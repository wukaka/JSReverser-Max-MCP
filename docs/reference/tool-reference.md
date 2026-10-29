<!-- AUTO GENERATED DO NOT EDIT - run 'npm run docs' to update-->

# Chrome DevTools MCP Tool Reference

> 快速按逆向目标查工具，请先看：[`docs/reference/reverse-task-index.md`](./reverse-task-index.md)

- **[Navigation automation](#navigation-automation)** (18 tools)
  - [`loc_find_clickable_elements`](#loc_find_clickable_elements)
  - [`nav_click_element`](#nav_click_element)
  - [`nav_list_pages`](#nav_list_pages)
  - [`nav_navigate_page`](#nav_navigate_page)
  - [`nav_new_page`](#nav_new_page)
  - [`nav_select_page`](#nav_select_page)
  - [`nav_type_text`](#nav_type_text)
  - [`nav_wait_for_element`](#nav_wait_for_element)
  - [`obs_get_dom_structure`](#obs_get_dom_structure)
  - [`obs_get_performance_metrics`](#obs_get_performance_metrics)
  - [`obs_query_dom`](#obs_query_dom)
  - [`rec_delete_session_state`](#rec_delete_session_state)
  - [`rec_dump_session_state`](#rec_dump_session_state)
  - [`rec_list_session_states`](#rec_list_session_states)
  - [`rec_load_session_state`](#rec_load_session_state)
  - [`rec_restore_session_state`](#rec_restore_session_state)
  - [`rec_save_session_state`](#rec_save_session_state)
  - [`sys_check_browser_health`](#sys_check_browser_health)
- **[Network](#network)** (6 tools)
  - [`obs_analyze_websocket_messages`](#obs_analyze_websocket_messages)
  - [`obs_get_network_request`](#obs_get_network_request)
  - [`obs_get_websocket_message`](#obs_get_websocket_message)
  - [`obs_get_websocket_messages`](#obs_get_websocket_messages)
  - [`obs_list_network_requests`](#obs_list_network_requests)
  - [`obs_list_websocket_connections`](#obs_list_websocket_connections)
- **[Debugging](#debugging)** (8 tools)
  - [`ins_evaluate_script`](#ins_evaluate_script)
  - [`ins_evaluate_script_to_file`](#ins_evaluate_script_to_file)
  - [`ins_inject_preload_script`](#ins_inject_preload_script)
  - [`nav_list_frames`](#nav_list_frames)
  - [`nav_select_frame`](#nav_select_frame)
  - [`obs_get_console_message`](#obs_get_console_message)
  - [`obs_list_console_messages`](#obs_list_console_messages)
  - [`obs_take_screenshot`](#obs_take_screenshot)
- **[JS Reverse Engineering](#js-reverse-engineering)** (54 tools)
  - [`ins_break_on_xhr`](#ins_break_on_xhr)
  - [`ins_create_hook`](#ins_create_hook)
  - [`ins_evaluate_on_callframe`](#ins_evaluate_on_callframe)
  - [`ins_get_paused_info`](#ins_get_paused_info)
  - [`ins_hook_function`](#ins_hook_function)
  - [`ins_inject_hook`](#ins_inject_hook)
  - [`ins_inject_stealth`](#ins_inject_stealth)
  - [`ins_list_breakpoints`](#ins_list_breakpoints)
  - [`ins_list_hooks`](#ins_list_hooks)
  - [`ins_list_stealth_features`](#ins_list_stealth_features)
  - [`ins_list_stealth_presets`](#ins_list_stealth_presets)
  - [`ins_pause`](#ins_pause)
  - [`ins_remove_breakpoint`](#ins_remove_breakpoint)
  - [`ins_remove_hook`](#ins_remove_hook)
  - [`ins_remove_xhr_breakpoint`](#ins_remove_xhr_breakpoint)
  - [`ins_resume`](#ins_resume)
  - [`ins_set_breakpoint`](#ins_set_breakpoint)
  - [`ins_set_breakpoint_on_text`](#ins_set_breakpoint_on_text)
  - [`ins_set_user_agent`](#ins_set_user_agent)
  - [`ins_step_into`](#ins_step_into)
  - [`ins_step_out`](#ins_step_out)
  - [`ins_step_over`](#ins_step_over)
  - [`ins_unhook_function`](#ins_unhook_function)
  - [`loc_deobfuscate_code`](#loc_deobfuscate_code)
  - [`loc_detect_crypto`](#loc_detect_crypto)
  - [`loc_find_in_script`](#loc_find_in_script)
  - [`loc_get_request_initiator`](#loc_get_request_initiator)
  - [`loc_get_script_source`](#loc_get_script_source)
  - [`loc_search_in_scripts`](#loc_search_in_scripts)
  - [`loc_search_in_sources`](#loc_search_in_sources)
  - [`loc_summarize_code`](#loc_summarize_code)
  - [`loc_trace_function`](#loc_trace_function)
  - [`loc_understand_code`](#loc_understand_code)
  - [`obs_collect_code`](#obs_collect_code)
  - [`obs_get_hook_data`](#obs_get_hook_data)
  - [`obs_get_storage`](#obs_get_storage)
  - [`obs_inspect_object`](#obs_inspect_object)
  - [`obs_list_scripts`](#obs_list_scripts)
  - [`obs_monitor_events`](#obs_monitor_events)
  - [`obs_stop_monitor`](#obs_stop_monitor)
  - [`rec_export_rebuild_bundle`](#rec_export_rebuild_bundle)
  - [`rec_export_session_report`](#rec_export_session_report)
  - [`rec_record_reverse_evidence`](#rec_record_reverse_evidence)
  - [`run_analyze_target`](#run_analyze_target)
  - [`ver_collection_diff`](#ver_collection_diff)
  - [`ver_diff_env_requirements`](#ver_diff_env_requirements)
  - [`ver_risk_panel`](#ver_risk_panel)
  - [`wasm_analyze_module`](#wasm_analyze_module)
  - [`wasm_collect`](#wasm_collect)
  - [`wasm_decompile`](#wasm_decompile)
  - [`wasm_inspect_exports`](#wasm_inspect_exports)
  - [`wasm_list_modules`](#wasm_list_modules)
  - [`wasm_signature_diff`](#wasm_signature_diff)
  - [`wasm_summarize_boundary`](#wasm_summarize_boundary)

## Navigation automation

### `loc_find_clickable_elements`

**Description:** Find clickable buttons/links, optionally filtered by text.

**Parameters:**

- `filterText`

### `nav_click_element`

**Description:** Click an element by selector.

**Parameters:**

- `selector`

### `nav_list_pages`

**Description:** Get a list of pages open in the browser.

### `nav_navigate_page`

**Description:** Navigates the currently selected page to a URL, or performs back/forward/reload navigation. Waits for DOMContentLoaded event (not full page load). Default timeout is 10 seconds.

**Parameters:**

- `type`
- `url`
- `ignoreCache`
- `timeout`

### `nav_new_page`

**Description:** Creates a new page and navigates to the specified URL. Waits for DOMContentLoaded event (not full page load). Default timeout is 10 seconds.

**Parameters:**

- `url`
- `timeout`

### `nav_select_page`

**Description:** Select a page as a context for future tool calls.

**Parameters:**

- `pageIdx`

### `nav_type_text`

**Description:** Type text into an input element.

**Parameters:**

- `selector`
- `text`
- `delay`

### `nav_wait_for_element`

**Description:** Wait for selector to appear.

**Parameters:**

- `selector`
- `timeout`

### `obs_get_dom_structure`

**Description:** Get DOM tree structure for current page.

**Parameters:**

- `maxDepth`
- `includeText`

### `obs_get_performance_metrics`

**Description:** Get page performance metrics from Performance API.

### `obs_query_dom`

**Description:** Query one or multiple elements by CSS selector.

**Parameters:**

- `selector`
- `all`
- `limit`

### `rec_delete_session_state`

**Description:** Delete one in-memory session snapshot by sessionId.

**Parameters:**

- `sessionId`

### `rec_dump_session_state`

**Description:** Export a saved session snapshot as JSON, optionally writing to a file.

**Parameters:**

- `sessionId`
- `path`
- `pretty`
- `encrypt`

### `rec_list_session_states`

**Description:** List all saved session snapshots in memory.

### `rec_load_session_state`

**Description:** Load a session snapshot from JSON string or file into memory.

**Parameters:**

- `sessionId`
- `path`
- `snapshotJson`
- `overwrite`

### `rec_restore_session_state`

**Description:** Restore a previously saved session snapshot to current page.

**Parameters:**

- `sessionId`
- `navigateToSavedUrl`
- `clearStorageBeforeRestore`

### `rec_save_session_state`

**Description:** Save current page session state (cookies/localStorage/sessionStorage) into in-memory snapshot.

**Parameters:**

- `sessionId`
- `includeCookies`
- `includeLocalStorage`
- `includeSessionStorage`

### `sys_check_browser_health`

**Description:** Check browser connectivity and active page readiness before running reverse workflows.

## Network

### `obs_analyze_websocket_messages`

**Description:** Analyzes WebSocket messages and groups them by pattern/fingerprint. Essential for understanding binary/protobuf message types in live streaming scenarios. Returns statistics and sample indices for each message type.

**Parameters:**

- `wsid`
- `direction`

### `obs_get_network_request`

**Description:** Gets a network request by an optional reqid, if omitted returns the currently selected request in the DevTools Network panel.

**Parameters:**

- `reqid`

### `obs_get_websocket_message`

**Description:** Gets a single WebSocket message by its frame index. Use obs_get_websocket_messages or obs_analyze_websocket_messages first to find the frame index.

**Parameters:**

- `wsid`
- `frameIndex`

### `obs_get_websocket_messages`

**Description:** Gets messages for a WebSocket connection. IMPORTANT: For binary/protobuf messages (like live streaming), use obs_analyze_websocket_messages FIRST to understand message types, then use groupId parameter to filter specific types. Default mode shows summary only.

**Parameters:**

- `wsid`
- `direction`
- `groupId`
- `pageSize`
- `pageIdx`
- `show_content`

### `obs_list_network_requests`

**Description:** List all requests for the currently selected page since the last navigation.

**Parameters:**

- `pageSize`
- `pageIdx`
- `resourceTypes`
- `includePreservedRequests`

### `obs_list_websocket_connections`

**Description:** List all WebSocket connections. After getting wsid, use obs_analyze_websocket_messages(wsid) FIRST to understand message patterns before viewing individual messages.

**Parameters:**

- `pageSize`
- `pageIdx`
- `urlFilter`
- `includePreservedConnections`

## Debugging

### `ins_evaluate_script`

**Description:** Evaluate a JavaScript function inside the currently selected page. Returns the response as JSON
so returned values have to JSON-serializable.

**Parameters:**

- `function`

### `ins_evaluate_script_to_file`

**Description:** Evaluate a JavaScript function inside the currently selected page and write the string result to a local file. Use this for large data (canvas fingerprints, base64 images, etc.) that exceeds the MCP response size limit.

**Parameters:**

- `function`
- `filePath`

### `ins_inject_preload_script`

**Description:** Register a JavaScript snippet that will run on future document loads before page scripts execute. Use this for preload hooks, environment patches, and early instrumentation.

**Parameters:**

- `script`

### `nav_list_frames`

**Description:** Lists all frames (including iframes) in the current page as a tree. Shows frame index, name, and URL. Use nav_select_frame to switch execution context to a specific frame.

### `nav_select_frame`

**Description:** Selects a frame (by index from nav_list_frames) as the execution context for ins_evaluate_script, ins_hook_function, obs_inspect_object, and other tools that run JavaScript in the page.

**Parameters:**

- `frameIdx`

### `obs_get_console_message`

**Description:** Gets a console message by its ID. You can get all messages by calling obs_list_console_messages.

**Parameters:**

- `msgid`

### `obs_list_console_messages`

**Description:** List all console messages for the currently selected page since the last navigation.

**Parameters:**

- `pageSize`
- `pageIdx`
- `types`
- `includePreservedMessages`

### `obs_take_screenshot`

**Description:** Take a screenshot of the page or element.

**Parameters:**

- `format`
- `quality`
- `fullPage`
- `filePath`

## JS Reverse Engineering

### `ins_break_on_xhr`

**Description:** Sets a breakpoint that triggers when an XHR/Fetch request URL contains the specified string.

**Parameters:**

- `url`

### `ins_create_hook`

**Description:** RECOMMENDED: Create hook script for function/fetch/xhr/property/cookie/websocket/eval/timer. Hooks run without pausing page execution and are the preferred approach over breakpoints for monitoring and interception.

**Parameters:**

- `type`
- `params`
- `description`
- `action`

### `ins_evaluate_on_callframe`

**Description:** Evaluates a JavaScript expression in the context of a specific call frame while paused. This allows you to inspect variables and execute code in the paused scope.

**Parameters:**

- `expression`
- `frameIndex`

### `ins_get_paused_info`

**Description:** Gets information about the current paused state including call stack, current location, and scope variables. Use this after a breakpoint is hit to understand the execution context.

**Parameters:**

- `includeScopes`
- `maxScopeDepth`

### `ins_hook_function`

**Description:** RECOMMENDED for reverse engineering: Hooks a JavaScript function to log its calls, arguments, and return values without pausing execution. More reliable than breakpoints for automated workflows. Use this as the default approach for monitoring functions.

**Parameters:**

- `target`
- `logArgs`
- `logResult`
- `logStack`
- `hookId`

### `ins_inject_hook`

**Description:** Inject an existing hook into the current page.

**Parameters:**

- `hookId`

### `ins_inject_stealth`

**Description:** Inject anti-detection stealth scripts to current page.

**Parameters:**

- `preset`

### `ins_list_breakpoints`

**Description:** Lists all active breakpoints in the current debugging session.

### `ins_list_hooks`

**Description:** Lists all active function hooks.

### `ins_list_stealth_features`

**Description:** List available stealth feature toggles.

### `ins_list_stealth_presets`

**Description:** List available stealth presets.

### `ins_pause`

**Description:** Pauses JavaScript execution at the current point. Use this to interrupt running code.

### `ins_remove_breakpoint`

**Description:** Removes a breakpoint by its ID. Use ins_list_breakpoints to see active breakpoints.

**Parameters:**

- `breakpointId`

### `ins_remove_hook`

**Description:** Remove a hook by id.

**Parameters:**

- `hookId`

### `ins_remove_xhr_breakpoint`

**Description:** Removes an XHR/Fetch breakpoint.

**Parameters:**

- `url`

### `ins_resume`

**Description:** Resumes JavaScript execution after being paused at a breakpoint. Execution continues until the next breakpoint or completion.

### `ins_set_breakpoint`

**Description:** Sets a breakpoint in a JavaScript file at the specified line. The breakpoint will trigger when the code executes. NOTE: Prefer ins_hook_function or ins_create_hook for monitoring function calls — breakpoints require ins_pause/ins_resume coordination and are error-prone in automated workflows. Use breakpoints only when you need to inspect local variables inside a function.

**Parameters:**

- `url`
- `lineNumber`
- `columnNumber`
- `condition`
- `isRegex`

### `ins_set_breakpoint_on_text`

**Description:** Sets a breakpoint on specific code (function name, statement, etc.) by searching for it and automatically determining the exact position. Works with both normal and minified files. NOTE: Prefer ins_hook_function for monitoring function calls — it captures args/results without pausing execution. Use this only when you need to inspect local variables at a specific code location.

**Parameters:**

- `text`
- `urlFilter`
- `occurrence`
- `condition`

### `ins_set_user_agent`

**Description:** Set custom user-agent for active page.

**Parameters:**

- `userAgent`

### `ins_step_into`

**Description:** Steps into the next function call. Use this to enter and debug function bodies.

### `ins_step_out`

**Description:** Steps out of the current function, continuing until the function returns. Use this to quickly exit a function.

### `ins_step_over`

**Description:** Steps over to the next statement, treating function calls as a single step. Use this to move through code without entering function bodies.

### `ins_unhook_function`

**Description:** Removes a previously installed function hook.

**Parameters:**

- `hookId`

### `loc_deobfuscate_code`

**Description:** AI-assisted JavaScript deobfuscation.

**Parameters:**

- `code`
- `aggressive`
- `renameVariables`

### `loc_detect_crypto`

**Description:** Detect cryptographic algorithms/libraries from JavaScript source.

**Parameters:**

- `code`
- `useAI`

### `loc_find_in_script`

**Description:** Finds a string in a specific script and returns its exact line/column position with surrounding context. Ideal for setting breakpoints in minified files where the entire code is on one line.

**Parameters:**

- `scriptId`
- `query`
- `contextChars`
- `occurrence`
- `caseSensitive`

### `loc_get_request_initiator`

**Description:** Gets the JavaScript call stack that initiated a network request. This helps trace which code triggered an API call.

**Parameters:**

- `requestId`
- `taskId`
- `taskSlug`
- `targetUrl`
- `goal`

### `loc_get_script_source`

**Description:** Gets the source code of a JavaScript script by its script ID. Supports line range (for normal files) or character offset (for minified single-line files). Use obs_list_scripts first to find the script ID.

**Parameters:**

- `scriptId`
- `startLine`
- `endLine`
- `offset`
- `length`

### `loc_search_in_scripts`

**Description:** Search in collected script cache with regex pattern.

**Parameters:**

- `pattern`
- `limit`
- `maxTotalSize`

### `loc_search_in_sources`

**Description:** Searches for a string or regex pattern in all loaded JavaScript sources. Returns matching lines with script ID, URL, and line number. Use loc_get_script_source with startLine/endLine to view full context around matches.

**Parameters:**

- `query`
- `caseSensitive`
- `isRegex`
- `maxResults`
- `maxLineLength`
- `excludeMinified`
- `urlFilter`

### `loc_summarize_code`

**Description:** Summarize one code file, multiple files, or project-level context.

**Parameters:**

- `mode`
- `code`
- `url`
- `files`

### `loc_trace_function`

**Description:** Traces calls to a function by its name in the source code. Works for ANY function including module-internal functions (webpack/rollup bundled). Uses "logpoints" (conditional breakpoints) to log arguments without pausing execution.

**Parameters:**

- `functionName`
- `urlFilter`
- `logArgs`
- `logThis`
- `pause`
- `traceId`
- `taskId`
- `taskSlug`
- `targetUrl`
- `goal`

### `loc_understand_code`

**Description:** Analyze code structure/business/security with AI + static analysis.

**Parameters:**

- `code`
- `focus`

### `obs_collect_code`

**Description:** Collect JavaScript code from a page with smart modes (summary/priority/incremental/full).

**Parameters:**

- `url`
- `smartMode`
- `returnMode`
- `includeInline`
- `includeExternal`
- `includeDynamic`
- `maxTotalSize`
- `maxFileSize`
- `pattern`
- `limit`
- `topN`

### `obs_get_hook_data`

**Description:** Get captured data for one hook or all hooks. Supports raw view and summary view for noise reduction.

**Parameters:**

- `hookId`
- `view`
- `maxRecords`

### `obs_get_storage`

**Description:** Gets browser storage data including cookies, localStorage, and sessionStorage.

**Parameters:**

- `type`
- `filter`

### `obs_inspect_object`

**Description:** Deeply inspects a JavaScript object, showing its properties, prototype chain, and methods. Useful for understanding object structure.

**Parameters:**

- `expression`
- `depth`
- `showMethods`
- `showPrototype`

### `obs_list_scripts`

**Description:** Lists all JavaScript scripts loaded in the current page. Returns script ID, URL, and source map information. Use this to find scripts before setting breakpoints or searching.

**Parameters:**

- `filter`

### `obs_monitor_events`

**Description:** Monitors DOM events on a specified element or window. Events will be logged to console.

**Parameters:**

- `selector`
- `events`
- `monitorId`
- `taskId`
- `taskSlug`
- `targetUrl`
- `goal`

### `obs_stop_monitor`

**Description:** Stops an event monitor.

**Parameters:**

- `monitorId`

### `rec_export_rebuild_bundle`

**Description:** Export a local Node rebuild bundle from observed reverse-engineering evidence.

**Parameters:**

- `taskId`
- `taskSlug`
- `targetUrl`
- `goal`
- `autoGenerate`
- `targetKeywords`
- `targetUrlPatterns`
- `targetFunctionNames`
- `targetActionDescription`
- `maxEvidenceItems`
- `entryCode`
- `envCode`
- `polyfillsCode`
- `capture`
- `notes`

### `rec_export_session_report`

**Description:** Export current reverse-engineering session as JSON or Markdown.

**Parameters:**

- `format`
- `includeHookData`

### `rec_record_reverse_evidence`

**Description:** Append structured reverse-engineering evidence to a task artifact log.

**Parameters:**

- `taskId`
- `taskSlug`
- `targetUrl`
- `goal`
- `channel`
- `targetKeywords`
- `targetUrlPatterns`
- `targetFunctionNames`
- `targetActionDescription`
- `entry`

### `run_analyze_target`

**Description:** One-shot reverse workflow: collect code, run security/crypto analysis, optional deobfuscation, and hook timeline correlation.

**Parameters:**

- `url`
- `topN`
- `useAI`
- `runDeobfuscation`
- `hookPreset`
- `autoInjectHooks`
- `waitAfterHookMs`
- `correlationWindowMs`
- `maxCorrelatedFlows`
- `maxFingerprints`
- `autoReplayActions`
- `collect`

### `ver_collection_diff`

**Description:** Compare previous and current collected file summaries.

**Parameters:**

- `previous`
- `current`
- `includeUnchanged`

### `ver_diff_env_requirements`

**Description:** Compare local runtime failures with observed browser capabilities and suggest the next environment patches.

**Parameters:**

- `runtimeError`
- `observedCapabilities`

### `ver_risk_panel`

**Description:** Build a combined risk score from analyzer, crypto detector and hook signals.

**Parameters:**

- `code`
- `useAI`
- `includeHookSignals`
- `hookId`
- `topN`

### `wasm_analyze_module`

**Description:** Analyze one Wasm module by session module ID, base64 payload, or artifact path.

**Parameters:**

- `moduleId`
- `base64`
- `artifactPath`
- `includeFunctionSignatures`
- `includeRawSectionMap`
- `includeStringScan`
- `maskSensitiveStrings`
- `maxStringSlots`
- `maxSummaryLines`

### `wasm_collect`

**Description:** Collect Wasm modules from network responses and runtime instantiation hooks.

**Parameters:**

- `url`
- `timeout`
- `waitAfterLoadMs`
- `includeRuntimeEvents`
- `includeImports`
- `includeExports`
- `maxModules`
- `captureBase64`
- `taskId`
- `taskSlug`
- `targetUrl`
- `goal`

### `wasm_decompile`

**Description:** Disassemble a Wasm module to WAT using wabt/wasm2wat and summarize function-level behavior.

**Parameters:**

- `moduleId`
- `base64`
- `artifactPath`
- `maxWatChars`
- `foldExprs`
- `inlineExport`

### `wasm_inspect_exports`

**Description:** Summarize Wasm export usage and likely high-value entry points.

**Parameters:**

- `moduleId`

### `wasm_list_modules`

**Description:** List Wasm modules captured in the current session.

**Parameters:**

- `includeImports`
- `includeExports`

### `wasm_signature_diff`

**Description:** Compare captured JS-Wasm boundary chains to highlight which query/body/header inputs vary like signature material.

**Parameters:**

- `moduleId`
- `exportName`
- `maxChains`

### `wasm_summarize_boundary`

**Description:** Build candidate JS -> memory bridge -> Wasm export -> sink chains for a captured Wasm module.

**Parameters:**

- `moduleId`
- `maxChains`

