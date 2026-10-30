
/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * 代码摘要骨架生成器
 *
 * 只产出确定性的结构信号（特征检测、函数名提取、复杂度、代码片段），
 * 不再内置子 LLM 调用。summary / purpose / keyFunctions 等自由文本归纳
 * 由主模型读取本工具返回的骨架 + 代码片段后自行完成。
 */

import type { CodeFile } from '../../types/index.js';
import { logger } from '../../utils/logger.js';

export interface CodeSummary {
  url: string;
  type: string;
  size: number;

  // 确定性特征检测
  hasEncryption: boolean;
  encryptionMethods: string[];
  hasAPI: boolean;
  apiEndpoints: string[];
  hasObfuscation: boolean;
  obfuscationType?: string;

  // 确定性提取
  keyFunctions: string[];
  dependencies: string[];

  // 复杂度评估
  complexity: 'low' | 'medium' | 'high';
  linesOfCode: number;

  // 代码片段（供主模型做语义归纳）
  codeSnippet: string;
}

export class CodeSummarizer {
  /**
   * 生成单个文件的确定性摘要骨架
   */
  async summarizeFile(file: CodeFile): Promise<CodeSummary> {
    logger.info(`Building summary skeleton for: ${file.url}`);

    const content = file.content;
    const lines = content.split('\n');

    // 截取代码片段（避免 token 溢出）
    const maxLength = 10000;
    const codeSnippet = content.length > maxLength
      ? content.substring(0, maxLength) + '\n\n... (truncated)'
      : content;

    const encryptionMethods = this.detectEncryptionMethods(content);
    const apiEndpoints = this.detectApiEndpoints(content);
    const obfuscationType = this.detectObfuscationType(content);
    const keyFunctions = this.extractFunctionNames(content);
    const dependencies = this.extractDependencies(content);
    const complexity = this.assessComplexity(content, lines.length);

    return {
      url: file.url,
      type: file.type,
      size: file.size,
      hasEncryption: encryptionMethods.length > 0,
      encryptionMethods,
      hasAPI: apiEndpoints.length > 0,
      apiEndpoints,
      hasObfuscation: obfuscationType !== undefined,
      obfuscationType,
      keyFunctions,
      dependencies,
      complexity,
      linesOfCode: lines.length,
      codeSnippet,
    };
  }

  /**
   * 批量生成摘要骨架
   */
  async summarizeBatch(files: CodeFile[], maxConcurrent = 3): Promise<CodeSummary[]> {
    logger.info(`Building summary skeletons for ${files.length} files...`);

    const results: CodeSummary[] = [];

    for (let i = 0; i < files.length; i += maxConcurrent) {
      const batch = files.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(file => this.summarizeFile(file))
      );
      results.push(...batchResults);

      logger.debug(`Processed batch ${Math.floor(i / maxConcurrent) + 1}/${Math.ceil(files.length / maxConcurrent)}`);
    }

    return results;
  }

  /**
   * 生成项目级确定性骨架（不含主 Purpose / 架构等自由文本）
   */
  async summarizeProject(files: CodeFile[]): Promise<{
    totalFiles: number;
    totalSize: number;
    filePreviews: Array<{url: string; size: number; type: string; preview: string}>;
  }> {
    logger.info('Building project-level summary skeleton...');

    const filePreviews = files.map(f => ({
      url: f.url,
      size: f.size,
      type: f.type,
      preview: f.content.substring(0, 200),
    }));

    return {
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      filePreviews,
    };
  }

  private detectEncryptionMethods(content: string): string[] {
    const methods: string[] = [];
    const rules: Array<[RegExp, string]> = [
      [/\bAES(?:-?[12][0-9]+)?\b/i, 'AES'],
      [/\bRSA\b/, 'RSA'],
      [/\bSHA-?[12][0-9]*\b/i, 'SHA'],
      [/\bMD5\b/, 'MD5'],
      [/\bHMAC\b/, 'HMAC'],
      [/\bTripleDES\b|\b3DES\b/, '3DES'],
      [/\bCryptoJS\b/, 'CryptoJS'],
      [/\bJSEncrypt\b/, 'JSEncrypt'],
    ];
    for (const [regex, label] of rules) {
      if (regex.test(content)) {
        methods.push(label);
      }
    }
    return methods;
  }

  private detectApiEndpoints(content: string): string[] {
    const endpoints = new Set<string>();
    const match = content.match(/["'`](\/[a-zA-Z0-9_\-/]{3,})["'`]/g);
    if (match) {
      for (const m of match.slice(0, 20)) {
        endpoints.add(m.slice(1, -1));
      }
    }
    const urlMatch = content.match(/https?:\/\/[a-zA-Z0-9_\-.]+(?:\/[^\s"'`)]*)?/g);
    if (urlMatch) {
      for (const u of urlMatch.slice(0, 10)) {
        endpoints.add(u);
      }
    }
    return Array.from(endpoints);
  }

  private detectObfuscationType(content: string): string | undefined {
    if (/\\x[0-9a-f]{2}/.test(content)) return 'hex-escape';
    if (/\\u[0-9a-f]{4}/.test(content)) return 'unicode-escape';
    if (/\beval\s*\(/.test(content)) return 'eval';
    if (/^\s*[\[\](),!+]+$/m.test(content)) return 'jsfuck-ish';
    if (/['"][a-zA-Z0-9+/=]{200,}['"]/.test(content)) return 'long-string-array';
    return undefined;
  }

  private extractFunctionNames(content: string): string[] {
    const functionMatches = content.matchAll(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
    const named = Array.from(functionMatches, m => m[1]).filter((name): name is string => !!name);

    const arrowMatches = content.matchAll(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z_$])\s*=>/g);
    const arrow = Array.from(arrowMatches, m => m[1]).filter((name): name is string => !!name);

    return Array.from(new Set([...named, ...arrow])).slice(0, 15);
  }

  private extractDependencies(content: string): string[] {
    const deps = new Set<string>();
    const importMatches = content.matchAll(/import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g);
    for (const m of importMatches) {
      if (m[1]) deps.add(m[1]);
    }
    const requireMatches = content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
    for (const m of requireMatches) {
      if (m[1]) deps.add(m[1]);
    }
    return Array.from(deps).slice(0, 20);
  }

  private assessComplexity(content: string, lineCount: number): 'low' | 'medium' | 'high' {
    const avgLineLength = lineCount > 0 ? content.length / lineCount : 0;
    if (avgLineLength > 100 || lineCount > 2000) return 'high';
    if (avgLineLength > 50 || lineCount > 500) return 'medium';
    return 'low';
  }
}
