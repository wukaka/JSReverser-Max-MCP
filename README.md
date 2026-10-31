# JSReverser-Max-MCP

JS 逆向正从一门手工艺术，变成可以编排、验证与沉淀的工程流程。本项目提供一套MCP与Skill作为能力接口，让具备强大推理能力的模型成为这套流程高效的执行者。

## 核心方法论

模型执行逆向任务时的默认行为契约：

- `Observe-first`：先观察页面、请求与脚本来源，再形成假设
- `Hook-preferred`：优先用最小侵入的 Hook 采样获取运行时事实
- `Breakpoint-last`：断点调试只在观察与 Hook 都不足以取证时启用
- `Rebuild-oriented`：一切取证都服务于本地复现——导出 rebuild bundle，在 Node 中逐项补环境
- `Evidence-first`：每一次观察、假设与验证都落盘为 task artifact，不依赖对话记忆
- `Pure-extraction-after-pass`：环境打通（env-pass）后进入纯算法提取阶段，结果可脱离浏览器独立运行

## Skills（方法论层）

仓库内置三个可复用的 skill，按「决策层 / 执行层 / 编排层」拆分：

- `blackbox-js-reverse-engineering`：决策层。负责实验设计、可证伪假设、差异分析与证据判定，适合排查“为什么这个环境/分支行为不一致”。
- `mcp-js-reverse-playbook`：执行层。负责 MCP 工具链的具体用法：签名链路定位、页面观察取证、本地补环境复现、VMP 插桩与 AST 去混淆。
- `signal-driven-js-reverse`：编排层。按阶段门组织前两个 skill，适合存在服务端判定、多轮尝试无进展、需要快速收敛的任务。


高强度任务建议先加载 `signal-driven-js-reverse`，它会要求同时加载另外两个 skill。

## 快速开始

### 1) 安装依赖并构建

```bash
npm install
npm run build
```

构建入口：

```bash
build/src/index.js
```

### 2) 先启动可接管的 Chrome

本项目不再自动拉起浏览器：未指定连接目标时服务会直接报错退出。

先启动一个带远程调试端口的 Chrome：

```bash
# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-mcp
```

Windows / Linux 的启动命令见 [docs/guides/browser-connection.md](docs/guides/browser-connection.md)。

然后启动服务并连接：

```bash
npm run start -- --browserUrl http://127.0.0.1:9222
```

也可以改用 `--wsEndpoint`，或用 `--autoConnect` 自动探测常见调试端口。

### 3) 配置客户端

最小配置示例（以 `--browserUrl` 接管本机 Chrome）。本服务不内置外部 LLM，浏览器接管、Hook / 断点 / Network / WebSocket、代码采集与去混淆等能力开箱即用；代码的语义理解与归纳由主模型直接完成：

```json
{
  "mcpServers": {
    "jsreverser-max-mcp": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js",
        "--browserUrl",
        "http://127.0.0.1:9222"
      ]
    }
  }
}
```

最后把仓库内置的三个 skill 装进客户端（以 Claude Code 为例，符号链接到用户级 skills 目录即可被自动发现，且随仓库更新生效）：

```bash
mkdir -p ~/.claude/skills && ln -s /ABSOLUTE/PATH/JSReverser-Max-MCP/skills/* ~/.claude/skills/
```

更多客户端（Claude Code / Cursor / Codex）配置示例、`--wsEndpoint`、`--autoConnect` 与端口转发写法，见：

- [docs/guides/client-configuration.md](docs/guides/client-configuration.md)
- [docs/guides/browser-connection.md](docs/guides/browser-connection.md)

## 支持的能力

<!-- BEGIN CAPABILITY TABLE -->

