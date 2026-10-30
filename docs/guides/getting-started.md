# 快速开始

这份指南给第一次接触 `JSReverser-Max-MCP` 的用户使用，目标是在 3 分钟内把服务跑起来。

## 1. 安装依赖并构建

```bash
npm install
npm run build
```

构建完成后入口文件为：

```bash
build/src/index.js
```

## 2. 先启动可接管的 Chrome

本项目不再自动拉起浏览器：未指定连接目标时服务会直接报错退出。

先启动一个带远程调试端口的 Chrome：

```bash
# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-mcp
```

启动服务时显式指定连接目标：

```bash
npm run start -- --browserUrl http://127.0.0.1:9222
```

## 3. 选择浏览器连接方式

常见有三种：

- 方式 A：`--browserUrl` 连接本机调试端口（最常用）
- 方式 B：`--wsEndpoint` 连接已知 WebSocket 地址
- 方式 C：`--autoConnect` 自动探测常见调试端口

如果你需要复用登录态、验证码、人机校验现场，直接用你已经打开的 Chrome 即可，只要它以 `--remote-debugging-port` 启动。

详细步骤请看：

- `docs/guides/browser-connection.md`

## 4. 配置客户端

按你使用的客户端继续看：

- `docs/guides/client-configuration.md`

## 5. 建议的第一条验证命令

连接成功后，优先验证下面几类工具：

- `nav_page(action=list)`
- `obs_list_network_requests`
- `obs_list_scripts`

能正常看到当前页面、请求和脚本，说明基础链路已经通了。

## 6. 关于代码分析

本服务不内置外部 LLM。`loc_analyze_code` 只返回确定性骨架（AST 结构、数据流、加密/弱算法规则检测、代码片段）；`understand` / `summarize` 的语义归纳、`deobfuscate` 解不了的 VMP/JSFuck 还原，由你（主模型）在工具输出的代码基础上直接完成，无需任何 API key。
