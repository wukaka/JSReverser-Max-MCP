---
name: mcp-js-reverse-playbook
description: 在使用 MCP 做前端 JavaScript 逆向时使用，适用于签名链路定位、页面观察取证、本地补环境复现、VMP 类插桩分析、AST 去混淆与证据化输出。
---

# MCP 前端 JS 逆向作业规范

## 核心原则

- `Observe-first`
- `Hook-preferred`
- `Breakpoint-last`
- `Rebuild-oriented`
- `Isolate-before-rebuild`
- `High-signal experiments`
- `Evidence-first`

先页面观察，再最小化采样，再做本地补环境，不要跳过取证直接猜环境。

## 目标场景

默认主场景是：

1. 定位接口签名、加密参数、关键请求字段
2. 在页面里确认哪个请求、哪个脚本、哪个函数参与参数生成
3. 导出本地复现材料
4. 在 Node 里按“代理 env log + first divergence + 最小因果单元”补环境跑通
5. 跑通后再做 AST 去混淆、VMP 插桩或逻辑提纯

## 六阶段工作流

### 1. Observe

目标：

- 先确认目标请求、相关脚本、候选函数，不猜环境。

默认入口：

- `references/automation-entry.md`
- `references/mcp-task-template.md`

必须产出：

- 目标请求
- initiator 线索
- 可疑脚本 URL / scriptId
- 初始 task artifact

### 2. Capture

目标：

- 对目标请求做最小侵入采样，拿到参数样例、调用顺序、运行时证据。

规则：

- 优先 fetch/xhr hook
- 如果目标发生在首屏初始化、首个请求前参数装配、页面首次执行阶段，先用 `inject_preload_script` 挂早期采样或补环境脚本
- 命中后先看 summary，再按需看 raw
- Hook 不足时再考虑断点

### 3. Isolate

目标：

- 在本地重建之前，先确定目标系统实际检查哪一层、哪些字段。

分工：

- Capture 负责取证；Isolate 负责判定服务端检查什么。

必须产出：

- 接受基线：先做重放检查；重放通过则作为正控制；重放被拒且判定为重放检测时，改为建立多次成功通过的参数样本库（跨时间/会话，含完整提交条件）
- 错误码/响应语义表（code、原文、触发条件、所暗示的层，重放拒绝单列一类）
- 至少一次客户端内篡改或消融实验，证明哪些参数参与判定

退出条件：

- 能明确说出当前失败属于传输 / 客户端上下文 / 内容 / 时间 / 会话状态中的哪一层
- 本地重建只针对该层，不跨层同时补

规则：

- 未完成 Isolate，不进入 Rebuild
- 实验须可证伪、单变量，先写预测再执行
- 结论写入账本；被推翻的结论保留撤回记录，不覆盖

### 4. Rebuild

目标：

- 把页面证据导出为本地可迭代的 Node 复现工程。

参考：

- `references/local-rebuild.md`
- `references/task-artifacts.md`

规则：

- 本地补环境必须以页面观测证据为依据
- 不允许空想式补 `window/document/navigator/crypto/storage`

### 5. Patch

目标：

- 按代理日志和 `first divergence` 驱动补环境，直到本地脚本能稳定跑出目标参数。

规则：

- 先读代理 env log，再记录当前 `first divergence`
- 一次只做一个补丁决策，不是机械地一次只改一个属性
- 一个补丁决策对应一个最小因果单元：值 / 函数壳 / 返回对象 / 最小对象契约
- `diff_env_requirements` 仅作辅助，不替代代理日志
- 每次补丁后立即复测，并记录 `first divergence` 是否前移
- 每次补丁都写入 task artifact

### 6. DeepDive

目标：

- 本地跑通后，再做去混淆、VMP、控制流还原、业务逻辑提纯。

规则：

- 如果当前任务只是出签名，这一阶段可以降级
- 如果要长期复用算法链路，这一阶段必须做

## 执行要求

- 所有重要步骤都要写入本地 task artifact
- 如果无法解释为什么调用某个工具，就不要调用
- 输出必须满足 `references/output-contract.md`
- 失败时按照 `references/fallbacks.md` 回退
- 参数默认值按 `references/tool-defaults.md`
- `skills/references/cases/*` 只允许抽象 case（映射/判定口径）
- 站点级可复用流程统一维护在 `scripts/cases/*`，不要把实操工作流写回 `skills/references/cases/*`
- 新增正式文档时遵循仓库分层：规则/模板放 `docs/reference/`，人类教程放 `docs/guides/`，公开参数索引更新 `scripts/cases/README.md`

## 必读引用

- 自动化入口：`references/automation-entry.md`
- 参数默认值：`references/tool-defaults.md`
- 任务输入模板：`references/task-input-template.md`
- MCP 专用任务编排：`references/mcp-task-template.md`
- 任务产物：`references/task-artifacts.md`
- 本地复现：`references/local-rebuild.md`
- 补环境：`references/env-patching.md`、`references/node-env-rebuild.md`
- 插桩：`references/instrumentation.md`
- 服务端隔离：`references/server-side-isolation.md`
- 输出变换探测：`references/output-transform-instrumentation.md`
- AST 去混淆：`references/ast-deobfuscation.md`
- 回退：`references/fallbacks.md`
- 输出契约：`references/output-contract.md`
- 案例库：`references/cases/`

## 配套模板

- 更新提示词：`docs/reference/reverse-update-prompt-template.md`
- 报告模板：`docs/reference/reverse-report-template.md`
- 算法升级 / first divergence：`docs/reference/algorithm-upgrade-template.md`