| 能力分类 | 说明 | 工具函数 | 入参 |
| --- | --- | --- | --- |
| 任务入口 | 不确定从哪开始？先要一条路线（只给路线，不给结论） | `reverse_guide` | `goal*`, `scenario` (from_zero/confirm_change/header_necessity/signer_inputs/offline_repro) |
| 页面与 Frame 管理 | 打开、切换、枚举页面与 iframe | `nav_page` | `action*` (list/select/new), `pageIdx`, `url`, `timeout` |
|  |  | `nav_frame` | `action*` (list/select), `frameIdx` |
| 页面观察与脚本定位 | 先回答“页面里有哪些脚本、目标代码大概在哪” | `obs_list_scripts` | `filter` |
|  |  | `loc_get_script_source` | `scriptId*`, `startLine`, `endLine`, `offset`, `length` |
|  |  | `loc_find_in_script` | `scriptId*`, `query*`, `contextChars`, `occurrence`, `caseSensitive` |
|  |  | `obs_list_collected_scripts` | `pattern`, `limit`, `maxTotalSize` |
| Hook 与运行时采样 | 先做最小侵入式观测，确认运行时到底调用了什么 | `ins_hook` | `action*` (function/create/list/remove/inject), `hookId`, `target`, `type`, `params`, `description`, `hookAction` (log/block/modify/passthrough), `logArgs`, `logResult`, `logStack` |
|  |  | `obs_get_hook_data` | `hookId`, `view` (raw/summary), `maxRecords` |
|  |  | `loc_trace_function` | `functionName*`, `urlFilter`, `logArgs`, `logThis`, `pause`, `traceId`, `taskId`, `taskSlug`, `targetUrl`, `goal` |
|  |  | `obs_monitor_events` | `action*` (start/stop), `selector`, `events[]`, `monitorId`, `taskId`, `taskSlug`, `targetUrl`, `goal` |
| 断点与调试控制 | 当 hook 不够时，再进入暂停式调试 | `ins_breakpoint` | `action*` (set/set_text/remove/list), `url`, `lineNumber`, `columnNumber`, `condition`, `isRegex`, `text`, `urlFilter`, `occurrence`, `breakpointId` |
|  |  | `ins_debug_control` | `action*` (pause/resume/step_over/step_into/step_out) |
|  |  | `ins_get_paused_info` | `includeScopes`, `maxScopeDepth` |
|  |  | `ins_evaluate_on_callframe` | `expression*`, `frameIndex` |
|  |  | `ins_xhr_breakpoint` | `action*` (set/remove), `url*` |
| 请求链路与网络分析 | 定位目标请求，确认是谁发起、带了什么参数 | `obs_list_network_requests` | `pageSize`, `pageIdx`, `resourceTypes[]`, `includePreservedRequests` |
|  |  | `obs_get_network_request` | `reqid`, `includeBody`, `toFile` |
|  |  | `loc_get_request_initiator` | `requestId*`, `taskId`, `taskSlug`, `targetUrl`, `goal` |
| 请求验证与重放 | 验证某个头/字段是否必需，并导出最小可执行请求 | `run_replay_request` | `reqid*`, `method`, `url`, `headers`, `removeHeaders[]`, `body`, `query`, `usePageContext`, `timeoutMs`, `allowHosts[]` |
|  |  | `run_header_ablation` | `reqid*`, `candidates[]`, `maxRuns`, `mode` (greedy/binary), `usePageContext`, `timeoutMs`, `allowHosts[]` |
|  |  | `ver_diff_network_requests` | `a*`, `b*`, `ignoreHeaders[]`, `jsonAware` |
|  |  | `run_export_request` | `reqid*`, `format*` (curl/node-fetch/node-axios), `headers`, `removeHeaders[]` |
| 签名 Oracle 与输入敏感度 | 从 initiator 栈自动找候选签名函数；注册签名器并扰动字段判断参与签名的输入 | `loc_trace_request_to_signer` | `reqid*`, `topN`, `contextChars`, `includeParentStack` |
|  |  | `ins_signer` | `action*` (register/list/remove/sign), `name`, `expr`, `payload`, `persist` |
|  |  | `ver_analyze_signer` | `name`, `expr`, `payload*`, `fields[]`, `trials` |
| 页面状态与运行前检查 | 补看页面运行状态、控制台输出和本地状态依赖 | `sys_check_browser_health` | — |
|  |  | `obs_list_console_messages` | `pageSize`, `pageIdx`, `types[]`, `includePreservedMessages` |
|  |  | `obs_get_console_message` | `msgid*` |
|  |  | `obs_get_storage` | `type` (all/cookies/localStorage/sessionStorage), `filter` |
|  |  | `ins_evaluate_script` | `function*` |
|  |  | `ins_evaluate_script_to_file` | `function*`, `filePath*` |
|  |  | `loc_search_in_sources` | `query*`, `caseSensitive`, `isRegex`, `maxResults`, `maxLineLength`, `excludeMinified`, `urlFilter` |
|  |  | `obs_inspect_object` | `expression*`, `depth`, `showMethods`, `showPrototype` |
|  |  | `obs_get_performance_metrics` | — |
| WebSocket 观察与消息分组 | 处理长连接、直播流或二进制帧时，用这组工具先分流再细看 | `obs_list_websocket_connections` | `pageSize`, `pageIdx`, `urlFilter`, `includePreservedConnections` |
|  |  | `obs_analyze_websocket_messages` | `wsid*`, `direction` (sent/received) |
|  |  | `obs_get_websocket_messages` | `wsid*`, `direction` (sent/received), `groupId`, `pageSize`, `pageIdx`, `show_content` |
|  |  | `obs_get_websocket_message` | `wsid*`, `frameIndex*` |
| 任务上下文与总结 | 设置任务后自动记录实验证据，并导出总结 | `rec_task_context` | `action*` (set/get/clear), `taskId`, `taskSlug`, `targetUrl`, `goal` |
|  |  | `rec_export_reverse_summary` | `taskId*`, `path` |
| 本地复现与补环境 | 把页面证据带回本地，逐步补齐 Node 运行环境 | `rec_export_rebuild_bundle` | `taskId*`, `taskSlug*`, `targetUrl*`, `goal*`, `autoGenerate`, `targetKeywords[]`, `targetUrlPatterns[]`, `targetFunctionNames[]`, `targetActionDescription`, `maxEvidenceItems`, `entryCode`, `envCode`, `polyfillsCode`, `capture`, `notes[]` |
|  |  | `ver_diff_env_requirements` | `runtimeError*`, `observedCapabilities[]` |
|  |  | `rec_record_reverse_evidence` | `taskId*`, `taskSlug*`, `targetUrl*`, `goal*`, `channel`, `targetKeywords[]`, `targetUrlPatterns[]`, `targetFunctionNames[]`, `targetActionDescription`, `entry*` |
| 页面自动化 | 做最小必要的页面操作，复现触发条件并辅助取证 | `nav_navigate_page` | `type` (url/back/forward/reload), `url`, `ignoreCache`, `timeout` |
|  |  | `obs_query_dom` | `selector*`, `all`, `limit` |
|  |  | `obs_get_dom_structure` | `maxDepth`, `includeText` |
|  |  | `nav_click_element` | `selector*` |
|  |  | `nav_type_text` | `selector*`, `text*`, `delay` |
|  |  | `nav_wait_for_element` | `selector*`, `timeout` |
|  |  | `obs_take_screenshot` | `format` (png/jpeg/webp), `quality`, `fullPage`, `filePath` |
| 注入与隐身 | 预注入脚本、stealth 特性与 UA 伪装 | `ins_inject_preload_script` | `script*` |
|  |  | `ins_stealth` | `action*` (inject/presets/features/set_user_agent), `preset` (windows-chrome/mac-chrome/mac-safari/linux-chrome/windows-edge), `userAgent` |
| 深度分析 | 拿到代码和运行时证据后，做结构理解、去混淆和一键分析 | `run_analyze_target` | `url*`, `topN`, `runDeobfuscation`, `hookPreset` (none/api-signature/network-core), `autoInjectHooks`, `waitAfterHookMs`, `correlationWindowMs`, `maxCorrelatedFlows`, `maxFingerprints`, `autoReplayActions[]`, `collect` |
|  |  | `obs_collect_code` | `url*`, `smartMode` (summary/priority/incremental/full), `returnMode` (full/summary/pattern/top-priority), `includeInline`, `includeExternal`, `includeDynamic`, `maxTotalSize`, `maxFileSize`, `pattern`, `limit`, `topN` |
|  |  | `ver_collection_diff` | `previous*[]`, `current[]`, `includeUnchanged` |
|  |  | `loc_analyze_code` | `action*` (deobfuscate/understand/summarize/crypto/risk), `code`, `url`, `files[]`, `focus` (all/structure/business/security), `aggressive`, `renameVariables`, `mode` (single/batch/project), `includeHookSignals`, `hookId`, `topN` |
| 会话与登录态复用 | 保存并复用浏览器会话与登录态 | `rec_session_state` | `action*` (save/restore/list/delete/dump/load), `sessionId`, `includeCookies`, `includeLocalStorage`, `includeSessionStorage`, `navigateToSavedUrl`, `clearStorageBeforeRestore`, `path`, `pretty`, `encrypt`, `snapshotJson`, `overwrite` |
|  |  | `rec_export_session_report` | `format` (json/markdown), `includeHookData` |
| Wasm 与 JSON 插件 | 覆盖采集、结构分析、导出使用情况、JS→Wasm 边界链路和 WAT 反汇编；Hook 体系内置 `json` 插件 | `wasm_collect` | `url*`, `timeout`, `waitAfterLoadMs`, `includeRuntimeEvents`, `includeImports`, `includeExports`, `maxModules`, `captureBase64`, `taskId`, `taskSlug`, `targetUrl`, `goal` |
|  |  | `wasm_list_modules` | `includeImports`, `includeExports` |
|  |  | `wasm_analyze_module` | `moduleId`, `base64`, `artifactPath`, `includeFunctionSignatures`, `includeRawSectionMap`, `includeStringScan`, `maskSensitiveStrings`, `maxStringSlots`, `maxSummaryLines` |
|  |  | `wasm_inspect_exports` | `moduleId*` |
|  |  | `wasm_summarize_boundary` | `moduleId*`, `maxChains` |
|  |  | `wasm_signature_diff` | `moduleId*`, `exportName`, `maxChains` |
|  |  | `wasm_decompile` | `moduleId`, `base64`, `artifactPath`, `maxWatChars`, `foldExprs`, `inlineExport` |

