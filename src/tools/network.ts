/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {isUtf8} from 'node:buffer';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

import {zod} from '../third_party/index.js';
import type {ResourceType} from '../third_party/index.js';
import {resolveDefaultArtifactsTasksDir} from '../utils/projectPaths.js';

import {ToolCategory} from './categories.js';
import {defineTool} from './ToolDefinition.js';

const INLINE_BODY_LIMIT = 10_000;
const BODY_READ_TIMEOUT_MS = 3000;

async function writeBodyFile(
  reqid: number,
  kind: 'request' | 'response',
  content: string | Uint8Array,
): Promise<{path: string; bytes: number}> {
  const dir =
    process.env.MCP_OUTPUT_DIR ??
    path.join(resolveDefaultArtifactsTasksDir(import.meta.url), '..', 'outputs');
  await mkdir(dir, {recursive: true});

  const isText = typeof content === 'string';
  const file = path.join(
    dir,
    `req${reqid}-${kind}-${Date.now()}.${isText ? 'txt' : 'bin'}`,
  );
  const data = isText
    ? Buffer.from(content as string, 'utf8')
    : Buffer.from(content as Uint8Array);
  await writeFile(file, data);
  return {path: file, bytes: data.length};
}

async function readResponseBuffer(response: {
  buffer(): Promise<Buffer>;
}): Promise<Buffer | undefined> {
  try {
    return await Promise.race([
      response.buffer(),
      new Promise<Buffer>((_, reject) => {
        setTimeout(
          () => reject(new Error('timeout')),
          BODY_READ_TIMEOUT_MS,
        );
      }),
    ]);
  } catch {
    return undefined;
  }
}

const FILTERABLE_RESOURCE_TYPES: readonly [ResourceType, ...ResourceType[]] = [
  'document',
  'stylesheet',
  'image',
  'media',
  'font',
  'script',
  'texttrack',
  'xhr',
  'fetch',
  'prefetch',
  'eventsource',
  'websocket',
  'manifest',
  'signedexchange',
  'ping',
  'cspviolationreport',
  'preflight',
  'fedcm',
  'other',
];

export const listNetworkRequests = defineTool({
  name: 'obs_list_network_requests',
  description: `List all requests for the currently selected page since the last navigation.`,
  annotations: {
    category: ToolCategory.NETWORK,
    readOnlyHint: true,
  },
  schema: {
    pageSize: zod
      .number()
      .int()
      .positive()
      .optional()
      .describe(
        'Maximum number of requests to return. When omitted, returns all requests.',
      ),
    pageIdx: zod
      .number()
      .int()
      .min(0)
      .optional()
      .describe(
        'Page number to return (0-based). When omitted, returns the first page.',
      ),
    resourceTypes: zod
      .array(zod.enum(FILTERABLE_RESOURCE_TYPES))
      .optional()
      .describe(
        'Filter requests to only return requests of the specified resource types. When omitted or empty, returns all requests.',
      ),
    includePreservedRequests: zod
      .boolean()
      .default(false)
      .optional()
      .describe(
        'Set to true to return the preserved requests over the last 3 navigations.',
      ),
  },
  handler: async (request, response, context) => {
    const data = await context.getDevToolsData();
    const reqid = data?.cdpRequestId
      ? context.resolveCdpRequestId(data.cdpRequestId)
      : undefined;
    response.setIncludeNetworkRequests(true, {
      pageSize: request.params.pageSize,
      pageIdx: request.params.pageIdx,
      resourceTypes: request.params.resourceTypes,
      includePreservedRequests: request.params.includePreservedRequests,
      networkRequestIdInDevToolsUI: reqid,
    });
  },
});

export const getNetworkRequest = defineTool({
  name: 'obs_get_network_request',
  description: `Gets a network request by an optional reqid, if omitted returns the currently selected request in the DevTools Network panel. By default only method, URL, status and headers are returned; set includeBody=true to include bodies. With toFile=true, bodies larger than 10KB are written to files and their paths are returned.`,
  annotations: {
    category: ToolCategory.NETWORK,
    readOnlyHint: true,
  },
  schema: {
    reqid: zod
      .number()
      .optional()
      .describe(
        'The reqid of the network request. If omitted returns the currently selected request in the DevTools Network panel.',
      ),
    includeBody: zod
      .boolean()
      .optional()
      .describe(
        'Include request and response bodies. Default false to keep the response compact.',
      ),
    toFile: zod
      .boolean()
      .optional()
      .describe(
        'Write request/response bodies larger than 10KB to artifacts/outputs and return their paths. Smaller bodies are returned inline.',
      ),
  },
  handler: async (request, response, context) => {
    const includeBody = request.params.includeBody ?? false;
    const toFile = request.params.toFile === true;

    let reqid = request.params.reqid;
    if (!reqid) {
      const data = await context.getDevToolsData();
      reqid = data?.cdpRequestId
        ? context.resolveCdpRequestId(data.cdpRequestId)
        : undefined;
      if (!reqid) {
        response.appendResponseLine(
          `Nothing is currently selected in the DevTools Network panel.`,
        );
        return;
      }
    }

    if (!toFile) {
      response.attachNetworkRequest(reqid, {includeBody});
      return;
    }

    const httpRequest = context.getNetworkRequestById(reqid);
    const notes: string[] = [];
    let wroteAny = false;

    let requestBody: string | undefined;
    if (httpRequest.hasPostData()) {
      requestBody = httpRequest.postData() ?? undefined;
      if (!requestBody) {
        requestBody =
          (await httpRequest.fetchPostData().catch(() => undefined)) ??
          undefined;
      }
    }
    if (requestBody) {
      const bytes = Buffer.byteLength(requestBody, 'utf8');
      if (bytes > INLINE_BODY_LIMIT) {
        const written = await writeBodyFile(reqid, 'request', requestBody);
        notes.push(`Request body (${bytes} bytes) written to ${written.path}`);
        wroteAny = true;
      }
    }

    const httpResponse = httpRequest.response();
    if (httpResponse) {
      const buffer = await readResponseBuffer(httpResponse);
      if (buffer && buffer.length > INLINE_BODY_LIMIT) {
        const content = isUtf8(buffer) ? buffer.toString('utf8') : buffer;
        const written = await writeBodyFile(reqid, 'response', content);
        notes.push(
          `Response body (${buffer.length} bytes) written to ${written.path}`,
        );
        wroteAny = true;
      }
    }

    response.attachNetworkRequest(reqid, {
      includeBody: wroteAny ? false : includeBody || toFile,
    });
    for (const note of notes) {
      response.appendResponseLine(note);
    }
    if (wroteAny) {
      response.appendResponseLine(
        'Bodies over the inline limit were written to files; read them from the client. Use includeBody=true to see smaller bodies inline.',
      );
    }
  },
});
