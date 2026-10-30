/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import { describe, it } from 'node:test';

import * as parser from '@babel/parser';

import { JSVMPDeobfuscator } from '../../../src/modules/deobfuscator/JSVMPDeobfuscator.js';
import type { VMFeatures, UnresolvedPart, VMType, VMInstruction } from '../../../src/types/index.js';

interface JSVMPHarness {
  detectJSVMP(code: string): VMFeatures | null;
  deobfuscate(options: {
    code: string;
    aggressive?: boolean;
    extractInstructions?: boolean;
    timeout?: number;
    maxIterations?: number;
  }): Promise<{
    isJSVMP: boolean;
    vmType?: VMType;
    instructions?: VMInstruction[];
    deobfuscatedCode: string;
    confidence: number;
    warnings?: string[];
    unresolvedParts?: UnresolvedPart[];
    stats?: { processingTime: number };
  }>;
  identifyVMType(code: string, features: VMFeatures): VMType;
  detectJSVMPWithRegex(code: string): VMFeatures | null;
  extractInstructions(code: string, features: VMFeatures): VMInstruction[];
  inferInstructionType(caseNode: unknown): string;
  restoreJSFuck(code: string, warnings: string[]): Promise<{ code: string; confidence: number; warnings: string[] }>;
  restoreJJEncode(code: string, warnings: string[]): Promise<{ code: string; confidence: number; warnings: string[] }>;
  restoreCustomVMBasic(
    code: string,
    aggressive: boolean,
    warnings: string[],
    unresolvedParts: UnresolvedPart[],
  ): Promise<{ code: string; confidence: number; warnings: string[]; unresolvedParts?: UnresolvedPart[] }>;
  restoreCode(
    code: string,
    features: VMFeatures,
    vmType: VMType,
    aggressive: boolean,
    timeout: number,
    maxIterations: number,
  ): Promise<{ code: string; confidence: number; warnings: string[]; unresolvedParts?: UnresolvedPart[] }>;
  restoreObfuscatorIO(
    code: string,
    aggressive: boolean,
    warnings: string[],
    unresolvedParts: UnresolvedPart[],
  ): Promise<{ code: string; confidence: number; warnings: string[]; unresolvedParts?: UnresolvedPart[] }>;
  restoreCustomVM(
    code: string,
    aggressive: boolean,
    warnings: string[],
    unresolvedParts: UnresolvedPart[],
  ): Promise<{ code: string; confidence: number; warnings: string[]; unresolvedParts?: UnresolvedPart[] }>;
}

function createVmFeatures(overrides: Partial<VMFeatures> = {}): VMFeatures {
  return {
    instructionCount: 4,
    interpreterLocation: 'L1',
    complexity: 'low',
    hasSwitch: true,
    hasInstructionArray: true,
    hasProgramCounter: true,
    ...overrides,
  };
}

