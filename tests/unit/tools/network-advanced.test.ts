/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import type {HTTPRequest} from '../../../src/third_party/index.js';
import {getJSHookRuntime} from '../../../src/tools/runtime.js';
import {
  diffNetworkRequests,
  exportRequest,
  headerAblation,
  replayRequest,
} from '../../../src/tools/network-advanced.js';

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

function fakeRequest(): HTTPRequest {
  return {
    url: () => 'https://api.example.com/list?page=1',
    method: () => 'POST',
    headers: () => ({
      'content-type': 'application/json',
      accept: '*/*',
      'x-sign': 'abc',
    }),
    postData: () => '{"page":1}',
  } as unknown as HTTPRequest;
}

function fakeContext(requests: HTTPRequest[]): any {
  return {
    getNetworkRequestById: (id: number) => requests[id] ?? requests[0],
  };
}

async function withRuntimePage(
  evaluate: (input: any) => unknown,
  run: () => Promise<void>,
): Promise<void> {
  const runtime = getJSHookRuntime() as any;
  const originals = {
    getPage: runtime.pageController.getPage,
    getCookies: runtime.pageController.getCookies,
  };
  runtime.pageController.getPage = async () => ({
    url: () => 'https://api.example.com/list',
    evaluate: async (_fn: unknown, input: any) => evaluate(input),
  });
  runtime.pageController.getCookies = async () => [
    {name: 'sid', value: '1', domain: 'example.com'},
  ];
  try {
    await run();
  } finally {
    runtime.pageController.getPage = originals.getPage;
    runtime.pageController.getCookies = originals.getCookies;
  }
}

describe('run_replay_request', () => {
  it('applies overrides and reports raw evidence', async () => {
    const seen: any[] = [];
    await withRuntimePage(
      (input) => {
        seen.push(input);
        return {
          status: 200,
          statusText: 'OK',
          headers: {'content-type': 'application/json'},
          body: '{"ok":true}',
          durationMs: 4,
        };
      },
      async () => {
        const response = makeResponse();
        await replayRequest.handler(
          {
            params: {
              reqid: 1,
              removeHeaders: ['x-sign'],
              headers: {'X-Extra': 'v'},
            },
          } as never,
          response as never,
          fakeContext([fakeRequest()]),
        );
        const result = jsonFrom(response.lines);
        assert.strictEqual(result.classification, 'success');
        assert.strictEqual(result.evidence.status, 200);
        assert.strictEqual(seen[0].headers['x-sign'], undefined);
        assert.strictEqual(seen[0].headers['x-extra'], 'v');
      },
    );
  });
});

describe('run_header_ablation', () => {
  it('identifies required and removable headers', async () => {
    await withRuntimePage(
      (input) => {
        const hasSign = Object.prototype.hasOwnProperty.call(input.headers, 'x-sign');
        return {
          status: hasSign ? 200 : 403,
          statusText: hasSign ? 'OK' : 'Forbidden',
          headers: {},
          body: hasSign ? '{"ok":true}' : 'sign invalid',
          durationMs: 2,
        };
      },
      async () => {
        const response = makeResponse();
        await headerAblation.handler(
          {
            params: {
              reqid: 1,
              candidates: ['x-sign', 'accept'],
              maxRuns: 4,
            },
          } as never,
          response as never,
          fakeContext([fakeRequest()]),
        );
        const result = jsonFrom(response.lines);
        assert.strictEqual(result.baselineSucceeded, true);
        assert.deepStrictEqual(result.requiredHeaders, ['x-sign']);
        assert.deepStrictEqual(result.removableHeaders, ['accept']);
        assert.ok(result.curl.includes('curl '));
        assert.ok(!result.minimalRequest.headers['accept']);
      },
    );
  });
});

describe('ver_diff_network_requests', () => {
  it('reports differences between two requests', async () => {
    const a = fakeRequest();
    const b = {
      url: () => 'https://api.example.com/list?page=2',
      method: () => 'POST',
      headers: () => ({'content-type': 'application/json', accept: '*/*', 'x-sign': 'def'}),
      postData: () => '{"page":2}',
    } as unknown as HTTPRequest;
    const response = makeResponse();
    await diffNetworkRequests.handler(
      {params: {a: 0, b: 1}} as never,
      response as never,
      fakeContext([a, b]),
    );
    const result = jsonFrom(response.lines);
    assert.deepStrictEqual(result.query, {page: {a: '1', b: '2'}});
    assert.deepStrictEqual(result.headers.changed['x-sign'], {a: 'abc', b: 'def'});
    assert.strictEqual(result.body.kind, 'json');
  });
});

describe('run_export_request', () => {
  it('exports a runnable curl snippet', async () => {
    const response = makeResponse();
    await exportRequest.handler(
      {params: {reqid: 1, format: 'curl', removeHeaders: ['x-sign']}} as never,
      response as never,
      fakeContext([fakeRequest()]),
    );
    const text = response.lines.join('\n');
    assert.ok(text.includes('curl '));
    assert.ok(text.includes('--data-raw'));
    assert.ok(!text.includes('x-sign'));
  });
});
