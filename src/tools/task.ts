/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

import {
  clearTaskContext,
  getTaskContext,
  setTaskContext,
} from '../modules/task/TaskContext.js';
import {zod} from '../third_party/index.js';

import {ToolCategory} from './categories.js';
import {getJSHookRuntime} from './runtime.js';
import {defineTool} from './ToolDefinition.js';

function appendJson(
  response: {appendResponseLine(value: string): void},
  data: unknown,
): void {
  response.appendResponseLine('```json');
  response.appendResponseLine(JSON.stringify(data, null, 2));
  response.appendResponseLine('```');
}

function renderValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.length > 200 ? `${value.slice(0, 200)}…` : value;
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null ||
    value === undefined
  ) {
    return String(value);
  }
  if (Array.isArray(value)) {
    const items = value.slice(0, 10).map((item) => String(item));
    return value.length > 10
      ? `[${items.join(', ')}, … ${value.length} items]`
      : `[${items.join(', ')}]`;
  }
  const json = JSON.stringify(value);
  return json.length > 200 ? `${json.slice(0, 200)}…` : json;
}

export const taskContext = defineTool({
  name: 'rec_task_context',
  description:
    'Sets, reads, or clears the active reverse task. When set, replay/ablation/signer-analysis/trace results are automatically appended to the task artifact directory.',
  annotations: {
    title: 'Task Context',
    category: ToolCategory.REVERSE_ENGINEERING,
    readOnlyHint: false,
  },
  schema: {
    action: zod.enum(['set', 'get', 'clear']),
    taskId: zod.string().optional().describe('For action=set: task id.'),
    taskSlug: zod.string().optional().describe('For action=set: task slug.'),
    targetUrl: zod.string().optional().describe('For action=set: target page URL.'),
    goal: zod.string().optional().describe('For action=set: reverse-engineering goal.'),
  },
  handler: async (request, response) => {
    const params = request.params;

    if (params.action === 'set') {
      if (!params.taskId || !params.taskSlug || !params.targetUrl || !params.goal) {
        throw new Error(
          'taskId, taskSlug, targetUrl and goal are required for action=set.',
        );
      }
      appendJson(response, {
        action: 'set',
        context: setTaskContext({
          taskId: params.taskId,
          taskSlug: params.taskSlug,
          targetUrl: params.targetUrl,
          goal: params.goal,
        }),
      });
      return;
    }

    if (params.action === 'clear') {
      clearTaskContext();
      appendJson(response, {action: 'clear', context: null});
      return;
    }

    appendJson(response, {action: 'get', context: getTaskContext() ?? null});
  },
});

export const exportReverseSummary = defineTool({
  name: 'rec_export_reverse_summary',
  description:
    'Builds a markdown summary from a reverse task artifact directory: goal, experiment entries recorded by replay/ablation/signer analysis, and evidence log counts. Optionally writes it to a file.',
  annotations: {
    title: 'Export Reverse Summary',
    category: ToolCategory.REVERSE_ENGINEERING,
    readOnlyHint: true,
  },
  schema: {
    taskId: zod.string().describe('The reverse task id.'),
    path: zod
      .string()
      .optional()
      .describe('Optional absolute path to write the markdown summary to.'),
  },
  handler: async (request, response) => {
    const runtime = getJSHookRuntime();
    const store = runtime.reverseTaskStore;
    const taskId = request.params.taskId;

    const descriptor = await store.readSnapshot<{
      goal?: string;
      targetUrl?: string;
      createdAt?: number;
      updatedAt?: number;
    }>(taskId, 'task.json');
    const experiments = await store.readLog('experiments', taskId);
    const runtimeEvidence = await store.readLog('runtime-evidence', taskId);
    const network = await store.readLog('network', taskId);
    const scripts = await store.readLog('scripts', taskId);

    const lines: string[] = [];
    lines.push(`# Reverse Summary: ${descriptor?.goal ?? taskId}`);
    lines.push('');
    lines.push(`- Task ID: ${taskId}`);
    if (descriptor?.targetUrl) {
      lines.push(`- Target: ${descriptor.targetUrl}`);
    }
    lines.push(`- Experiments: ${experiments.length}`);

    lines.push('');
    lines.push('## Experiments');
    if (experiments.length === 0) {
      lines.push('- (none recorded)');
    } else {
      for (const entry of experiments) {
        const timestamp = entry.timestamp ? String(entry.timestamp) : '';
        const tool = entry.tool ? String(entry.tool) : 'experiment';
        lines.push(`### ${tool}${timestamp ? ` @ ${timestamp}` : ''}`);
        for (const [key, value] of Object.entries(entry)) {
          if (key === 'timestamp' || key === 'tool') {
            continue;
          }
          lines.push(`- ${key}: ${renderValue(value)}`);
        }
        lines.push('');
      }
    }

    lines.push('## Evidence Logs');
    lines.push(`- runtime-evidence: ${runtimeEvidence.length}`);
    lines.push(`- network: ${network.length}`);
    lines.push(`- scripts: ${scripts.length}`);

    lines.push('');
    lines.push('## Open Items');
    lines.push(
      '- Conclusions are not inferred automatically. Record them with rec_record_reverse_evidence.',
    );

    const markdown = `${lines.join('\n')}\n`;

    if (request.params.path) {
      await mkdir(path.dirname(request.params.path), {recursive: true});
      await writeFile(request.params.path, markdown, 'utf8');
      appendJson(response, {
        taskId,
        path: request.params.path,
        bytes: Buffer.byteLength(markdown, 'utf8'),
        experiments: experiments.length,
      });
      return;
    }

    response.appendResponseLine('```md');
    response.appendResponseLine(markdown.trimEnd());
    response.appendResponseLine('```');
  },
});
