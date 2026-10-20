/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {describe, it} from 'node:test';

const repoRoot = process.cwd();

async function readRepoFile(relativePath: string): Promise<string> {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

describe('reverse workflow docs', () => {
  it('documents task artifacts, local rebuild, and Codex workflow guidance', async () => {
    const readme = await readRepoFile('README.md');
    const caseIndex = await readRepoFile('scripts/cases/README.md');
    const reverseIndex = await readRepoFile('docs/reference/reverse-task-index.md');
    const artifactsDoc = await readRepoFile('docs/reference/reverse-artifacts.md');
    const caseSafetyPolicy = await readRepoFile('docs/reference/case-safety-policy.md');
    const reverseWorkflowDoc = await readRepoFile('docs/reference/reverse-workflow.md');
    const reverseBootstrapDoc = await readRepoFile('docs/reference/reverse-bootstrap.md');
    const envPatchingDoc = await readRepoFile('docs/reference/env-patching.md');
    const updatePromptTemplate = await readRepoFile('docs/reference/reverse-update-prompt-template.md');
    const reverseReportTemplate = await readRepoFile('docs/reference/reverse-report-template.md');
    const algorithmUpgradeTemplate = await readRepoFile('docs/reference/algorithm-upgrade-template.md');
    const toolReference = await readRepoFile('docs/reference/tool-reference.md');
    const toolIoContract = await readRepoFile('docs/reference/tool-io-contract.md');
    const outputContract = await readRepoFile('skills/mcp-js-reverse-playbook/references/output-contract.md');
    const envTemplate = await readRepoFile('artifacts/tasks/_TEMPLATE/env/env.js');
    const polyfillsTemplate = await readRepoFile('artifacts/tasks/_TEMPLATE/env/polyfills.js');
    const entryTemplate = await readRepoFile('artifacts/tasks/_TEMPLATE/env/entry.js');
    const docsRootEntries = await readdir(path.join(repoRoot, 'docs'), {withFileTypes: true});
    const docsRootFiles = docsRootEntries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();

    assert.ok(readme.includes('核心方法论'));
    assert.ok(readme.includes('已沉淀链路'));
    assert.ok(readme.includes('支持的能力'));
    assert.ok(readme.includes('文档入口'));
    assert.ok(readme.includes('参考项目'));
    assert.ok(readme.includes('[scripts/cases/README.md](scripts/cases/README.md)'));
    assert.deepStrictEqual(docsRootFiles, []);
    assert.ok(caseIndex.includes('某东 `h5st` 参数'));
    assert.ok(caseIndex.includes('[scripts/cases/jd-h5st-pure-node.mjs](jd-h5st-pure-node.mjs)'));
    assert.ok(caseIndex.includes('某手 `falcon` 风控参数'));
    assert.ok(caseIndex.includes('如果新增公开参数 / 链路入口，统一更新本文件'));
    assert.ok(caseIndex.includes('Category: 参数签名'));
    assert.ok(caseIndex.includes('Status: abstract-case'));
    assert.ok(caseIndex.includes('Runtime: pure-node'));
    assert.ok(caseIndex.includes('字段规范'));
    assert.ok(reverseIndex.includes('export_rebuild_bundle'));
    assert.ok(reverseIndex.includes('record_reverse_evidence'));
    assert.ok(artifactsDoc.includes('timeline.jsonl'));
    assert.ok(artifactsDoc.includes('最小必备文件'));
    assert.ok(artifactsDoc.includes('可选文件'));
    assert.ok(artifactsDoc.includes('run/exported-runtime.js'));
    assert.ok(artifactsDoc.includes('portable runtime'));
    assert.ok(reverseWorkflowDoc.includes('模型执行协议'));
    assert.ok(reverseWorkflowDoc.includes('Observe-first'));
    assert.ok(reverseWorkflowDoc.includes('env rebuild'));
    assert.ok(readme.includes('reverse-update-prompt-template'));
    assert.ok(readme.includes('reverse-report-template'));
    assert.ok(reverseBootstrapDoc.includes('第一条正式工作回复必须包含'));
    assert.ok(reverseBootstrapDoc.includes('当前阶段'));
    assert.ok(updatePromptTemplate.includes('first divergence'));
    assert.ok(updatePromptTemplate.includes('不要猜'));
    assert.ok(reverseReportTemplate.includes('目标接口与字段'));
    assert.ok(reverseReportTemplate.includes('task artifact'));
    assert.ok(caseSafetyPolicy.includes('仅 `artifacts/tasks/_TEMPLATE/` 允许默认入库'));
    assert.ok(caseSafetyPolicy.includes('真实 `artifacts/tasks/<task-id>/` 默认视为本地私有任务目录'));
    assert.ok(caseSafetyPolicy.includes('新增正式文档时，不要再直接放到 `docs/` 根目录'));
    assert.ok(algorithmUpgradeTemplate.includes('first divergence'));
    assert.ok(algorithmUpgradeTemplate.includes('targetFunctionNames'));
    assert.ok(algorithmUpgradeTemplate.includes('env rebuild'));
    assert.ok(toolReference.includes('targetActionDescription'));
    assert.ok(toolReference.includes('targetFunctionNames'));
    assert.ok(toolIoContract.includes('Canonical Store'));
    assert.ok(outputContract.includes('targetContext'));
    assert.ok(outputContract.includes('targetActionDescription'));
    assert.ok(envPatchingDoc.includes('MCP 页面取证'));
    assert.ok(envPatchingDoc.includes('capture.json'));
    assert.ok(envPatchingDoc.includes('不要猜环境'));
    assert.ok(envPatchingDoc.includes('代理诊断层'));
    assert.ok(envPatchingDoc.includes('补丁判定表'));
    assert.ok(envPatchingDoc.includes('负面示例'));
    assert.ok(envPatchingDoc.includes('两阶段目标'));
    assert.ok(envPatchingDoc.includes('可移植 JS 导出'));
    assert.ok(envTemplate.includes('globalThis.window = globalThis'));
    assert.ok(envTemplate.includes('globalThis.localStorage ??='));
    assert.ok(polyfillsTemplate.includes('globalThis.watch = function watch'));
    assert.ok(polyfillsTemplate.includes('globalThis.makeFunction = function makeFunction'));
    assert.ok(polyfillsTemplate.includes('[env:get]'));
    assert.ok(entryTemplate.includes('import "./env.js";'));
    assert.ok(entryTemplate.includes('import "./polyfills.js";'));
  });
});
