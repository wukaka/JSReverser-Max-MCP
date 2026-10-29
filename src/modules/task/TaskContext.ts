/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {getJSHookRuntime} from '../../tools/runtime.js';

export interface TaskContextInput {
  taskId: string;
  taskSlug: string;
  targetUrl: string;
  goal: string;
}

let currentTask: TaskContextInput | undefined;

export function setTaskContext(input: TaskContextInput): TaskContextInput {
  currentTask = {...input};
  return currentTask;
}

export function getTaskContext(): TaskContextInput | undefined {
  return currentTask ? {...currentTask} : undefined;
}

export function clearTaskContext(): void {
  currentTask = undefined;
}

export interface RecordResult {
  recorded: boolean;
  taskId?: string;
  error?: string;
}

export async function recordTaskEvidence(
  channel: string,
  entry: Record<string, unknown>,
): Promise<RecordResult> {
  if (!currentTask) {
    return {recorded: false};
  }

  try {
    const runtime = getJSHookRuntime();
    const task = await runtime.reverseTaskStore.openTask({
      taskId: currentTask.taskId,
      slug: currentTask.taskSlug,
      targetUrl: currentTask.targetUrl,
      goal: currentTask.goal,
    });
    await task.appendLog(channel, {
      timestamp: new Date().toISOString(),
      ...entry,
    });
    return {recorded: true, taskId: task.taskId};
  } catch (error) {
    return {
      recorded: false,
      taskId: currentTask.taskId,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
