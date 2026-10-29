# Reverse Task Index

按逆向目标快速定位 MCP 工具，减少“该用哪个工具”的试错成本。

## Step 0：开场必读（强制）

任何新会话、任何新 case、任何“继续上次逆向”的第一步，都先读：

1. `docs/reference/reverse-bootstrap.md`
2. `docs/reference/case-safety-policy.md`
3. `docs/reference/reverse-workflow.md`
4. 若任务已通过 `env-pass`，或目标明确是“补环境后提纯算法”，继续读 `docs/reference/pure-extraction.md`

开场第一条正式工作回复必须同时说明：

- 已读取上述文档
- 当前阶段（Observe / Capture / Rebuild / Patch / PureExtraction / Port）
- 本次产出写入哪里：`scripts/cases/*` 抽象层，还是 `artifacts/tasks/<task-id>/` 可执行层

仓库级安全边界：

- `scripts/cases/*` 只允许抽象模板与方法索引
- 可执行实现、完整签名链路、真实任务证据统一进入 `artifacts/tasks/<task-id>/`

如果第一条回复没有显式确认这些约束，视为尚未进入正确工作流。

默认工作流：

1. 页面观察
2. 运行时采样
3. task artifact 记录
4. local rebuild
5. 本地补环境（代理日志优先）
6. `env-pass` 后再进入纯算法提纯

读取优先级（强制）：

1. 先读 `artifacts/tasks/<task-id>/`（若存在）
2. 再读 `scripts/cases/*` 抽象 case
3. 最后按模板新建流程：
   - `docs/reference/parameter-methodology-template.md`
   - `docs/reference/parameter-site-mapping-template.md`

## 1) 快速摸清页面加载了什么脚本

- `obs_list_scripts`
- `loc_get_script_source`
- `loc_search_in_scripts`

常用场景：先看主站脚本、动态加载脚本、webpack chunk 的体量和命名。

## 2) 在压缩/混淆代码里定位关键逻辑

- `loc_find_in_script`
- `ins_set_breakpoint_on_text`
- `loc_understand_code`
- `loc_deobfuscate_code`

常用关键词：`sign`、`token`、`nonce`、`encrypt`、`hmac`。

## 3) 追踪请求参数是怎么生成的

- `ins_create_hook`
- `ins_inject_hook`
- `obs_get_hook_data`
- `ins_break_on_xhr`
- `loc_get_request_initiator`

推荐先 Hook `fetch/xhr/websocket`，触发业务动作后再抓记录。

同步记录：

- `rec_record_reverse_evidence`

## 4) 一键分析目标站点（推荐入口）

- `run_analyze_target`

关键输出：

- `requestFingerprints`
- `priorityTargets`
- `signatureChain`
- `actionPlan`

适合第一次接触目标站，快速得到下一步可执行动作。

## 5) 导出本地补环境工程

- `rec_export_rebuild_bundle`
- `ver_diff_env_requirements`

适合在页面里确认请求链路后，导出 `env/entry.js`、`env/env.js`、`env/polyfills.js`、`env/capture.json` 做 local rebuild。

固定顺序：

1. 先运行 `env/entry.js`
2. 先读 task-local 代理 env log
3. 记录当前 `first divergence`
4. 再按“最小因果单元”决定补丁
5. 必要时才用 `ver_diff_env_requirements` 做辅助比对

补环境原则请同时参考：`docs/reference/env-patching.md`

## 6) 评估风险和加密实现

- `loc_detect_crypto`
- `ver_risk_panel`
- `loc_understand_code`

用于识别弱算法、可疑签名实现、安全风险点。

## 7) 页面交互自动化（配合采样）

- `nav_navigate_page`
- `obs_query_dom`
- `nav_click_element`
- `nav_type_text`
- `nav_wait_for_element`
- `obs_take_screenshot`

适合自动触发登录、下单、提交等关键动作后再采集数据。

## 8) 导出分析结果

- `rec_export_session_report`
- `ver_collection_diff`
- `rec_record_reverse_evidence`

用于沉淀会话证据、对比两次采样差异，并把关键结论写入 task artifact。

## 9) 登录态复用（需登录站点建议）

- `rec_save_session_state`
- `rec_restore_session_state`
- `rec_list_session_states`
- `rec_dump_session_state`
- `rec_load_session_state`
- `sys_check_browser_health`

适合“必须登录后才能访问”的目标站，减少重复扫码/验证码成本。

## 10) 典型最小链路

1. `nav_new_page`
2. 先读 `docs/reference/reverse-bootstrap.md`，再按其要求继续读 `docs/reference/case-safety-policy.md` 与 `docs/reference/reverse-workflow.md`
3. `run_analyze_target`
4. 设定目标边界：`targetKeywords`、`targetUrlPatterns`、`targetFunctionNames`、`targetActionDescription`
5. `loc_search_in_scripts`
6. `ins_create_hook` + `ins_inject_hook`
7. 触发页面动作
8. `obs_get_hook_data`
9. `rec_record_reverse_evidence`
10. `rec_export_rebuild_bundle`
11. 运行 `env/entry.js` 并读取代理 env log
12. 记录 `first divergence`
13. `ver_diff_env_requirements`（仅辅助）
14. `ver_risk_panel`
15. `env-pass` 后再推进纯算法提纯

## 11) 参数总表

完整参数与字段说明请查：`docs/reference/tool-reference.md`

## 12) 参数复现模板复用（推荐）

遇到“某个参数可复现”任务时，先走模板而不是临时写脚本：

1. 先读 `docs/reference/reverse-bootstrap.md`
2. 再填站点无关模板：`docs/reference/parameter-methodology-template.md`
3. 再填站点映射模板：`docs/reference/parameter-site-mapping-template.md`
4. 按模板执行 Observe / Capture / Rebuild / Patch / Verify，补环境阶段默认走“代理日志 + `first divergence` + 最小因果单元”
5. 可执行代码与完整链路统一放 `artifacts/tasks/<task-id>/`

安全约束：`docs/reference/case-safety-policy.md`
