/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

import type {HTTPRequest, Page} from '../../third_party/index.js';

export interface ReplaySpec {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}

export interface ReplayOverrides {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  removeHeaders?: string[];
  body?: string;
  query?: Record<string, string>;
}

export function buildReplaySpec(
  request: HTTPRequest,
  overrides: ReplayOverrides = {},
): ReplaySpec {
  let url = overrides.url ?? request.url();
  if (overrides.query) {
    const parsed = new URL(url);
    for (const [key, value] of Object.entries(overrides.query)) {
      parsed.searchParams.set(key, value);
    }
    url = parsed.toString();
  }

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(request.headers())) {
    headers[key.toLowerCase()] = String(value);
  }
  for (const name of overrides.removeHeaders ?? []) {
    delete headers[name.toLowerCase()];
  }
  for (const [key, value] of Object.entries(overrides.headers ?? {})) {
    headers[key.toLowerCase()] = value;
  }

  const method = (overrides.method ?? request.method()).toUpperCase();
  const originalBody = request.postData();
  const body =
    overrides.body ??
    (method === 'GET' || method === 'HEAD'
      ? undefined
      : originalBody ?? undefined);

  return {method, url, headers, body};
}

export type ReplayClassification =
  | 'success'
  | 'auth_invalid'
  | 'risk_control'
  | 'signature_invalid'
  | 'param_invalid'
  | 'rate_limited'
  | 'network_error'
  | 'unknown';

export interface ReplayEvidence {
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  responseHeaders?: Record<string, string>;
  bodySnippet?: string;
  bodySize?: number;
  durationMs: number;
  error?: string;
}

export interface ReplayOutcome {
  classification: ReplayClassification;
  evidence: ReplayEvidence;
  suggestions: string[];
}

const SNIPPET_LIMIT = 2000;

export function classifyReplay(
  status: number | undefined,
  body: string,
): {classification: ReplayClassification; suggestions: string[]} {
  const text = body.toLowerCase();

  if (status !== undefined && status >= 200 && status < 300) {
    return {classification: 'success', suggestions: []};
  }

  if (status === 429) {
    return {
      classification: 'rate_limited',
      suggestions: ['Wait and retry with a lower rate; check Retry-After.'],
    };
  }

  if (
    status === 401 ||
    /(unauthorized|not logged in|login required|token expired|session expired|重新登录|未登录|登录失效)/.test(text)
  ) {
    return {
      classification: 'auth_invalid',
      suggestions: [
        'Re-capture cookies/token from a live page, or restore a saved session.',
        'Compare the Cookie and Authorization headers with the original request.',
      ],
    };
  }

  if (
    status === 412 ||
    /(captcha|slider|verify|verification|risk control|风控|验证码|人机验证|安全验证)/.test(text)
  ) {
    return {
      classification: 'risk_control',
      suggestions: [
        'Risk control triggered; try from a warm page context instead of Node.',
        'Check whether a device/browser fingerprint header is missing.',
      ],
    };
  }

  if (
    (status === 400 || status === 403) &&
    /(sign|signature|nonce|timestamp|签名|校验失败)/.test(text)
  ) {
    return {
      classification: 'signature_invalid',
      suggestions: [
        'Re-sign the payload with the live page function before replaying.',
        'Compare sign-related headers and body fields with the original request.',
      ],
    };
  }

  if (status === 400 || status === 422) {
    return {
      classification: 'param_invalid',
      suggestions: [
        'Compare query/body fields with the original request for missing or changed values.',
      ],
    };
  }

  return {
    classification: 'unknown',
    suggestions: ['Inspect the raw status and response snippet above.'],
  };
}

