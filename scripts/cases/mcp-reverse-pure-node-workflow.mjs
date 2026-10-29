function printAbstractCaseGuide() {
  console.log(`Case: MCP 前端逆向到纯 Node 工作流
Category: 工作流
Status: abstract-case
Runtime: pure-node
Scope: non-runnable

MCP Reverse Pure-Node Workflow Abstract Case (Non-runnable)

This case intentionally does NOT contain executable site logic.
It standardizes which MCP tool to use first, what artifact to collect,
and which next tool to use based on the observed result.

Goal:
- 用固定工具顺序，快速完成：页面取证 -> 签名链定位 -> 本地补环境 -> 单文件导出 -> 服务端验证
- scripts/cases/ 中如果必须记录 page 或 api host，统一保存为 Base64 文本，推荐字段名为 `entry_url_b64` 或 `api_host_b64`，使用前先解码

Required workflow:
1) Target request discovery:
   - First use: \`obs_list_network_requests\`
   - Then use: \`obs_get_network_request\`
   - Collect:
     target URL / method / status / query shape / body shape / response schema preview.
   - Output:
     one baseline successful request sample and one target path candidate.

2) Initiator confirmation:
   - First use: \`loc_get_request_initiator\`
   - Then optionally use: \`obs_list_scripts\`, \`loc_get_script_source\`
   - Collect:
     initiator stack, candidate script URL, bundled module path, caller function names.
   - Output:
     one confirmed initiator chain from network request back to business/runtime code.

3) Write-point capture:
   - First use: \`ins_hook\` or \`ins_hook\`
   - Common hooks:
     \`fetch\`, \`XMLHttpRequest.prototype.open\`, \`XMLHttpRequest.prototype.send\`,
     \`URLSearchParams.prototype.append\`, \`URLSearchParams.prototype.set\`
   - Then use: \`obs_get_hook_data\`
   - Collect:
     target parameter write event, request send timing, stack summary, argument preview.
   - Output:
     exact write point for target field and whether it is appended before send or during send.

4) Source correlation:
   - First use: \`loc_search_in_sources\`
   - Then use: \`loc_get_script_source\` or \`obs_collect_code\`
   - Optional: \`loc_analyze_code\`, \`loc_analyze_code\`
   - Collect:
     candidate function bodies, loader chain, security script URLs, dynamic dependency order.
   - Output:
     one stable local rebuild chain:
     business entry -> runtime wrapper -> security layer -> final signer/write point.

5) Evidence recording:
   - First use: \`rec_record_reverse_evidence\`
   - Record every important milestone:
     request sample, initiator chain, hook hit, script URL, first divergence, patch decision.
   - Output:
     durable task artifact timeline for later rebuild or drift recovery.

6) Local rebuild bootstrap:
   - First use in repo: task-local \`artifacts/tasks/<task-id>/env/\` and \`run/\`
   - Build minimal host only:
     \`window/document/navigator/location/history/screen/storage/crypto/fetch/XMLHttpRequest\`
   - Do NOT guess full browser.
   - Output:
     one minimal runnable harness that can start target scripts.

7) Missing-env diagnosis:
   - First use: proxy diagnostics in local rebuild
   - Then use: task-local env log, first divergence note, retry table
   - Patch rules:
     one missing value/function/object per loop.
   - Output:
     one confirmed first divergence per iteration and one minimal patch decision.

8) Local signer extraction:
   - First use: local exported entry such as \`genSign\`, \`genToken\`, \`genABogus\`
   - Then use: one task-local smoke script
   - Collect:
     generated field value, final URL or headers, deterministic input contract.
   - Output:
     one callable local API surface.

9) Single-file export:
   - First use: task-local \`run/exported-runtime.js\`
   - Goal:
     inline required capture and scripts, remove external file reads, keep only runtime dependencies.
   - Output:
     one self-contained exported runtime and one minimal \`test.js\` example.

10) Verification:
    - First use: local verifier request
    - Verify:
      no-sign / captured-valid-sign / generated-sign.
    - Collect:
      HTTP status, service \`status_code\`, expected response keys, resource count.
    - Output:
      one pass/fail conclusion for generated signer.

11) Drift recovery:
    - First use after failure:
      \`obs_list_network_requests\` -> \`loc_get_request_initiator\` -> hooks -> source correlation.
    - Watch:
      script URL drift, file size drift, function name drift, request contract drift.
    - Output:
      one updated first divergence and one next rebuild action.

Tool routing rules:
- Want target request? Use \`obs_list_network_requests\`
- Want exact request details? Use \`obs_get_network_request\`
- Want caller stack? Use \`loc_get_request_initiator\`
- Want parameter write point? Use \`ins_hook\` / \`ins_hook\` + \`obs_get_hook_data\`
- Want source location? Use \`loc_search_in_sources\` / \`loc_get_script_source\`
- Want code summary? Use \`obs_collect_code\` / \`loc_analyze_code\`
- Want durable timeline? Use \`rec_record_reverse_evidence\`
- Want local reproducibility? Move to \`artifacts/tasks/<task-id>/run/\`

Acceptance criteria:
- One target request sample is preserved.
- One initiator chain is confirmed.
- One target parameter write point is captured.
- One local rebuild chain runs in Node.
- One first divergence note exists for each failed iteration.
- One exported runtime surface is defined.
- If pure extraction is attempted, one fixed fixture is recorded.
- One generated request passes server verification.

Repository boundary:
- Keep this file abstract and non-runnable.
- Put executable scripts only in \`artifacts/tasks/<task-id>/run/\`.
- Do not store raw production cookie bundles or reusable production signer code here.

References:
- scripts/cases/douyin-a-bogus-pure-node.mjs
- docs/reference/reverse-task-index.md
- docs/reference/tool-reference.md
- docs/reference/case-safety-policy.md
`);
}

printAbstractCaseGuide();
