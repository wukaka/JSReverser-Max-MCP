<!-- AUTO GENERATED DO NOT EDIT - run 'npm run docs' to update-->

# Chrome DevTools MCP Tool Reference

> 快速按逆向目标查工具，请先看：[`docs/reference/reverse-task-index.md`](./reverse-task-index.md)

- **[Navigation automation](#navigation-automation)** (10 tools)
  - [`nav_click_element`](#nav_click_element)
  - [`nav_navigate_page`](#nav_navigate_page)
  - [`nav_page`](#nav_page)
  - [`nav_type_text`](#nav_type_text)
  - [`nav_wait_for_element`](#nav_wait_for_element)
  - [`obs_get_dom_structure`](#obs_get_dom_structure)
  - [`obs_get_performance_metrics`](#obs_get_performance_metrics)
  - [`obs_query_dom`](#obs_query_dom)
  - [`rec_session_state`](#rec_session_state)
  - [`sys_check_browser_health`](#sys_check_browser_health)
- **[Network](#network)** (10 tools)
  - [`obs_analyze_websocket_messages`](#obs_analyze_websocket_messages)
  - [`obs_get_network_request`](#obs_get_network_request)
  - [`obs_get_websocket_message`](#obs_get_websocket_message)
  - [`obs_get_websocket_messages`](#obs_get_websocket_messages)
  - [`obs_list_network_requests`](#obs_list_network_requests)
  - [`obs_list_websocket_connections`](#obs_list_websocket_connections)
  - [`run_export_request`](#run_export_request)
  - [`run_header_ablation`](#run_header_ablation)
  - [`run_replay_request`](#run_replay_request)
  - [`ver_diff_network_requests`](#ver_diff_network_requests)
- **[Debugging](#debugging)** (7 tools)
  - [`ins_evaluate_script`](#ins_evaluate_script)
  - [`ins_evaluate_script_to_file`](#ins_evaluate_script_to_file)
  - [`ins_inject_preload_script`](#ins_inject_preload_script)
  - [`nav_frame`](#nav_frame)
  - [`obs_get_console_message`](#obs_get_console_message)
  - [`obs_list_console_messages`](#obs_list_console_messages)
  - [`obs_take_screenshot`](#obs_take_screenshot)
- **[JS Reverse Engineering](#js-reverse-engineering)** (39 tools)
  - [`ins_breakpoint`](#ins_breakpoint)
  - [`ins_debug_control`](#ins_debug_control)
  - [`ins_evaluate_on_callframe`](#ins_evaluate_on_callframe)
  - [`ins_get_paused_info`](#ins_get_paused_info)
  - [`ins_hook`](#ins_hook)
  - [`ins_signer`](#ins_signer)
  - [`ins_stealth`](#ins_stealth)
  - [`ins_xhr_breakpoint`](#ins_xhr_breakpoint)
  - [`loc_analyze_code`](#loc_analyze_code)
  - [`loc_find_in_script`](#loc_find_in_script)
  - [`loc_get_request_initiator`](#loc_get_request_initiator)
  - [`loc_get_script_source`](#loc_get_script_source)
  - [`loc_search_in_sources`](#loc_search_in_sources)
  - [`loc_trace_function`](#loc_trace_function)
  - [`loc_trace_request_to_signer`](#loc_trace_request_to_signer)
  - [`obs_collect_code`](#obs_collect_code)
  - [`obs_get_hook_data`](#obs_get_hook_data)
  - [`obs_get_storage`](#obs_get_storage)
  - [`obs_inspect_object`](#obs_inspect_object)
  - [`obs_list_collected_scripts`](#obs_list_collected_scripts)
  - [`obs_list_scripts`](#obs_list_scripts)
  - [`obs_monitor_events`](#obs_monitor_events)
  - [`rec_export_rebuild_bundle`](#rec_export_rebuild_bundle)
  - [`rec_export_reverse_summary`](#rec_export_reverse_summary)
  - [`rec_export_session_report`](#rec_export_session_report)
  - [`rec_record_reverse_evidence`](#rec_record_reverse_evidence)
  - [`rec_task_context`](#rec_task_context)
  - [`reverse_guide`](#reverse_guide)
  - [`run_analyze_target`](#run_analyze_target)
  - [`ver_analyze_signer`](#ver_analyze_signer)
  - [`ver_collection_diff`](#ver_collection_diff)
  - [`ver_diff_env_requirements`](#ver_diff_env_requirements)
  - [`wasm_analyze_module`](#wasm_analyze_module)
  - [`wasm_collect`](#wasm_collect)
  - [`wasm_decompile`](#wasm_decompile)
  - [`wasm_inspect_exports`](#wasm_inspect_exports)
  - [`wasm_list_modules`](#wasm_list_modules)
  - [`wasm_signature_diff`](#wasm_signature_diff)
  - [`wasm_summarize_boundary`](#wasm_summarize_boundary)

## Navigation automation

### `nav_click_element`

**Description:** Click an element by selector.

**Parameters:**

- **`selector`** — `string` · required
  - CSS selector of the element to click.

### `nav_navigate_page`

**Description:** Navigates the currently selected page to a URL, or performs back/forward/reload navigation. Waits for DOMContentLoaded event (not full page load). Default timeout is 10 seconds.

**Parameters:**

- **`type`** — `enum` · optional
  - Allowed: `url` | `back` | `forward` | `reload`
  - Navigate the page by URL, back or forward in history, or reload.

- **`url`** — `string` · optional
  - Target URL (only type=url)

- **`ignoreCache`** — `boolean` · optional
  - Whether to ignore cache on reload.

- **`timeout`** — `number` · optional
  - Maximum wait time in milliseconds. If set to 0, the default timeout will be used.

### `nav_page`

**Description:** Manages pages: action=list lists open pages; action=select selects one by index; action=new opens a new page at a URL.

**Parameters:**

- **`action`** — `enum` · required
  - Allowed: `list` | `select` | `new`
  - list: list open pages; select: select a page by pageIdx; new: open a new page at url.

- **`pageIdx`** — `number` · optional
  - For action=select: page index from action=list.

- **`url`** — `string` · optional
  - For action=new: URL to load.

- **`timeout`** — `number` · optional
  - Maximum wait time in milliseconds. If set to 0, the default timeout will be used.

### `nav_type_text`

**Description:** Type text into an input element.

**Parameters:**

- **`selector`** — `string` · required
  - CSS selector of the input element.

- **`text`** — `string` · required
  - Text to type.

- **`delay`** — `number` · optional
  - Delay in milliseconds between keystrokes.

### `nav_wait_for_element`

**Description:** Wait for selector to appear.

**Parameters:**

- **`selector`** — `string` · required
  - CSS selector to wait for.

- **`timeout`** — `number` · optional
  - Maximum wait time in milliseconds.

### `obs_get_dom_structure`

**Description:** Get DOM tree structure for current page.

**Parameters:**

- **`maxDepth`** — `number` · optional
  - Maximum tree depth to traverse (default 3).

- **`includeText`** — `boolean` · optional
  - Include text content of leaf elements.

### `obs_get_performance_metrics`

**Description:** Get page performance metrics from Performance API.

### `obs_query_dom`

**Description:** Query one or multiple elements by CSS selector.

**Parameters:**

- **`selector`** — `string` · required
  - CSS selector to query.

- **`all`** — `boolean` · optional
  - Return all matches instead of the first one.

- **`limit`** — `number` · optional
  - Maximum number of elements when all=true (default 50).

### `rec_session_state`

**Description:** Manage in-memory page session snapshots (cookies/localStorage/sessionStorage). action=save | restore | list | delete | dump | load.

**Parameters:**

- **`action`** — `enum` · required
  - Allowed: `save` | `restore` | `list` | `delete` | `dump` | `load`
  - save: snapshot current cookies/storage; restore: apply a snapshot; list: list snapshots; delete: remove one; dump: export to JSON; load: import from JSON.

- **`sessionId`** — `string` · optional
  - Snapshot id (generated on save when omitted).

- **`includeCookies`** — `boolean` · optional
  - Include cookies in the snapshot (default true).

- **`includeLocalStorage`** — `boolean` · optional
  - Include localStorage (default true).

- **`includeSessionStorage`** — `boolean` · optional
  - Include sessionStorage (default true).

- **`navigateToSavedUrl`** — `boolean` · optional
  - Navigate to the saved URL before restoring (default true).

- **`clearStorageBeforeRestore`** — `boolean` · optional
  - Clear current cookies/storage before restoring.

- **`path`** — `string` · optional
  - File path for dump/load.

- **`pretty`** — `boolean` · optional
  - Pretty-print JSON output.

- **`encrypt`** — `boolean` · optional
  - Encrypt the dumped snapshot.

- **`snapshotJson`** — `string` · optional
  - Inline snapshot JSON for load.

- **`overwrite`** — `boolean` · optional
  - Overwrite an existing snapshot with the same id.

### `sys_check_browser_health`

**Description:** Check browser connectivity and active page readiness before running reverse workflows.

## Network

### `obs_analyze_websocket_messages`

**Description:** Analyzes WebSocket messages and groups them by pattern/fingerprint. Essential for understanding binary/protobuf message types in live streaming scenarios. Returns statistics and sample indices for each message type.

**Parameters:**

- **`wsid`** — `number` · required
  - The wsid of the WebSocket connection to analyze.

- **`direction`** — `enum` · optional
  - Allowed: `sent` | `received`
  - Only analyze messages in this direction.

### `obs_get_network_request`

**Description:** Gets a network request by an optional reqid, if omitted returns the currently selected request in the DevTools Network panel. By default only method, URL, status and headers are returned; set includeBody=true to include bodies. With toFile=true, bodies larger than 10KB are written to files and their paths are returned.

**Parameters:**

- **`reqid`** — `number` · optional
  - The reqid of the network request. If omitted returns the currently selected request in the DevTools Network panel.

- **`includeBody`** — `boolean` · optional
  - Include request and response bodies. Default false to keep the response compact.

- **`toFile`** — `boolean` · optional
  - Write request/response bodies larger than 10KB to artifacts/outputs and return their paths. Smaller bodies are returned inline.

### `obs_get_websocket_message`

**Description:** Gets a single WebSocket message by its frame index. Use obs_get_websocket_messages or obs_analyze_websocket_messages first to find the frame index.

**Parameters:**

- **`wsid`** — `number` · required
  - The wsid of the WebSocket connection.

- **`frameIndex`** — `number` · required
  - The frame index (0-based) to retrieve.

### `obs_get_websocket_messages`

**Description:** Gets messages for a WebSocket connection. IMPORTANT: For binary/protobuf messages (like live streaming), use obs_analyze_websocket_messages FIRST to understand message types, then use groupId parameter to filter specific types. Default mode shows summary only.

**Parameters:**

- **`wsid`** — `number` · required
  - The wsid of the WebSocket connection.

- **`direction`** — `enum` · optional
  - Allowed: `sent` | `received`
  - Filter by direction: "sent" or "received".

- **`groupId`** — `string` · optional
  - Filter by group ID (A, B, C, ...). Get group IDs from obs_analyze_websocket_messages first.

- **`pageSize`** — `number` · optional · default `10`
  - Messages per page. Defaults to 10.

- **`pageIdx`** — `number` · optional
  - Page number (0-based).

- **`show_content`** — `boolean` · optional · default `false`
  - Set to true to show full message payload. Default false (summary only) to avoid large binary output.

### `obs_list_network_requests`

**Description:** List all requests for the currently selected page since the last navigation.

**Parameters:**

- **`pageSize`** — `number` · optional
  - Maximum number of requests to return. When omitted, returns all requests.

- **`pageIdx`** — `number` · optional
  - Page number to return (0-based). When omitted, returns the first page.

- **`resourceTypes`** — `array<enum>` · optional
  - Filter requests to only return requests of the specified resource types. When omitted or empty, returns all requests.

- **`includePreservedRequests`** — `boolean` · optional · default `false`
  - Set to true to return the preserved requests over the last 3 navigations.

### `obs_list_websocket_connections`

**Description:** List all WebSocket connections. After getting wsid, use obs_analyze_websocket_messages(wsid) FIRST to understand message patterns before viewing individual messages.

**Parameters:**

- **`pageSize`** — `number` · optional
  - Maximum number of connections to return. When omitted, returns all connections.

- **`pageIdx`** — `number` · optional
  - Page number to return (0-based). When omitted, returns the first page.

- **`urlFilter`** — `string` · optional
  - Filter connections by URL. Only connections containing this substring will be returned.

- **`includePreservedConnections`** — `boolean` · optional · default `false`
  - Set to true to return the preserved connections over the last 3 navigations.

### `run_export_request`

**Description:** Exports a captured request as a runnable curl / node-fetch / node-axios snippet, optionally after removing headers.

**Parameters:**

- **`reqid`** — `number` · required
  - The reqid to export.

- **`format`** — `enum` · required
  - Allowed: `curl` | `node-fetch` | `node-axios`
  - Snippet format: curl, node-fetch, or node-axios.

- **`headers`** — `object` · optional
  - Headers to set or override.

- **`removeHeaders`** — `array<string>` · optional
  - Header names to remove.

### `run_header_ablation`

**Description:** Finds which request headers are required by repeatedly replaying the request with headers removed. Returns per-run evidence, the required/removable sets, and a minimal request (including curl).

**Parameters:**

- **`reqid`** — `number` · required
  - The reqid to ablate.

- **`candidates`** — `array<string>` · optional
  - Header names to test. Defaults to all page-controllable headers.

- **`maxRuns`** — `number` · optional
  - Maximum number of replays (default: 10).

- **`mode`** — `enum` · optional
  - Allowed: `greedy` | `binary`
  - Search strategy (default: greedy).

- **`usePageContext`** — `boolean` · optional
  - Run the request inside the page (inherits cookies, default true). Set false to replay from Node with page cookies.

- **`timeoutMs`** — `number` · optional
  - Request timeout in milliseconds (default: 15000).

- **`allowHosts`** — `array<string>` · optional
  - Extra hosts allowed for replay. Cross-site targets are blocked by default.

### `run_replay_request`

**Description:** Replays a captured request with optional header/body/query overrides and returns the raw status, response snippet, and a failure classification. Use it to verify hypotheses about required headers or signing inputs.

**Parameters:**

- **`reqid`** — `number` · required
  - The reqid from obs_list_network_requests.

- **`method`** — `string` · optional
  - Override HTTP method.

- **`url`** — `string` · optional
  - Override the full URL.

- **`headers`** — `object` · optional
  - Headers to set or override.

- **`removeHeaders`** — `array<string>` · optional
  - Header names to remove.

- **`body`** — `string` · optional
  - Override the request body.

- **`query`** — `object` · optional
  - Query parameters to set or override.

- **`usePageContext`** — `boolean` · optional
  - Run the request inside the page (inherits cookies, default true). Set false to replay from Node with page cookies.

- **`timeoutMs`** — `number` · optional
  - Request timeout in milliseconds (default: 15000).

- **`allowHosts`** — `array<string>` · optional
  - Extra hosts allowed for replay. Cross-site targets are blocked by default.

### `ver_diff_network_requests`

**Description:** Compares two captured requests and returns only the differences in method, URL, query, headers, and body (JSON-aware).

**Parameters:**

- **`a`** — `number` · required
  - First reqid.

- **`b`** — `number` · required
  - Second reqid.

- **`ignoreHeaders`** — `array<string>` · optional
  - Header names to ignore (e.g. cookies, timestamps).

- **`jsonAware`** — `boolean` · optional
  - Compare JSON bodies structurally (default: true).

## Debugging

### `ins_evaluate_script`

**Description:** Evaluate a JavaScript function inside the currently selected page. Returns the response as JSON
so returned values have to JSON-serializable.

**Parameters:**

- **`function`** — `string` · required
  - A JavaScript function declaration to be executed by the tool in the currently selected page.
Example without arguments: `() => {
  return document.title
}` or `async () => {
  return await fetch("example.com")
}`.
Example with arguments: `(el) => {
  return el.innerText;
}`


### `ins_evaluate_script_to_file`

**Description:** Evaluate a JavaScript function inside the currently selected page and write the string result to a local file. Use this for large data (canvas fingerprints, base64 images, etc.) that exceeds the MCP response size limit.

**Parameters:**

- **`function`** — `string` · required
  - A JavaScript function declaration that returns a string. Example: `() => { return document.querySelector('canvas').toDataURL(); }`

- **`filePath`** — `string` · required
  - Absolute path to write the result to. Example: /tmp/canvas_fingerprint.txt

### `ins_inject_preload_script`

**Description:** Register a JavaScript snippet that will run on future document loads before page scripts execute. Use this for preload hooks, environment patches, and early instrumentation.

**Parameters:**

- **`script`** — `string` · required
  - JavaScript source to register for future document loads.

### `nav_frame`

**Description:** Manages frames: action=list lists all frames (including iframes); action=select switches the execution context to a frame by index.

**Parameters:**

- **`action`** — `enum` · required
  - Allowed: `list` | `select`
  - list: list frames; select: switch execution context to frameIdx.

- **`frameIdx`** — `number` · optional
  - For action=select: frame index from action=list. 0 = main frame.

### `obs_get_console_message`

**Description:** Gets a console message by its ID. You can get all messages by calling obs_list_console_messages.

**Parameters:**

- **`msgid`** — `number` · required
  - The msgid of a console message on the page from the listed console messages

### `obs_list_console_messages`

**Description:** List all console messages for the currently selected page since the last navigation.

**Parameters:**

- **`pageSize`** — `number` · optional
  - Maximum number of messages to return. When omitted, returns all requests.

- **`pageIdx`** — `number` · optional
  - Page number to return (0-based). When omitted, returns the first page.

- **`types`** — `array<enum>` · optional
  - Filter messages to only return messages of the specified resource types. When omitted or empty, returns all messages.

- **`includePreservedMessages`** — `boolean` · optional · default `false`
  - Set to true to return the preserved messages over the last 3 navigations.

### `obs_take_screenshot`

**Description:** Take a screenshot of the page or element.

**Parameters:**

- **`format`** — `enum` · optional · default `png`
  - Allowed: `png` | `jpeg` | `webp`
  - Type of format to save the screenshot as. Default is "png"

- **`quality`** — `number` · optional
  - Compression quality for JPEG and WebP formats (0-100). Higher values mean better quality but larger file sizes. Ignored for PNG format.

- **`fullPage`** — `boolean` · optional
  - If set to true takes a screenshot of the full page instead of the currently visible viewport. Incompatible with uid.

- **`filePath`** — `string` · optional
  - The absolute path, or a path relative to the current working directory, to save the screenshot to instead of attaching it to the response.

## JS Reverse Engineering

### `ins_breakpoint`

**Description:** Manages breakpoints. action=set sets a line breakpoint; action=set_text locates code text and sets a breakpoint; action=remove removes one by id; action=list lists active breakpoints.

**Parameters:**

- **`action`** — `enum` · required
  - Allowed: `set` | `set_text` | `remove` | `list`
  - set: line breakpoint by script URL; set_text: locate code text and break there; remove: remove by id; list: list active breakpoints.

- **`url`** — `string` · optional
  - For action=set: script URL (partial match or regex).

- **`lineNumber`** — `number` · optional
  - For action=set: 1-based line number.

- **`columnNumber`** — `number` · optional
  - For action=set: 0-based column (default: 0).

- **`condition`** — `string` · optional
  - Optional condition expression.

- **`isRegex`** — `boolean` · optional
  - For action=set: treat url as a regex (default: false).

- **`text`** — `string` · optional
  - For action=set_text: code text to locate.

- **`urlFilter`** — `string` · optional
  - For action=set_text: only search scripts whose URL contains this.

- **`occurrence`** — `number` · optional
  - For action=set_text: which occurrence (default: 1).

- **`breakpointId`** — `string` · optional
  - For action=remove: breakpoint id.

### `ins_debug_control`

**Description:** Controls paused execution: action=pause | resume | step_over | step_into | step_out.

**Parameters:**

- **`action`** — `enum` · required
  - Allowed: `pause` | `resume` | `step_over` | `step_into` | `step_out`
  - pause: pause execution; resume: continue; step_over/step_into/step_out: step the debugger.

### `ins_evaluate_on_callframe`

**Description:** Evaluates a JavaScript expression in the context of a specific call frame while paused. This allows you to inspect variables and execute code in the paused scope.

**Parameters:**

- **`expression`** — `string` · required
  - The JavaScript expression to evaluate.

- **`frameIndex`** — `number` · optional · default `0`
  - The call frame index to evaluate in (0 = top frame, default: 0).

### `ins_get_paused_info`

**Description:** Gets information about the current paused state including call stack, current location, and scope variables. Use this after a breakpoint is hit to understand the execution context.

**Parameters:**

- **`includeScopes`** — `boolean` · optional · default `true`
  - Whether to include scope variables (default: true).

- **`maxScopeDepth`** — `number` · optional · default `2`
  - Maximum scope depth to traverse (default: 2).

### `ins_hook`

**Description:** Manages hooks. action=function hooks a JS function and logs calls/args/results; action=create builds a declarative hook (fetch/xhr/function/property/cookie/websocket/eval/timer); action=list shows active hooks; action=remove removes one; action=inject injects an existing hook script.

**Parameters:**

- **`action`** — `enum` · required
  - Allowed: `function` | `create` | `list` | `remove` | `inject`
  - function: hook a JS function and log calls; create: build a declarative hook; list: show active hooks; remove: remove one; inject: inject an existing hook script.

- **`hookId`** — `string` · optional
  - Hook id. For action=function it defaults to the target name.

- **`target`** — `string` · optional
  - For action=function: global function name, object method ("XMLHttpRequest.prototype.open"), or path ("window.app.api.request").

- **`type`** — `string` · optional
  - For action=create: fetch/xhr/function/property/cookie/websocket/eval/timer.

- **`params`** — `object` · optional
  - For action=create: hook type parameters.

- **`description`** — `string` · optional
  - For action=create: human-readable description.

- **`hookAction`** — `enum` · optional
  - Allowed: `log` | `block` | `modify` | `passthrough`
  - For action=create: behavior.

- **`logArgs`** — `boolean` · optional
  - For action=function: log arguments (default: true).

- **`logResult`** — `boolean` · optional
  - For action=function: log return value (default: true).

- **`logStack`** — `boolean` · optional
  - For action=function: log call stack (default: false).

### `ins_signer`

**Description:** Manages signers (page functions used as signing oracles). action=register stores an expression that evaluates to a function; action=list shows registered signers; action=remove deletes one; action=sign calls a signer with a payload and returns its output.

**Parameters:**

- **`action`** — `enum` · required
  - Allowed: `register` | `list` | `remove` | `sign`
  - register: store a signer expression; list: show registered signers; remove: delete one; sign: call it with a payload.

- **`name`** — `string` · optional
  - Signer name.

- **`expr`** — `string` · optional
  - For action=register: expression that evaluates to a function, e.g. "window.signature" or "(p) => md5(p)"

- **`payload`** — `unknown` · optional
  - For action=sign: payload passed to the signer.

- **`persist`** — `boolean` · optional
  - For action=register: persist the signer to artifacts/signers.json.

### `ins_stealth`

**Description:** Inspect or apply anti-detection stealth settings. action=inject applies stealth scripts to the current page; action=presets lists presets; action=features lists feature toggles; action=set_user_agent sets the page user-agent.

**Parameters:**

- **`action`** — `enum` · required
  - Allowed: `inject` | `presets` | `features` | `set_user_agent`
  - inject: apply stealth scripts; presets: list presets; features: list feature toggles; set_user_agent: set the page UA.

- **`preset`** — `enum` · optional
  - Allowed: `windows-chrome` | `mac-chrome` | `mac-safari` | `linux-chrome` | `windows-edge`
  - Stealth preset to apply; selects the spoofed platform profile.

- **`userAgent`** — `string` · optional
  - User-Agent string to apply (required for action=set_user_agent).

### `ins_xhr_breakpoint`

**Description:** Sets or removes an XHR/Fetch breakpoint that matches a URL substring.

**Parameters:**

- **`action`** — `enum` · required
  - Allowed: `set` | `remove`
  - set: add an XHR/Fetch breakpoint; remove: remove it.

- **`url`** — `string` · required
  - URL pattern to break on (partial match).

### `loc_analyze_code`

**Description:** Analyzes JavaScript source. action=deobfuscate | understand | summarize | crypto | risk. Provide code (for summarize you may pass url/files; for risk you may omit code to use collected files).

**Parameters:**

- **`action`** — `enum` · required
  - Allowed: `deobfuscate` | `understand` | `summarize` | `crypto` | `risk`
  - deobfuscate: clean obfuscated code; understand: structure/business/security analysis; summarize: summarize files or a project; crypto: detect crypto primitives; risk: combined risk score.

- **`code`** — `string` · optional
  - Source code to analyze (required for deobfuscate/understand/crypto).

- **`url`** — `string` · optional
  - Source URL label used by summarize when no file list is provided.

- **`files`** — `array<object>` · optional
  - Files to summarize (action=summarize with mode=batch or project).

- **`focus`** — `enum` · optional
  - Allowed: `all` | `structure` | `business` | `security`
  - Analysis focus for action=understand: all, structure, business, or security.

- **`aggressive`** — `boolean` · optional
  - For deobfuscate: enable aggressive transformations.

- **`renameVariables`** — `boolean` · optional
  - For deobfuscate: rename variables to readable names.

- **`useAI`** — `boolean` · optional
  - For crypto: enable LLM-based deep analysis.

- **`mode`** — `enum` · optional
  - Allowed: `single` | `batch` | `project`
  - For action=summarize: scope.

- **`includeHookSignals`** — `boolean` · optional
  - For risk: include hook record counts in scoring (default true).

- **`hookId`** — `string` · optional
  - For risk: restrict hook signals to this hook id.

- **`topN`** — `number` · optional
  - For risk: number of collected files to use when code is omitted (default 5).

### `loc_find_in_script`

**Description:** Finds a string in a specific script and returns its exact line/column position with surrounding context. Ideal for setting breakpoints in minified files where the entire code is on one line.

**Parameters:**

- **`scriptId`** — `string` · required
  - The script ID to search in (from obs_list_scripts).

- **`query`** — `string` · required
  - The string to find in the script.

- **`contextChars`** — `number` · optional · default `100`
  - Number of characters to show before and after the match (default: 100).

- **`occurrence`** — `number` · optional · default `1`
  - Which occurrence to find (1 = first, 2 = second, etc.).

- **`caseSensitive`** — `boolean` · optional · default `true`
  - Whether the search is case-sensitive (default: true).

### `loc_get_request_initiator`

**Description:** Gets the JavaScript call stack that initiated a network request. This helps trace which code triggered an API call.

**Parameters:**

- **`requestId`** — `number` · required
  - The request ID (from obs_list_network_requests) to get the initiator for.

- **`taskId`** — `string` · optional
  - Optional reverse task ID for writing durable evidence artifacts.

- **`taskSlug`** — `string` · optional
  - Optional reverse task slug used when opening the task artifact directory.

- **`targetUrl`** — `string` · optional
  - Optional target page URL associated with the reverse task.

- **`goal`** — `string` · optional
  - Optional reverse-engineering goal for the task artifact.

### `loc_get_script_source`

**Description:** Gets the source code of a JavaScript script by its script ID. Supports line range (for normal files) or character offset (for minified single-line files). Use obs_list_scripts first to find the script ID.

**Parameters:**

- **`scriptId`** — `string` · required
  - The script ID (from obs_list_scripts) to get the source code for.

- **`startLine`** — `number` · optional
  - Start line number (1-based). Use for multi-line files.

- **`endLine`** — `number` · optional
  - End line number (1-based). Use for multi-line files.

- **`offset`** — `number` · optional
  - Character offset to start from (0-based). Use for minified single-line files.

- **`length`** — `number` · optional · default `1000`
  - Number of characters to return when using offset (default: 1000).

### `loc_search_in_sources`

**Description:** Searches for a string or regex pattern in all loaded JavaScript sources. Returns matching lines with script ID, URL, and line number. Use loc_get_script_source with startLine/endLine to view full context around matches.

**Parameters:**

- **`query`** — `string` · required
  - The search query (string or regex pattern).

- **`caseSensitive`** — `boolean` · optional · default `false`
  - Whether the search should be case-sensitive.

- **`isRegex`** — `boolean` · optional · default `false`
  - Whether to treat the query as a regular expression.

- **`maxResults`** — `number` · optional · default `30`
  - Maximum number of results to return (default: 30).

- **`maxLineLength`** — `number` · optional · default `150`
  - Maximum characters per line preview (default: 150). Set to 0 for full lines.

- **`excludeMinified`** — `boolean` · optional · default `true`
  - Skip minified files (files with very long lines). Default: true.

- **`urlFilter`** — `string` · optional
  - Only search scripts whose URL contains this string (case-insensitive).

### `loc_trace_function`

**Description:** Traces calls to a function by its name in the source code. Works for ANY function including module-internal functions (webpack/rollup bundled). Uses "logpoints" (conditional breakpoints) to log arguments without pausing execution.

**Parameters:**

- **`functionName`** — `string` · required
  - The function name to trace. Will search for "function NAME" or "NAME = function" or "NAME(" patterns.

- **`urlFilter`** — `string` · optional
  - Only search in scripts matching this URL pattern.

- **`logArgs`** — `boolean` · optional · default `true`
  - Whether to log function arguments (default: true).

- **`logThis`** — `boolean` · optional · default `false`
  - Whether to log "this" context (default: false).

- **`pause`** — `boolean` · optional · default `false`
  - Whether to actually pause execution (default: false, just logs).

- **`traceId`** — `string` · optional
  - Custom ID for this trace. Used to identify in logs.

- **`taskId`** — `string` · optional
  - Optional reverse task ID for writing durable evidence artifacts.

- **`taskSlug`** — `string` · optional
  - Optional reverse task slug used when opening the task artifact directory.

- **`targetUrl`** — `string` · optional
  - Optional target page URL associated with the reverse task.

- **`goal`** — `string` · optional
  - Optional reverse-engineering goal for the task artifact.

### `loc_trace_request_to_signer`

**Description:** Scores the initiator call stack of a request and returns candidate functions that build or sign it. Reads the source around each frame and ranks by signing signals (function name, crypto primitives, string building, timestamps, randomness).

**Parameters:**

- **`reqid`** — `number` · required
  - The reqid from obs_list_network_requests.

- **`topN`** — `number` · optional
  - Number of candidates to return (default: 5).

- **`contextChars`** — `number` · optional
  - Characters of source to read around each frame (default: 400).

- **`includeParentStack`** — `boolean` · optional
  - Include async parent frames (default: true).

### `obs_collect_code`

**Description:** Collect JavaScript code from a page with smart modes (summary/priority/incremental/full).

**Parameters:**

- **`url`** — `string` · required
  - Page URL to collect scripts from.

- **`smartMode`** — `enum` · optional
  - Allowed: `summary` | `priority` | `incremental` | `full`
  - summary: metadata only; priority: targeted files; incremental: diff since last run; full: all content.

- **`returnMode`** — `enum` · optional
  - Allowed: `full` | `summary` | `pattern` | `top-priority`
  - full: complete content; summary: metadata; pattern: URL-filtered; top-priority: highest-signal files.

- **`includeInline`** — `boolean` · optional
  - Include inline scripts.

- **`includeExternal`** — `boolean` · optional
  - Include external scripts.

- **`includeDynamic`** — `boolean` · optional
  - Include dynamically loaded scripts.

- **`maxTotalSize`** — `number` · optional
  - Maximum total response size in bytes.

- **`maxFileSize`** — `number` · optional
  - Maximum size per file in bytes.

- **`pattern`** — `string` · optional
  - URL regex used with returnMode=pattern.

- **`limit`** — `number` · optional
  - Maximum number of files returned.

- **`topN`** — `number` · optional
  - Number of top-priority files returned with returnMode=top-priority.

### `obs_get_hook_data`

**Description:** Get captured data for one hook or all hooks. Supports raw view and summary view for noise reduction.

**Parameters:**

- **`hookId`** — `string` · optional
  - Hook id to read; omit to read all hooks.

- **`view`** — `enum` · optional
  - Allowed: `raw` | `summary`
  - raw: full records; summary: aggregated counts and samples.

- **`maxRecords`** — `number` · optional
  - Maximum records per hook in summary view.

### `obs_get_storage`

**Description:** Gets browser storage data including cookies, localStorage, and sessionStorage.

**Parameters:**

- **`type`** — `enum` · optional · default `all`
  - Allowed: `all` | `cookies` | `localStorage` | `sessionStorage`
  - Which storage to retrieve (default: all).

- **`filter`** — `string` · optional
  - Optional filter string to match against keys/names.

### `obs_inspect_object`

**Description:** Deeply inspects a JavaScript object, showing its properties, prototype chain, and methods. Useful for understanding object structure.

**Parameters:**

- **`expression`** — `string` · required
  - JavaScript expression to evaluate and inspect (e.g., "window.app", "document.body", "myObject").

- **`depth`** — `number` · optional · default `2`
  - How deep to inspect nested objects (default: 2).

- **`showMethods`** — `boolean` · optional · default `true`
  - Whether to show methods (default: true).

- **`showPrototype`** — `boolean` · optional · default `true`
  - Whether to show prototype chain (default: true).

### `obs_list_collected_scripts`

**Description:** Lists scripts in the collection cache (populated by obs_collect_code), optionally filtered by a regex matched against script URLs. Does not search script content — use loc_search_in_sources for that.

**Parameters:**

- **`pattern`** — `string` · optional
  - Regex matched against collected script URLs. When omitted, lists all cached scripts.

- **`limit`** — `number` · optional
  - Maximum number of scripts returned (default 20).

- **`maxTotalSize`** — `number` · optional
  - Maximum total size of returned script content in bytes.

### `obs_list_scripts`

**Description:** Lists all JavaScript scripts loaded in the current page. Returns script ID, URL, and source map information. Use this to find scripts before setting breakpoints or searching.

**Parameters:**

- **`filter`** — `string` · optional
  - Optional filter string to match against script URLs (case-insensitive partial match).

### `obs_monitor_events`

**Description:** Monitors DOM events on a specified element or window. action=start begins monitoring; action=stop stops the monitor. Events are logged to console.

**Parameters:**

- **`action`** — `enum` · required
  - Allowed: `start` | `stop`
  - start: begin monitoring a target; stop: stop the monitor by id.

- **`selector`** — `string` · optional
  - CSS selector for element to monitor, or "window"/"document" (default: window).

- **`events`** — `array<string>` · optional
  - Specific events to monitor (e.g., ["click", "keydown"]). If not specified, monitors common events.

- **`monitorId`** — `string` · optional
  - Custom ID for this monitor. Used to stop monitoring later.

- **`taskId`** — `string` · optional
  - Optional reverse task ID for writing durable evidence artifacts.

- **`taskSlug`** — `string` · optional
  - Optional reverse task slug used when opening the task artifact directory.

- **`targetUrl`** — `string` · optional
  - Optional target page URL associated with the reverse task.

- **`goal`** — `string` · optional
  - Optional reverse-engineering goal for the task artifact.

### `rec_export_rebuild_bundle`

**Description:** Export a local Node rebuild bundle from observed reverse-engineering evidence.

**Parameters:**

- **`taskId`** — `string` · required
  - Reverse task id used for the artifact directory.

- **`taskSlug`** — `string` · required
  - Human-readable task slug.

- **`targetUrl`** — `string` · required
  - Target page URL associated with the task.

- **`goal`** — `string` · required
  - Reverse-engineering goal for the artifact.

- **`autoGenerate`** — `boolean` · optional
  - Auto-generate entry/env/polyfill code from captured evidence.

- **`targetKeywords`** — `array<string>` · optional
  - Keywords used when auto-selecting evidence.

- **`targetUrlPatterns`** — `array<string>` · optional
  - URL patterns used when auto-selecting evidence.

- **`targetFunctionNames`** — `array<string>` · optional
  - Function names used when auto-selecting evidence.

- **`targetActionDescription`** — `string` · optional
  - Description of the triggering action.

- **`maxEvidenceItems`** — `number` · optional
  - Maximum evidence items included in the bundle.

- **`entryCode`** — `string` · optional
  - Explicit entry script override.

- **`envCode`** — `string` · optional
  - Explicit environment code override.

- **`polyfillsCode`** — `string` · optional
  - Explicit polyfills override.

- **`capture`** — `object` · optional
  - Captured runtime data (cookies/storage/page) to bundle.

- **`notes`** — `array<string>` · optional · default `[]`
  - Extra notes written into the bundle.

### `rec_export_reverse_summary`

**Description:** Builds a markdown summary from a reverse task artifact directory: goal, experiment entries recorded by replay/ablation/signer analysis, and evidence log counts. Optionally writes it to a file.

**Parameters:**

- **`taskId`** — `string` · required
  - The reverse task id.

- **`path`** — `string` · optional
  - Optional absolute path to write the markdown summary to.

### `rec_export_session_report`

**Description:** Export current reverse-engineering session as JSON or Markdown.

**Parameters:**

- **`format`** — `enum` · optional · default `json`
  - Allowed: `json` | `markdown`
  - Output format: json or markdown.

- **`includeHookData`** — `boolean` · optional
  - Include captured hook records in the report.

### `rec_record_reverse_evidence`

**Description:** Append structured reverse-engineering evidence to a task artifact log.

**Parameters:**

- **`taskId`** — `string` · required
  - Reverse task id.

- **`taskSlug`** — `string` · required
  - Human-readable task slug.

- **`targetUrl`** — `string` · required
  - Target page URL.

- **`goal`** — `string` · required
  - Reverse-engineering goal.

- **`channel`** — `string` · optional · default `runtime-evidence`
  - Log channel name (e.g. runtime-evidence, network, scripts).

- **`targetKeywords`** — `array<string>` · optional
  - Target keywords to persist as task context.

- **`targetUrlPatterns`** — `array<string>` · optional
  - Target URL patterns to persist as task context.

- **`targetFunctionNames`** — `array<string>` · optional
  - Target function names to persist as task context.

- **`targetActionDescription`** — `string` · optional
  - Description of the target action.

- **`entry`** — `object` · required
  - Structured evidence entry to append.

### `rec_task_context`

**Description:** Sets, reads, or clears the active reverse task. When set, replay/ablation/signer-analysis/trace results are automatically appended to the task artifact directory.

**Parameters:**

- **`action`** — `enum` · required
  - Allowed: `set` | `get` | `clear`
  - set: set the active task; get: read it; clear: unset it.

- **`taskId`** — `string` · optional
  - For action=set: task id.

- **`taskSlug`** — `string` · optional
  - For action=set: task slug.

- **`targetUrl`** — `string` · optional
  - For action=set: target page URL.

- **`goal`** — `string` · optional
  - For action=set: reverse-engineering goal.

### `reverse_guide`

**Description:** Returns a recommended tool path for a reverse-engineering goal. It only suggests routes and next steps; it does not draw conclusions about the target.

**Parameters:**

- **`goal`** — `string` · required
  - What you are trying to do, e.g. "从 0 还原某接口签名"、"确认这个接口是否改版"、"哪些请求头是必需的".

- **`scenario`** — `enum` · optional
  - Allowed: `from_zero` | `confirm_change` | `header_necessity` | `signer_inputs` | `offline_repro`
  - Explicit scenario. Inferred from goal when omitted.

### `run_analyze_target`

**Description:** One-shot reverse workflow: collect code, run security/crypto analysis, optional deobfuscation, and hook timeline correlation.

**Parameters:**

- **`url`** — `string` · required
  - Target page URL.

- **`topN`** — `number` · optional
  - Number of top-priority files used for analysis.

- **`useAI`** — `boolean` · optional
  - Enable LLM-assisted analysis.

- **`runDeobfuscation`** — `boolean` · optional
  - Run the deobfuscation pipeline on selected files.

- **`hookPreset`** — `enum` · optional
  - Allowed: `none` | `api-signature` | `network-core`
  - Hook preset: none, api-signature, or network-core.

- **`autoInjectHooks`** — `boolean` · optional
  - Inject the selected hook preset automatically.

- **`waitAfterHookMs`** — `number` · optional
  - Wait time after hook injection before collecting.

- **`correlationWindowMs`** — `number` · optional
  - Time window for correlating hooks with requests.

- **`maxCorrelatedFlows`** — `number` · optional
  - Maximum correlated request flows to return.

- **`maxFingerprints`** — `number` · optional
  - Maximum request fingerprints to return.

- **`autoReplayActions`** — `array<object>` · optional
  - Actions replayed before sampling (click/type/navigate...).

- **`collect`** — `object` · optional
  - Collector options for the initial collection.

### `ver_analyze_signer`

**Description:** Probes a signer to find which payload fields affect the signature, and checks whether the signature is stable across identical calls (timestamp/nonce detection). Returns raw per-field evidence, not just conclusions.

**Parameters:**

- **`name`** — `string` · optional
  - Registered signer name.

- **`expr`** — `string` · optional
  - Ad-hoc signer expression (used when name is omitted).

- **`payload`** — `object` · required
  - Object payload. Fields are perturbed one at a time.

- **`fields`** — `array<string>` · optional
  - Subset of top-level fields to probe (default: all).

- **`trials`** — `number` · optional
  - Identical-call repetitions for the stability check (default: 2).

### `ver_collection_diff`

**Description:** Compare previous and current collected file summaries.

**Parameters:**

- **`previous`** — `array<object>` · required
  - Previous collection summary.

- **`current`** — `array<object>` · optional
  - Current collection summary (defaults to the live cache).

- **`includeUnchanged`** — `boolean` · optional
  - Include files that did not change.

### `ver_diff_env_requirements`

**Description:** Compare local runtime failures with observed browser capabilities and suggest the next environment patches.

**Parameters:**

- **`runtimeError`** — `string` · required
  - Local runtime error to analyze.

- **`observedCapabilities`** — `array<string>` · optional · default `[]`
  - Capabilities observed in the browser.

### `wasm_analyze_module`

**Description:** Analyze one Wasm module by session module ID, base64 payload, or artifact path.

**Parameters:**

- **`moduleId`** — `string` · optional
  - Wasm module id from wasm_list_modules.

- **`base64`** — `string` · optional
  - Base64 Wasm payload (alternative to moduleId).

- **`artifactPath`** — `string` · optional
  - Path to a Wasm file (alternative to moduleId).

- **`includeFunctionSignatures`** — `boolean` · optional
  - Include function type signatures.

- **`includeRawSectionMap`** — `boolean` · optional
  - Include the raw section map.

- **`includeStringScan`** — `boolean` · optional
  - Scan data sections for strings.

- **`maskSensitiveStrings`** — `boolean` · optional
  - Mask sensitive strings in the output.

- **`maxStringSlots`** — `number` · optional
  - Maximum string slots to scan.

- **`maxSummaryLines`** — `number` · optional
  - Maximum summary lines to return.

### `wasm_collect`

**Description:** Collect Wasm modules from network responses and runtime instantiation hooks.

**Parameters:**

- **`url`** — `string` · required
  - Page URL to collect Wasm from.

- **`timeout`** — `number` · optional
  - Collection timeout in milliseconds.

- **`waitAfterLoadMs`** — `number` · optional
  - Wait after load before collecting.

- **`includeRuntimeEvents`** — `boolean` · optional
  - Include runtime instantiation events.

- **`includeImports`** — `boolean` · optional
  - Include import names.

- **`includeExports`** — `boolean` · optional
  - Include export names.

- **`maxModules`** — `number` · optional
  - Maximum modules to keep.

- **`captureBase64`** — `boolean` · optional
  - Capture the full module as base64.

- **`taskId`** — `string` · optional
  - Reverse task id.

- **`taskSlug`** — `string` · optional
  - Human-readable task slug.

- **`targetUrl`** — `string` · optional
  - Target page URL.

- **`goal`** — `string` · optional
  - Reverse-engineering goal.

### `wasm_decompile`

**Description:** Disassemble a Wasm module to WAT using wabt/wasm2wat and summarize function-level behavior.

**Parameters:**

- **`moduleId`** — `string` · optional
  - Wasm module id.

- **`base64`** — `string` · optional
  - Base64 Wasm payload (alternative to moduleId).

- **`artifactPath`** — `string` · optional
  - Path to a Wasm file.

- **`maxWatChars`** — `number` · optional
  - Maximum WAT characters returned.

- **`foldExprs`** — `boolean` · optional
  - Fold expressions in the WAT output.

- **`inlineExport`** — `boolean` · optional
  - Inline export annotations.

### `wasm_inspect_exports`

**Description:** Summarize Wasm export usage and likely high-value entry points.

**Parameters:**

- **`moduleId`** — `string` · required
  - Wasm module id.

### `wasm_list_modules`

**Description:** List Wasm modules captured in the current session.

**Parameters:**

- **`includeImports`** — `boolean` · optional
  - Include import names.

- **`includeExports`** — `boolean` · optional
  - Include export names.

### `wasm_signature_diff`

**Description:** Compare captured JS-Wasm boundary chains to highlight which query/body/header inputs vary like signature material.

**Parameters:**

- **`moduleId`** — `string` · required
  - Wasm module id.

- **`exportName`** — `string` · optional
  - Restrict the comparison to one export name.

- **`maxChains`** — `number` · optional
  - Maximum boundary chains to return.

### `wasm_summarize_boundary`

**Description:** Build candidate JS -> memory bridge -> Wasm export -> sink chains for a captured Wasm module.

**Parameters:**

- **`moduleId`** — `string` · required
  - Wasm module id.

- **`maxChains`** — `number` · optional
  - Maximum chains to return.

