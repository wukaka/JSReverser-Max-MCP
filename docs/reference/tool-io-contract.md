# 全工具读写契约表

更新时间：2026-10-29

## 统一数据平面（Single Source of Truth）

1. Hook 采集数据：`window.__hookStore[hookId]`（页面侧唯一键）
2. Hook 安装元信息：`window.__mcp_hooks__`（仅用于 list/unhook，不存采集数据）
3. 事件监控元信息：`window.__mcp_monitors__`（monitor/stop 管理）
4. 服务器侧 Hook 汇总：`runtime.hookManager`（由 `obs_get_hook_data` 从 `__hookStore` 同步）
5. 采集缓存：`runtime.collector` + `UnifiedCacheManager`（代码/摘要/统计缓存）
6. 任务工件：`artifacts/tasks/<taskId>/...`（证据、env、报告、bundle）

## 契约规则

- 同一类数据只能有一个页面侧主键（例如 Hook 数据只能写 `__hookStore`）。
- 工具读取路径必须对齐写入路径，禁止写 A 读 B。
- 汇总工具（`obs_get_hook_data`/`loc_analyze_code`/`rec_export_session_report`）必须使用 `hookManager.getAllKnownHookIds()` 口径。

## 工具读写契约（全量）

| Tool | Read Sources | Write Sources | Canonical Store |
|---|---|---|---|
| `run_analyze_target` | `runtime.collector` + `runtime.hookManager` + 代码文本 | 分析结果；部分工具写 task artifact | HookManager / Artifacts |
| `loc_analyze_code` | `runtime.collector` + `runtime.hookManager` + 代码文本 | 分析结果；部分工具写 task artifact | HookManager / Artifacts |
| `rec_export_session_report` | `hookManager.getAllKnownHookIds()` + `getRecords()` | Response report | HookManager |
| `rec_record_reverse_evidence` | 请求参数 + 当前上下文 | task artifact 文件 | `artifacts/tasks/*` |
| `obs_collect_code` | `runtime.collector` + 页面脚本/网络 | `runtime.collector` 缓存 | Collector Cache / UnifiedCache |
| `ver_collection_diff` | `runtime.collector` + 页面脚本/网络 | `runtime.collector` 缓存 | Collector Cache / UnifiedCache |
| `obs_list_collected_scripts` | `runtime.collector` + 页面脚本/网络 | `runtime.collector` 缓存 | Collector Cache / UnifiedCache |
| `obs_get_console_message` | Console 缓存 | Response attach only | CDP Console |
| `obs_list_console_messages` | Console 缓存 | Response attach only | CDP Console |
| `ins_xhr_breakpoint` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `ins_evaluate_on_callframe` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `loc_find_in_script` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `ins_get_paused_info` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `loc_get_request_initiator` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `loc_get_script_source` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `obs_get_storage` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `ins_hook` | 页面函数 / `__mcp_hooks__` / HookManager | `__mcp_hooks__` + `__hookStore[hookId]`；create/list/remove 走 HookManager | `__hookStore` / HookManager |
| `obs_inspect_object` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `ins_breakpoint` | DebuggerContext（行断点 / 文本定位） | 断点规则 | DebuggerContext |
| `obs_list_scripts` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `obs_monitor_events` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `ins_debug_control` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `loc_search_in_sources` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `loc_trace_function` | DebuggerContext + Page Runtime | 断点/XHR 规则/页面注入状态 | `__hookStore` / `__mcp_hooks__` / `__mcp_monitors__` |
| `obs_get_dom_structure` | DOM Runtime | Response only | - |
| `obs_query_dom` | DOM Runtime | Response only | - |
| `nav_frame` | Frame 列表 | selected frame | Runtime selectedFrame |
| `obs_get_hook_data` | `__hookStore` -> `hookManager` | `hookManager` 同步数据 | `__hookStore` / HookManager |
| `obs_get_network_request` | Network 面板缓存 | Response attach only | CDP Network |
| `obs_list_network_requests` | Network 面板缓存 | Response attach only | CDP Network |
| `sys_check_browser_health` | PageController + 浏览器会话状态 | SessionState 快照/恢复 | In-memory SessionState |
| `nav_click_element` | PageController + 浏览器会话状态 | SessionState 快照/恢复 | In-memory SessionState |
| `rec_session_state` | SessionState 管理器 | SessionState 管理器 | In-memory SessionState |
| `obs_get_performance_metrics` | PageController + 浏览器会话状态 | SessionState 快照/恢复 | In-memory SessionState |
| `nav_type_text` | PageController + 浏览器会话状态 | SessionState 快照/恢复 | In-memory SessionState |
| `nav_wait_for_element` | PageController + 浏览器会话状态 | SessionState 快照/恢复 | In-memory SessionState |
| `nav_page` | BrowserManager pages | 当前页选择/导航 | BrowserManager currentPage |
| `nav_navigate_page` | BrowserManager pages | 当前页选择/导航 | BrowserManager currentPage |
| `ver_diff_env_requirements` | 运行时失败信息 + 页面能力 + 证据输入（辅助补环境，不替代代理日志） | rebuild bundle/task artifacts | Artifacts |
| `rec_export_rebuild_bundle` | 请求参数 + 当前上下文 | task artifact 文件 | `artifacts/tasks/*` |
| `obs_take_screenshot` | 页面/元素渲染 | 截图文件或响应附件 | filesystem(optional) |
| `ins_evaluate_script` | 当前 frame runtime | 页面注入脚本 | PreloadScript Registry |
| `ins_inject_preload_script` | 当前 frame runtime | 页面注入脚本 | PreloadScript Registry |
| `ins_stealth` | Stealth 配置 | 页面 stealth 注入 / UA | Stealth Runtime |
| `obs_analyze_websocket_messages` | WebSocket 帧缓存 | Response attach only | CDP WebSocket |
| `obs_get_websocket_message` | WebSocket 帧缓存 | Response attach only | CDP WebSocket |
| `obs_get_websocket_messages` | WebSocket 帧缓存 | Response attach only | CDP WebSocket |
| `obs_list_websocket_connections` | WebSocket 帧缓存 | Response attach only | CDP WebSocket |

