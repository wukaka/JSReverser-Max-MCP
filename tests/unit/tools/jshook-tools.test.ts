
/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import {describe, it} from 'node:test';

import {zod} from '../../../src/third_party/index.js';
import {analyzeCode, analyzeTarget, exportSessionReport} from '../../../src/tools/analyzer.js';
import {collectCode, collectionDiff} from '../../../src/tools/collector.js';
import {queryDom} from '../../../src/tools/dom.js';
import {hook} from '../../../src/tools/debugger.js';
import {getHookData} from '../../../src/tools/hook.js';
import {clickElement, checkBrowserHealth, sessionState} from '../../../src/tools/page.js';
import {stealth} from '../../../src/tools/stealth.js';

describe('jshook tools schema', () => {
  it('validates obs_collect_code schema', () => {
    const schema = zod.object(collectCode.schema);
    const result = schema.parse({
      url: 'https://example.com',
      smartMode: 'summary',
      returnMode: 'pattern',
      pattern: 'main',
      limit: 5,
      topN: 3,
    });
    assert.strictEqual(result.smartMode, 'summary');
    assert.strictEqual(result.returnMode, 'pattern');
  });

  it('validates ver_collection_diff schema', () => {
    const schema = zod.object(collectionDiff.schema);
    const result = schema.parse({
      previous: [{url: 'a.js', size: 12, type: 'external'}],
      includeUnchanged: true,
    });
    assert.strictEqual(result.previous.length, 1);
    assert.strictEqual(result.includeUnchanged, true);
  });

  it('validates loc_analyze_code summarize schema', () => {
    const schema = zod.object(analyzeCode.schema);
    const result = schema.parse({action: 'summarize', mode: 'single', code: 'const x = 1;'});
    assert.strictEqual(result.mode, 'single');
  });

  it('validates loc_analyze_code risk and rec_export_session_report schemas', () => {
    const riskSchema = zod.object(analyzeCode.schema);
    const analyzeSchema = zod.object(analyzeTarget.schema);
    const reportSchema = zod.object(exportSessionReport.schema);

    const risk = riskSchema.parse({action: 'risk', code: 'md5(x)', includeHookSignals: true});
    const workflow = analyzeSchema.parse({
      url: 'https://example.com',
      hookPreset: 'network-core',
      autoInjectHooks: true,
      correlationWindowMs: 800,
      maxCorrelatedFlows: 5,
      maxFingerprints: 6,
    });
    const report = reportSchema.parse({format: 'markdown', includeHookData: true});

    assert.strictEqual(risk.includeHookSignals, true);
    assert.strictEqual(workflow.hookPreset, 'network-core');
    assert.strictEqual(workflow.maxFingerprints, 6);
    assert.strictEqual(report.format, 'markdown');
  });

  it('validates hook and stealth schemas', () => {
    const hookSchema = zod.object(hook.schema);
    const hookDataSchema = zod.object(getHookData.schema);
    const stealthSchema = zod.object(stealth.schema);

    const hookParams = hookSchema.parse({action: 'create', type: 'fetch'});
    const hookData = hookDataSchema.parse({hookId: 'h1', view: 'summary', maxRecords: 20});
    const stealthParams = stealthSchema.parse({action: 'inject', preset: 'windows-chrome'});

    assert.strictEqual(hookParams.type, 'fetch');
    assert.strictEqual(hookData.view, 'summary');
    assert.strictEqual(stealthParams.preset, 'windows-chrome');
  });

  it('validates dom and page schemas', () => {
    const domSchema = zod.object(queryDom.schema);
    const pageSchema = zod.object(clickElement.schema);
    const healthSchema = zod.object(checkBrowserHealth.schema);
    const sessionSchema = zod.object(sessionState.schema);

    const dom = domSchema.parse({selector: 'button'});
    const page = pageSchema.parse({selector: '#x'});
    const health = healthSchema.parse({});
    const saveSession = sessionSchema.parse({action: 'save', sessionId: 's1', includeCookies: true});
    const restoreSession = sessionSchema.parse({action: 'restore', sessionId: 's1', clearStorageBeforeRestore: true});
    const listed = sessionSchema.parse({action: 'list'});
    const removed = sessionSchema.parse({action: 'delete', sessionId: 's1'});
    const dumped = sessionSchema.parse({action: 'dump', sessionId: 's1', pretty: false});
    const loaded = sessionSchema.parse({action: 'load', snapshotJson: '{"id":"s1"}', overwrite: true});

    assert.strictEqual(dom.selector, 'button');
    assert.strictEqual(page.selector, '#x');
    assert.deepStrictEqual(health, {});
    assert.strictEqual(saveSession.sessionId, 's1');
    assert.strictEqual(restoreSession.clearStorageBeforeRestore, true);
    assert.strictEqual(listed.action, 'list');
    assert.strictEqual(removed.sessionId, 's1');
    assert.strictEqual(dumped.pretty, false);
    assert.strictEqual(loaded.overwrite, true);
  });
});
