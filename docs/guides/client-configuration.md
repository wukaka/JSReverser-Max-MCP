# 客户端配置指南

这份指南按客户端分别给出可直接复制的 MCP 配置示例。

约定：

- 路径统一写成 `/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js`
- 如果你要复用已经打开的浏览器，默认 remote debugging 地址使用 `http://127.0.0.1:9222`
- 本服务不内置外部 LLM，不需要任何 API key；浏览器接管、Hook / 断点 / Network / WebSocket、代码采集与去混淆开箱即用

## 最常用完整模板

如果你只是想先快速跑起来，推荐直接使用"接管已打开浏览器"这一份：

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

适合场景：

- 需要复用本机已登录浏览器
- 使用支持 `mcpServers` JSON 配置格式的客户端

如果你用的是 Codex `config.toml`，直接看下方 "Codex" 小节的完整模板。

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

#### 自动探测本机调试端口

```json
{
  "mcpServers": {
    "jsreverser-max-mcp": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js",
        "--autoConnect"
      ]
    }
  }
}
```

## Claude Code

### 最简单配置

```bash
claude mcp add jsreverser-max-mcp node /ABSOLUTE/PATH/JSReverser-Max-MCP/build/src/index.js
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
      ]
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

## 配置完成后的验证

无论你用哪个客户端，建议都做一次最小验证：

1. 打开一个已知页面
2. 调用 `nav_page(action=list)`
3. 调用 `obs_list_scripts`
4. 调用 `obs_list_network_requests`

如果四者都能返回你当前页面对应的信息，说明配置已经基本正确。