| `ins_evaluate_script_to_file` | 当前 frame runtime | 本地文件 | filesystem |
| `ins_signer` | 页面 runtime + 内存注册表 | 内存注册表 / `artifacts/signers.json`（persist=true） | Signer Registry |
| `ver_analyze_signer` | 页面 runtime + Signer Registry | Response + `experiments` 日志 | Signer Registry / Artifacts |
| `loc_trace_request_to_signer` | DebuggerContext 调用栈 + 脚本源码 | Response + `experiments` 日志 | Artifacts |
| `run_replay_request` | Network 缓存 + 页面 runtime / Node axios | Response + `experiments` 日志 | Artifacts |
| `run_header_ablation` | Network 缓存 + 页面 runtime | Response + `experiments` 日志 | Artifacts |
| `ver_diff_network_requests` | Network 缓存 | Response only | CDP Network |
| `run_export_request` | Network 缓存 | Response only | CDP Network |
| `reverse_guide` | 内置 playbook | Response only | - |
| `rec_task_context` | 内存任务上下文 | 内存任务上下文 | TaskContext（进程内） |
| `rec_export_reverse_summary` | `artifacts/tasks/<id>/*.jsonl` + `task.json` | 可选 markdown 文件 | Artifacts |
| `wasm_collect` | 网络响应 + 页面 runtime | Wasm 会话缓存 | Wasm Session |
| `wasm_list_modules` | Wasm 会话缓存 | Response only | Wasm Session |
| `wasm_analyze_module` | Wasm 会话缓存 / base64 / artifact | Response only | Wasm Session |
| `wasm_inspect_exports` | Wasm 会话缓存 | Response only | Wasm Session |
| `wasm_summarize_boundary` | Wasm 会话缓存 | Response only | Wasm Session |
| `wasm_signature_diff` | Wasm 会话缓存 | Response only | Wasm Session |
| `wasm_decompile` | Wasm 会话缓存 / artifact | Response only | Wasm Session |
