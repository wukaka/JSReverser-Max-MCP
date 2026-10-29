/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {getJSHookRuntime} from '../../../src/tools/runtime.js';
import {analyzeSigner, signer} from '../../../src/tools/signer.js';

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

async function withPageEvaluate(
  evaluate: (input: any) => unknown,
  run: () => Promise<void>,
): Promise<void> {
  const runtime = getJSHookRuntime() as any;
  const original = runtime.pageController.getPage;
  runtime.pageController.getPage = async () => ({
    url: () => 'https://example.com',
    evaluate: async (_fn: unknown, input: any) => evaluate(input),
  });
  try {
    await run();
  } finally {
    runtime.pageController.getPage = original;
  }
}

describe('ins_signer', () => {
  it('registers, lists, signs and removes a signer', async () => {
    await withPageEvaluate(
      (input) => `${input.payload.a}|${input.payload.b}`,
      async () => {
        const registerResponse = makeResponse();
        await signer.handler(
          {params: {action: 'register', name: 'unit-signer', expr: 'window.sign'}} as never,
          registerResponse as never,
          {} as never,
        );
        assert.strictEqual(jsonFrom(registerResponse.lines).registered.name, 'unit-signer');

        const listResponse = makeResponse();
        await signer.handler(
          {params: {action: 'list'}} as never,
          listResponse as never,
          {} as never,
        );
        const listed = jsonFrom(listResponse.lines);
        assert.ok(listed.signers.some((entry: any) => entry.name === 'unit-signer'));

        const signResponse = makeResponse();
        await signer.handler(
          {params: {action: 'sign', name: 'unit-signer', payload: {a: 1, b: 2}}} as never,
          signResponse as never,
          {} as never,
        );
        const signed = jsonFrom(signResponse.lines);
        assert.strictEqual(signed.signature, '1|2');

        const removeResponse = makeResponse();
        await signer.handler(
          {params: {action: 'remove', name: 'unit-signer'}} as never,
          removeResponse as never,
          {} as never,
        );
        assert.strictEqual(jsonFrom(removeResponse.lines).removed, true);
      },
    );
  });

  it('rejects signing with an unknown signer', async () => {
    const response = makeResponse();
    await assert.rejects(
      async () => {
        await signer.handler(
          {params: {action: 'sign', name: 'missing-signer', payload: {}}} as never,
          response as never,
          {} as never,
        );
      },
      /Signer not found/,
    );
  });
});

describe('ver_analyze_signer', () => {
  it('reports sensitive and insensitive fields for a stable signer', async () => {
    await withPageEvaluate(
      (input) => `${input.payload.a}|${input.payload.b}`,
      async () => {
        const response = makeResponse();
        await analyzeSigner.handler(
          {
            params: {
              expr: '(p) => p.a + "|" + p.b',
              payload: {a: '1', b: '2', c: '3'},
            },
          } as never,
          response as never,
          {} as never,
        );
        const result = jsonFrom(response.lines);
        assert.strictEqual(result.stable, true);
        assert.deepStrictEqual(result.sensitiveFields.sort(), ['a', 'b']);
        assert.deepStrictEqual(result.insensitiveFields, ['c']);
        assert.strictEqual(result.matrix.length, 3);
      },
    );
  });

  it('detects unstable signatures', async () => {
    let counter = 0;
    await withPageEvaluate(
      () => `sig-${counter++}`,
      async () => {
        const response = makeResponse();
        await analyzeSigner.handler(
          {
            params: {
              expr: 'window.sign',
              payload: {a: '1'},
              trials: 2,
            },
          } as never,
          response as never,
          {} as never,
        );
        const result = jsonFrom(response.lines);
        assert.strictEqual(result.stable, false);
        assert.ok(result.notes.some((note: string) => note.includes('timestamp or nonce')));
      },
    );
  });
});
