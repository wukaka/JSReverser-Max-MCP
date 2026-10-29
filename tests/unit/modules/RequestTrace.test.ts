/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {
  extractSnippet,
  scoreFrame,
} from '../../../src/modules/network/RequestTrace.js';

const baseFrame = {
  functionName: '',
  scriptId: '1',
  url: 'https://example.com/app.js',
  lineNumber: 0,
  columnNumber: 0,
};

describe('scoreFrame', () => {
  it('ranks a signing-looking frame highest', () => {
    const signer = scoreFrame(
      {...baseFrame, functionName: 'signParams'},
      'function signParams(a){return md5(a + Date.now())}',
    );
    const transport = scoreFrame(
      {...baseFrame, functionName: 'send'},
      'function send(u){return fetch(u)}',
    );
    assert.ok(signer.score > transport.score);
    assert.ok(signer.reasons.some((reason) => reason.includes('signing-related')));
    assert.ok(transport.reasons.some((reason) => reason.includes('transport wrapper')));
  });

  it('returns zero for browser-internal frames', () => {
    const result = scoreFrame(
      {...baseFrame, url: 'chrome://devtools/bundle.js'},
      'function signParams(a){return md5(a)}',
    );
    assert.strictEqual(result.score, 0);
    assert.deepStrictEqual(result.reasons, ['browser-internal frame']);
  });
});

describe('extractSnippet', () => {
  it('returns a window around the frame line in multi-line sources', () => {
    const source = Array.from({length: 20}, (_, i) => `line${i + 1}`).join('\n');
    const snippet = extractSnippet(source, 9, 0, 40);
    assert.ok(snippet.includes('line10'));
    assert.ok(!snippet.includes('line20'));
  });

  it('uses character offsets for minified single-line sources', () => {
    const source = `${'a'.repeat(1000)}SIGN_HERE${'b'.repeat(1000)}`;
    const snippet = extractSnippet(source, 0, 1000, 50);
    assert.ok(snippet.includes('SIGN_HERE'));
    assert.ok(snippet.length <= 101);
  });
});
