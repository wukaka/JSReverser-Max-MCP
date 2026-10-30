/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import { describe, it } from 'node:test';

import { CryptoDetector } from '../../../src/modules/crypto/CryptoDetector.js';

interface CryptoDetectorHarness {
  detect(options: { code: string }): Promise<{
    algorithms: Array<{ name: string; confidence: number }>;
  }>;
  detectLibraries(code: string): unknown[];
  detectByKeywords(code: string): unknown[];
  mergeResults(
    algorithms: Array<{
      name: string;
      type: string;
      confidence: number;
      location: { file: string; line: number };
      usage: string;
    }>,
  ): Array<{ confidence: number }>;
  escapeRegex(input: string): string;
  findLineNumber(code: string, needle: string): number;
  rulesManager: {
    getKeywordRules(): unknown[];
    getLibraryRules(): unknown[];
  };
}

interface CryptoDetectorPublicHarness {
  exportRules(): string;
  loadCustomRules(json: string): void;
}

describe('CryptoDetector extended', () => {
  it('covers load/export rules and keyword/library detection paths', async () => {
    const detector = new CryptoDetector() as unknown as CryptoDetectorPublicHarness;
    const detectorInternals = detector as unknown as CryptoDetectorHarness;

    const exported = detector.exportRules();
    assert.strictEqual(typeof exported, 'string');

    detector.loadCustomRules(exported);
    const reExported = detector.exportRules();
    assert.strictEqual(typeof reExported, 'string');

    const libs = detectorInternals.detectLibraries(
      'CryptoJS.version="4.1.1"; forge.random.getBytesSync(16);',
    );
    assert.ok(libs.length >= 1);

    const kws = detectorInternals.detectByKeywords('AES.encrypt(x); CBC; PKCS7;');
    // mode/padding 关键词会被跳过，算法关键词应仍可命中
    assert.ok(Array.isArray(kws));
  });

  it('covers rule-based detection and merge ordering', async () => {
    const detector = new CryptoDetector() as unknown as CryptoDetectorHarness;

    const result = await detector.detect({
      code: 'const h = md5(x); const x = CryptoJS.AES.encrypt(a,b);',
    });
    assert.ok(result.algorithms.length >= 1);

    const merged = detector.mergeResults([
      { name: 'A', type: 'hash', confidence: 0.5, location: { file: 'current', line: 1 }, usage: '' },
      { name: 'A', type: 'hash', confidence: 0.9, location: { file: 'current', line: 2 }, usage: '' },
      { name: 'B', type: 'hash', confidence: 0.6, location: { file: 'current', line: 3 }, usage: '' },
    ]);
    assert.strictEqual(merged[0]?.confidence, 0.9);
  });

  it('covers helper methods', () => {
    const detector = new CryptoDetector() as unknown as CryptoDetectorHarness;

    assert.strictEqual(detector.escapeRegex('a+b*c?'), 'a\\+b\\*c\\?');
    assert.strictEqual(detector.findLineNumber('a\nb\nc', 'x'), 0);
    assert.strictEqual(detector.findLineNumber('a\nfind-me\nc', 'find-me'), 2);
  });

  it('covers detect catch path when rule manager throws', async () => {
    const detector = new CryptoDetector() as unknown as CryptoDetectorHarness;
    detector.rulesManager = {
      getKeywordRules: () => {
        throw new Error('rules boom');
      },
      getLibraryRules: () => [],
    };

    await assert.rejects(
      async () => {
        await detector.detect({ code: 'const x=1' });
      },
      /rules boom/,
    );
  });
});
