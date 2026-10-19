# Task Artifacts

每个逆向任务都应写入一个 task artifact 目录，例如：

`artifacts/tasks/<taskId>/`

推荐最少包含：

- `task.json`
- `timeline.jsonl`
- `network.jsonl`
- `scripts.jsonl`
- `runtime-evidence.jsonl`
- `cookies.json`
- `env/entry.js`
- `env/env.js`
- `env/polyfills.js`
- `env/capture.json`
- `report.md`

这些产物用于：

- 给 Codex / Claude / Gemini 续做同一个任务
- 回看页面观察证据
- 对齐本地补环境状态
- 进入后续 AST 去混淆或 VMP 深挖

## Evidence Ledger

- 追加式编号章节，不覆盖旧结论。
- 每条事实标注：OBSERVED / INFERRED / SPECULATIVE / VERIFIED。
- 每条事实附：日期或轮次、适用链路、复现命令或脚本路径。
- 单独维护“已证伪 / 已撤回”表。
- 静态提取结果（结构、常量表）与运行时验证真值分文件存放。
