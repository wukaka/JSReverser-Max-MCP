/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {
  xhrBreakpoint,
  evaluateOnCallframe,
  findInScript,
  getPausedInfo,
  getRequestInitiator,
  getScriptSource,
  hook,
  inspectObject,
  listScripts,
  monitorEvents,
  searchInSources,
  breakpoint,
  debugControl,
  traceFunction,
  getStorage,
} from '../../../src/tools/debugger.js';

interface DebuggerResponseHarness {
  lines: string[];
  appendResponseLine(value: string): void;
  setIncludePages(value: boolean): void;
  setIncludeNetworkRequests(value: boolean): void;
  setIncludeConsoleData(value: boolean): void;
  attachImage(value: unknown): void;
  attachNetworkRequest(id: number): void;
  attachConsoleMessage(id: number): void;
  setIncludeWebSocketConnections(value: boolean): void;
  attachWebSocket(id: number): void;
}

interface PausedStateHarness {
  isPaused: boolean;
  callFrames: Array<{
    callFrameId: string;
    location: {
      scriptId: string;
      lineNumber: number;
      columnNumber: number;
    };
  }>;
}

interface DebuggerContextHarness {
  isEnabled(): boolean;
  getPausedState?(): PausedStateHarness;
  evaluateOnCallFrame?(callFrameId: string, expression: string): Promise<{
    exceptionDetails?: {
      text: string;
      exception?: {description?: string};
    };
    result?: unknown;
  }>;
  getClient?(): object | null;
}

interface ToolContextHarness {
  debuggerContext: DebuggerContextHarness;
  getSelectedPage(): {
    evaluate(script: string): Promise<unknown>;
  };
  getSelectedFrame(): {
    evaluate(script: string): Promise<unknown>;
  };
  getNetworkRequestById(): {url(): string};
  getRequestInitiator(): unknown;
}

interface EmptyRequestHarness {
  params: Record<string, never>;
}

function makeResponse(): DebuggerResponseHarness {
  const lines: string[] = [];
  return {
    lines,
    appendResponseLine: (v: string) => lines.push(v),
    setIncludePages: () => undefined,
    setIncludeNetworkRequests: () => undefined,
    setIncludeConsoleData: () => undefined,
    attachImage: () => undefined,
    attachNetworkRequest: () => undefined,
    attachConsoleMessage: () => undefined,
    setIncludeWebSocketConnections: () => undefined,
    attachWebSocket: () => undefined,
  };
}

function makeDisabledContext(): ToolContextHarness {
  return {
    debuggerContext: {
      isEnabled: () => false,
    },
    getSelectedPage: () => ({evaluate: async () => ({})}),
    getSelectedFrame: () => ({evaluate: async () => ({})}),
    getNetworkRequestById: () => ({url: () => 'https://example.com'}),
    getRequestInitiator: () => undefined,
  };
}

