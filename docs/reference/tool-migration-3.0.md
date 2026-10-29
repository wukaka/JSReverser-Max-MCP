# 3.0 工具迁移表

3.0.0 对全部工具做了破坏性重命名，不保留旧名别名。
新命名规则：`<簇>_<原工具名>`；Wasm 专用链去掉重复的 `wasm` 段。

## 合并说明

以下工具由多个旧工具合并而成，具体行为通过 `action` 参数选择：

| v3 工具 | 合并了 | action |
|---|---|---|
| `loc_analyze_code` | deobfuscate_code / understand_code / summarize_code / detect_crypto / risk_panel | deobfuscate / understand / summarize / crypto / risk |
| `ins_hook` | create_hook / inject_hook / list_hooks / remove_hook / hook_function / unhook_function | create / inject / list / remove / function |
| `rec_session_state` | save / restore / list / delete / dump / load_session_state | 同名 action |
| `ins_stealth` | inject_stealth / list_stealth_presets / list_stealth_features / set_user_agent | inject / presets / features / set_user_agent |
| `ins_xhr_breakpoint` | break_on_xhr / remove_xhr_breakpoint | set / remove |
| `obs_monitor_events` | monitor_events / stop_monitor | start / stop |
| `ins_breakpoint` | set_breakpoint / set_breakpoint_on_text / remove_breakpoint / list_breakpoints | set / set_text / remove / list |
| `ins_debug_control` | pause / resume / step_over / step_into / step_out | 同名 action |
| `nav_page` | list_pages / select_page / new_page | list / select / new |
| `nav_frame` | list_frames / select_frame | list / select |

已移除的工具：`find_clickable_elements`（被 `obs_query_dom` 替代，可点击元素选择器配方见 `skills/mcp-js-reverse-playbook/references/tool-defaults.md`）。

| 旧名 | 新名 |
|---|---|
| `analyze_target` | `run_analyze_target` |
| `analyze_wasm_module` | `wasm_analyze_module` |
| `analyze_wasm_signature_diff` | `wasm_signature_diff` |
| `analyze_websocket_messages` | `obs_analyze_websocket_messages` |
| `break_on_xhr` | `ins_xhr_breakpoint` |
| `check_browser_health` | `sys_check_browser_health` |
| `click_element` | `nav_click_element` |
| `collect_code` | `obs_collect_code` |
| `collect_wasm` | `wasm_collect` |
| `collection_diff` | `ver_collection_diff` |
| `create_hook` | `ins_hook` |
| `decompile_wasm_module` | `wasm_decompile` |
| `delete_session_state` | `rec_session_state` |
| `deobfuscate_code` | `loc_analyze_code` |
| `detect_crypto` | `loc_analyze_code` |
| `diff_env_requirements` | `ver_diff_env_requirements` |
| `dump_session_state` | `rec_session_state` |
| `evaluate_on_callframe` | `ins_evaluate_on_callframe` |
| `evaluate_script` | `ins_evaluate_script` |
| `evaluate_script_to_file` | `ins_evaluate_script_to_file` |
| `export_rebuild_bundle` | `rec_export_rebuild_bundle` |
| `export_session_report` | `rec_export_session_report` |
| `find_in_script` | `loc_find_in_script` |
| `get_console_message` | `obs_get_console_message` |
| `get_dom_structure` | `obs_get_dom_structure` |
| `get_hook_data` | `obs_get_hook_data` |
| `get_network_request` | `obs_get_network_request` |
| `get_paused_info` | `ins_get_paused_info` |
| `get_performance_metrics` | `obs_get_performance_metrics` |
| `get_request_initiator` | `loc_get_request_initiator` |
| `get_script_source` | `loc_get_script_source` |
| `get_storage` | `obs_get_storage` |
| `get_websocket_message` | `obs_get_websocket_message` |
| `get_websocket_messages` | `obs_get_websocket_messages` |
| `hook_function` | `ins_hook` |
| `inject_hook` | `ins_hook` |
| `inject_preload_script` | `ins_inject_preload_script` |
| `inject_stealth` | `ins_stealth` |
| `inspect_object` | `obs_inspect_object` |
| `inspect_wasm_exports` | `wasm_inspect_exports` |
| `list_breakpoints` | `ins_breakpoint(action=list)` |
| `list_console_messages` | `obs_list_console_messages` |
| `list_frames` | `nav_frame(action=list)` |
| `list_hooks` | `ins_hook` |
| `list_network_requests` | `obs_list_network_requests` |
| `list_pages` | `nav_page(action=list)` |
| `list_scripts` | `obs_list_scripts` |
| `list_session_states` | `rec_session_state` |
| `list_stealth_features` | `ins_stealth` |
| `list_stealth_presets` | `ins_stealth` |
| `list_wasm_modules` | `wasm_list_modules` |
| `list_websocket_connections` | `obs_list_websocket_connections` |
| `load_session_state` | `rec_session_state` |
| `monitor_events` | `obs_monitor_events` |
| `navigate_page` | `nav_navigate_page` |
| `new_page` | `nav_page(action=new)` |
| `pause` | `ins_debug_control(action=pause)` |
| `query_dom` | `obs_query_dom` |
| `record_reverse_evidence` | `rec_record_reverse_evidence` |
| `remove_breakpoint` | `ins_breakpoint(action=remove)` |
| `remove_hook` | `ins_hook` |
| `remove_xhr_breakpoint` | `ins_xhr_breakpoint` |
| `restore_session_state` | `rec_session_state` |
| `resume` | `ins_debug_control(action=resume)` |
| `risk_panel` | `loc_analyze_code` |
| `save_session_state` | `rec_session_state` |
| `search_in_scripts` | `obs_list_collected_scripts` |
| `search_in_sources` | `loc_search_in_sources` |
| `select_frame` | `nav_frame(action=select)` |
| `select_page` | `nav_page(action=select)` |
| `set_breakpoint` | `ins_breakpoint(action=set)` |
| `set_breakpoint_on_text` | `ins_breakpoint(action=set_text)` |
| `set_user_agent` | `ins_stealth` |
| `step_into` | `ins_debug_control(action=step_into)` |
| `step_out` | `ins_debug_control(action=step_out)` |
| `step_over` | `ins_debug_control(action=step_over)` |
| `stop_monitor` | `obs_monitor_events` |
| `summarize_code` | `loc_analyze_code` |
| `summarize_wasm_boundary` | `wasm_summarize_boundary` |
| `take_screenshot` | `obs_take_screenshot` |
| `trace_function` | `loc_trace_function` |
| `type_text` | `nav_type_text` |
| `understand_code` | `loc_analyze_code` |
| `unhook_function` | `ins_hook` |
| `wait_for_element` | `nav_wait_for_element` |

## 新增工具（无旧名）

- `run_replay_request`
- `run_header_ablation`
- `ver_diff_network_requests`
- `run_export_request`
- `reverse_guide`
- `rec_task_context`
- `rec_export_reverse_summary`
- `loc_trace_request_to_signer`
- `ins_signer`
- `ver_analyze_signer`
