/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Central parameter documentation. `defineTool` injects these into schema
 * fields that do not already have a description, so parameter docs stay in one
 * place while explicit schema descriptions still win.
 */
export const TOOL_PARAM_DOCS: Record<string, Record<string, string>> = {
  ins_breakpoint: {
    action:
      'set: line breakpoint by script URL; set_text: locate code text and break there; remove: remove by id; list: list active breakpoints.',
  },
  ins_debug_control: {
    action:
      'pause: pause execution; resume: continue; step_over/step_into/step_out: step the debugger.',
  },
  ins_hook: {
    action:
      'function: hook a JS function and log calls; create: build a declarative hook; list: show active hooks; remove: remove one; inject: inject an existing hook script.',
  },
  ins_signer: {
    action:
      'register: store a signer expression; list: show registered signers; remove: delete one; sign: call it with a payload.',
  },
  ins_stealth: {
    action:
      'inject: apply stealth scripts; presets: list presets; features: list feature toggles; set_user_agent: set the page UA.',
    preset: 'Stealth preset to apply; selects the spoofed platform profile.',
    userAgent: 'User-Agent string to apply (required for action=set_user_agent).',
  },
  ins_xhr_breakpoint: {
    action: 'set: add an XHR/Fetch breakpoint; remove: remove it.',
  },
  loc_analyze_code: {
    action:
      'deobfuscate: clean obfuscated code; understand: structure/business/security analysis; summarize: summarize files or a project; crypto: detect crypto primitives; risk: combined risk score.',
    code: 'Source code to analyze (required for deobfuscate/understand/crypto).',
    url: 'Source URL label used by summarize when no file list is provided.',
    files: 'Files to summarize (action=summarize with mode=batch or project).',
    focus:
      'Analysis focus for action=understand: all, structure, business, or security.',
    aggressive: 'For deobfuscate: enable aggressive transformations.',
    renameVariables: 'For deobfuscate: rename variables to readable names.',
    includeHookSignals: 'For risk: include hook record counts in scoring (default true).',
    hookId: 'For risk: restrict hook signals to this hook id.',
    topN: 'For risk: number of collected files to use when code is omitted (default 5).',
  },
  nav_click_element: {
    selector: 'CSS selector of the element to click.',
  },
  nav_frame: {
    action: 'list: list frames; select: switch execution context to frameIdx.',
  },
  nav_page: {
    action:
      'list: list open pages; select: select a page by pageIdx; new: open a new page at url.',
  },
  nav_type_text: {
    selector: 'CSS selector of the input element.',
    text: 'Text to type.',
    delay: 'Delay in milliseconds between keystrokes.',
  },
  nav_wait_for_element: {
    selector: 'CSS selector to wait for.',
    timeout: 'Maximum wait time in milliseconds.',
  },
  obs_collect_code: {
    url: 'Page URL to collect scripts from.',
    smartMode:
      'summary: metadata only; priority: targeted files; incremental: diff since last run; full: all content.',
    returnMode:
      'full: complete content; summary: metadata; pattern: URL-filtered; top-priority: highest-signal files.',
    includeInline: 'Include inline scripts.',
    includeExternal: 'Include external scripts.',
    includeDynamic: 'Include dynamically loaded scripts.',
    maxTotalSize: 'Maximum total response size in bytes.',
    maxFileSize: 'Maximum size per file in bytes.',
    pattern: 'URL regex used with returnMode=pattern.',
    limit: 'Maximum number of files returned.',
    topN: 'Number of top-priority files returned with returnMode=top-priority.',
  },
  obs_get_dom_structure: {
    maxDepth: 'Maximum tree depth to traverse (default 3).',
    includeText: 'Include text content of leaf elements.',
  },
  obs_get_hook_data: {
    hookId: 'Hook id to read; omit to read all hooks.',
    view: 'raw: full records; summary: aggregated counts and samples.',
    maxRecords: 'Maximum records per hook in summary view.',
  },
  obs_list_collected_scripts: {
    limit: 'Maximum number of scripts returned (default 20).',
    maxTotalSize: 'Maximum total size of returned script content in bytes.',
  },
  obs_monitor_events: {
    action: 'start: begin monitoring a target; stop: stop the monitor by id.',
  },
  obs_query_dom: {
    selector: 'CSS selector to query.',
    all: 'Return all matches instead of the first one.',
    limit: 'Maximum number of elements when all=true (default 50).',
  },
  rec_export_rebuild_bundle: {
    taskId: 'Reverse task id used for the artifact directory.',
    taskSlug: 'Human-readable task slug.',
    targetUrl: 'Target page URL associated with the task.',
    goal: 'Reverse-engineering goal for the artifact.',
    autoGenerate: 'Auto-generate entry/env/polyfill code from captured evidence.',
    targetKeywords: 'Keywords used when auto-selecting evidence.',
    targetUrlPatterns: 'URL patterns used when auto-selecting evidence.',
    targetFunctionNames: 'Function names used when auto-selecting evidence.',
    targetActionDescription: 'Description of the triggering action.',
    maxEvidenceItems: 'Maximum evidence items included in the bundle.',
    entryCode: 'Explicit entry script override.',
    envCode: 'Explicit environment code override.',
    polyfillsCode: 'Explicit polyfills override.',
    capture: 'Captured runtime data (cookies/storage/page) to bundle.',
    notes: 'Extra notes written into the bundle.',
  },
  rec_export_session_report: {
    format: 'Output format: json or markdown.',
    includeHookData: 'Include captured hook records in the report.',
  },
  rec_record_reverse_evidence: {
    taskId: 'Reverse task id.',
    taskSlug: 'Human-readable task slug.',
    targetUrl: 'Target page URL.',
    goal: 'Reverse-engineering goal.',
    channel: 'Log channel name (e.g. runtime-evidence, network, scripts).',
    targetKeywords: 'Target keywords to persist as task context.',
    targetUrlPatterns: 'Target URL patterns to persist as task context.',
    targetFunctionNames: 'Target function names to persist as task context.',
    targetActionDescription: 'Description of the target action.',
    entry: 'Structured evidence entry to append.',
  },
  rec_session_state: {
    action:
      'save: snapshot current cookies/storage; restore: apply a snapshot; list: list snapshots; delete: remove one; dump: export to JSON; load: import from JSON.',
    sessionId: 'Snapshot id (generated on save when omitted).',
    includeCookies: 'Include cookies in the snapshot (default true).',
    includeLocalStorage: 'Include localStorage (default true).',
    includeSessionStorage: 'Include sessionStorage (default true).',
    navigateToSavedUrl: 'Navigate to the saved URL before restoring (default true).',
    clearStorageBeforeRestore: 'Clear current cookies/storage before restoring.',
    path: 'File path for dump/load.',
    pretty: 'Pretty-print JSON output.',
    encrypt: 'Encrypt the dumped snapshot.',
    snapshotJson: 'Inline snapshot JSON for load.',
    overwrite: 'Overwrite an existing snapshot with the same id.',
  },
  rec_task_context: {
    action: 'set: set the active task; get: read it; clear: unset it.',
  },
  run_analyze_target: {
    url: 'Target page URL.',
    topN: 'Number of top-priority files used for analysis.',
    runDeobfuscation: 'Run the deobfuscation pipeline on selected files.',
    hookPreset: 'Hook preset: none, api-signature, or network-core.',
    autoInjectHooks: 'Inject the selected hook preset automatically.',
    waitAfterHookMs: 'Wait time after hook injection before collecting.',
    correlationWindowMs: 'Time window for correlating hooks with requests.',
    maxCorrelatedFlows: 'Maximum correlated request flows to return.',
    maxFingerprints: 'Maximum request fingerprints to return.',
    autoReplayActions: 'Actions replayed before sampling (click/type/navigate...).',
    collect: 'Collector options for the initial collection.',
  },
  run_export_request: {
    format: 'Snippet format: curl, node-fetch, or node-axios.',
  },
  ver_collection_diff: {
    previous: 'Previous collection summary.',
    current: 'Current collection summary (defaults to the live cache).',
    includeUnchanged: 'Include files that did not change.',
  },
  ver_diff_env_requirements: {
    runtimeError: 'Local runtime error to analyze.',
    observedCapabilities: 'Capabilities observed in the browser.',
  },
  wasm_analyze_module: {
    moduleId: 'Wasm module id from wasm_list_modules.',
    base64: 'Base64 Wasm payload (alternative to moduleId).',
    artifactPath: 'Path to a Wasm file (alternative to moduleId).',
    includeFunctionSignatures: 'Include function type signatures.',
    includeRawSectionMap: 'Include the raw section map.',
    includeStringScan: 'Scan data sections for strings.',
    maskSensitiveStrings: 'Mask sensitive strings in the output.',
    maxStringSlots: 'Maximum string slots to scan.',
    maxSummaryLines: 'Maximum summary lines to return.',
  },
  wasm_collect: {
    url: 'Page URL to collect Wasm from.',
    timeout: 'Collection timeout in milliseconds.',
    waitAfterLoadMs: 'Wait after load before collecting.',
    includeRuntimeEvents: 'Include runtime instantiation events.',
    includeImports: 'Include import names.',
    includeExports: 'Include export names.',
    maxModules: 'Maximum modules to keep.',
    captureBase64: 'Capture the full module as base64.',
    taskId: 'Reverse task id.',
    taskSlug: 'Human-readable task slug.',
    targetUrl: 'Target page URL.',
    goal: 'Reverse-engineering goal.',
  },
  wasm_decompile: {
    moduleId: 'Wasm module id.',
    base64: 'Base64 Wasm payload (alternative to moduleId).',
    artifactPath: 'Path to a Wasm file.',
    maxWatChars: 'Maximum WAT characters returned.',
    foldExprs: 'Fold expressions in the WAT output.',
    inlineExport: 'Inline export annotations.',
  },
  wasm_inspect_exports: {
    moduleId: 'Wasm module id.',
  },
  wasm_list_modules: {
    includeImports: 'Include import names.',
    includeExports: 'Include export names.',
  },
  wasm_signature_diff: {
    moduleId: 'Wasm module id.',
    exportName: 'Restrict the comparison to one export name.',
    maxChains: 'Maximum boundary chains to return.',
  },
  wasm_summarize_boundary: {
    moduleId: 'Wasm module id.',
    maxChains: 'Maximum chains to return.',
  },
};
