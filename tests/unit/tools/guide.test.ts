/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {reverseGuide} from '../../../src/tools/guide.js';

interface ResponseHarness {
  lines: string[];
  appendResponseLine(value: string): void;
}

function makeResponse(): ResponseHarness {
  const lines: string[] = [];
  return {
    lines,
    appendResponseLine: (value: string) => lines.push(value),
  };
}

function jsonFrom(lines: string[]): any {
  const start = lines.indexOf('```json');
  const end = lines.indexOf('```', start + 1);
  return JSON.parse(lines.slice(start + 1, end).join('\n'));
}

describe('reverse_guide', () => {
  it('returns a route without conclusions', async () => {
    const response = makeResponse();
    await reverseGuide.handler(
      {params: {goal: '从 0 还原某接口签名'}} as never,
      response as never,
      {} as never,
    );
    const result = jsonFrom(response.lines);
    assert.strictEqual(result.scenario, 'from_zero');
    assert.ok(Array.isArray(result.recommendedPath));
    assert.ok(result.recommendedPath.length > 0);
    assert.ok(Array.isArray(result.avoid));
    assert.ok(result.note.includes('not a conclusion'));
  });

  it('honors an explicit scenario', async () => {
    const response = makeResponse();
    await reverseGuide.handler(
      {params: {goal: 'whatever', scenario: 'header_necessity'}} as never,
      response as never,
      {} as never,
    );
    const result = jsonFrom(response.lines);
    assert.strictEqual(result.scenario, 'header_necessity');
    assert.strictEqual(result.matchedBy, 'explicit');
  });
});
