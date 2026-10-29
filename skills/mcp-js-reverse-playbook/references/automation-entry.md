# 自动化入口剧本

默认按三段式执行：

1. 页面观察
2. 运行时采样
3. 本地补环境

标准入口：

1. `sys_check_browser_health`
2. `nav_new_page` 或 `nav_select_page`
3. `run_analyze_target`
4. `loc_search_in_scripts`
5. `obs_list_network_requests` + `loc_get_request_initiator`
6. 如果目标涉及首屏初始化、首个请求前参数生成、页面首次执行逻辑：先 `ins_inject_preload_script`
7. `rec_record_reverse_evidence`
8. `ins_create_hook` + `ins_inject_hook`
9. 触发动作
10. `obs_get_hook_data(summary)`
11. 命中后 `obs_get_hook_data(raw)` + `rec_record_reverse_evidence`
12. `rec_export_rebuild_bundle`
13. 本地补环境复现

重试上限：2 次。

只有在 Hook 无法解释关键上下文时才进入断点路径。
如果问题出在首屏初始化，就优先走 preload 采样，不要等页面脚本跑完后再补 hook。