describe('debugger tools error paths', () => {
  it('ins_hook should write records into single __hookStore', async () => {
    const response = makeResponse();
    let capturedScript = '';
    const context: ToolContextHarness = {
      debuggerContext: {
        isEnabled: () => true,
      },
      getSelectedPage: () => ({evaluate: async () => ({})}),
      getSelectedFrame: () => ({
        evaluate: async (script: string) => {
          capturedScript = script;
          return {success: true, hookId: 'h_store'};
        },
      }),
      getNetworkRequestById: () => ({url: () => 'https://example.com'}),
      getRequestInitiator: () => undefined,
    };

    await hook.handler(
      {params: {action: 'function', target: 'window.fetch', hookId: 'h_store', logArgs: true, logResult: true, logStack: false}},
      response as unknown as Parameters<typeof hook.handler>[1],
      context as unknown as Parameters<typeof hook.handler>[2],
    );

    assert.ok(capturedScript.includes('window.__hookStore = window.__hookStore || {}'));
    assert.ok(capturedScript.includes('window.__hookStore[hookId]'));
    assert.ok(!capturedScript.includes('__mcp_hook_data__'));
  });

  it('covers debugger-disabled early-return branches', async () => {
    const response = makeResponse();
    const context = makeDisabledContext();

    await listScripts.handler({params: {}} as EmptyRequestHarness, response as unknown as Parameters<typeof listScripts.handler>[1], context as unknown as Parameters<typeof listScripts.handler>[2]);
    await getScriptSource.handler({params: {scriptId: '1', length: 1000}}, response as unknown as Parameters<typeof getScriptSource.handler>[1], context as unknown as Parameters<typeof getScriptSource.handler>[2]);
    await findInScript.handler({params: {scriptId: '1', query: 'x', contextChars: 100, occurrence: 1, caseSensitive: true}}, response as unknown as Parameters<typeof findInScript.handler>[1], context as unknown as Parameters<typeof findInScript.handler>[2]);
    await searchInSources.handler({params: {query: 'x', caseSensitive: false, isRegex: false, maxResults: 30, maxLineLength: 150, excludeMinified: true}}, response as unknown as Parameters<typeof searchInSources.handler>[1], context as unknown as Parameters<typeof searchInSources.handler>[2]);
    await breakpoint.handler({params: {action: 'set', url: 'a.js', lineNumber: 1, isRegex: false}}, response as unknown as Parameters<typeof breakpoint.handler>[1], context as unknown as Parameters<typeof breakpoint.handler>[2]);
    await breakpoint.handler({params: {action: 'remove', breakpointId: 'bp'}}, response as unknown as Parameters<typeof breakpoint.handler>[1], context as unknown as Parameters<typeof breakpoint.handler>[2]);
    await breakpoint.handler({params: {action: 'list'}}, response as unknown as Parameters<typeof breakpoint.handler>[1], context as unknown as Parameters<typeof breakpoint.handler>[2]);
    await getPausedInfo.handler({params: {includeScopes: false, maxScopeDepth: 3}}, response as unknown as Parameters<typeof getPausedInfo.handler>[1], context as unknown as Parameters<typeof getPausedInfo.handler>[2]);
    await debugControl.handler({params: {action: 'resume'}}, response as unknown as Parameters<typeof debugControl.handler>[1], context as unknown as Parameters<typeof debugControl.handler>[2]);
    await debugControl.handler({params: {action: 'pause'}}, response as unknown as Parameters<typeof debugControl.handler>[1], context as unknown as Parameters<typeof debugControl.handler>[2]);
    await debugControl.handler({params: {action: 'step_over'}}, response as unknown as Parameters<typeof debugControl.handler>[1], context as unknown as Parameters<typeof debugControl.handler>[2]);
    await debugControl.handler({params: {action: 'step_into'}}, response as unknown as Parameters<typeof debugControl.handler>[1], context as unknown as Parameters<typeof debugControl.handler>[2]);
    await debugControl.handler({params: {action: 'step_out'}}, response as unknown as Parameters<typeof debugControl.handler>[1], context as unknown as Parameters<typeof debugControl.handler>[2]);
    await evaluateOnCallframe.handler({params: {expression: 'x', frameIndex: 0}}, response as unknown as Parameters<typeof evaluateOnCallframe.handler>[1], context as unknown as Parameters<typeof evaluateOnCallframe.handler>[2]);
    await breakpoint.handler({params: {action: 'set_text', text: 'token', occurrence: 1}}, response as unknown as Parameters<typeof breakpoint.handler>[1], context as unknown as Parameters<typeof breakpoint.handler>[2]);
    await xhrBreakpoint.handler({params: {action: 'set', url: '/api'}}, response as unknown as Parameters<typeof xhrBreakpoint.handler>[1], context as unknown as Parameters<typeof xhrBreakpoint.handler>[2]);
    await xhrBreakpoint.handler({params: {action: 'remove', url: '/api'}}, response as unknown as Parameters<typeof xhrBreakpoint.handler>[1], context as unknown as Parameters<typeof xhrBreakpoint.handler>[2]);
    await traceFunction.handler({params: {functionName: 'sign', pause: false, logArgs: true, logThis: false}}, response as unknown as Parameters<typeof traceFunction.handler>[1], context as unknown as Parameters<typeof traceFunction.handler>[2]);

    assert.ok(response.lines.filter((line) => line.includes('Debugger is not enabled')).length >= 10);
  });

  it('covers runtime error and failure response branches', async () => {
    const response = makeResponse();
    const evaluateReverseScript = async (script: string) => {
      if (script.includes('__mcp_hooks__') && script.includes('return [];')) {
        throw new Error('list hook fail');
      }
      if (script.includes('hookId') && script.includes('Hook already exists')) {
        return {success: false, message: 'Hook already exists with id: h1'};
      }
      if (script.includes('Hook not found')) {
        return {success: false, message: 'Hook not found: missing'};
      }
      if (script.includes('Cannot evaluate')) {
        return {error: 'Cannot evaluate: x'};
      }
      if (script.includes('Monitor already exists')) {
        return {success: false, message: 'Monitor already exists: m1'};
      }
      if (script.includes('Monitor not found')) {
        return {success: false, message: 'Monitor not found: m1'};
      }
      if (script.includes('const type =')) {
        throw new Error('storage fail');
      }
      return {};
    };
    const context: ToolContextHarness = {
      debuggerContext: {
        isEnabled: () => true,
        getPausedState: () => ({
          isPaused: true,
          callFrames: [{callFrameId: 'cf-1', location: {scriptId: '1', lineNumber: 0, columnNumber: 0}}],
        }),
        evaluateOnCallFrame: async () => ({
          exceptionDetails: {
            text: 'boom',
            exception: {description: 'stack boom'},
          },
        }),
        getClient: () => null,
      },
      getSelectedPage: () => ({
        evaluate: evaluateReverseScript,
      }),
      getSelectedFrame: () => ({
        evaluate: evaluateReverseScript,
      }),
      getNetworkRequestById: () => {
        throw new Error('request missing');
      },
      getRequestInitiator: () => undefined,
    };

    await getRequestInitiator.handler({params: {requestId: 1}}, response as unknown as Parameters<typeof getRequestInitiator.handler>[1], context as unknown as Parameters<typeof getRequestInitiator.handler>[2]);
    await hook.handler({params: {action: 'function', target: 'window.fetch', hookId: 'h1', logArgs: true, logResult: true, logStack: false}}, response as unknown as Parameters<typeof hook.handler>[1], context as unknown as Parameters<typeof hook.handler>[2]);
    await hook.handler({params: {action: 'remove', hookId: 'missing'}}, response as unknown as Parameters<typeof hook.handler>[1], context as unknown as Parameters<typeof hook.handler>[2]);
    await assert.doesNotReject(async () => {
      await hook.handler({params: {action: 'list'}}, response as unknown as Parameters<typeof hook.handler>[1], context as unknown as Parameters<typeof hook.handler>[2]);
    });
    await inspectObject.handler({params: {expression: 'window.__not_found__', depth: 2, showMethods: false, showPrototype: false}}, response as unknown as Parameters<typeof inspectObject.handler>[1], context as unknown as Parameters<typeof inspectObject.handler>[2]);
    await getStorage.handler({params: {type: 'all'}}, response as unknown as Parameters<typeof getStorage.handler>[1], context as unknown as Parameters<typeof getStorage.handler>[2]);
    await monitorEvents.handler({params: {action: 'start', selector: '#missing', monitorId: 'm1'}}, response as unknown as Parameters<typeof monitorEvents.handler>[1], context as unknown as Parameters<typeof monitorEvents.handler>[2]);
    await monitorEvents.handler({params: {action: 'stop', monitorId: 'm1'}}, response as unknown as Parameters<typeof monitorEvents.handler>[1], context as unknown as Parameters<typeof monitorEvents.handler>[2]);
    await xhrBreakpoint.handler({params: {action: 'set', url: '/api'}}, response as unknown as Parameters<typeof xhrBreakpoint.handler>[1], context as unknown as Parameters<typeof xhrBreakpoint.handler>[2]);
    await xhrBreakpoint.handler({params: {action: 'remove', url: '/api'}}, response as unknown as Parameters<typeof xhrBreakpoint.handler>[1], context as unknown as Parameters<typeof xhrBreakpoint.handler>[2]);

    assert.ok(response.lines.some((line) => line.includes('Error getting initiator')));
    assert.ok(response.lines.some((line) => line.includes('Hook already exists')));
    assert.ok(response.lines.some((line) => line.includes('Hook not found')));
    assert.ok(response.lines.some((line) => line.includes('Error: list hook fail')));
    assert.ok(response.lines.some((line) => line.includes('Cannot evaluate')));
    assert.ok(response.lines.some((line) => line.includes('Error: storage fail')));
    assert.ok(response.lines.some((line) => line.includes('Monitor already exists')));
    assert.ok(response.lines.some((line) => line.includes('Monitor not found')));
    assert.ok(response.lines.filter((line) => line.includes('Debugger client not available')).length >= 2);
  });
});