async function readPageBody(
  page: Page,
  spec: ReplaySpec,
  timeoutMs: number,
): Promise<ReplayEvidence> {
  try {
    const result = await page.evaluate(
      async (input: {
        url: string;
        method: string;
        headers: Record<string, string>;
        body?: string;
        timeoutMs: number;
      }) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), input.timeoutMs);
        const startedAt = performance.now();
        try {
          const response = await fetch(input.url, {
            method: input.method,
            headers: input.headers,
            body: input.body,
            credentials: 'include',
            redirect: 'manual',
            signal: controller.signal,
          });
          const text = await response.text();
          const headers: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return {
            status: response.status,
            statusText: response.statusText,
            headers,
            body: text,
            durationMs: performance.now() - startedAt,
          };
        } finally {
          clearTimeout(timer);
        }
      },
      {
        url: spec.url,
        method: spec.method,
        headers: spec.headers,
        body: spec.body,
        timeoutMs,
      },
    );

    return {
      method: spec.method,
      url: spec.url,
      status: result.status,
      statusText: result.statusText,
      responseHeaders: result.headers,
      bodySnippet: result.body.slice(0, SNIPPET_LIMIT),
      bodySize: result.body.length,
      durationMs: Math.round(result.durationMs),
    };
  } catch (error) {
    return {
      method: spec.method,
      url: spec.url,
      durationMs: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function readNodeBody(
  getCookies: () => Promise<Array<{name: string; value: string; domain?: string}>>,
  spec: ReplaySpec,
  timeoutMs: number,
): Promise<ReplayEvidence> {
  const startedAt = Date.now();
  try {
    const host = new URL(spec.url).hostname;
    const cookies = await getCookies();
    const cookieHeader = cookies
      .filter((cookie) => {
        const domain = (cookie.domain ?? '').replace(/^\./, '');
        return domain === '' || host === domain || host.endsWith(`.${domain}`);
      })
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const response = await axios.request({
      method: spec.method,
      url: spec.url,
      headers: {
        ...spec.headers,
        ...(cookieHeader ? {cookie: cookieHeader} : {}),
      },
      data: spec.body,
      timeout: timeoutMs,
      maxRedirects: 0,
      validateStatus: () => true,
      responseType: 'text',
      transformResponse: [(data) => data],
    });

    const body = String(response.data ?? '');
    return {
      method: spec.method,
      url: spec.url,
      status: response.status,
      statusText: response.statusText,
      responseHeaders: Object.fromEntries(
        Object.entries(response.headers).map(([key, value]) => [
          key,
          String(value),
        ]),
      ),
      bodySnippet: body.slice(0, SNIPPET_LIMIT),
      bodySize: body.length,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      method: spec.method,
      url: spec.url,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function replaySpec(
  spec: ReplaySpec,
  options: {
    usePageContext: boolean;
    page?: Page;
    getCookies?: () => Promise<
      Array<{name: string; value: string; domain?: string}>
    >;
    timeoutMs: number;
  },
): Promise<ReplayOutcome> {
  let evidence: ReplayEvidence;
  if (options.usePageContext) {
    if (!options.page) {
      throw new Error('Page context is required for page-context replay.');
    }
    evidence = await readPageBody(options.page, spec, options.timeoutMs);
  } else {
    if (!options.getCookies) {
      throw new Error('Cookie source is required for Node-context replay.');
    }
    evidence = await readNodeBody(options.getCookies, spec, options.timeoutMs);
  }

  if (evidence.error) {
    return {
      classification: 'network_error',
      evidence,
      suggestions: [
        'Check the URL and network reachability.',
        'If the page blocks fetch (CORS), retry with usePageContext=true.',
      ],
    };
  }

  const {classification, suggestions} = classifyReplay(
    evidence.status,
    evidence.bodySnippet ?? '',
  );
  return {classification, evidence, suggestions};
}

export interface RequestDiff {
  method?: {a: string; b: string};
  url?: {a: string; b: string};
  query?: Record<string, {a?: string; b?: string}>;
  headers?: {
    added: Record<string, string>;
    removed: Record<string, string>;
    changed: Record<string, {a: string; b: string}>;
  };
  body?: {
    kind: 'none' | 'text' | 'json';
    changed: boolean;
    text?: {a: string; b: string};
    json?: Array<{path: string; a?: unknown; b?: unknown}>;
  };
}

function diffJson(
  a: unknown,
  b: unknown,
  path: string,
  out: Array<{path: string; a?: unknown; b?: unknown}>,
): void {
  if (out.length >= 50) {
    return;
  }
  if (a === b) {
    return;
  }
  const bothObjects =
    a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b);
  if (!bothObjects) {
    out.push({path, a, b});
    return;
  }
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);
  for (const key of keys) {
    diffJson(aObj[key], bObj[key], path ? `${path}.${key}` : key, out);
  }
}

export function diffRequests(
  a: HTTPRequest,
  b: HTTPRequest,
  options: {ignoreHeaders?: string[]; jsonAware?: boolean} = {},
): RequestDiff {
  const diff: RequestDiff = {};

  if (a.method() !== b.method()) {
    diff.method = {a: a.method(), b: b.method()};
  }
  if (a.url() !== b.url()) {
    diff.url = {a: a.url(), b: b.url()};
  }

  const queryA = new URL(a.url()).searchParams;
  const queryB = new URL(b.url()).searchParams;
  const queryDiff: Record<string, {a?: string; b?: string}> = {};
  const queryKeys = new Set([...queryA.keys(), ...queryB.keys()]);
  for (const key of queryKeys) {
    const va = queryA.get(key) ?? undefined;
    const vb = queryB.get(key) ?? undefined;
    if (va !== vb) {
      queryDiff[key] = {a: va, b: vb};
    }
  }
  if (Object.keys(queryDiff).length > 0) {
    diff.query = queryDiff;
  }

  const ignore = new Set((options.ignoreHeaders ?? []).map((h) => h.toLowerCase()));
  const headersA = a.headers();
  const headersB = b.headers();
  const added: Record<string, string> = {};
  const removed: Record<string, string> = {};
  const changed: Record<string, {a: string; b: string}> = {};
  const headerKeys = new Set([...Object.keys(headersA), ...Object.keys(headersB)]);
  for (const key of headerKeys) {
    if (ignore.has(key.toLowerCase())) {
      continue;
    }
    const va = headersA[key];
    const vb = headersB[key];
    if (va === undefined && vb !== undefined) {
      added[key] = vb;
    } else if (va !== undefined && vb === undefined) {
      removed[key] = va;
    } else if (va !== vb) {
      changed[key] = {a: String(va), b: String(vb)};
    }
  }
  if (Object.keys(added).length + Object.keys(removed).length + Object.keys(changed).length > 0) {
    diff.headers = {added, removed, changed};
  }

  const bodyA = a.postData() ?? '';
  const bodyB = b.postData() ?? '';
  if (bodyA === '' && bodyB === '') {
    diff.body = {kind: 'none', changed: false};
    return diff;
  }

  if (options.jsonAware !== false) {
    try {
      const jsonA = JSON.parse(bodyA);
      const jsonB = JSON.parse(bodyB);
      const changes: Array<{path: string; a?: unknown; b?: unknown}> = [];
      diffJson(jsonA, jsonB, '', changes);
      diff.body = {kind: 'json', changed: changes.length > 0, json: changes};
      return diff;
    } catch {
      // Fall back to text comparison.
    }
  }

  diff.body = {
    kind: 'text',
    changed: bodyA !== bodyB,
    text: {
      a: bodyA.slice(0, SNIPPET_LIMIT),
      b: bodyB.slice(0, SNIPPET_LIMIT),
    },
  };
  return diff;
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

export function toCurl(
  spec: ReplaySpec,
  headers?: Record<string, string>,
): string {
  const effective = headers ?? spec.headers;
  const parts = [`curl ${shellQuote(spec.url)}`, `-X ${spec.method}`];
  for (const [key, value] of Object.entries(effective)) {
    if (['content-length', 'host', 'connection'].includes(key.toLowerCase())) {
      continue;
    }
    parts.push(`-H ${shellQuote(`${key}: ${value}`)}`);
  }
  if (spec.body) {
    parts.push(`--data-raw ${shellQuote(spec.body)}`);
  }
  return parts.join(' \\\n  ');
}

export function toNodeFetch(spec: ReplaySpec): string {
  return [
    'const res = await fetch(' + JSON.stringify(spec.url) + ', {',
    `  method: ${JSON.stringify(spec.method)},`,
    `  headers: ${JSON.stringify(spec.headers, null, 2)},`,
    spec.body ? `  body: ${JSON.stringify(spec.body)},` : '',
    '});',
    'console.log(res.status, await res.text());',
  ]
    .filter(Boolean)
    .join('\n');
}

export function toNodeAxios(spec: ReplaySpec): string {
  return [
    "import axios from 'axios';",
    'const res = await axios.request({',
    `  method: ${JSON.stringify(spec.method)},`,
    `  url: ${JSON.stringify(spec.url)},`,
    `  headers: ${JSON.stringify(spec.headers, null, 2)},`,
    spec.body ? `  data: ${JSON.stringify(spec.body)},` : '',
    '  validateStatus: () => true,',
    '});',
    'console.log(res.status, res.data);',
  ]
    .filter(Boolean)
    .join('\n');
}
