/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {
  buildReplaySpec,
  classifyReplay,
  diffRequests,
  toCurl,
  toNodeFetch,
} from '../../../src/modules/network/RequestReplay.js';
import {assertAllowedUrl} from '../../../src/modules/safety/RequestScope.js';
import type {HTTPRequest} from '../../../src/third_party/index.js';

function fakeRequest(options: {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}): HTTPRequest {
  return {
    url: () => options.url ?? 'https://api.example.com/orders?x=1',
    method: () => options.method ?? 'POST',
    headers: () => options.headers ?? {'content-type': 'application/json', 'x-sign': 'abc'},
    postData: () => options.body ?? '{"a":1}',
  } as unknown as HTTPRequest;
}

describe('buildReplaySpec', () => {
  it('applies header, query, body and removal overrides', () => {
    const spec = buildReplaySpec(fakeRequest({}), {
      headers: {'X-New': 'v'},
      removeHeaders: ['x-sign'],
      query: {page: '2'},
      body: '{"a":2}',
    });
    assert.strictEqual(spec.method, 'POST');
    assert.strictEqual(spec.headers['x-sign'], undefined);
    assert.strictEqual(spec.headers['x-new'], 'v');
    assert.ok(spec.url.endsWith('page=2'));
    assert.strictEqual(spec.body, '{"a":2}');
  });

  it('drops the body for GET requests', () => {
    const spec = buildReplaySpec(fakeRequest({method: 'GET', body: 'ignored'}), {});
    assert.strictEqual(spec.body, undefined);
  });
});

describe('classifyReplay', () => {
  it('classifies success, auth, risk control, signature, rate limit and network errors', () => {
    assert.strictEqual(classifyReplay(200, '{"ok":true}').classification, 'success');
    assert.strictEqual(classifyReplay(401, 'unauthorized').classification, 'auth_invalid');
    assert.strictEqual(classifyReplay(412, 'need captcha').classification, 'risk_control');
    assert.strictEqual(classifyReplay(400, 'sign invalid').classification, 'signature_invalid');
    assert.strictEqual(classifyReplay(429, '').classification, 'rate_limited');
    assert.strictEqual(classifyReplay(400, 'bad param').classification, 'param_invalid');
    assert.strictEqual(classifyReplay(500, 'boom').classification, 'unknown');
  });
});

describe('diffRequests', () => {
  it('reports query, header and JSON body differences', () => {
    const a = fakeRequest({url: 'https://api.example.com/o?x=1', body: '{"a":1,"b":2}'});
    const b = fakeRequest({
      url: 'https://api.example.com/o?x=2',
      headers: {'content-type': 'application/json', 'x-sign': 'def'},
      body: '{"a":1,"b":3}',
    });
    const diff = diffRequests(a, b);
    assert.deepStrictEqual(diff.query, {x: {a: '1', b: '2'}});
    assert.deepStrictEqual(diff.headers?.changed['x-sign'], {a: 'abc', b: 'def'});
    assert.strictEqual(diff.body?.kind, 'json');
    assert.ok(diff.body?.json?.some((entry) => entry.path === 'b'));
  });
});

describe('request export', () => {
  it('renders curl and node-fetch snippets', () => {
    const spec = buildReplaySpec(fakeRequest({}), {});
    const curl = toCurl(spec);
    assert.ok(curl.includes('curl '));
    assert.ok(curl.includes('-X POST'));
    assert.ok(curl.includes('--data-raw'));
    const node = toNodeFetch(spec);
    assert.ok(node.includes('await fetch('));
    assert.ok(node.includes('"x-sign"'));
  });
});

describe('RequestScope', () => {
  it('allows same-site URLs and blocks cross-site ones', () => {
    assert.doesNotThrow(() =>
      assertAllowedUrl('https://api.example.com/x', 'https://www.example.com/page'),
    );
    assert.throws(
      () => assertAllowedUrl('https://evil.test/x', 'https://www.example.com/page'),
      /cross-site requests are disabled/,
    );
  });

  it('allows explicitly allowed hosts', () => {
    assert.doesNotThrow(() =>
      assertAllowedUrl('https://evil.test/x', 'https://www.example.com/page', {
        allowHosts: ['evil.test'],
      }),
    );
  });
});
