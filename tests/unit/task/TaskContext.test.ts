/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {describe, it} from 'node:test';

import {
  clearTaskContext,
  getTaskContext,
  recordTaskEvidence,
  setTaskContext,
} from '../../../src/modules/task/TaskContext.js';
import {ReverseTaskStore} from '../../../src/reverse/ReverseTaskStore.js';
import {getJSHookRuntime} from '../../../src/tools/runtime.js';

describe('TaskContext', () => {
  it('sets, reads and clears the active task', () => {
    clearTaskContext();
    assert.strictEqual(getTaskContext(), undefined);

    setTaskContext({
      taskId: 't1',
      taskSlug: 'demo',
      targetUrl: 'https://example.com',
      goal: '还原签名',
    });
    assert.deepStrictEqual(getTaskContext(), {
      taskId: 't1',
      taskSlug: 'demo',
      targetUrl: 'https://example.com',
      goal: '还原签名',
    });

    clearTaskContext();
    assert.strictEqual(getTaskContext(), undefined);
  });

  it('skips recording when no task is active', async () => {
    clearTaskContext();
    const result = await recordTaskEvidence('experiments', {tool: 'x'});
    assert.deepStrictEqual(result, {recorded: false});
  });

  it('appends evidence to the task store when a task is active', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'task-ctx-'));
    const runtime = getJSHookRuntime() as any;
    const original = runtime.reverseTaskStore;
    runtime.reverseTaskStore = new ReverseTaskStore({rootDir: dir});
    try {
      setTaskContext({
        taskId: 't2',
        taskSlug: 'demo',
        targetUrl: 'https://example.com',
        goal: '还原签名',
      });
      const result = await recordTaskEvidence('experiments', {
        tool: 'run_replay_request',
        classification: 'success',
      });
      assert.strictEqual(result.recorded, true);

      const entries = await runtime.reverseTaskStore.readLog('experiments', 't2');
      assert.strictEqual(entries.length, 1);
      assert.strictEqual(entries[0].tool, 'run_replay_request');
    } finally {
      clearTaskContext();
      runtime.reverseTaskStore = original;
      await rm(dir, {recursive: true, force: true});
    }
  });
});
