/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  extractSnippet,
  scoreFrame,
  type TraceFrame,
} from '../modules/network/RequestTrace.js';
import {recordTaskEvidence} from '../modules/task/TaskContext.js';
import {zod} from '../third_party/index.js';

import {ToolCategory} from './categories.js';
import {defineTool} from './ToolDefinition.js';

interface ScoredFrame extends TraceFrame {
  frameIndex: number;
  score: number;
  reasons: string[];
  snippetPreview: string;
  suggestedNext: string[];
}

export const traceRequestToSigner = defineTool({
  name: 'loc_trace_request_to_signer',
  description:
    'Scores the initiator call stack of a request and returns candidate functions that build or sign it. Reads the source around each frame and ranks by signing signals (function name, crypto primitives, string building, timestamps, randomness).',
  annotations: {
    title: 'Trace Request to Signer',
    category: ToolCategory.REVERSE_ENGINEERING,
    readOnlyHint: true,
  },
  schema: {
    reqid: zod
      .number()
      .int()
      .describe('The reqid from obs_list_network_requests.'),
    topN: zod
      .number()
      .int()
      .positive()
      .optional()
      .describe('Number of candidates to return (default: 5).'),
    contextChars: zod
      .number()
      .int()
      .positive()
      .optional()
      .describe('Characters of source to read around each frame (default: 400).'),
    includeParentStack: zod
      .boolean()
      .optional()
      .describe('Include async parent frames (default: true).'),
  },
  handler: async (request, response, context) => {
    const {reqid, topN, contextChars, includeParentStack} = request.params;
    const debugger_ = context.debuggerContext;
    const httpRequest = context.getNetworkRequestById(reqid);
    const initiator = context.getRequestInitiator(httpRequest);

    if (!initiator) {
      response.appendResponseLine(
        `No initiator information found for request ${reqid}.`,
      );
      response.appendResponseLine(
        'This might be a navigation request or the initiator was not captured.',
      );
      return;
    }

    const frames: TraceFrame[] = [
      ...(initiator.stack?.callFrames ?? []),
      ...(includeParentStack !== false
        ? initiator.stack?.parent?.callFrames ?? []
        : []),
    ];

    const scored: ScoredFrame[] = [];
    for (let index = 0; index < frames.length; index += 1) {
      const frame = frames[index]!;
      let snippet = '';
      try {
        const source = await debugger_.getScriptSource(frame.scriptId);
        snippet = extractSnippet(
          source,
          frame.lineNumber,
          frame.columnNumber,
          contextChars ?? 400,
        );
      } catch {
        snippet = '';
      }

      const {score, reasons} = scoreFrame(frame, snippet);
      const suggestedNext: string[] = [];
      if (score > 0 && frame.url) {
        suggestedNext.push(
          `ins_breakpoint(action=set, url="${frame.url}", lineNumber=${frame.lineNumber + 1})`,
        );
      }
      if (score > 0 && frame.functionName) {
        suggestedNext.push(
          `loc_trace_function(functionName="${frame.functionName}")`,
        );
        suggestedNext.push(
          `ins_hook(action=function, target="${frame.functionName}")`,
        );
      }

      scored.push({
        ...frame,
        frameIndex: index,
        score,
        reasons,
        snippetPreview: snippet.replace(/\s+/g, ' ').slice(0, 300),
        suggestedNext,
      });
    }

    const candidates = scored
      .sort((a, b) => b.score - a.score || a.frameIndex - b.frameIndex)
      .slice(0, topN ?? 5);

    const recorded = await recordTaskEvidence('experiments', {
      tool: 'loc_trace_request_to_signer',
      requestUrl: httpRequest.url(),
      candidates: candidates.slice(0, 3).map((candidate) => ({
        functionName: candidate.functionName,
        url: candidate.url,
        line: candidate.lineNumber + 1,
        score: candidate.score,
      })),
    });

    response.appendResponseLine('```json');
    response.appendResponseLine(
      JSON.stringify(
        {
          requestUrl: httpRequest.url(),
          initiatorType: initiator.type,
          totalFrames: frames.length,
          candidates,
          caveat:
            'These are frames on the request-initiator stack. A signer that runs before the request is built may not appear here; use these frames as entry points.',
          evidenceRecorded: recorded,
        },
        null,
        2,
      ),
    );
    response.appendResponseLine('```');
  },
});
