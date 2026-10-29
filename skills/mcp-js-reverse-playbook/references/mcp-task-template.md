# JS Reverse MCP 专用任务模板

按固定阶段执行：

0. 不确定起点：`reverse_guide(goal=...)`

0.5 建立任务上下文：`rec_task_context(action=set, ...)`；结束时用 `rec_export_reverse_summary(taskId)` 导出证据链

1. 页面观察
   - `sys_check_browser_health`
   - `nav_page(action=new)` + 可选 `rec_session_state`
   - `run_analyze_target`
   - `loc_search_in_sources`
   - `obs_list_network_requests` / `loc_get_request_initiator`
   - 设定目标边界：`targetKeywords`、`targetUrlPatterns`、`targetFunctionNames`、`targetActionDescription`

2. 运行时采样
   - 如果目标在首屏初始化或首次请求前生成：先 `ins_inject_preload_script`
   - `ins_hook(action=create, type=fetch/xhr)` + `ins_hook(action=inject)`
   - 触发动作
   - `obs_get_hook_data(summary)`
   - 命中后 `obs_get_hook_data(raw)` + `rec_record_reverse_evidence`
   - 需要验证某头/字段是否必需：`run_header_ablation`；单次试跑用 `run_replay_request`；导出最小请求用 `run_export_request`
   - 先自动找候选：`loc_trace_request_to_signer(reqid)`
   - 需要判断签名输入：`ins_signer(action=register, expr=...)` + `ver_analyze_signer(payload=...)`

3. 本地补环境
   - `rec_export_rebuild_bundle`
   - 本地执行 `env/entry.js`
   - 优先读取代理 env log
   - 记录当前 `first divergence`
   - 按“最小因果单元”做一个补丁决策
   - 必要时再用 `ver_diff_env_requirements` 做辅助比对
   - 复跑并确认 `first divergence` 是否前移

4. 深挖
   - `loc_analyze_code`
   - 必要时插桩 / VMP 分析

核心要求：

- 页面观察先于本地补环境
- 本地补环境先于深度去混淆
- 补环境默认遵循“代理日志 + `first divergence` + 最小因果单元”
- 每一步都要写 task artifact
- 参数名不明显时，优先靠请求、函数、时间窗和动作描述锁定目标
