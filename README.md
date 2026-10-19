# JS Reverse Strong MCP

一个把前端 JavaScript 逆向流程标准化的 MCP 服务。  
目标不是只做页面调试，而是把页面观察、运行时采样、本地复现、补环境和证据沉淀串成一套可复用工作流。

## 核心方法论

本项目默认遵循以下方法论：

- `Observe-first`
- `Hook-preferred`
- `Breakpoint-last`
- `Rebuild-oriented`
- `Evidence-first`
- `Pure-extraction-after-pass`

这意味着：

1. 先在浏览器里确认请求、脚本、函数和依赖来源
2. 再做最小化 Hook 采样
3. 再导出 local rebuild
4. 再在 Node 里逐项补环境
5. 每一步都沉淀为 task artifact，而不是只留在对话里

## Skills（方法论层）

仓库内置三个可复用的 skill，按「决策层 / 执行层 / 编排层」拆分：

- `blackbox-js-reverse-engineering`：决策层。负责实验设计、可证伪假设、差异分析与证据判定，适合排查“为什么这个环境/分支行为不一致”。
- `mcp-js-reverse-playbook`：执行层。负责 MCP 工具链的具体用法：签名链路定位、页面观察取证、本地补环境复现、VMP 插桩与 AST 去混淆。
- `signal-driven-js-reverse`：编排层。按阶段门组织前两个 skill，适合存在服务端判定、多轮尝试无进展、需要快速收敛的任务。

入口文件：

- `skills/blackbox-js-reverse-engineering/SKILL.md`
- `skills/mcp-js-reverse-playbook/SKILL.md`
- `skills/signal-driven-js-reverse/SKILL.md`

高强度任务建议先加载 `signal-driven-js-reverse`，它会要求同时加载另外两个 skill。

## 已沉淀链路

以下参数链路已有公开索引，可作为仓库内复用入口：

- 某东 `h5st` 参数
  - 索引：[scripts/cases/README.md](scripts/cases/README.md)
  - Case：[scripts/cases/jd-h5st-pure-node.mjs](scripts/cases/jd-h5st-pure-node.mjs)

- 某手 `falcon` 风控参数
  - 索引：[scripts/cases/README.md](scripts/cases/README.md)
  - Case：[scripts/cases/ks-hxfalcon-pure-node.mjs](scripts/cases/ks-hxfalcon-pure-node.mjs)

- 某音 `a-bogus` 参数
  - 索引：[scripts/cases/README.md](scripts/cases/README.md)
  - Case：[scripts/cases/douyin-a-bogus-pure-node.mjs](scripts/cases/douyin-a-bogus-pure-node.mjs)

说明：

- README 首页只展示脱敏后的参数类型和公开入口
- 真实 `artifacts/tasks/<task-id>/` 默认视为本地私有任务目录
- Git 默认只提交 `artifacts/tasks/_TEMPLATE/`

## 支持的能力

### 页面观察与脚本定位

先回答“页面里有哪些脚本、目标代码大概在哪”。

`list_scripts` · `get_script_source` · `find_in_script` · `search_in_scripts`

### Hook 与运行时采样

先做最小侵入式观测，确认运行时到底调用了什么。

`create_hook` · `inject_hook` · `get_hook_data` · `hook_function` · `trace_function`

### 断点与调试控制

当 hook 不够时，再进入暂停式调试。

`set_breakpoint` · `set_breakpoint_on_text` · `resume` · `pause` · `step_over` / `step_into` / `step_out`

### 请求链路与网络分析

定位目标请求，确认是谁发起、带了什么参数。

`list_network_requests` · `get_network_request` · `get_request_initiator` · `break_on_xhr`

### 页面状态与运行前检查

补看页面运行状态、控制台输出和本地状态依赖。

`check_browser_health` · `list_console_messages` · `get_storage` · `evaluate_script` · `evaluate_script_to_file` · `search_in_sources`

### WebSocket 观察与消息分组

处理长连接、直播流或二进制帧时，用这组工具先分流再细看。

`list_websocket_connections` · `analyze_websocket_messages` · `get_websocket_messages`

### 本地复现与补环境

把页面证据带回本地，逐步补齐 Node 运行环境。

`export_rebuild_bundle` · `diff_env_requirements` · `record_reverse_evidence`

### 页面自动化

做最小必要的页面操作，复现触发条件并辅助取证。

`navigate_page` · `query_dom` · `click_element` · `type_text` · `take_screenshot`

### 深度分析

在拿到代码和运行时证据后，继续做结构理解与去混淆。

`collect_code` · `understand_code` · `deobfuscate_code` · `risk_panel`

### 会话与登录态复用

`save_session_state` · `restore_session_state` · `dump_session_state` · `load_session_state`

完整参数说明见 [docs/reference/tool-reference.md](docs/reference/tool-reference.md)。
按逆向流程选工具可继续看 [docs/reference/reverse-workflow.md](docs/reference/reverse-workflow.md)。

## 外部 AI 增强

项目支持把外部 LLM 作为“分析增强层”接入，当前支持 `openai`、`anthropic`、`gemini`。配置通过进程环境变量完成，MCP 客户端里在 server 配置的 `env` 中传入：

