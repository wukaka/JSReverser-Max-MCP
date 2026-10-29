# 自动化入口剧本

默认按三段式执行：

1. 页面观察
2. 运行时采样
3. 本地补环境

标准入口：

0. 不确定起点：`reverse_guide(goal=...)` 先拿路线（只给路线，不下结论）
0.5 建立任务上下文：`rec_task_context(action=set, taskId, taskSlug, targetUrl, goal)`，之后重放/消融/签名分析/溯源会自动记账
1. `sys_check_browser_health`
2. `nav_page(action=new)` 或 `nav_page(action=select)`
3. `run_analyze_target`
4. `loc_search_in_sources`
5. `obs_list_network_requests` + `loc_get_request_initiator`
5.0 需要定位签名函数：`loc_trace_request_to_signer(reqid)`
5.1 需要确认某个头是否必需：`run_header_ablation(reqid)`；单次验证用 `run_replay_request`
6. 如果目标涉及首屏初始化、首个请求前参数生成、页面首次执行逻辑：先 `ins_inject_preload_script`
7. `rec_record_reverse_evidence`
8. `ins_hook(action=create)` + `ins_hook(action=inject)`
9. 触发动作
10. `obs_get_hook_data(summary)`
10.1 需要判断签名字段：`ins_signer(action=register, expr=...)` → `ver_analyze_signer(payload=...)`
11. 命中后 `obs_get_hook_data(raw)` + `rec_record_reverse_evidence`
12. `rec_export_rebuild_bundle`
13. 本地补环境复现

重试上限：2 次。

只有在 Hook 无法解释关键上下文时才进入断点路径。
如果问题出在首屏初始化，就优先走 preload 采样，不要等页面脚本跑完后再补 hook。
