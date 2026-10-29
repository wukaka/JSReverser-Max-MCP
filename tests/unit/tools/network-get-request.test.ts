/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {readFile, rm} from 'node:fs/promises';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, it} from 'node:test';

import {getNetworkRequest} from '../../../src/tools/network.js';

interface ResponseHarness {
  lines: string[];
  attached?: {reqid: number; includeBody?: boolean};
  appendResponseLine(value: string): void;
  attachNetworkRequest(reqid: number, options?: {includeBody?: boolean}): void;
}

function makeResponse(): ResponseHarness {
  const response: ResponseHarness = {
    lines: [],
    appendResponseLine: (value: string) => response.lines.push(value),
    attachNetworkRequest: (reqid, options) => {
      response.attached = {reqid, includeBody: options?.includeBody};
    },
  };
  return response;
}

function makeContext(body: string): any {
  return {
    getNetworkRequestById: () => ({
      hasPostData: () => false,
      postData: () => undefined,
      fetchPostData: async () => undefined,
      response: () => ({
        buffer: async () => Buffer.from(body, 'utf8'),
      }),
    }),
    getDevToolsData: async () => ({}),
    resolveCdpRequestId: () => undefined,
  };
}

describe('obs_get_network_request toFile', () => {
  it('writes bodies larger than 10KB to a file and skips inline bodies', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'mcp-output-'));
    process.env.MCP_OUTPUT_DIR = dir;
    try {
      const response = makeResponse();
      await getNetworkRequest.handler(
        {params: {reqid: 7, includeBody: true, toFile: true}} as never,
        response as never,
        makeContext('x'.repeat(20_000)),
      );

      assert.deepStrictEqual(response.attached, {reqid: 7, includeBody: false});
      const note = response.lines.find((line) => line.includes('written to'));
      assert.ok(note, 'expected a written-to note');
      const filePath = note!.split('written to ')[1]!;
      const content = await readFile(filePath, 'utf8');
      assert.strictEqual(content.length, 20_000);
    } finally {
      delete process.env.MCP_OUTPUT_DIR;
      await rm(dir, {recursive: true, force: true});
    }
  });

  it('returns small bodies inline when toFile is set', async () => {
    const response = makeResponse();
    await getNetworkRequest.handler(
      {params: {reqid: 7, toFile: true}} as never,
      response as never,
      makeContext('small'),
    );
    assert.deepStrictEqual(response.attached, {reqid: 7, includeBody: true});
    assert.strictEqual(
      response.lines.some((line) => line.includes('written to')),
      false,
    );
  });

  it('keeps the default headers-only behavior without toFile', async () => {
    const response = makeResponse();
    await getNetworkRequest.handler(
      {params: {reqid: 7}} as never,
      response as never,
      makeContext('small'),
    );
    assert.deepStrictEqual(response.attached, {reqid: 7, includeBody: false});
  });
});
