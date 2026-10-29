/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {McpResponse} from '../../src/McpResponse.js';

describe('McpResponse network detail formatting', () => {
  it('renders richer request metadata for attached network requests', async () => {
    const response = new McpResponse();
    response.attachNetworkRequest(7);

    const context = {
      getNetworkRequestById() {
        return {
          url: () => 'https://api.example.com/orders',
          method: () => 'POST',
          resourceType: () => 'fetch',
          headers: () => ({'content-type': 'application/json', accept: '*/*'}),
          hasPostData: () => true,
          postData: () => '{"a":1}',
          fetchPostData: async () => '{"a":1}',
          response: () => ({
            status: () => 200,
            headers: () => ({'content-type': 'application/json'}),
            buffer: async () => Buffer.from('{"ok":true}', 'utf8'),
          }),
          failure: () => null,
          redirectChain: () => [],
        };
      },
      getNetworkRequestStableId: () => 7,
      getNetworkConditions: () => undefined,
      getCpuThrottlingRate: () => 1,
      getPages: () => [],
      isPageSelected: () => false,
      getConsoleData: () => [],
      getWebSocketConnections: () => [],
      getWebSocketById: () => {
        throw new Error('not used');
      },
      getConsoleMessageById: () => {
        throw new Error('not used');
      },
      getConsoleMessageStableId: () => 0,
      createPagesSnapshot: async () => undefined,
      getNavigationTimeout: () => 30_000,
    };

    const [text] = await response.handle(
      'obs_get_network_request',
      context as never,
    );

    assert.strictEqual(text.type, 'text');
    assert.ok(text.text.includes('Method: POST'));
    assert.ok(text.text.includes('Resource Type: fetch'));
    assert.ok(text.text.includes('### Request Headers (2)'));
    assert.ok(text.text.includes('### Response Headers (1)'));
    assert.ok(text.text.includes('### Response Body'));
  });

  it('omits bodies and shows a hint when includeBody is false', async () => {
    const response = new McpResponse();
    response.attachNetworkRequest(7, {includeBody: false});

    const context = {
      getNetworkRequestById() {
        return {
          url: () => 'https://api.example.com/orders',
          method: () => 'POST',
          resourceType: () => 'fetch',
          headers: () => ({'content-type': 'application/json', accept: '*/*'}),
          hasPostData: () => true,
          postData: () => '{"a":1}',
          fetchPostData: async () => '{"a":1}',
          response: () => ({
            status: () => 200,
            headers: () => ({'content-type': 'application/json'}),
            buffer: async () => Buffer.from('{"ok":true}', 'utf8'),
          }),
          failure: () => null,
          redirectChain: () => [],
        };
      },
      getNetworkRequestStableId: () => 7,
      getNetworkConditions: () => undefined,
      getCpuThrottlingRate: () => 1,
      getPages: () => [],
      isPageSelected: () => false,
      getConsoleData: () => [],
      getWebSocketConnections: () => [],
      getWebSocketById: () => {
        throw new Error('not used');
      },
      getConsoleMessageById: () => {
        throw new Error('not used');
      },
      getConsoleMessageStableId: () => 0,
      createPagesSnapshot: async () => undefined,
      getNavigationTimeout: () => 30_000,
    };

    const [text] = await response.handle(
      'obs_get_network_request',
      context as never,
    );

    assert.strictEqual(text.type, 'text');
    assert.ok(text.text.includes('Method: POST'));
    assert.ok(text.text.includes('### Request Headers (2)'));
    assert.ok(text.text.includes('### Response Headers (1)'));
    assert.ok(!text.text.includes('### Request Body'));
    assert.ok(!text.text.includes('### Response Body'));
    assert.ok(!text.text.includes('{"a":1}'));
    assert.ok(!text.text.includes('{"ok":true}'));
    assert.ok(text.text.includes('### Body Sizes'));
    assert.ok(text.text.includes('Request body: 7 bytes'));
    assert.ok(text.text.includes('Response body: 11 bytes'));
    assert.ok(text.text.includes('toFile=true'));
  });

  it('renders request failure details with the new failure heading', async () => {
    const response = new McpResponse();
    response.attachNetworkRequest(9);

    const context = {
      getNetworkRequestById() {
        return {
          url: () => 'https://api.example.com/fail',
          method: () => 'GET',
          resourceType: () => 'xhr',
          headers: () => ({}),
          hasPostData: () => false,
          postData: () => undefined,
          fetchPostData: async () => undefined,
          response: () => null,
          failure: () => ({errorText: 'net::ERR_ABORTED'}),
          redirectChain: () => [],
        };
      },
      getNetworkRequestStableId: () => 9,
      getNetworkConditions: () => undefined,
      getCpuThrottlingRate: () => 1,
      getPages: () => [],
      isPageSelected: () => false,
      getConsoleData: () => [],
      getWebSocketConnections: () => [],
      getWebSocketById: () => {
        throw new Error('not used');
      },
      getConsoleMessageById: () => {
        throw new Error('not used');
      },
      getConsoleMessageStableId: () => 0,
      createPagesSnapshot: async () => undefined,
      getNavigationTimeout: () => 30_000,
    };

    const [text] = await response.handle(
      'obs_get_network_request',
      context as never,
    );

    assert.strictEqual(text.type, 'text');
    assert.ok(text.text.includes('Method: GET'));
    assert.ok(text.text.includes('Resource Type: xhr'));
    assert.ok(text.text.includes('### Request Failure'));
    assert.ok(text.text.includes('net::ERR_ABORTED'));
  });
});
