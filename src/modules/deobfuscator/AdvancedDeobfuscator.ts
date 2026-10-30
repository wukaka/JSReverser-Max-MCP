
/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * 高级反混淆模块 - 支持2024-2025最新混淆技术
 * 
 * 支持的混淆类型:
 * 1. Invisible Unicode Obfuscation (2025新技术)
 * 2. VM Protection (虚拟机保护)
 * 3. Control Flow Flattening (控制流平坦化)
 * 4. String Array Rotation (字符串数组旋转)
 * 5. Dead Code Injection (死代码注入)
 * 6. Opaque Predicates (不透明谓词)
 * 7. Custom Obfuscators (魔改混淆器)
 */

import { logger } from '../../utils/logger.js';

import * as parser from '@babel/parser';
import traverseImport from '@babel/traverse';
const traverse = (traverseImport as unknown as {default?: typeof traverseImport}).default ?? traverseImport;
import generateImport from '@babel/generator';
const generate = (generateImport as unknown as {default?: typeof generateImport}).default ?? generateImport;
import * as t from '@babel/types';

export interface AdvancedDeobfuscateOptions {
  code: string;
  detectOnly?: boolean; // 仅检测混淆类型
  aggressiveVM?: boolean; // 激进VM反混淆
  useASTOptimization?: boolean; // 使用AST优化
  timeout?: number; // 超时时间（毫秒）
}

export interface AdvancedDeobfuscateResult {
  code: string;
  detectedTechniques: string[];
  confidence: number;
  warnings: string[];
  astOptimized?: boolean; // AST是否被优化
  vmDetected?: {
    type: string;
    instructions: number;
    deobfuscated: boolean;
  };
}

export class AdvancedDeobfuscator {
  constructor() {}

  /**
   * 高级反混淆入口
   */
  async deobfuscate(options: AdvancedDeobfuscateOptions): Promise<AdvancedDeobfuscateResult> {
    logger.info('Starting advanced deobfuscation...');
    const startTime = Date.now();

    let code = options.code;
    const detectedTechniques: string[] = [];
    const warnings: string[] = [];
    let vmDetected: AdvancedDeobfuscateResult['vmDetected'];
    let astOptimized = false;

    try {
      // 0. 预处理：标准化代码格式
      code = this.normalizeCode(code);

      // 1. 检测Invisible Unicode混淆
      if (this.detectInvisibleUnicode(code)) {
        detectedTechniques.push('invisible-unicode');
        logger.info('Detected: Invisible Unicode Obfuscation (2025)');
        code = this.decodeInvisibleUnicode(code);
      }

      // 2. 检测和移除字符串编码
      if (this.detectStringEncoding(code)) {
        detectedTechniques.push('string-encoding');
        logger.info('Detected: String Encoding');
        code = this.decodeStrings(code);
      }

      // 3. 检测VM保护
      const vmInfo = this.detectVMProtection(code);
      if (vmInfo.detected) {
        detectedTechniques.push('vm-protection');
        logger.info(`Detected: VM Protection (${vmInfo.type})`);
        vmDetected = {
          type: vmInfo.type,
          instructions: vmInfo.instructionCount,
          deobfuscated: false,
        };

        if (options.aggressiveVM) {
          const vmResult = await this.deobfuscateVM(code, vmInfo);
          if (vmResult.success) {
            code = vmResult.code;
            vmDetected.deobfuscated = true;
          } else {
            warnings.push('VM deobfuscation failed, code may be incomplete');
          }
        }
      }

      // 4. 检测控制流平坦化
      if (this.detectControlFlowFlattening(code)) {
        detectedTechniques.push('control-flow-flattening');
        logger.info('Detected: Control Flow Flattening');
        code = await this.unflattenControlFlow(code);
      }

      // 5. 检测字符串数组旋转
      if (this.detectStringArrayRotation(code)) {
        detectedTechniques.push('string-array-rotation');
        logger.info('Detected: String Array Rotation');
        code = this.derotateStringArray(code);
      }

      // 6. 检测死代码注入
      if (this.detectDeadCodeInjection(code)) {
        detectedTechniques.push('dead-code-injection');
        logger.info('Detected: Dead Code Injection');
        code = this.removeDeadCode(code);
      }

      // 7. 检测不透明谓词
      if (this.detectOpaquePredicates(code)) {
        detectedTechniques.push('opaque-predicates');
        logger.info('Detected: Opaque Predicates');
        code = this.removeOpaquePredicates(code);
      }

      // 8. AST优化（常量折叠、表达式简化）
      if (options.useASTOptimization !== false) {
        logger.info('Applying AST optimizations...');
        const optimized = this.applyASTOptimizations(code);
        if (optimized !== code) {
          code = optimized;
          astOptimized = true;
          detectedTechniques.push('ast-optimized');
        }
      }

      // 9. 最终清理：LLM 语义清理已移除，留规则式 AST 优化结果。
      //    复杂 VM / 控制流的语义还原由主模型在工具输出基础上完成。

      const duration = Date.now() - startTime;
      const confidence = this.calculateConfidence(detectedTechniques, warnings, code);

      logger.success(`Advanced deobfuscation completed in ${duration}ms`);

      return {
        code,
        detectedTechniques,
        confidence,
        warnings,
        vmDetected,
        astOptimized,
      };
    } catch (error) {
      logger.error('Advanced deobfuscation failed', error);
      throw error;
    }
  }

