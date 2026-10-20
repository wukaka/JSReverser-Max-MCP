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


适用于支持 `mcpServers` JSON 配置的客户端配置：

```json
{
  "mcpServers": {
    "jsreverser-max-mcp": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js",
        "--browserUrl",
        "http://127.0.0.1:9222"
      ],
      "env": {
        "DEFAULT_LLM_PROVIDER": "gemini",
        "GEMINI_API_KEY": "your_key",
        "GEMINI_MODEL": "gemini-2.0-flash-exp"
      }
    }
  }
}
```

Cursor / Codex 的配置示例，以及 `--wsEndpoint`、`--autoConnect`、端口转发和 Gemini / Claude / OpenAI 的 `env` 写法，见：

- [docs/guides/client-configuration.md](docs/guides/client-configuration.md)
- [docs/guides/browser-connection.md](docs/guides/browser-connection.md)

## 支持的能力

| 能力分类 | 说明 | 工具函数 |
| --- | --- | --- |
| 页面与 Frame 管理 | 打开、切换、枚举页面与 iframe | `list_pages` |
| | | `select_page` |
| | | `new_page` |
| | | `list_frames` |
| | | `select_frame` |
| 页面观察与脚本定位 | 先回答“页面里有哪些脚本、目标代码大概在哪” | `list_scripts` |
| | | `get_script_source` |
| | | `find_in_script` |
| | | `search_in_scripts` |
| Hook 与运行时采样 | 先做最小侵入式观测，确认运行时到底调用了什么 | `create_hook` |
| | | `inject_hook` |
| | | `get_hook_data` |
| | | `hook_function` |
| | | `trace_function` |
| | | `unhook_function` |
| | | `list_hooks` |
| | | `remove_hook` |
| | | `monitor_events` |
| | | `stop_monitor` |
| 断点与调试控制 | 当 hook 不够时，再进入暂停式调试 | `set_breakpoint` |
| | | `set_breakpoint_on_text` |
| | | `remove_breakpoint` |
| | | `list_breakpoints` |
| | | `resume` |
| | | `pause` |
| | | `step_over` / `step_into` / `step_out` |
| | | `get_paused_info` |
| | | `evaluate_on_callframe` |
| | | `remove_xhr_breakpoint` |
| 请求链路与网络分析 | 定位目标请求，确认是谁发起、带了什么参数 | `list_network_requests` |
| | | `get_network_request` |
| | | `get_request_initiator` |
| | | `break_on_xhr` |
| 页面状态与运行前检查 | 补看页面运行状态、控制台输出和本地状态依赖 | `check_browser_health` |
| | | `list_console_messages` |
| | | `get_console_message` |
| | | `get_storage` |
| | | `evaluate_script` |
| | | `evaluate_script_to_file` |
| | | `search_in_sources` |
| | | `inspect_object` |
| | | `get_performance_metrics` |
| WebSocket 观察与消息分组 | 处理长连接、直播流或二进制帧时，用这组工具先分流再细看 | `list_websocket_connections` |
| | | `analyze_websocket_messages` |
| | | `get_websocket_messages` |
| | | `get_websocket_message` |
| 本地复现与补环境 | 把页面证据带回本地，逐步补齐 Node 运行环境 | `export_rebuild_bundle` |
| | | `diff_env_requirements` |
| | | `record_reverse_evidence` |
| 页面自动化 | 做最小必要的页面操作，复现触发条件并辅助取证 | `navigate_page` |
| | | `query_dom` |
| | | `get_dom_structure` |
| | | `find_clickable_elements` |
| | | `click_element` |
| | | `type_text` |
| | | `wait_for_element` |
| | | `take_screenshot` |
| 注入与隐身 | 预注入脚本、stealth 特性与 UA 伪装 | `inject_preload_script` |
| | | `inject_stealth` |
| | | `list_stealth_features` |
| | | `list_stealth_presets` |
| | | `set_user_agent` |
| 深度分析 | 在拿到代码和运行时证据后，继续做结构理解与去混淆 | `collect_code` |
| | | `collection_diff` |
| | | `summarize_code` |
| | | `understand_code` |
| | | `deobfuscate_code` |
| | | `risk_panel` |
| 会话与登录态复用 | 保存并复用浏览器会话与登录态 | `save_session_state` |
| | | `restore_session_state` |
| | | `dump_session_state` |
| | | `load_session_state` |
| | | `list_session_states` |
| | | `delete_session_state` |
| | | `export_session_report` |
| Wasm 与 JSON 插件 | 覆盖采集、结构分析、导出使用情况、JS→Wasm 边界链路和 WAT 反汇编；Hook 体系内置 `json` 插件，同时 Hook `JSON.stringify` / `JSON.parse` | `collect_wasm` |
| | | `list_wasm_modules` |
| | | `analyze_wasm_module` |
| | | `inspect_wasm_exports` |
| | | `summarize_wasm_boundary` |
| | | `analyze_wasm_signature_diff` |
| | | `decompile_wasm_module` |

> 注：强依赖外部 AI 的只有 `understand_code`；`detect_crypto`、`analyze_target`、`risk_panel`、`deobfuscate_code` 属于可选增强。外部 LLM 当前支持 `openai` / `anthropic` / `gemini`，配置通过进程环境变量完成，MCP 客户端里在 server 配置的 `env` 中传入（如 `DEFAULT_LLM_PROVIDER` + 对应 `*_API_KEY`）。不配置也能使用浏览器接管、Hook / 断点 / Network / WebSocket、`collect_code`、`export_rebuild_bundle` 等核心能力。完整 provider 列表、`.env` 写法与逐功能依赖说明见 [docs/guides/ai-configuration.md](docs/guides/ai-configuration.md)。

完整参数说明见 [docs/reference/tool-reference.md](docs/reference/tool-reference.md)。
按逆向流程选工具可继续看 [docs/reference/reverse-workflow.md](docs/reference/reverse-workflow.md)。
Wasm 与 JSON 插件的完整参数与实现细节见 [docs/reference/wasm-and-json-plugins.md](docs/reference/wasm-and-json-plugins.md)。

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

### Fork 来源

本仓库 fork 自 [lwjjike/JSReverser-Strong-MCP](https://github.com/lwjjike/JSReverser-Strong-MCP)，并在其基础上做二次开发。上游代码的版权与协议归属以其仓库为准。

### 其他参考项目

本项目在设计和实现过程中还参考了以下项目，具体协议声明（如 MIT 等）以对应上游仓库为准：

- https://github.com/wuji66dde/jshook-skill
- https://github.com/zhizhuodemao/js-reverse-mcp

## License

Apache-2.0

本仓库沿用 Apache-2.0 协议，完整协议文本见根目录 `LICENSE`。由于本仓库 fork 自 [lwjjike/JSReverser-Strong-MCP](https://github.com/lwjjike/JSReverser-Strong-MCP)，上游代码的版权声明与协议条款以其仓库为准，二次开发部分同样以 Apache-2.0 发布。
