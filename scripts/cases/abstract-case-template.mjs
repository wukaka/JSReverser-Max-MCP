function printAbstractCaseTemplate() {
  console.log(`Case: <站点 / 参数名>
Category: <参数签名|风控参数|设备指纹|工作流>
Status: abstract-case
Runtime: pure-node
Scope: non-runnable

<Abstract Case Name> (Non-runnable)

This case intentionally does NOT contain executable code.
It is a high-density abstract template for writing reusable repository-safe reverse cases.

Overview:
- Goal: <一句话说明要复现什么，以及是否需要 pure extraction / Python port>
- Repository boundary: keep this file abstract; put executable code only in \`artifacts/tasks/<task-id>/run/\`.
- Read order: \`docs/reference/reverse-bootstrap.md\` -> \`docs/reference/case-safety-policy.md\` -> \`docs/reference/reverse-workflow.md\` -> optional \`docs/reference/pure-extraction.md\`.

Target Contract:
- entry_url_b64 or api_host_b64: \`<base64>\`
- target field: \`<field_name>\`
- common companion fields:
  \`<field_a>\`, \`<field_b>\`, \`<field_c>\`
- likely request style:
  <query/body/header + target endpoint pattern>
- note:
  decode Base64 before use; keep real request values task-local

Success Signals:
- one browser-observed request is confirmed carrying \`<field_name>\`
- one stable initiator chain is confirmed from request back to signer / writer entry
- one local signer API generates non-empty target value
- one generated request passes server verification
- if pure extraction is attempted, one fixed fixture is recorded and reusable

Fast Repro Path:
- first find <目标请求>
- then trace initiator back to <wrapper/signer/runtime>
- then hook <write-point / signer boundary / send path>
- then rebuild only enough host to make the path run

Search Keywords:
- field keywords:
  \`<field_name>\`, \`<companion_field>\`
- likely signer/runtime keywords:
  \`<function_name>\`, \`<bundle_name>\`, \`<helper_name>\`
- endpoint or route keywords:
  \`<url_fragment>\`, \`<functionId>\`

Hook Points:
- <recommended hook 1>
- <recommended hook 2>
- <recommended hook 3>
- <recommended hook 4>

Breakpoint Hints:
- set breakpoint where \`<field_name>\` is finally written into request
- set breakpoint on candidate signer wrapper call site such as \`<wrapper_call_text>\`
- if multiple wrappers exist, prefer the one nearest the target request builder
- if request-level tracing is noisy, break on target URL fragment first and walk upward

Watch Variables:
- <payload before sign>
- <canonical order / normalization result>
- <critical intermediate value>
- <final field value>
- <route metadata / functionId / appid>
- <time/random/token source>

Branch Markers:
- whether <field/order/route flag> controls signer branch
- whether <token/source/config> is fixed, derived, remote, or cached
- whether write happens before send or during send
- whether host modeling changes code path

Observe Phase:
1) Find the target request:
   - First use: \`obs_list_network_requests\`
   - Then use: \`obs_get_network_request\`
   - Collect:
     one successful request carrying \`<field_name>\` and companion fields.
   - Must answer:
     which endpoint consumes the field, where it is written, what the passing response looks like.
   - Output:
     one stable request contract and one baseline browser sample.

2) Confirm initiator chain:
   - First use: \`loc_get_request_initiator\`
   - Then use: \`obs_list_scripts\`, \`loc_get_script_source\`, \`loc_search_in_sources\`
   - Collect:
     business caller, request builder, signer wrapper, runtime module URL, function names.
   - Output:
     one stable caller stack and one candidate signer boundary.

3) Confirm write point:
   - First use: \`ins_hook_function\` / \`ins_create_hook\`
   - Collect:
     where \`<field_name>\` is attached,
     whether payload is assembled before sign or sign after canonicalization,
     whether signer returns a whole query fragment or only one field.
   - Output:
     one confirmed write point and one confirmed field placement.

Capture Phase:
4) Capture signer input/output boundary:
   - Collect:
     signer arguments,
     canonical field ordering,
     body/query/header serialization style,
     time input,
     token dependency,
     any intermediate string/buffer before final join.
   - Must separate:
     business payload fields vs signer-only fields vs environment-derived seeds.
   - Output:
     one reusable input/output sample around signer boundary.

5) Record evidence:
   - First use: \`rec_record_reverse_evidence\`
   - Record:
     request sample, initiator, signer entry, seed schema, first divergence notes.
   - Output:
     one durable timeline for rebuild and drift recovery.

Seed Schema Checklist:
- cookie keys involved, if any
- localStorage/sessionStorage keys involved, if any
- time source and allowed drift window
- random source or token source
- fingerprint branches such as canvas / navigator / crypto
- route-specific behavior of companion auth fields
- only record dependency class here; keep true values task-local

Rebuild Boundary:
6) Start local pure-Node rebuild:
   - Build minimal host in \`artifacts/tasks/<task-id>/run/\`
   - Start with:
     \`<window/document/navigator/location/storage/...>\`
   - Do not guess the whole browser.
   - Keep separate:
     environment shim,
     signer runtime,
     verification scripts,
     trace scripts,
     evidence files.
   - Output:
     one local harness that can start the signer module.

7) Use proxy env logs to patch gaps:
   - First use: local proxy diagnostics
   - Observe:
     first missing env path, host getter crash, missing function shell, or bridge mismatch.
   - Patch rule:
     one first divergence per loop,
     one patch decision per loop,
     one minimal causal unit per loop.
   - Minimal causal unit can be:
     one value,
     one function shell,
     one returned object,
     one minimal object contract.
   - Output:
     one first divergence note per patch iteration.

Negative Patterns During Patch:
- do not simulate the whole browser because one property is missing
- do not jump to Python host before Node rebuild passes
- do not guess cookie/storage/time source without page evidence
- do not patch multiple unrelated objects before recording current \`first divergence\`
- do not treat \`env rebuild\` success as pure algorithm completion

Local API Contract:
8) Extract local callable surface:
   - Goal surface:
     \`<genSign(...)>\` or equivalent signer function.
   - Explicit input contract should answer:
     what request fields are required,
     what route metadata is required,
     what runtimeContext is required,
     what seeds are still environment-side.
   - Explicit output contract should answer:
     final string shape,
     field ordering dependency,
     token dependency,
     route-specific toggles.
   - Output:
     one callable local signer API.

Portable Runtime Gate:
9) Export a portable runtime:
   - Goal file:
     \`run/exported-runtime.js\` or equivalent runtime entry.
   - Goal constraints:
     inline required capture and signer scripts,
     no external file reads at call time,
     one entry such as \`<genSign(input)>\`.
   - Portable runtime is allowed to retain small version-bound constants,
     but must not still depend on full page scheduler.
   - Output:
     one task-local callable runtime and one minimal smoke test.

Server Acceptance:
10) Verify server-side acceptance:
    - Compare:
      no-sign / fake-sign / captured-valid-sign / generated-sign.
    - Verify:
      HTTP status,
      business status code,
      response body preview,
      expected schema keys,
      route-specific acceptance signals.
    - Must record:
      which endpoint passed,
      which endpoint still failed,
      whether failure is signer-side or request-contract-side.
    - Output:
      one pass/fail conclusion for generated field.

Failure Triage:
- empty signer output:
  check signer boundary and missing token/time source first
- non-empty but server rejects:
  check route contract, canonical order, auth companion fields, and serialization
- shape mismatch:
  check final join and intermediate segment assembly
- browser and local differ early:
  go back to current \`first divergence\`, not directly to Python port

Pure Extraction Gate:
11) Pure algorithm extraction (only after pass):
    - Preconditions:
      local rebuild runs,
      one generated request already passes server verification,
      portable runtime is callable.
    - Goal:
      extract a readable pure runtime without full browser host
      and without depending on original page scheduler.
    - Collect:
      explicit request input contract,
      runtimeContext knobs such as time/random controls,
      constants boundary,
      intermediate buffers or tokens needed for cross-check.
    - Must separate:
      what is true algorithm,
      what is route configuration,
      what is environment glue,
      what is drift-prone remote dependency.
    - Output:
      one task-local \`run/pure-*.js\`
      and, if needed, one task-local \`run/pure_*.py\`.

Pure Algorithm Key Points:
- preserve exact canonical ordering / normalization before simplifying code
- make time/random controls explicit in runtimeContext
- isolate token/default-value generation from final join logic
- do not hide route configuration inside module globals
- keep constants boundary explicit so later drift can be localized quickly

Fixture Contract:
12) Cross-runtime fixture alignment:
    - Build:
      one fixed fixture input,
      one fixed runtimeContext,
      one fixed expected signer output.
    - Fixture should preserve:
      route context,
      canonicalized payload shape,
      time/random controls,
      any seed class still required by signer.
    - Verify:
      Node pure runtime,
      Python pure runtime,
      and portable-runtime result stay aligned.
    - Write back:
      fixture result,
      pure algorithm status,
      server acceptance,
      and drift boundary into task artifact \`report.md\`.

Port Order:
13) Python port order:
    - Preferred order:
      browser evidence -> local rebuild -> portable runtime -> Node pure -> Python pure.
    - Do not:
      jump from browser scripts straight to Python pure.
    - Python version should consume explicit inputs,
      not hidden baseline files or implicit process-local state.
    - Output:
      one explicit port boundary and one reusable fixture source.

Drift Watchlist:
14) Drift recovery:
    - When scripts drift, rerun:
      request discovery -> initiator -> signer hook -> source correlation -> local patch.
    - Watch:
      signer module URL,
      function names,
      field order contract,
      token dependency,
      route-specific companion field behavior,
      fixed fixture output,
      server acceptance.

Task-local Deliverables:
- \`task.json\`
- \`runtime-evidence.jsonl\`
- \`network.jsonl\`
- \`scripts.jsonl\`
- \`run/README.md\`
- local rebuild entry under \`run/\`
- verification entry under \`run/verify/\`
- trace entry under \`run/trace/\`
- portable runtime under \`run/core/\` or equivalent
- if pure extraction is reached: fixture file + \`run/pure-*.js\`
- if Python port is reached: task-local \`run/pure_*.py\` or equivalent port entry

Acceptance Criteria:
- Browser-side evidence includes at least one request carrying target field.
- One initiator chain is confirmed from request back to signer / writer entry.
- One local signer API can generate non-empty target value.
- One generated request matches expected contract and passes server verification.
- If pure extraction is attempted, one fixed fixture is recorded and reusable.
- If Python port exists, Python output aligns with Node pure or the difference is explicitly explained.
- One first divergence note exists for each failed rebuild iteration.

Repository Boundary:
- Keep this file abstract and non-runnable.
- Put executable experiments only in \`artifacts/tasks/<task-id>/run/\`.
- Do not store raw production cookie/token/storage bundles or reusable signer code here.

References:
- scripts/cases/mcp-reverse-pure-node-workflow.mjs
- docs/reference/reverse-bootstrap.md
- docs/reference/reverse-workflow.md
- docs/reference/pure-extraction.md
- docs/reference/tool-reference.md
- docs/reference/case-safety-policy.md
`);
}

printAbstractCaseTemplate();