  /**
   * 检测Invisible Unicode混淆 (2025新技术)
   * 使用不可见Unicode字符表示二进制数据
   */
  private detectInvisibleUnicode(code: string): boolean {
    // 检测零宽字符
    const invisibleChars = [
      '\u200B', // Zero Width Space
      '\u200C', // Zero Width Non-Joiner
      '\u200D', // Zero Width Joiner
      '\u2060', // Word Joiner
      '\uFEFF', // Zero Width No-Break Space
    ];

    return invisibleChars.some(char => code.includes(char));
  }

  /**
   * 解码Invisible Unicode混淆
   */
  private decodeInvisibleUnicode(code: string): string {
    logger.info('Decoding invisible unicode...');

    // 映射：不可见字符 -> 二进制位
    const charToBit: Record<string, string> = {
      '\u200B': '0',
      '\u200C': '1',
      '\u200D': '00',
      '\u2060': '01',
      '\uFEFF': '10',
    };

    let decoded = code;

    // 查找所有不可见字符序列
    const invisiblePattern = /[\u200B\u200C\u200D\u2060\uFEFF]+/g;
    const matches = code.match(invisiblePattern);

    if (matches) {
      matches.forEach(match => {
        // 转换为二进制
        let binary = '';
        for (const char of match) {
          binary += charToBit[char] || '';
        }

        // 二进制转字符串
        if (binary.length % 8 === 0) {
          let text = '';
          for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substring(i, i + 8);
            text += String.fromCharCode(parseInt(byte, 2));
          }
          decoded = decoded.replace(match, text);
        }
      });
    }

