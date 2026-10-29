# 客户端配置指南

这份指南按客户端分别给出可直接复制的 MCP 配置示例。

约定：

- 路径统一写成 `/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js`
- 如果你要复用已经打开的浏览器，默认 remote debugging 地址使用 `http://127.0.0.1:9222`
- 外部 AI 配置统一通过 MCP server 的 `env` 传入

## 最常用完整模板

如果你只是想先快速跑起来，推荐直接使用“接管已打开浏览器 + Gemini API”这一份：

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

适合场景：

- 需要复用本机已登录浏览器
- 希望 `loc_understand_code` 这类 AI 增强功能开箱即用
- 使用支持 `mcpServers` JSON 配置格式的客户端

如果你用的是 Codex `config.toml`，直接看下方 “Codex” 小节的完整模板。

## 完整可直接使用示例

### 适用于 `mcpServers` JSON 结构的客户端

这类客户端通常使用如下 JSON 结构配置 MCP server。  
如果你的 Claude / Gemini / Cursor 客户端使用的是 `mcpServers` 配置格式，可以直接参考下面模板。

#### 最小可用

```json
{
  "mcpServers": {
    "jsreverser-max-mcp": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js"
      ]
    }
  }
}
```

#### 接管已打开浏览器

```json
{
  "mcpServers": {
    "jsreverser-max-mcp": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js",
        "--browserUrl",
        "http://127.0.0.1:9222"
      ]
    }
  }
}
```

#### 使用 Gemini API

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

#### 使用 Claude API

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
        "DEFAULT_LLM_PROVIDER": "anthropic",
        "ANTHROPIC_API_KEY": "your_key",
        "ANTHROPIC_MODEL": "claude-3-5-sonnet-20241022"
      }
    }
  }
}
```

#### 使用 OpenAI API

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
        "DEFAULT_LLM_PROVIDER": "openai",
        "OPENAI_API_KEY": "your_key",
        "OPENAI_MODEL": "gpt-4o"
      }
    }
  }
}
```

#### 使用 Gemini CLI

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
        "GEMINI_CLI_PATH": "gemini-cli"
      }
    }
  }
}
```

## Claude Code

### 最简单配置

```bash
claude mcp add jsreverser-max-mcp node /ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js
```

### 推荐配置思路

如果你使用的是支持 `mcpServers` JSON 配置的 Claude 客户端，优先直接使用上面的 JSON 模板。  
如果你使用的是 `claude mcp add` 命令行方式，先把 server 加进去，再在对应客户端配置里补 `env`。

### AI 配置示例

Claude API：

```toml
[mcp_servers.jsreverser-max-mcp]
command = "node"
args = ["/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js"]

[mcp_servers.jsreverser-max-mcp.env]
DEFAULT_LLM_PROVIDER = "anthropic"
ANTHROPIC_API_KEY = "your_key"
ANTHROPIC_MODEL = "claude-3-5-sonnet-20241022"
```

Gemini API：

```toml
[mcp_servers.jsreverser-max-mcp]
command = "node"
args = ["/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js"]

[mcp_servers.jsreverser-max-mcp.env]
DEFAULT_LLM_PROVIDER = "gemini"
GEMINI_API_KEY = "your_key"
GEMINI_MODEL = "gemini-2.0-flash-exp"
```

OpenAI API：

```toml
[mcp_servers.jsreverser-max-mcp]
command = "node"
args = ["/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js"]

[mcp_servers.jsreverser-max-mcp.env]
DEFAULT_LLM_PROVIDER = "openai"
OPENAI_API_KEY = "your_key"
OPENAI_MODEL = "gpt-4o"
```

### 接管已打开的 Chrome

```bash
claude mcp add jsreverser-max-mcp node /ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js -- --browserUrl http://127.0.0.1:9222
```

如果你本地已经固定开着远程调试端口，也可以改用：

```bash
claude mcp add jsreverser-max-mcp node /ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js -- --autoConnect
```

## Cursor

`Settings -> MCP -> New MCP Server`

### 最简单配置

- Command: `node`
- Args: `[/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js]`

### 完整 JSON 示例

如果你的 Cursor 版本支持 JSON 形式的 MCP 配置，可直接参考：

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

### 接管已打开的 Chrome

- Command: `node`
- Args:

```json
[
  "/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js",
  "--browserUrl",
  "http://127.0.0.1:9222"
]
```

### 配置外部 AI 环境变量

如果客户端界面支持为 MCP server 配置环境变量，传入这些键即可：

- `DEFAULT_LLM_PROVIDER`
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY`
- `OPENAI_MODEL` / `ANTHROPIC_MODEL` / `GEMINI_MODEL`
- `GEMINI_CLI_PATH`

