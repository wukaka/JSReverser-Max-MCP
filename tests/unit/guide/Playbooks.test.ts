/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {
  buildGuide,
  inferScenario,
  type Scenario,
} from '../../../src/modules/guide/Playbooks.js';
import * as analyzerTools from '../../../src/tools/analyzer.js';
import * as collectorTools from '../../../src/tools/collector.js';
import * as consoleTools from '../../../src/tools/console.js';
import * as debuggerTools from '../../../src/tools/debugger.js';
import * as domTools from '../../../src/tools/dom.js';
import * as frameTools from '../../../src/tools/frames.js';
import * as guideTools from '../../../src/tools/guide.js';
import * as hookTools from '../../../src/tools/hook.js';
import * as networkAdvancedTools from '../../../src/tools/network-advanced.js';
import * as networkTools from '../../../src/tools/network.js';
import * as pageTools from '../../../src/tools/page.js';
import * as pagesTools from '../../../src/tools/pages.js';
import * as rebuildTools from '../../../src/tools/rebuild.js';
import * as screenshotTools from '../../../src/tools/screenshot.js';
import * as scriptTools from '../../../src/tools/script.js';
import * as signerTraceTools from '../../../src/tools/signer-trace.js';
import * as signerTools from '../../../src/tools/signer.js';
import * as stealthTools from '../../../src/tools/stealth.js';
import * as wasmTools from '../../../src/tools/wasm.js';
import * as websocketTools from '../../../src/tools/websocket.js';

const SCENARIOS: Scenario[] = [
  'from_zero',
  'confirm_change',
  'header_necessity',
  'signer_inputs',
  'offline_repro',
];

function allToolNames(): Set<string> {
  const modules = [
    analyzerTools, collectorTools, consoleTools, debuggerTools, domTools,
    frameTools, guideTools, hookTools, networkTools, networkAdvancedTools,
    pageTools, pagesTools, rebuildTools, screenshotTools, scriptTools,
    signerTools, signerTraceTools, stealthTools, wasmTools, websocketTools,
  ];
  const names = new Set<string>();
  for (const module of modules) {
    for (const value of Object.values(module)) {
      const name = (value as {name?: unknown}).name;
      if (typeof name === 'string') {
        names.add(name);
      }
    }
  }
  return names;
}

describe('reverse guide playbooks', () => {
  it('infers scenarios from goal keywords', () => {
    assert.strictEqual(inferScenario('确认这个接口是否改版'), 'confirm_change');
    assert.strictEqual(inferScenario('哪些请求头是必需的'), 'header_necessity');
    assert.strictEqual(inferScenario('判断哪些字段参与签名'), 'signer_inputs');
    assert.strictEqual(inferScenario('把请求离线复现到 node'), 'offline_repro');
    assert.strictEqual(inferScenario('陌生站点还原签名'), 'from_zero');
  });

  it('uses explicit scenario over inference', () => {
    const {playbook, matchedBy} = buildGuide('随便什么目标', 'header_necessity');
    assert.strictEqual(playbook.scenario, 'header_necessity');
    assert.strictEqual(matchedBy, 'explicit');
  });

  it('marks keyword and default matches separately', () => {
    assert.strictEqual(buildGuide('确认改版').matchedBy, 'keyword');
    assert.strictEqual(buildGuide('随便看看').matchedBy, 'default');
  });

  it('only references tools that exist', () => {
    const names = allToolNames();
    for (const scenario of SCENARIOS) {
      const {playbook} = buildGuide('', scenario);
      for (const step of playbook.recommendedPath) {
        for (const tool of step.tools) {
          assert.ok(
            names.has(tool),
            `${scenario} references missing tool: ${tool}`,
          );
        }
      }
    }
  });
});
