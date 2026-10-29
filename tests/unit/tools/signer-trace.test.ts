/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {traceRequestToSigner} from '../../../src/tools/signer-trace.js';

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

const SOURCES: Record<string, string> = {
  'sdk': 'function send(url){return fetch(url + token)}',
  'app': 'function signParams(a){return md5(a + Date.now())}',
  'devtools': 'function internal(){}',
};

function makeContext(): any {
  return {
    getNetworkRequestById: () => ({
      url: () => 'https://api.example.com/list',
    }),
    getRequestInitiator: () => ({
      type: 'script',
      stack: {
        callFrames: [
          {
            functionName: 'send',
            scriptId: 'sdk',
            url: 'https://cdn.example.com/sdk.js',
            lineNumber: 0,
            columnNumber: 0,
          },
          {
            functionName: 'signParams',
            scriptId: 'app',
            url: 'https://www.example.com/app.js',
            lineNumber: 10,
            columnNumber: 0,
          },
          {
            functionName: 'internal',
            scriptId: 'devtools',
            url: 'chrome://devtools/bundle.js',
            lineNumber: 0,
            columnNumber: 0,
          },
        ],
        parent: {callFrames: []},
      },
    }),
    debuggerContext: {
      getScriptSource: async (scriptId: string) => SOURCES[scriptId] ?? '',
    },
  };
}

describe('loc_trace_request_to_signer', () => {
  it('ranks signing frames above transport and internal frames', async () => {
    const response = makeResponse();
    await traceRequestToSigner.handler(
      {params: {reqid: 1, topN: 3}} as never,
      response as never,
      makeContext(),
    );

    const result = jsonFrom(response.lines);
    assert.strictEqual(result.totalFrames, 3);
    assert.strictEqual(result.candidates[0].functionName, 'signParams');
    assert.ok(result.candidates[0].score > 0);
    assert.ok(result.candidates[0].reasons.some((reason: string) => reason.includes('signing')));
    assert.ok(
      result.candidates.some(
        (candidate: any) => candidate.url.startsWith('chrome://') && candidate.score === 0,
      ),
    );
    assert.ok(result.caveat.includes('entry points'));
  });

  it('reports when no initiator is available', async () => {
    const response = makeResponse();
    await traceRequestToSigner.handler(
      {params: {reqid: 1}} as never,
      response as never,
      {
        getNetworkRequestById: () => ({url: () => 'https://api.example.com/list'}),
        getRequestInitiator: () => undefined,
        debuggerContext: {},
      } as never,
    );
    assert.ok(response.lines.join('\n').includes('No initiator information'));
  });
});
