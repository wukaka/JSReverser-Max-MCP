/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {zod} from '../third_party/index.js';

import {
  buildReplaySpec,
  diffRequests,
  replaySpec,
  toCurl,
  toNodeAxios,
  toNodeFetch,
} from '../modules/network/RequestReplay.js';
import type {
  ReplayOutcome,
  ReplayOverrides,
} from '../modules/network/RequestReplay.js';
import {
  assertAllowedUrl,
  assertRateLimit,
  recordReplayAudit,
} from '../modules/safety/RequestScope.js';
import {recordTaskEvidence} from '../modules/task/TaskContext.js';

import {ToolCategory} from './categories.js';
import {getJSHookRuntime} from './runtime.js';
import {defineTool} from './ToolDefinition.js';
import type {Context} from './ToolDefinition.js';

const DEFAULT_TIMEOUT_MS = 15000;

const PAGE_UNCONTROLLABLE_HEADERS = new Set([
  'host',
  'content-length',
  'connection',
  'accept-encoding',
  'cookie',
  'user-agent',
  'referer',
  'origin',
  'accept-language',
  'sec-fetch-mode',
  'sec-fetch-site',
  'sec-fetch-dest',
]);

const replayCommonSchema = {
  usePageContext: zod
    .boolean()
    .optional()
    .describe(
      'Run the request inside the page (inherits cookies, default true). Set false to replay from Node with page cookies.',
    ),
  timeoutMs: zod
    .number()
    .int()
    .positive()
    .optional()
    .describe(`Request timeout in milliseconds (default: ${DEFAULT_TIMEOUT_MS}).`),
  allowHosts: zod
    .array(zod.string())
    .optional()
    .describe(
      'Extra hosts allowed for replay. Cross-site targets are blocked by default.',
    ),
};

interface ReplayToolParams {
  reqid: number;
  usePageContext?: boolean;
  timeoutMs?: number;
  allowHosts?: string[];
}

async function performReplay(
  context: Context,
  params: ReplayToolParams,
  overrides: ReplayOverrides,
): Promise<{outcome: ReplayOutcome; spec: ReturnType<typeof buildReplaySpec>}> {
  const runtime = getJSHookRuntime();
  const request = context.getNetworkRequestById(params.reqid);
  const spec = buildReplaySpec(request, overrides);
  const page = await runtime.pageController.getPage();

  assertAllowedUrl(spec.url, page.url(), {allowHosts: params.allowHosts});
  assertRateLimit();

  const usePageContext = params.usePageContext !== false;
  const outcome = await replaySpec(spec, {
    usePageContext,
    page,
    getCookies: async () =>
      (await runtime.pageController.getCookies()) as Array<{
        name: string;
        value: string;
        domain?: string;
      }>,
    timeoutMs: params.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  });

  recordReplayAudit({
    timestamp: new Date().toISOString(),
    method: spec.method,
    url: spec.url,
    classification: outcome.classification,
    status: outcome.evidence.status,
    durationMs: outcome.evidence.durationMs,
  });

  return {outcome, spec};
}

function appendJson(
  response: {appendResponseLine(value: string): void},
  data: unknown,
): void {
  response.appendResponseLine('```json');
  response.appendResponseLine(JSON.stringify(data, null, 2));
  response.appendResponseLine('```');
}