describe('JSVMPDeobfuscator', () => {
  it('detectJSVMP via AST and deobfuscate success path with extracted instructions', async () => {
    const d = new JSVMPDeobfuscator() as unknown as JSVMPHarness;
    const vmCode = `
      const bc = new Array(60).fill(1);
      let pc = 0;
      while (true) {
        parseInt("" + bc[pc] + bc[pc + 1], 16);
        fn.apply(ctx, args);
        switch(pc){
          case 0: break; case 1: break; case 2: break; case 3: break; case 4: break;
          case 5: break; case 6: break; case 7: break; case 8: break; case 9: break;
          case 10: break; case 11: break;
        }
        pc++;
      }
    `;
    const features = d.detectJSVMP(vmCode);
    assert.ok(features);
    assert.strictEqual(features.hasSwitch, true);
    assert.ok(features.instructionCount >= 11);

    d.detectJSVMP = () => ({
      instructionCount: 2,
      interpreterLocation: 'L1',
      complexity: 'low',
      hasSwitch: true,
      hasInstructionArray: true,
      hasProgramCounter: true,
    });
    d.identifyVMType = () => 'custom';
    d.extractInstructions = () => [{ opcode: 1, name: 'INST_1', type: 'call', description: 'd' }];
    d.restoreCode = async () => ({
      code: 'restored',
      confidence: 0.88,
      warnings: ['ok'],
      unresolvedParts: [{ location: 'x', reason: 'r', suggestion: 's' }],
    });

    const res = await d.deobfuscate({ code: 'obf', extractInstructions: true });
    assert.strictEqual(res.isJSVMP, true);
    assert.strictEqual(res.vmType, 'custom');
    assert.strictEqual(res.instructions?.length, 1);
    assert.strictEqual(res.deobfuscatedCode, 'restored');
    assert.ok((res.stats?.processingTime ?? 0) >= 0);
  });

  it('detects regex features and identifies VM type', () => {
    const d = new JSVMPDeobfuscator() as unknown as JSVMPHarness;
    const regexDetect = d.detectJSVMPWithRegex(
      'while(true){switch(x){case 1:break;} parseInt("" + b[i],16); fn.apply(a,b);}',
    );
    assert.ok(regexDetect);

    const features = createVmFeatures();
    assert.strictEqual(d.identifyVMType('_0xabc; function(_0x1){}', features), 'obfuscator.io');
    assert.strictEqual(d.identifyVMType('[][(+[])]', features), 'jsfuck');
    assert.strictEqual(d.identifyVMType('$=~[]; $$$$=1;', features), 'jjencode');
    assert.strictEqual(d.identifyVMType('const x=1;', features), 'custom');
  });

  it('extracts instructions and infers instruction types', () => {
    const d = new JSVMPDeobfuscator() as unknown as JSVMPHarness;
    const code = `
      function vm(op){
        switch(op){
          case 0: arr.push(v[0]); break;
          case 1: x = 1; break;
          case 2: a = 1 + 2; break;
          case 3: fn(); break;
          case 4: if (x) { break; } break;
        }
      }
    `;
    const instructions = d.extractInstructions(code, createVmFeatures({ instructionCount: 5 }));
    assert.strictEqual(instructions.length, 5);

    const ast = parser.parse('switch(x){case 1: x=1; break;}', { sourceType: 'script' }) as {
      program: { body: Array<{ cases: unknown[] }> };
    };
    const switchCase = ast.program.body[0].cases[0];
    const tpe = d.inferInstructionType(switchCase);
    assert.strictEqual(typeof tpe, 'string');
  });

  it('covers JSFuck/JJEncode local execution fallback (no LLM decode)', async () => {
    const d = new JSVMPDeobfuscator() as unknown as JSVMPHarness;

    const jsfuckOk = await d.restoreJSFuck('"decoded"', []);
    assert.strictEqual(jsfuckOk.code, 'decoded');
    assert.ok(jsfuckOk.confidence >= 0.5);

    // 过长 / 执行失败时返回原始代码 + 警告（不再 fallback 到内置 LLM）
    const tooLong = await d.restoreJSFuck('x'.repeat(100001), []);
    assert.strictEqual(typeof tooLong.code, 'string');
    assert.ok(tooLong.warnings.some((w: string) => w.includes('主模型') || w.includes('手动')));

    const jj = await d.restoreJJEncode('invalid $$$$', []);
    assert.strictEqual(typeof jj.code, 'string');
  });

  it('covers custom VM basic restore and restore dispatch', async () => {
    const d = new JSVMPDeobfuscator() as unknown as JSVMPHarness;
    const basic = await d.restoreCustomVMBasic(
      'if(a){}; debugger; var x = !!(1); "" + y;',
      true,
      [],
      [],
    );
    assert.ok(!basic.code.includes('debugger'));
    assert.ok(basic.warnings.length > 0);

    // restoreCustomVM 现在直接委托给规则式 restoreCustomVMBasic
    const custom = await d.restoreCustomVM('code', false, [], []);
    assert.ok(custom.confidence >= 0.1);
    assert.ok(Array.isArray(custom.warnings));

    d.restoreObfuscatorIO = async () => ({ code: 'o', confidence: 0.8, warnings: [] });
    d.restoreJSFuck = async () => ({ code: 'j', confidence: 0.7, warnings: [] });
    d.restoreJJEncode = async () => ({ code: 'jj', confidence: 0.7, warnings: [] });
    d.restoreCustomVM = async () => ({ code: 'c', confidence: 0.6, warnings: [] });

    const features = createVmFeatures();
    assert.strictEqual((await d.restoreCode('x', features, 'obfuscator.io', false, 0, 0)).code, 'o');
    assert.strictEqual((await d.restoreCode('x', features, 'jsfuck', false, 0, 0)).code, 'j');
    assert.strictEqual((await d.restoreCode('x', features, 'jjencode', false, 0, 0)).code, 'jj');
    assert.strictEqual((await d.restoreCode('x', features, 'custom', false, 0, 0)).code, 'c');
  });

  it('covers public deobfuscate no-detect and error branches', async () => {
    const d = new JSVMPDeobfuscator() as unknown as JSVMPHarness;
    const notVm = await d.deobfuscate({ code: 'const x=1;' });
    assert.strictEqual(notVm.isJSVMP, false);

    d.detectJSVMP = () => {
      throw new Error('boom');
    };
    const failed = await d.deobfuscate({ code: 'const y=1;' });
    assert.strictEqual(failed.isJSVMP, false);
    assert.ok(failed.warnings?.some((w: string) => w.includes('反混淆失败')));
  });

  it('covers restoreObfuscatorIO success path with string array replacement', async () => {
    const d = new JSVMPDeobfuscator() as unknown as JSVMPHarness;
    const warnings: string[] = [];
    const unresolved: UnresolvedPart[] = [];
    const code = `
      var _0xabc=["hello","world"];
      console.log(_0xabc[1]);
      (function(_0xabc,_0xdef){ while(true){ try { break; } catch(e){ _0xabc.push(_0xabc.shift()); } } }(_0xabc,0x1));
      var n = 0x10;;
    `;

    const out = await d.restoreObfuscatorIO(code, true, warnings, unresolved);
    assert.ok(out.code.includes('"world"'));
    assert.ok(out.code.includes('16'));
    assert.ok(out.confidence >= 0.6);
  });

  it('covers restoreObfuscatorIO parse-fail branch (no LLM array extraction)', async () => {
    const d = new JSVMPDeobfuscator() as unknown as JSVMPHarness;
    const warnings: string[] = [];
    const unresolved: UnresolvedPart[] = [];
    const code = `
      var _0xabc=[not_valid_here];
      console.log(_0xabc[2]);
    `;
    // 解析失败时不再 fallback 到内置 LLM 提取；保留原始引用并给出 unresolved 提示
    const out = await d.restoreObfuscatorIO(code, false, warnings, unresolved);
    assert.ok(out.warnings.some((w: string) => w.includes('字符串数组')));
    assert.ok(Array.isArray(out.unresolvedParts));
  });
});
