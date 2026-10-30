/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import { describe, it } from 'node:test';

import { AdvancedDeobfuscator } from '../../../src/modules/deobfuscator/AdvancedDeobfuscator.js';
import type {
  AdvancedDeobfuscateOptions,
  AdvancedDeobfuscateResult,
} from '../../../src/modules/deobfuscator/AdvancedDeobfuscator.js';

interface VmDetectionLike {
  detected: boolean;
  type: string;
  instructionCount: number;
}

interface VmStructureLike {
  hasInterpreter?: boolean;
  hasStack?: boolean;
  hasRegisters?: boolean;
  interpreterFunction?: string;
  instructionArray?: string;
}

interface VmResultLike {
  success: boolean;
  code: string;
}

interface AdvancedDeobfuscatorTestHarness {
  detectInvisibleUnicode(code: string): boolean;
  decodeInvisibleUnicode(code: string): string;
  detectStringEncoding(code: string): boolean;
  detectVMProtection(code: string): VmDetectionLike;
  analyzeVMStructure(code: string): VmStructureLike;
  simplifyVMCode(code: string, vmComponents: VmStructureLike): string;
  detectControlFlowFlattening(code: string): boolean;
  removeDeadCode(code: string): string;
  removeOpaquePredicates(code: string): string;
  unflattenControlFlow(code: string): Promise<string>;
  applyASTOptimizations(code: string): string;
  calculateConfidence(
    techniques: string[],
    warnings: string[],
    code: string,
  ): number;
  deobfuscate(options: AdvancedDeobfuscateOptions): Promise<AdvancedDeobfuscateResult>;
  deobfuscateVM(
    code: string,
    vmInfo: Pick<VmDetectionLike, 'type' | 'instructionCount'>,
  ): Promise<VmResultLike>;
  derotateStringArray(code: string): string;
  normalizeCode(code: string): string;
  estimateCodeComplexity(code: string): number;
}

describe('AdvancedDeobfuscator', () => {
  it('covers invisible unicode/string detection and decode helpers', () => {
    const d = new AdvancedDeobfuscator() as unknown as AdvancedDeobfuscatorTestHarness;
    const zw = '​‌​​​​​‌'; // 01000001 => 'A'

    assert.strictEqual(d.detectInvisibleUnicode(`x${zw}y`), true);
    assert.strictEqual(d.detectInvisibleUnicode('normal text'), false);

    const decoded = d.decodeInvisibleUnicode(`const s="${zw}"`);
    assert.ok(decoded.includes('A'));

    assert.strictEqual(d.detectStringEncoding('const x="\\x61\\u0062";'), true);
    assert.strictEqual(d.detectStringEncoding('const x="abc";'), false);
  });

  it('covers VM/control-flow/dead-code/opaque detection and transforms', async () => {
    const d = new AdvancedDeobfuscator() as unknown as AdvancedDeobfuscatorTestHarness;
    const vmCode = `
      while(true){ switch(op){ case 0: stack.push(1); break; case 1: stack.pop(); break; } }
      var code=[1,2,3,4,5,6,7,8,9,10,11,12];
    `;
    const vm = d.detectVMProtection(vmCode);
    assert.strictEqual(vm.detected, true);
    assert.ok(vm.instructionCount >= 2);

    const vmStructure = d.analyzeVMStructure(
      'while(true){switch(x){case 0x1:break;}} stack.push(1); r1=2;',
    );
    assert.strictEqual(vmStructure.hasInterpreter, true);
    assert.strictEqual(vmStructure.hasStack, true);
    assert.strictEqual(vmStructure.hasRegisters, true);

    const simplifiedVm = d.simplifyVMCode(
      'function interp(){return 1;} var inst=[1,2,3]; interp();',
      { interpreterFunction: 'interp', instructionArray: 'inst' },
    );
    assert.ok(simplifiedVm.includes('VM interpreter removed'));

    assert.strictEqual(
      d.detectControlFlowFlattening('while(!![]){switch(x){case 1:break;}}'),
      true,
    );

    const deadOut = d.removeDeadCode('function f(){ if(false){a()} else {b()} if(true){c()} return 1; d(); }');
    assert.ok(!deadOut.includes('if (false)'));
    assert.ok(!deadOut.includes('d();'));

    const opaqueOut = d.removeOpaquePredicates('if(5>3){a()} if(1===2){b()}');
    assert.ok(opaqueOut.includes('a()'));
    assert.ok(!opaqueOut.includes('if (1 === 2)'));

    // 控制流还原已不再内置 LLM；规则版直接原样返回
    const unflattened = await d.unflattenControlFlow('const x=1;');
    assert.strictEqual(unflattened, 'const x=1;');
  });

  it('covers ast optimization and confidence helpers', () => {
    const d = new AdvancedDeobfuscator() as unknown as AdvancedDeobfuscatorTestHarness;

    const optimized = d.applyASTOptimizations('const a=(1+2); const b=true&&x; false||y;');
    assert.ok(optimized.includes('3'));
    assert.ok(optimized.includes('x'));

    const c1 = d.calculateConfidence(['vm-protection', 'ast-optimized'], ['warn'], 'const a=1;');
    const c2 = d.calculateConfidence([], ['w1', 'w2', 'w3'], 'function a(){if(x){while(y){}}}');
    assert.ok(c1 >= 0.1 && c1 <= 0.95);
    assert.ok(c2 >= 0.1 && c2 <= 0.95);
  });

  it('covers full deobfuscate pipeline and VM rule-based fallback', async () => {
    const d = new AdvancedDeobfuscator() as unknown as AdvancedDeobfuscatorTestHarness;

    const result = await d.deobfuscate({
      code: '\\x61\\u0062;if(false){x()}',
      aggressiveVM: false,
      useASTOptimization: true,
    });
    assert.strictEqual(typeof result.code, 'string');
    assert.ok(Array.isArray(result.detectedTechniques));
    assert.ok(result.confidence > 0);

    // VM 反混淆现在走规则式 simplifyVMCode，不再有 LLM 成功/失败分支
    const vmRes = await d.deobfuscateVM('var x=1;', { type: 'custom-vm', instructionCount: 0 });
    assert.strictEqual(typeof vmRes.code, 'string');
  });

  it('covers derotate and normalization helpers', () => {
    const d = new AdvancedDeobfuscator() as unknown as AdvancedDeobfuscatorTestHarness;

    const rotated = `
      (function(_0xabc,_0xdef){
        while(true){
          try { break; } catch(e){ _0xabc.push(_0xabc.shift()); }
        }
      })(['a','b'], 0x1);
      console.log("x");
    `;
    const derotated = d.derotateStringArray(rotated);
    assert.ok(derotated.includes('console.log'));

    const normalized = d.normalizeCode('/*a*/ const x = 1; // c\\n\\n const y = 2;');
    assert.ok(normalized.includes('const'));

    const complexity = d.estimateCodeComplexity('if(a){for(let i=0;i<2;i++){while(b){break;}}}');
    assert.ok(complexity > 0);
  });
});