export const replayRequest = defineTool({
  name: 'run_replay_request',
  description:
    'Replays a captured request with optional header/body/query overrides and returns the raw status, response snippet, and a failure classification. Use it to verify hypotheses about required headers or signing inputs.',
  annotations: {
    title: 'Replay Request',
    category: ToolCategory.NETWORK,
    readOnlyHint: false,
  },
  schema: {
    reqid: zod.number().int().describe('The reqid from obs_list_network_requests.'),
    method: zod.string().optional().describe('Override HTTP method.'),
    url: zod.string().optional().describe('Override the full URL.'),
    headers: zod
      .record(zod.string(), zod.string())
      .optional()
      .describe('Headers to set or override.'),
    removeHeaders: zod
      .array(zod.string())
      .optional()
      .describe('Header names to remove.'),
    body: zod.string().optional().describe('Override the request body.'),
    query: zod
      .record(zod.string(), zod.string())
      .optional()
      .describe('Query parameters to set or override.'),
    ...replayCommonSchema,
  },
  handler: async (request, response, context) => {
    const {outcome, spec} = await performReplay(context, request.params, {
      method: request.params.method,
      url: request.params.url,
      headers: request.params.headers,
      removeHeaders: request.params.removeHeaders,
      body: request.params.body,
      query: request.params.query,
    });

    const recorded = await recordTaskEvidence('experiments', {
      tool: 'run_replay_request',
      method: spec.method,
      url: spec.url,
      classification: outcome.classification,
      status: outcome.evidence.status,
      durationMs: outcome.evidence.durationMs,
      removedHeaders: request.params.removeHeaders ?? [],
      overriddenHeaders: Object.keys(request.params.headers ?? {}),
    });

    appendJson(response, {
      classification: outcome.classification,
      request: {
        method: spec.method,
        url: spec.url,
        headerNames: Object.keys(spec.headers),
        bodySize: spec.body?.length ?? 0,
      },
      evidence: outcome.evidence,
      suggestions: outcome.suggestions,
      evidenceRecorded: recorded,
    });
  },
});

export const headerAblation = defineTool({
  name: 'run_header_ablation',
  description:
    'Finds which request headers are required by repeatedly replaying the request with headers removed. Returns per-run evidence, the required/removable sets, and a minimal request (including curl).',
  annotations: {
    title: 'Header Ablation',
    category: ToolCategory.NETWORK,
    readOnlyHint: false,
  },
  schema: {
    reqid: zod.number().int().describe('The reqid to ablate.'),
    candidates: zod
      .array(zod.string())
      .optional()
      .describe(
        'Header names to test. Defaults to all page-controllable headers.',
      ),
    maxRuns: zod
      .number()
      .int()
      .positive()
      .optional()
      .describe('Maximum number of replays (default: 10).'),
    mode: zod
      .enum(['greedy', 'binary'])
      .optional()
      .describe('Search strategy (default: greedy).'),
    ...replayCommonSchema,
  },
  handler: async (request, response, context) => {
    const runtime = getJSHookRuntime();
    const original = context.getNetworkRequestById(request.params.reqid);
    const maxRuns = request.params.maxRuns ?? 10;
    const mode = request.params.mode ?? 'greedy';

    const allHeaders = Object.keys(original.headers());
    const candidates = (
      request.params.candidates ??
      allHeaders.filter((name) => !PAGE_UNCONTROLLABLE_HEADERS.has(name.toLowerCase()))
    ).map((name) => name.toLowerCase());

    const runs: Array<{
      removedHeaders: string[];
      status?: number;
      classification: string;
      durationMs: number;
    }> = [];

    const probe = async (removed: string[]): Promise<boolean> => {
      const {outcome} = await performReplay(context, request.params, {
        removeHeaders: removed,
      });
      runs.push({
        removedHeaders: removed,
        status: outcome.evidence.status,
        classification: outcome.classification,
        durationMs: outcome.evidence.durationMs,
      });
      return outcome.classification === 'success';
    };

    const baselineOk = await probe([]);
    if (!baselineOk) {
      const recorded = await recordTaskEvidence('experiments', {
        tool: 'run_header_ablation',
        url: original.url(),
        baselineSucceeded: false,
        runs,
      });
      appendJson(response, {
        baselineSucceeded: false,
        runs,
        message:
          'Baseline replay failed; fix the baseline before ablating headers.',
        evidenceRecorded: recorded,
      });
      return;
    }

    const removable: string[] = [];
    const required: string[] = [];
    const untested: string[] = [];

    if (mode === 'greedy') {
      for (const header of candidates) {
        if (runs.length - 1 >= maxRuns) {
          untested.push(header);
          continue;
        }
        const trial = [...removable, header];
        if (await probe(trial)) {
          removable.push(header);
        } else {
          required.push(header);
        }
      }
    } else {
      let removableSet = new Set<string>();
      const tryRemoveGroup = async (group: string[]): Promise<void> => {
        if (group.length === 0) {
          return;
        }
        if (runs.length - 1 >= maxRuns) {
          untested.push(...group);
          return;
        }
        const trial = new Set([...removableSet, ...group]);
        if (await probe([...trial])) {
          removableSet = trial;
          return;
        }
        if (group.length === 1) {
          required.push(group[0]!);
          return;
        }
        const mid = Math.floor(group.length / 2);
        await tryRemoveGroup(group.slice(0, mid));
        await tryRemoveGroup(group.slice(mid));
      };
      await tryRemoveGroup(candidates);
      removable.push(...removableSet);
    }

    const minimalHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(original.headers())) {
      if (!removable.includes(key.toLowerCase())) {
        minimalHeaders[key] = value;
      }
    }
    const minimalSpec = buildReplaySpec(original, {
      removeHeaders: removable,
    });

    const recorded = await recordTaskEvidence('experiments', {
      tool: 'run_header_ablation',
      url: minimalSpec.url,
      method: minimalSpec.method,
      requiredHeaders: required,
      removableHeaders: removable,
      incomplete: untested.length > 0,
      totalRuns: runs.length,
    });

    appendJson(response, {
      baselineSucceeded: true,
      mode,
      totalRuns: runs.length,
      incomplete: untested.length > 0,
      evidenceRecorded: recorded,
      runs,
      requiredHeaders: required,
      removableHeaders: removable,
      untestedHeaders: untested,
      minimalRequest: {
        method: minimalSpec.method,
        url: minimalSpec.url,
        headers: minimalHeaders,
        bodySize: minimalSpec.body?.length ?? 0,
      },
      curl: toCurl(minimalSpec, minimalHeaders),
    });
  },
});

