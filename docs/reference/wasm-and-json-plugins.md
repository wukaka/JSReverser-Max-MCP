# Wasm 与 JSON Hook 插件

## Wasm 工具链

项目内置了一套面向 WebAssembly 逆向的工具链。

### `wasm_collect`

用途：从目标页面采集 Wasm 模块及运行时事件，并在需要时写入 reverse task artifacts。

主要参数：

- `url`: 目标页面 URL
- `timeout?`: 页面采集超时
- `waitAfterLoadMs?`: 页面加载后额外等待时间
- `includeRuntimeEvents?`: 是否返回运行时事件
- `includeImports?`: 是否在结果中展开 imports
- `includeExports?`: 是否在结果中展开 exports
- `maxModules?`: 最多保留的模块数
- `captureBase64?`: 是否在采样阶段保留 base64 载荷

### `wasm_list_modules`

用途：列出当前会话已经捕获到的 Wasm 模块。

主要参数：

- `includeImports?`
- `includeExports?`

### `wasm_analyze_module`

用途：对单个 Wasm 模块做静态结构分析。

输入三选一：

- `moduleId`
- `base64`
- `artifactPath`

可选分析参数：

- `includeFunctionSignatures?`
- `includeRawSectionMap?`
- `includeStringScan?`
- `maskSensitiveStrings?`
- `maxStringSlots?`
- `maxSummaryLines?`

### `wasm_inspect_exports`

用途：结合运行时事件总结导出函数的使用情况，并给出高价值入口点候选。

主要参数：

- `moduleId`

### `wasm_summarize_boundary`

用途：构建 `JS -> memory bridge -> Wasm export -> sink` 的候选链路，帮助定位 Wasm 参与签名、编码、压缩、加密的边界位置。

主要参数：

- `moduleId`
- `maxChains?`

### `wasm_signature_diff`

用途：对比多个边界链路中的输入变化，识别更像签名材料的 header/query/body 字段。

主要参数：

- `moduleId`
- `exportName?`
- `maxChains?`

### `wasm_decompile`

用途：使用 `wabt/wasm2wat` 将 Wasm 反汇编为 WAT，并输出函数级行为摘要。

输入三选一：

- `moduleId`
- `base64`
- `artifactPath`

可选参数：

- `maxWatChars?`
- `foldExprs?`
- `inlineExport?`

## JSON Hook 插件

项目的 Hook 插件体系里已经加入了 `json` 类型插件，用来直接观察页面里的 `JSON.stringify` 和 `JSON.parse` 调用。这类点位通常正好位于“参数对象 -> 字符串请求体”和“响应文本 -> 对象”之间，适合拿来确认签名前后的结构变化、定位序列化入口、观察是否有额外字段注入。

当前实现特点：

- 同时 Hook `JSON.stringify` 和 `JSON.parse`
- 自动记录 `operation`、`callCount`、`timestamp`
- `JSON.stringify` 会记录 `valueType`、`valuePreview`、`hasReplacer`、`replacerType`、`spaceType`、`serializedLength`、`resultPreview`
- `JSON.parse` 会记录 `textPreview`、`textLength`、`hasReviver`、`reviverType`、`resultType`、`resultPreview`
- 如果开启栈采集，还会附带 `stack`
- 当前实现里，`action: "block"` 会直接阻断调用；未阻断时会保持原始逻辑执行并记录结果