    return decoded;
  }

  /**
   * 检测VM保护
   */
  private detectVMProtection(code: string): {
    detected: boolean;
    type: string;
    instructionCount: number;
  } {
    // VM特征：
    // 1. 大量switch-case语句
    // 2. 指令数组
    // 3. 程序计数器(PC)
    // 4. 栈操作

    const vmPatterns = [
      /while\s*\(\s*true\s*\)\s*\{[\s\S]*?switch\s*\(/i, // 无限循环+switch
      /var\s+\w+\s*=\s*\[\s*\d+(?:\s*,\s*\d+){10,}\s*\]/i, // 指令数组
      /\w+\[pc\+\+\]/i, // PC递增
      /stack\.push|stack\.pop/i, // 栈操作
    ];

    const matchCount = vmPatterns.filter(pattern => pattern.test(code)).length;

    if (matchCount >= 2) {
      return {
        detected: true,
        type: matchCount >= 3 ? 'custom-vm' : 'simple-vm',
        instructionCount: this.countVMInstructions(code),
      };
    }

    return { detected: false, type: 'none', instructionCount: 0 };
  }

  /**
   * 统计VM指令数量
   */
  private countVMInstructions(code: string): number {
    const match = code.match(/case\s+\d+:/g);
    return match ? match.length : 0;
  }

  /**
   * VM反混淆
   *
   * VM保护是一种高级混淆技术,将JavaScript代码转换为自定义虚拟机指令
   * 常见的VM混淆器:
   * 1. JScrambler VM Protection
   * 2. 自定义字节码VM (如TikTok使用的)
   * 3. Stack-based VM
   *
   * 反混淆策略:
   * 1. 识别VM结构 (指令集、解释器、栈/寄存器)
   * 2. 提取指令序列
   * 3. 符号执行或动态追踪
   * 4. 重建原始控制流
   * 5. LLM辅助理解复杂逻辑
   */
  private async deobfuscateVM(
    code: string,
    vmInfo: { type: string; instructionCount: number }
  ): Promise<{ success: boolean; code: string }> {
    logger.warn('VM deobfuscation is experimental and may fail');

    try {
      // 第一步: 尝试识别VM结构
      const vmStructure = this.analyzeVMStructure(code);

      if (vmStructure.hasInterpreter) {
        logger.info(`Detected VM interpreter with ${vmStructure.instructionTypes.length} instruction types`);
      }

      // 第二步: 提取关键VM组件
      const vmComponents = this.extractVMComponents(code);

      // 第三步: 基于规则的简化（LLM 语义还原已移除，由主模型接手）
      const simplifiedCode = this.simplifyVMCode(code, vmComponents);

      return {
        success: simplifiedCode !== code,
        code: simplifiedCode
      };
    } catch (error) {
      logger.error('VM deobfuscation failed', error);
      return { success: false, code };
    }
  }

  /**
   * 分析VM结构
   */
  private analyzeVMStructure(code: string): {
    hasInterpreter: boolean;
    instructionTypes: string[];
    hasStack: boolean;
    hasRegisters: boolean;
  } {
    const structure = {
      hasInterpreter: false,
      instructionTypes: [] as string[],
      hasStack: false,
      hasRegisters: false,
    };

    // 检测解释器循环模式
    if (/while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/.test(code)) {
      structure.hasInterpreter = true;
    }

    // 检测指令分发模式 (switch-case)
    const switchMatches = code.match(/case\s+0x[0-9a-f]+:/gi);
    if (switchMatches && switchMatches.length > 10) {
      structure.hasInterpreter = true;
      structure.instructionTypes = switchMatches.map(m => m.replace(/case\s+/i, '').replace(/:/, ''));
    }

    // 检测栈操作
    if (/\.push\(|\.pop\(/.test(code)) {
      structure.hasStack = true;
    }

    // 检测寄存器模式
    if (/r\d+\s*=|reg\[\d+\]/.test(code)) {
      structure.hasRegisters = true;
    }

    return structure;
  }

  /**
   * 提取VM组件
   */
  private extractVMComponents(code: string): {
    instructionArray?: string;
    dataArray?: string;
    interpreterFunction?: string;
  } {
    const components: any = {};

    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      traverse(ast, {
        // 查找大型数组 (可能是指令或数据)
        VariableDeclarator(path: any) {
          if (t.isArrayExpression(path.node.init)) {
            const arrayLength = path.node.init.elements.length;

            if (arrayLength > 50) {
              const arrayName = t.isIdentifier(path.node.id) ? path.node.id.name : 'unknown';

              // 检查数组内容类型
              const firstElement = path.node.init.elements[0];
              if (t.isNumericLiteral(firstElement)) {
                components.instructionArray = arrayName;
              } else if (t.isStringLiteral(firstElement)) {
                components.dataArray = arrayName;
              }
            }
          }
        },

        // 查找解释器函数 (包含大型switch语句)
        FunctionDeclaration(path: any) {
          let hasBigSwitch = false;

          traverse(path.node, {
            SwitchStatement(switchPath: any) {
              if (switchPath.node.cases.length > 10) {
                hasBigSwitch = true;
              }
            },
          }, path.scope, path);

          if (hasBigSwitch && t.isIdentifier(path.node.id)) {
            components.interpreterFunction = path.node.id.name;
          }
        },
      });
    } catch (error) {
      logger.debug('Failed to extract VM components:', error);
    }

    return components;
  }

  /**
   * 简化VM代码 (基于规则)
   */
  private simplifyVMCode(code: string, vmComponents: any): string {
    try {
      let simplified = code;

      // 移除VM解释器函数 (如果能识别)
      if (vmComponents.interpreterFunction) {
        const regex = new RegExp(`function\\s+${vmComponents.interpreterFunction}\\s*\\([^)]*\\)\\s*\\{[^}]*\\}`, 'g');
        simplified = simplified.replace(regex, '// VM interpreter removed');
      }

      // 移除大型指令数组
      if (vmComponents.instructionArray) {
        const regex = new RegExp(`var\\s+${vmComponents.instructionArray}\\s*=\\s*\\[[^\\]]*\\];`, 'g');
        simplified = simplified.replace(regex, '// VM instruction array removed');
      }

      return simplified;
    } catch (error) {
      logger.debug('Failed to simplify VM code:', error);
      return code;
    }
  }

  /**
   * 检测控制流平坦化
   */
  private detectControlFlowFlattening(code: string): boolean {
    // 特征：大量连续的switch-case + 状态变量
    const pattern = /while\s*\(\s*!!\s*\[\s*\]\s*\)\s*\{[\s\S]*?switch\s*\(/i;
    return pattern.test(code);
  }

  /**
   * 还原控制流 - 占位
   *
   * 控制流平坦化的语义还原此前由内置 LLM 完成，现已移除。
   * 该工具不再做规则式控制流还原；主模型可在工具输出的代码上自行完成。
   */
  private async unflattenControlFlow(code: string): Promise<string> {
    logger.info('Control flow unflattening deferred to main model (no rule-based implementation)');
    return code;
  }

  // 其他检测和反混淆方法的占位符
  private detectStringArrayRotation(code: string): boolean {
    return /\w+\s*=\s*\w+\s*\+\s*0x[0-9a-f]+/.test(code);
  }

  /**
   * 字符串数组去旋转
   * 基于CASCADE论文: String Array Rotate Function还原
   *
   * Obfuscator.IO会生成一个IIFE来旋转字符串数组:
   * (function(getStringArray, target) {
   *   var stringArray = getStringArray();
   *   while (true) {
   *     try {
   *       var value = parseInt(...) / ... + ...;
   *       if (value === target) break;
   *       else stringArray.push(stringArray.shift());
   *     } catch { stringArray.push(stringArray.shift()); }
   *   }
   * })(getStringArray, 0x12345);
   */
  private derotateStringArray(code: string): string {
    logger.info('Derotating string array...');

    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      let derotated = 0;

      traverse(ast, {
        // 查找字符串数组旋转IIFE
        CallExpression(path) {
          // 检查是否是IIFE调用
          if (!t.isFunctionExpression(path.node.callee) &&
              !t.isArrowFunctionExpression(path.node.callee)) {
            return;
          }

          const func = path.node.callee;
          if (!t.isFunctionExpression(func) || !t.isBlockStatement(func.body)) {
            return;
          }

          // 检查函数体是否包含while循环和字符串数组操作
          const hasWhileLoop = func.body.body.some(stmt => t.isWhileStatement(stmt));
          const hasArrayRotation = JSON.stringify(func.body).includes('push') &&
                                   JSON.stringify(func.body).includes('shift');

          if (hasWhileLoop && hasArrayRotation) {
            logger.debug('Found string array rotation IIFE');

            // 移除这个IIFE,因为它只是用来旋转数组的
            // 实际的字符串数组已经在运行时被旋转过了
            path.remove();
            derotated++;
          }
        },
      });

      if (derotated > 0) {
        logger.info(`Removed ${derotated} string array rotation functions`);
        return generate(ast, { comments: true, compact: false }).code;
      }

      return code;
    } catch (error) {
      logger.error('Failed to derotate string array:', error);
      return code;
    }
  }

  private detectDeadCodeInjection(code: string): boolean {
    return /if\s*\(\s*false\s*\)|if\s*\(\s*!!\s*\[\s*\]\s*\)/.test(code);
  }

  /**
   * 移除死代码
   *
   * 死代码注入是一种常见的混淆技术,包括:
   * 1. if (false) { ... } - 永远不会执行的代码块
   * 2. if (!![] ) { ... } - 永远为true的条件
   * 3. 不可达的代码 - return/throw后的代码
   * 4. 未使用的变量和函数
   */
  private removeDeadCode(code: string): string {
    logger.info('Removing dead code...');

    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      let removed = 0;

      traverse(ast, {
        // 移除 if (false) { ... }
        IfStatement(path: any) {
          const test = path.node.test;

          // 检查 if (false)
          if (t.isBooleanLiteral(test) && test.value === false) {
            if (path.node.alternate) {
              // 有else分支,保留else
              path.replaceWith(path.node.alternate);
            } else {
              // 没有else,直接移除
              path.remove();
            }
            removed++;
            return;
          }

          // 检查 if (true)
          if (t.isBooleanLiteral(test) && test.value === true) {
            // 保留then分支
            path.replaceWith(path.node.consequent);
            removed++;
            return;
          }

          // 检查 if (!![] ) - 永远为true
          if (t.isUnaryExpression(test) && test.operator === '!' &&
              t.isUnaryExpression(test.argument) && test.argument.operator === '!' &&
              t.isArrayExpression(test.argument.argument)) {
            path.replaceWith(path.node.consequent);
            removed++;
            return;
          }
        },

        // 移除return/throw后的不可达代码
        BlockStatement(path: any) {
          const body = path.node.body;
          let foundTerminator = false;
          const newBody: any[] = [];

          for (const stmt of body) {
            if (foundTerminator) {
              // 跳过return/throw后的代码
              removed++;
              continue;
            }

            newBody.push(stmt);

            if (t.isReturnStatement(stmt) || t.isThrowStatement(stmt)) {
              foundTerminator = true;
            }
          }

          if (newBody.length < body.length) {
            path.node.body = newBody;
          }
        },
      });

      if (removed > 0) {
        logger.info(`Removed ${removed} dead code blocks`);
        return generate(ast, { comments: true, compact: false }).code;
      }

      return code;
    } catch (error) {
      logger.error('Failed to remove dead code:', error);
      return code;
    }
  }

  private detectOpaquePredicates(code: string): boolean {
    return /if\s*\(\s*\d+\s*[<>!=]+\s*\d+\s*\)/.test(code);
  }

  /**
   * 移除不透明谓词
   *
   * 不透明谓词是指那些结果在编译时已知但在运行时看起来是动态的条件表达式
   * 例如:
   * 1. if (5 > 3) { ... } - 永远为true
   * 2. if (1 === 2) { ... } - 永远为false
   * 3. if (x * 0 === 0) { ... } - 永远为true (对于任何数字x)
   * 4. if ((x | 0) === x) { ... } - 永远为true (对于整数x)
   */
  private removeOpaquePredicates(code: string): string {
    logger.info('Removing opaque predicates...');

    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      let removed = 0;

      traverse(ast, {
        IfStatement(path: any) {
          const test = path.node.test;

          // 检查简单的数字比较: if (5 > 3)
          if (t.isBinaryExpression(test)) {
            const left = test.left;
            const right = test.right;
            const operator = test.operator;

            // 两边都是数字字面量
            if (t.isNumericLiteral(left) && t.isNumericLiteral(right)) {
              let result: boolean | undefined;

              switch (operator) {
                case '>':
                  result = left.value > right.value;
                  break;
                case '<':
                  result = left.value < right.value;
                  break;
                case '>=':
                  result = left.value >= right.value;
                  break;
                case '<=':
                  result = left.value <= right.value;
                  break;
                case '===':
                case '==':
                  result = left.value === right.value;
                  break;
                case '!==':
                case '!=':
                  result = left.value !== right.value;
                  break;
              }

              if (result !== undefined) {
                if (result) {
                  // 条件永远为true,保留then分支
                  path.replaceWith(path.node.consequent);
                } else {
                  // 条件永远为false
                  if (path.node.alternate) {
                    path.replaceWith(path.node.alternate);
                  } else {
                    path.remove();
                  }
                }
                removed++;
                return;
              }
            }
          }

          // 检查 x * 0 === 0 类型的谓词
          if (t.isBinaryExpression(test) && (test.operator === '===' || test.operator === '==')) {
            const left = test.left;
            const right = test.right;

            // x * 0 === 0
            if (t.isBinaryExpression(left) && left.operator === '*' &&
                t.isNumericLiteral(right) && right.value === 0) {
              if ((t.isNumericLiteral(left.left) && left.left.value === 0) ||
                  (t.isNumericLiteral(left.right) && left.right.value === 0)) {
                // 永远为true
                path.replaceWith(path.node.consequent);
                removed++;
                return;
              }
            }
          }
        },
      });

      if (removed > 0) {
        logger.info(`Removed ${removed} opaque predicates`);
        return generate(ast, { comments: true, compact: false }).code;
      }

      return code;
    } catch (error) {
      logger.error('Failed to remove opaque predicates:', error);
      return code;
    }
  }


  /**
   * 标准化代码格式
   */
  private normalizeCode(code: string): string {
    // 移除多余的空白字符
    code = code.replace(/\s+/g, ' ');
    // 移除注释中的混淆
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    code = code.replace(/\/\/.*/g, '');
    return code.trim();
  }

  /**
   * 检测字符串编码
   */
  private detectStringEncoding(code: string): boolean {
    // 检测常见的字符串编码模式
    const patterns = [
      /\\x[0-9a-f]{2}/i, // 十六进制编码
      /\\u[0-9a-f]{4}/i, // Unicode编码
      /String\.fromCharCode/i, // fromCharCode
      /atob\(/i, // Base64解码
    ];
    return patterns.some(p => p.test(code));
  }

  /**
   * 解码字符串
   */
  private decodeStrings(code: string): string {
    logger.info('Decoding strings...');

    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      let decoded = 0;

      traverse(ast, {
        // 解码 String.fromCharCode(...)
        CallExpression(path: any) {
          if (
            t.isMemberExpression(path.node.callee) &&
            t.isIdentifier(path.node.callee.object, { name: 'String' }) &&
            t.isIdentifier(path.node.callee.property, { name: 'fromCharCode' })
          ) {
            // 检查所有参数是否都是数字
            const allNumbers = path.node.arguments.every((arg: any) => t.isNumericLiteral(arg));

            if (allNumbers) {
              const charCodes = path.node.arguments.map((arg: any) => arg.value);
              const decodedString = String.fromCharCode(...charCodes);
              path.replaceWith(t.stringLiteral(decodedString));
              decoded++;
            }
          }
        },
      });

      if (decoded > 0) {
        logger.info(`Decoded ${decoded} string expressions`);
        return generate(ast, { comments: false, compact: false }).code;
      }

      return code;
    } catch (error) {
      logger.error('Failed to decode strings:', error);
      return code;
    }
  }

  /**
   * 应用AST优化
   */
  private applyASTOptimizations(code: string): string {
    logger.info('Applying AST optimizations...');

    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      let optimized = 0;

      traverse(ast, {
        // 常量折叠：计算常量表达式
        BinaryExpression(path: any) {
          const { left, right, operator } = path.node;

          if (t.isNumericLiteral(left) && t.isNumericLiteral(right)) {
            let result: number | undefined;

            switch (operator) {
              case '+': result = left.value + right.value; break;
              case '-': result = left.value - right.value; break;
              case '*': result = left.value * right.value; break;
              case '/': result = left.value / right.value; break;
              case '%': result = left.value % right.value; break;
              case '**': result = Math.pow(left.value, right.value); break;
            }

            if (result !== undefined) {
              path.replaceWith(t.numericLiteral(result));
              optimized++;
            }
          }
        },

        // 简化逻辑表达式
        LogicalExpression(path: any) {
          const { left, right, operator } = path.node;

          // true && x => x
          if (operator === '&&' && t.isBooleanLiteral(left) && left.value === true) {
            path.replaceWith(right);
            optimized++;
          }

          // false || x => x
          if (operator === '||' && t.isBooleanLiteral(left) && left.value === false) {
            path.replaceWith(right);
            optimized++;
          }
        },

        // 移除空语句
        EmptyStatement(path: any) {
          path.remove();
          optimized++;
        },

        // 简化三元表达式
        ConditionalExpression(path: any) {
          const { test, consequent, alternate } = path.node;

          // true ? a : b => a
          if (t.isBooleanLiteral(test) && test.value === true) {
            path.replaceWith(consequent);
            optimized++;
          }

          // false ? a : b => b
          if (t.isBooleanLiteral(test) && test.value === false) {
            path.replaceWith(alternate);
            optimized++;
          }
        },
      });

      if (optimized > 0) {
        logger.info(`Applied ${optimized} AST optimizations`);
        return generate(ast, { comments: true, compact: false }).code;
      }

      return code;
    } catch (error) {
      logger.error('Failed to apply AST optimizations:', error);
      return code;
    }
  }

  /**
   * 计算反混淆置信度
   *
   * 基于多个因素计算置信度分数:
   * 1. 成功检测和处理的混淆技术数量
   * 2. 警告和错误数量
   * 3. 代码复杂度变化
   * 4. AST节点数量变化
   */
  private calculateConfidence(techniques: string[], warnings: string[], code: string): number {
    let confidence = 0.3; // 基础置信度

    // 每成功处理一种混淆技术,增加置信度
    const techniqueBonus = Math.min(techniques.length * 0.12, 0.5);
    confidence += techniqueBonus;

    // 每个警告降低置信度
    const warningPenalty = warnings.length * 0.08;
    confidence -= warningPenalty;

    // 特定技术的额外置信度
    const highConfidenceTechniques = [
      'invisible-unicode',
      'string-array-rotation',
      'dead-code-injection',
      'opaque-predicates',
      'string-encoding',
      'ast-optimized',
    ];

    const highConfidenceCount = techniques.filter(t =>
      highConfidenceTechniques.some(ht => t.includes(ht))
    ).length;

    confidence += highConfidenceCount * 0.05;

    // VM反混淆的置信度较低
    if (techniques.some(t => t.includes('vm-protection'))) {
      confidence -= 0.15;
    }

    // 控制流平坦化的置信度中等
    if (techniques.some(t => t.includes('control-flow-flattening'))) {
      confidence -= 0.05;
    }

    // 根据代码复杂度调整置信度
    const complexity = this.estimateCodeComplexity(code);
    if (complexity < 10) {
      confidence += 0.1; // 简单代码更容易反混淆
    } else if (complexity > 100) {
      confidence -= 0.1; // 复杂代码更难反混淆
    }

    // 确保置信度在0-1之间
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  /**
   * 估算代码复杂度
   */
  private estimateCodeComplexity(code: string): number {
    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      });

      let complexity = 0;

      traverse(ast, {
        // 每个函数增加复杂度
        FunctionDeclaration() { complexity += 2; },
        FunctionExpression() { complexity += 2; },
        ArrowFunctionExpression() { complexity += 2; },

        // 每个条件语句增加复杂度
        IfStatement() { complexity += 1; },
        SwitchStatement() { complexity += 2; },
        ConditionalExpression() { complexity += 1; },

        // 每个循环增加复杂度
        WhileStatement() { complexity += 2; },
        ForStatement() { complexity += 2; },
        DoWhileStatement() { complexity += 2; },

        // 每个try-catch增加复杂度
        TryStatement() { complexity += 3; },
      });

      return complexity;
    } catch {
      // 如果解析失败，返回高复杂度
      return 100;
    }
  }
}