export const diffNetworkRequests = defineTool({
  name: 'ver_diff_network_requests',
  description:
    'Compares two captured requests and returns only the differences in method, URL, query, headers, and body (JSON-aware).',
  annotations: {
    title: 'Diff Network Requests',
    category: ToolCategory.NETWORK,
    readOnlyHint: true,
  },
  schema: {
    a: zod.number().int().describe('First reqid.'),
    b: zod.number().int().describe('Second reqid.'),
    ignoreHeaders: zod
      .array(zod.string())
      .optional()
      .describe('Header names to ignore (e.g. cookies, timestamps).'),
    jsonAware: zod
      .boolean()
      .optional()
      .describe('Compare JSON bodies structurally (default: true).'),
  },
  handler: async (request, response, context) => {
    const a = context.getNetworkRequestById(request.params.a);
    const b = context.getNetworkRequestById(request.params.b);
    appendJson(
      response,
      diffRequests(a, b, {
        ignoreHeaders: request.params.ignoreHeaders,
        jsonAware: request.params.jsonAware,
      }),
    );
  },
});

export const exportRequest = defineTool({
  name: 'run_export_request',
  description:
    'Exports a captured request as a runnable curl / node-fetch / node-axios snippet, optionally after removing headers.',
  annotations: {
    title: 'Export Request',
    category: ToolCategory.NETWORK,
    readOnlyHint: true,
  },
  schema: {
    reqid: zod.number().int().describe('The reqid to export.'),
    format: zod.enum(['curl', 'node-fetch', 'node-axios']),
    headers: zod
      .record(zod.string(), zod.string())
      .optional()
      .describe('Headers to set or override.'),
    removeHeaders: zod
      .array(zod.string())
      .optional()
      .describe('Header names to remove.'),
  },
  handler: async (request, response, context) => {
    const original = context.getNetworkRequestById(request.params.reqid);
    const spec = buildReplaySpec(original, {
      headers: request.params.headers,
      removeHeaders: request.params.removeHeaders,
    });

    const snippet =
      request.params.format === 'curl'
        ? toCurl(spec)
        : request.params.format === 'node-fetch'
          ? toNodeFetch(spec)
          : toNodeAxios(spec);

    response.appendResponseLine(
      request.params.format === 'curl' ? '```bash' : '```js',
    );
    response.appendResponseLine(snippet);
    response.appendResponseLine('```');
  },
});
