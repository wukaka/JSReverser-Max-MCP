# 外部 AI 配置

这个项目支持把外部 LLM 作为“分析增强层”接进来，当前支持：

- `openai`
- `anthropic`
- `gemini`

配置入口本质上是进程环境变量。
通过 MCP 客户端启动时，优先在 MCP server 配置里的 `env` 传入；`.env` 只适合你直接本地运行 `node build/src/index.js` 或 `npm run start` 的场景。

推荐方式示例：

```toml
[mcp_servers.js-reverse]
command = "node"
args = ["/ABSOLUTE/PATH/JSReverser-MCP/build/src/index.js"]

[mcp_servers.js-reverse.env]
DEFAULT_LLM_PROVIDER = "anthropic"
ANTHROPIC_API_KEY = "your_key"
ANTHROPIC_MODEL = "claude-3-5-sonnet-20241022"
```

如果你是直接在项目目录本地启动，也可以使用 `.env`：

```bash
# 三选一：openai / anthropic / gemini
DEFAULT_LLM_PROVIDER=gemini

# OpenAI
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o
OPENAI_BASE_URL=

# Anthropic / Claude
ANTHROPIC_API_KEY=your_key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_BASE_URL=

# Gemini
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.0-flash-exp

# 如果不用 API，也可以走本地 CLI
GEMINI_CLI_PATH=gemini-cli
```

说明：

- `DEFAULT_LLM_PROVIDER` 决定默认走哪个 provider
- `gemini` 支持两种模式：有 `GEMINI_API_KEY` 时走 API；没有时会尝试走 `GEMINI_CLI_PATH`
- `openai` 和 `anthropic` 需要对应 API key
- 如果你配了多个 provider，实际使用哪个，仍由 `DEFAULT_LLM_PROVIDER` 决定

## 哪些功能依赖外部 AI

强依赖外部 AI 的功能：

- `understand_code`
  - 内部会调用 LLM 做代码语义理解、业务逻辑提取、安全风险补充

可选启用外部 AI 的功能：

- `detect_crypto`
  - 只有传 `useAI=true` 时才会额外调用 LLM；不传时主要依赖本地规则和 AST 分析
- `analyze_target`
  - 传 `useAI=true` 时会在一站式分析里启用更深的 AI 辅助分析
- `risk_panel`
  - 参数里有 `useAI`，但当前实现主体仍以本地分析结果聚合为主

有 AI 时效果更好，但不配也能运行的功能：

- `deobfuscate_code`
  - 本地规则、AST 优化、专项反混淆管线始终可用；配置外部 AI 后，复杂语义清理、VM 结构理解、部分编码型混淆降级分析会更完整

完全不依赖外部 AI 的功能：

- 浏览器接管
- Hook / 断点 / Console / Storage / Network / WebSocket
- `collect_code`
- `export_rebuild_bundle`
- `diff_env_requirements`
- `record_reverse_evidence`

如果没配外部 AI，典型影响是：

- `understand_code` 会直接报 provider 未配置
- `detect_crypto(useAI=true)` 会退回本地分析或忽略 AI 增强
- `deobfuscate_code` 仍可跑，但某些高难度混淆的解释和清理质量会下降
