function printAbstractCaseGuide() {
  console.log(`Case: 某东 h5st 参数
Category: 参数签名
Status: abstract-case
Runtime: pure-node
Scope: non-runnable

JD h5st Abstract Case (Non-runnable)

This case intentionally does NOT contain executable signing code.
It is a high-density abstract case for reusing the JD \`h5st\` workflow without exposing task-local implementation.

Overview:
- Goal: reconstruct \`h5st\`, verify server acceptance, then extract pure runtime only after \`env-pass\`.
- Repository boundary: keep this file abstract; put executable code only in \`artifacts/tasks/<task-id>/run/\`.
- Read order: \`docs/reference/reverse-bootstrap.md\` -> \`docs/reference/case-safety-policy.md\` -> \`docs/reference/reverse-workflow.md\` -> optional \`docs/reference/pure-extraction.md\`.

Target Contract:
- api_host_b64: \`aHR0cHM6Ly9hcGkubS5qZC5jb20vYXBp\`
- target field: \`h5st\`
- common companion fields:
  \`appid\`, \`functionId\`, \`body\`, \`client\`, \`clientVersion\`, \`t\`, \`_stk\`, \`_ste\`, \`x-api-eid-token\`
- likely request style:
  signed query/body parameters sent to mobile API host
- note:
  decode Base64 before use; keep real request values task-local

Success Signals:
- one browser-observed request is confirmed carrying \`h5st\`
- one stable initiator chain is confirmed from request back to signer entry
- one local signer API generates non-empty \`h5st\`
- one generated request passes server verification
- if pure extraction is attempted, one fixed fixture is recorded and reusable

Fast Repro Path:
- first find one request with \`functionId\` + \`body\` + \`h5st\`
- then trace request initiator back to signer wrapper
- then hook signer entry and request send path together
- then confirm \`_stk\` ordering and \`x-api-eid-token\` behavior before rebuilding

Search Keywords:
- field keywords:
  \`h5st\`, \`_stk\`, \`_ste\`, \`x-api-eid-token\`
- likely signer keywords:
  \`ParamsSignMain\`, \`sign\`, \`genH5st\`, \`defaultToken\`, \`fingerprint\`, \`canvas\`, \`Date\`
- request-shape keywords:
  \`functionId\`, \`body\`, \`appid\`, \`clientVersion\`

Hook Points:
- signer entry function
- request builder before final payload join
- \`fetch\`
- \`XMLHttpRequest.prototype.open\`
- \`XMLHttpRequest.prototype.send\`
- optional: body canonicalization helper or field-order helper

Breakpoint Hints:
- set breakpoint where string \`h5st\` is finally attached to request params
- set breakpoint near \`_stk\` ordering logic
- set breakpoint on signer wrapper call site such as \`ParamsSignMain.sign(...)\`
- if multiple wrappers exist, prefer the one whose caller is nearest the target request builder

Watch Variables:
- request payload before sign
- canonical field order used for sign input
- final joined string before \`h5st\` output
- route metadata such as \`functionId\` and \`appid\`
- time source / timestamp input
- token-like intermediate values
- route-specific \`x-api-eid-token\` behavior

Branch Markers:
- whether \`_stk\` is static or rebuilt per route
- whether \`_ste\` is fixed, derived, or branch-controlled
- whether \`x-api-eid-token\` should be empty for the current route
- whether token source is remote, cached, or generated locally

Field Shape Checklist:
- confirm whether \`h5st\` is final joined text rather than JSON field object
- confirm segment count and segment ordering
- confirm whether \`_stk\` ordering directly constrains the final signer input
- confirm whether \`_ste\` is fixed, derived, or branch-controlled
- confirm whether \`x-api-eid-token\` is required, optional, or should stay empty for the target route

Observe Phase:
1) Find the target request:
   - First use: \`obs_list_network_requests\`
   - Then use: \`obs_get_network_request\`
   - Collect:
     one successful request carrying \`h5st\` and companion fields.
   - Must answer:
     which endpoint consumes \`h5st\`, where the field is written, what the passing response looks like.
   - Output:
     one stable request contract and one baseline browser sample.

2) Confirm initiator chain:
   - First use: \`loc_get_request_initiator\`
   - Then use: \`obs_list_scripts\`, \`loc_get_script_source\`, \`loc_search_in_sources\`
   - Collect:
     business caller, request builder, signer wrapper, signer module URL, function names.
   - Expected chain example:
     business request builder -> wrapper -> \`ParamsSignMain.sign(...)\` or equivalent signer entry.
   - Output:
     one stable caller stack and one candidate signer boundary.

3) Confirm write point:
   - First use: \`ins_hook_function\` / \`ins_create_hook\`
   - Collect:
     where \`h5st\` is attached,
     whether final payload is assembled before sign or sign after canonicalization,
     whether signer returns whole query fragment or only one field.
   - Output:
     one confirmed write point and one confirmed field placement.

Capture Phase:
4) Capture signer input/output boundary:
   - Collect:
     signer arguments,
     canonical field ordering,
     body serialization style,
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
     request sample, initiator, signer entry, field ordering logic, seed schema, first divergence notes.
   - Output:
     one durable timeline for rebuild and drift recovery.

Seed Schema Checklist:
- cookie keys involved, if any
- localStorage/sessionStorage keys involved, if any
- time source and allowed drift window
- random source or token source
- fingerprint branches such as canvas / navigator / crypto
- route-specific behavior of \`x-api-eid-token\`
- only record shape and dependency class here; keep true values task-local

Rebuild Boundary:
6) Start local pure-Node rebuild:
   - Build minimal host in \`artifacts/tasks/<task-id>/run/\`
   - Start with:
     \`window/document/navigator/location/storage/canvas/crypto/Date\`
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
     missing browser primitives, crypto/date helpers, canvas or storage reads.
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
- do not fill the whole \`navigator\` because one property is missing
- do not start from Python host before Node rebuild passes
- do not guess cookie/storage/time source without page evidence
- do not patch multiple unrelated objects before recording current \`first divergence\`
- do not treat \`env rebuild\` success as pure algorithm completion

Local API Contract:
8) Extract local callable surface:
   - Goal surface:
     \`genH5st(input)\` or equivalent signer function.
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
     one entry such as \`genH5st(input)\`.
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
      whether route-specific gates still pass.
    - Must record:
      which endpoint passed,
      which endpoint still failed,
      whether failure is signer-side or request-contract-side.
    - Output:
      one pass/fail conclusion for generated \`h5st\`.

Failure Triage:
- empty signer output:
  check signer boundary and missing token/time source first
- non-empty but server rejects:
  check route contract, \`_stk\` order, \`x-api-eid-token\`, and body canonicalization
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
- preserve exact canonical field ordering before trying to simplify code
- preserve time/random controls in explicit runtimeContext
- isolate token/default-value generation from final join logic
- do not hide route configuration inside module globals
- keep constants boundary explicit so later drift can be localized

Fixture Contract:
12) Cross-runtime fixture alignment:
    - Build:
      one fixed fixture input,
      one fixed runtimeContext,
      one fixed expected signer output.
    - Fixture should preserve:
      functionId/route context,
      canonicalized body shape,
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
      route-specific \`x-api-eid-token\` behavior,
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
- Browser-side evidence includes at least one signed request carrying \`h5st\`.
- One initiator chain is confirmed from request back to signer entry.
- One local signer API can generate non-empty \`h5st\`.
- One generated request matches expected field contract and passes server verification.
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

printAbstractCaseGuide();