> 入参列：`name*` 表示必填；枚举值以 `(a/b)` 标注；`name[]` 表示数组。完整说明见 [tool-reference](docs/reference/tool-reference.md)。

<!-- END CAPABILITY TABLE -->

> 注：`loc_analyze_code` 只返回确定性骨架（AST 结构、数据流、模式、复杂度、加密/弱算法规则检测、代码片段）；`understand` / `summarize` 的语义归纳、`deobfuscate` 解不了的 VMP/JSFuck 还原，均由主模型在工具输出基础上自行完成。
>
- 完整参数说明见 [docs/reference/tool-reference.md](docs/reference/tool-reference.md)。
- 按逆向流程选工具可继续看 [docs/reference/reverse-workflow.md](docs/reference/reverse-workflow.md)。
- Wasm 与 JSON 插件的完整参数与实现细节见 [docs/reference/wasm-and-json-plugins.md](docs/reference/wasm-and-json-plugins.md)。

## 文档入口

逆向相关任务开场先读：`docs/reference/reverse-bootstrap.md`。该入口会继续要求模型读取 `docs/reference/case-safety-policy.md`、`docs/reference/reverse-workflow.md`；若已进入 `env-pass` 后的提纯阶段，再读 `docs/reference/pure-extraction.md`。

### Guides

