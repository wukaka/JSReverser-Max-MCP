/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {readFileSync} from 'node:fs';
import {describe, it} from 'node:test';

import * as analyzerTools from '../../../src/tools/analyzer.js';
import * as collectorTools from '../../../src/tools/collector.js';
import * as consoleTools from '../../../src/tools/console.js';
import * as debuggerTools from '../../../src/tools/debugger.js';
import * as domTools from '../../../src/tools/dom.js';
import * as frameTools from '../../../src/tools/frames.js';
import * as guideTools from '../../../src/tools/guide.js';
import * as hookTools from '../../../src/tools/hook.js';
import * as networkTools from '../../../src/tools/network.js';
import * as networkAdvancedTools from '../../../src/tools/network-advanced.js';
import * as pageTools from '../../../src/tools/page.js';
import * as pagesTools from '../../../src/tools/pages.js';
import * as rebuildTools from '../../../src/tools/rebuild.js';
import * as screenshotTools from '../../../src/tools/screenshot.js';
import * as scriptTools from '../../../src/tools/script.js';
import * as signerTools from '../../../src/tools/signer.js';
import * as signerTraceTools from '../../../src/tools/signer-trace.js';
import * as stealthTools from '../../../src/tools/stealth.js';
import * as taskTools from '../../../src/tools/task.js';
import * as wasmTools from '../../../src/tools/wasm.js';
import * as websocketTools from '../../../src/tools/websocket.js';

interface ZodLike {
  description?: string;
  _def?: {
    typeName?: string;
    innerType?: ZodLike;
    schema?: ZodLike;
    type?: ZodLike;
    values?: string[];
  };
}

function unwrap(field: ZodLike): ZodLike {
  let current = field;
  while (current._def) {
    const typeName = current._def.typeName;
    if (
      typeName === 'ZodOptional' ||
      typeName === 'ZodDefault' ||
      typeName === 'ZodNullable'
    ) {
      current = current._def.innerType!;
      continue;
    }
    if (typeName === 'ZodEffects') {
      current = current._def.schema!;
      continue;
    }
    if (typeName === 'ZodBranded' || typeName === 'ZodReadonly') {
      current = current._def.type!;
      continue;
    }
    break;
  }
  return current;
}

function allTools(): Array<{name: string; schema: Record<string, ZodLike>}> {
  const modules = [
    analyzerTools, collectorTools, consoleTools, debuggerTools, domTools,
    frameTools, guideTools, hookTools, networkTools, networkAdvancedTools,
    pageTools, pagesTools, rebuildTools, screenshotTools, scriptTools,
    signerTools, signerTraceTools, stealthTools, taskTools, wasmTools,
    websocketTools,
  ];
  const tools: Array<{name: string; schema: Record<string, ZodLike>}> = [];
  for (const module of modules) {
    for (const value of Object.values(module)) {
      const candidate = value as {
        name?: unknown;
        schema?: Record<string, ZodLike>;
      };
      if (typeof candidate.name === 'string' && candidate.schema) {
        tools.push({name: candidate.name, schema: candidate.schema});
      }
    }
  }
  return tools;
}

describe('tool parameter documentation', () => {
  it('documents every parameter, including enum options', () => {
    const problems: string[] = [];

    for (const tool of allTools()) {
      for (const [param, field] of Object.entries(tool.schema)) {
        const inner = unwrap(field);
        const description = field.description ?? inner.description;
        if (!description) {
          problems.push(`${tool.name}.${param} is missing a description`);
          continue;
        }
        if (inner._def?.typeName === 'ZodEnum') {
          const values = inner._def.values ?? [];
          if (values.length === 0) {
            problems.push(`${tool.name}.${param} enum has no values`);
          }
        }
      }
    }

    assert.deepStrictEqual(problems, []);
  });

  it('lists every tool in the README capability table', () => {
    const readme = readFileSync('README.md', 'utf8');
    const names = new Set<string>();
    for (const line of readme.split('\n')) {
      if (!line.startsWith('|')) {
        continue;
      }
      for (const match of line.matchAll(/`([a-z]+_[a-z0-9_]+)`/g)) {
        names.add(match[1]!);
      }
    }

    const missing = allTools()
      .map((tool) => tool.name)
      .filter((name) => !names.has(name));
    assert.deepStrictEqual(missing, []);
  });
});