```toml
[mcp_servers.js-reverse.env]
DEFAULT_LLM_PROVIDER = "anthropic"
ANTHROPIC_API_KEY = "your_key"
ANTHROPIC_MODEL = "claude-3-5-sonnet-20241022"
```

强依赖外部 AI 的只有 `understand_code`；`detect_crypto`、`analyze_target`、`risk_panel`、`deobfuscate_code` 属于可选增强。不配置也能使用浏览器接管、Hook / 断点 / Network / WebSocket、`collect_code`、`export_rebuild_bundle` 等核心能力。

完整 provider 列表、`.env` 写法与逐功能依赖说明见 [docs/guides/ai-configuration.md](docs/guides/ai-configuration.md)。

## Wasm 与 JSON Hook 插件

内置 Wasm 逆向工具链，覆盖采集、结构分析、导出使用情况、JS→Wasm 边界链路和 WAT 反汇编：

- `collect_wasm` / `list_wasm_modules`：采集并列出 Wasm 模块
- `analyze_wasm_module`：静态结构分析
- `inspect_wasm_exports` / `summarize_wasm_boundary` / `analyze_wasm_signature_diff`：导出入口与签名边界分析
- `decompile_wasm_module`：反汇编为 WAT

Hook 体系还内置 `json` 类型插件，同时 Hook `JSON.stringify` / `JSON.parse`，用于确认签名前后的结构变化和额外字段注入。

完整参数与实现细节见 [docs/reference/wasm-and-json-plugins.md](docs/reference/wasm-and-json-plugins.md)，工具参数总表见 [docs/reference/tool-reference.md](docs/reference/tool-reference.md)。

## 标准任务结构

任务目录统一使用：

- `artifacts/tasks/_TEMPLATE/`
- `artifacts/tasks/<task-id>/`

推荐目录结构：

- `task.json`
- `runtime-evidence.jsonl`
- `network.jsonl`
- `scripts.jsonl`
- `env/env.js`
- `env/polyfills.js`
- `env/entry.js`
- `env/capture.json`
- `run/`
- `report.md`

职责边界：

- `env.js`
  - 基础宿主对象和最小 shim
- `polyfills.js`
  - 代理诊断层、`watch`、`safeFunction`、`makeFunction`
- `entry.js`
  - 运行入口、目标脚本加载、first divergence 输出

## 标准执行流程

推荐流程：

1. 页面观察
2. 运行时采样
3. 证据入库
4. local rebuild
5. 逐项补环境
6. first divergence 定位
7. `env-pass` 后再进入纯算法 / 风控逻辑提纯

默认原则：

- 不要跳过页面证据直接猜环境
- 不要一次性全量模拟浏览器
- 不要把真实任务目录直接提交 Git

## 参数沉淀与安全边界

参数链路沉淀遵循以下规则：

1. 先读本地 task artifact

- `artifacts/tasks/<task-id>/`

2. 本地没有时再读抽象 case

- `scripts/cases/*`

3. 仍不足时按模板新建

- `docs/reference/parameter-methodology-template.md`
- `docs/reference/parameter-site-mapping-template.md`

安全边界：

- case 只保留抽象方法和流程
- 真实任务目录默认本地保留
- 敏感值必须脱敏后才允许共享
- Git 默认只提交 `_TEMPLATE`

详见：

- [docs/reference/case-safety-policy.md](docs/reference/case-safety-policy.md)
- [docs/reference/reverse-artifacts.md](docs/reference/reverse-artifacts.md)
- [docs/reference/env-patching.md](docs/reference/env-patching.md)

## 3 分钟快速开始

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

本项目不再自动拉起浏览器：未指定连接目标时服务会直接报错退出，避免旧兜底在父进程被强制终止后留下孤儿 Chrome 进程。

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

最小配置示例（以 `--browserUrl` 接管本机 Chrome）：

#### Claude Code

```bash
claude mcp add js-reverse node /ABSOLUTE/PATH/JSReverser-MCP/build/src/index.js -- --browserUrl http://127.0.0.1:9222
```

Cursor / Codex 的配置示例，以及 `--wsEndpoint`、`--autoConnect`、端口转发和 Gemini / Claude / OpenAI 的 `env` 写法，见：

- [docs/guides/client-configuration.md](docs/guides/client-configuration.md)
- [docs/guides/browser-connection.md](docs/guides/browser-connection.md)

## 文档入口

逆向相关任务开场先读：`docs/reference/reverse-bootstrap.md`。该入口会继续要求模型读取 `docs/reference/case-safety-policy.md`、`docs/reference/reverse-workflow.md`；若已进入 `env-pass` 后的提纯阶段，再读 `docs/reference/pure-extraction.md`。

### Guides

- 快速开始：[docs/guides/getting-started.md](docs/guides/getting-started.md)
- 浏览器连接：[docs/guides/browser-connection.md](docs/guides/browser-connection.md)
- 客户端配置：[docs/guides/client-configuration.md](docs/guides/client-configuration.md)
- 外部 AI 配置：[docs/guides/ai-configuration.md](docs/guides/ai-configuration.md)
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

本项目在设计和实现过程中参考了以下项目，具体协议声明（如 MIT 等）以对应上游仓库为准：

- https://github.com/wuji66dde/jshook-skill
- https://github.com/zhizhuodemao/js-reverse-mcp

## License

Apache-2.0