- 快速开始：[docs/guides/getting-started.md](docs/guides/getting-started.md)
- 浏览器连接：[docs/guides/browser-connection.md](docs/guides/browser-connection.md)
- 客户端配置：[docs/guides/client-configuration.md](docs/guides/client-configuration.md)
- 逆向工作流：[docs/reference/reverse-workflow.md](docs/reference/reverse-workflow.md)
- 补环境规范：[docs/reference/env-patching.md](docs/reference/env-patching.md)

### Reference

- 模型首读入口：[docs/reference/reverse-bootstrap.md](docs/reference/reverse-bootstrap.md)
- 逆向任务索引：[docs/reference/reverse-task-index.md](docs/reference/reverse-task-index.md)
- 工具参数总表：[docs/reference/tool-reference.md](docs/reference/tool-reference.md)
- Wasm 与 JSON 插件：[docs/reference/wasm-and-json-plugins.md](docs/reference/wasm-and-json-plugins.md)
- 工具读写契约：[docs/reference/tool-io-contract.md](docs/reference/tool-io-contract.md)
- 任务产物说明：[docs/reference/reverse-artifacts.md](docs/reference/reverse-artifacts.md)

### Templates And Supporting Docs

- [docs/reference/reverse-update-prompt-template.md](docs/reference/reverse-update-prompt-template.md)
- [docs/reference/reverse-report-template.md](docs/reference/reverse-report-template.md)
- [docs/reference/algorithm-upgrade-template.md](docs/reference/algorithm-upgrade-template.md)
- [docs/reference/parameter-methodology-template.md](docs/reference/parameter-methodology-template.md)
- [docs/reference/parameter-site-mapping-template.md](docs/reference/parameter-site-mapping-template.md)

## 参考项目

### Fork 来源

本仓库 fork 自 [lwjjike/JSReverser-Strong-MCP](https://github.com/lwjjike/JSReverser-Strong-MCP)，并在其基础上做二次开发。上游代码的版权与协议归属以其仓库为准。

### 其他参考项目

本项目在设计和实现过程中还参考了以下项目，具体协议声明（如 MIT 等）以对应上游仓库为准：

- https://github.com/wuji66dde/jshook-skill
- https://github.com/zhizhuodemao/js-reverse-mcp

## License

Apache-2.0

本仓库沿用 Apache-2.0 协议，完整协议文本见根目录 `LICENSE`。由于本仓库 fork 自 [lwjjike/JSReverser-Strong-MCP](https://github.com/lwjjike/JSReverser-Strong-MCP)，上游代码的版权声明与协议条款以其仓库为准，二次开发部分同样以 Apache-2.0 发布。