推荐思路：

- Claude：设置 `DEFAULT_LLM_PROVIDER=anthropic` 和 `ANTHROPIC_API_KEY`
- Gemini：设置 `DEFAULT_LLM_PROVIDER=gemini` 和 `GEMINI_API_KEY`
- OpenAI：设置 `DEFAULT_LLM_PROVIDER=openai` 和 `OPENAI_API_KEY`

完整示例：

- Claude API

```json
{
  "DEFAULT_LLM_PROVIDER": "anthropic",
  "ANTHROPIC_API_KEY": "your_key",
  "ANTHROPIC_MODEL": "claude-3-5-sonnet-20241022"
}
```

- Gemini API

```json
{
  "DEFAULT_LLM_PROVIDER": "gemini",
  "GEMINI_API_KEY": "your_key",
  "GEMINI_MODEL": "gemini-2.0-flash-exp"
}
```

- OpenAI API

```json
{
  "DEFAULT_LLM_PROVIDER": "openai",
  "OPENAI_API_KEY": "your_key",
  "OPENAI_MODEL": "gpt-4o"
}
```

## Codex

Codex 使用 `config.toml`。

### 最简单配置

```toml
[mcp_servers.jsreverser-max-mcp]
command = "node"
args = ["/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js"]
```

### 接管已打开的 Chrome

```toml
[mcp_servers.jsreverser-max-mcp]
command = "node"
args = [
  "/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js",
  "--browserUrl",
  "http://127.0.0.1:9222"
]
```

### 自动接管本机浏览器

```toml
[mcp_servers.jsreverser-max-mcp]
command = "node"
args = [
  "/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js",
  "--autoConnect"
]
```

### 配置外部 AI 环境变量

Gemini API：

```toml
[mcp_servers.jsreverser-max-mcp]
command = "node"
args = ["/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js"]

[mcp_servers.jsreverser-max-mcp.env]
DEFAULT_LLM_PROVIDER = "gemini"
GEMINI_API_KEY = "your_key"
GEMINI_MODEL = "gemini-2.0-flash-exp"
```

Claude API：

```toml
[mcp_servers.jsreverser-max-mcp]
command = "node"
args = [
  "/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js",
  "--browserUrl",
  "http://127.0.0.1:9222"
]

[mcp_servers.jsreverser-max-mcp.env]
DEFAULT_LLM_PROVIDER = "anthropic"
ANTHROPIC_API_KEY = "your_key"
ANTHROPIC_MODEL = "claude-3-5-sonnet-20241022"
```

OpenAI API：

```toml
[mcp_servers.jsreverser-max-mcp]
command = "node"
args = [
  "/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js",
  "--browserUrl",
  "http://127.0.0.1:9222"
]

[mcp_servers.jsreverser-max-mcp.env]
DEFAULT_LLM_PROVIDER = "openai"
OPENAI_API_KEY = "your_key"
OPENAI_MODEL = "gpt-4o"
```

Gemini CLI：

```toml
[mcp_servers.jsreverser-max-mcp]
command = "node"
args = [
  "/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js",
  "--browserUrl",
  "http://127.0.0.1:9222"
]

[mcp_servers.jsreverser-max-mcp.env]
DEFAULT_LLM_PROVIDER = "gemini"
GEMINI_CLI_PATH = "gemini-cli"
```

如果你只想从一个 provider 切换到另一个，通常只需要替换：

- `DEFAULT_LLM_PROVIDER = "anthropic"` 并设置 `ANTHROPIC_API_KEY`
- `DEFAULT_LLM_PROVIDER = "openai"` 并设置 `OPENAI_API_KEY`
- `DEFAULT_LLM_PROVIDER = "gemini"` 并设置 `GEMINI_API_KEY` 或 `GEMINI_CLI_PATH`

## 配置完成后的验证

无论你用哪个客户端，建议都做一次最小验证：

1. 打开一个已知页面
2. 调用 `nav_list_pages`
3. 调用 `obs_list_scripts`
4. 调用 `obs_list_network_requests`

如果三者都能返回你当前页面对应的信息，说明配置已经基本正确。

如果你还配置了外部 AI，可以再补一条验证：

5. 调用 `loc_understand_code` 分析一小段代码

如果返回 provider 未配置错误，通常说明 MCP server 的 `env` 没有传进去，而不是工具本身有问题。
