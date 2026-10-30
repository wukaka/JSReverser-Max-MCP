/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {CryptoDetector} from '../../../src/modules/crypto/CryptoDetector.js';

describe('CryptoDetector', () => {
  it('detects algorithm keywords', async () => {
    const detector = new CryptoDetector();
    const result = await detector.detect({
      code: 'const hash = md5(input); const x = sha256(y);',
    });

    assert.ok(result.algorithms.length >= 1);
  });
});
