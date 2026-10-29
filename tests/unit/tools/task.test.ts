/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, it} from 'node:test';

import {ReverseTaskStore} from '../../../src/reverse/ReverseTaskStore.js';
import {getJSHookRuntime} from '../../../src/tools/runtime.js';
import {exportReverseSummary, taskContext} from '../../../src/tools/task.js';

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

describe('rec_task_context', () => {
  it('sets, gets and clears the context', async () => {
    const setResponse = makeResponse();
    await taskContext.handler(
      {
        params: {
          action: 'set',
          taskId: 't1',
          taskSlug: 'demo',
          targetUrl: 'https://example.com',
          goal: '还原签名',
        },
      } as never,
      setResponse as never,
      {} as never,
    );
    assert.strictEqual(jsonFrom(setResponse.lines).context.taskId, 't1');

    const getResponse = makeResponse();
    await taskContext.handler(
      {params: {action: 'get'}} as never,
      getResponse as never,
      {} as never,
    );
    assert.strictEqual(jsonFrom(getResponse.lines).context.goal, '还原签名');

    const clearResponse = makeResponse();
    await taskContext.handler(
      {params: {action: 'clear'}} as never,
      clearResponse as never,
      {} as never,
    );
    assert.strictEqual(jsonFrom(clearResponse.lines).context, null);
  });
});

describe('rec_export_reverse_summary', () => {
  it('renders markdown from task artifacts and optionally writes a file', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'task-summary-'));
    const runtime = getJSHookRuntime() as any;
    const original = runtime.reverseTaskStore;
    runtime.reverseTaskStore = new ReverseTaskStore({rootDir});
    try {
      const store = runtime.reverseTaskStore as ReverseTaskStore;
      const task = await store.openTask({
        taskId: 't9',
        slug: 'demo',
        targetUrl: 'https://api.example.com',
        goal: '还原签名',
      });
      await task.appendLog('experiments', {
        timestamp: 'T1',
        tool: 'run_replay_request',
        classification: 'success',
        status: 200,
      });
      await task.appendLog('runtime-evidence', {note: 'x'});

      const response = makeResponse();
      await exportReverseSummary.handler(
        {params: {taskId: 't9'}} as never,
        response as never,
        {} as never,
      );
      const markdown = response.lines.join('\n');
      assert.ok(markdown.includes('# Reverse Summary: 还原签名'));
      assert.ok(markdown.includes('### run_replay_request @ T1'));
      assert.ok(markdown.includes('classification: success'));
      assert.ok(markdown.includes('runtime-evidence: 1'));

      const outPath = join(rootDir, 'summary.md');
      const writeResponse = makeResponse();
      await exportReverseSummary.handler(
        {params: {taskId: 't9', path: outPath}} as never,
        writeResponse as never,
        {} as never,
      );
      const written = jsonFrom(writeResponse.lines);
      assert.strictEqual(written.path, outPath);
      const content = await readFile(outPath, 'utf8');
      assert.ok(content.includes('## Experiments'));
    } finally {
      runtime.reverseTaskStore = original;
      await rm(rootDir, {recursive: true, force: true});
    }
  });
});
