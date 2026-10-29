function printAbstractCaseGuide() {
  console.log(`Case: 某音 a-bogus 参数
Category: 参数签名
Status: abstract-case
Runtime: pure-node
Scope: non-runnable

Douyin a_bogus Abstract Case (Non-runnable)

This case intentionally does NOT contain executable signing code.
It is a high-density abstract case for reusing the Douyin \`a_bogus\` workflow without exposing task-local implementation.

Overview:
- Goal: reconstruct \`a_bogus\`, verify the target resource-list request, then extract pure runtime only after \`env-pass\`.
- Repository boundary: keep this file abstract; put executable code only in \`artifacts/tasks/<task-id>/run/\`.
- Read order: \`docs/reference/reverse-bootstrap.md\` -> \`docs/reference/case-safety-policy.md\` -> \`docs/reference/reverse-workflow.md\` -> optional \`docs/reference/pure-extraction.md\`.

Target Contract:
- entry_url_b64: \`aHR0cHM6Ly93d3cuZG91eWluLmNvbS9zZWFyY2gvMQ==\`
- api: \`GET /aweme/v1/web/solution/resource/list/\`
- target field: \`a_bogus\`
- common companion fields:
  \`spot_keys\`, \`app_id\`, \`version_code\`, \`webid\`, \`msToken\`, route query fields
- note:
  decode Base64 before use; keep real request values task-local

Success Signals:
- one browser-observed request is confirmed carrying \`a_bogus\`
- one stable initiator chain is confirmed from business request back to security scripts
- one local signer API generates non-empty \`a_bogus\`
- one generated request returns \`HTTP 200\` and \`status_code=0\`
- if pure extraction is attempted, one fixed fixture is recorded and reusable

Fast Repro Path:
- first find one successful resource-list request with \`a_bogus\`
- then trace initiator back through runtime loader and security bundle
- then hook query write point and send path together
- then rebuild only enough host to let send-time patch path run

Search Keywords:
- field keywords:
  \`a_bogus\`, \`msToken\`, \`webid\`, \`resource/list\`
- likely script keywords:
  \`bdms\`, \`secsdk\`, \`sdk-glue\`, \`runtime\`
- write-point keywords:
  \`URLSearchParams.append\`, \`append('a_bogus'\`, \`set('a_bogus'\`

Hook Points:
- \`URLSearchParams.prototype.append\`
- \`URLSearchParams.prototype.set\`
- \`XMLHttpRequest.prototype.open\`
- \`XMLHttpRequest.prototype.send\`
- send-time patch helper inside security bundle

Breakpoint Hints:
- set breakpoint where string \`a_bogus\` is appended to query params
- set breakpoint near send-time patch path in \`bdms.js\`
- if multiple bundles exist, prefer the one reached from the resource-list initiator chain
- if write-point search is noisy, break on request URL fragment of resource-list endpoint first

Watch Variables:
- path + query before security patch
- final query after \`a_bogus\` append
- script loader order
- runtimeContext values such as time/random controls if exposed
- send-time helper inputs

Branch Markers:
- whether write happens before send or during send
- whether \`msToken\` and \`webid\` are consumed directly or via wrapper
- whether path/query normalization occurs before signer call
- whether host/location modeling changes code path

Observe Phase:
1) Find the target request:
   - First use: \`obs_list_network_requests\`
   - Then use: \`obs_get_network_request\`
   - Collect:
     one successful request carrying \`a_bogus\` and companion fields.
   - Output:
     one baseline browser sample with \`status_code=0\`.

2) Confirm initiator chain:
   - First use: \`loc_get_request_initiator\`
   - Then use: \`obs_list_scripts\`, \`loc_get_script_source\`
   - Collect:
     business entry, runtime wrapper, security script URLs.
   - Expected chain example:
     business entry -> runtime.js -> sdk-glue.js -> secsdk-lastest.umd.js -> bdms.js.
   - Output:
     one stable caller stack for the resource-list request.

3) Capture the write point of \`a_bogus\`:
   - First use: \`ins_hook_function\` / \`ins_create_hook\`
   - Collect:
     stack frame when \`a_bogus\` is written,
     whether it is appended before send or during send.
   - Expected write point:
     \`URLSearchParams.append('a_bogus', value)\` or equivalent send-time mutation.

Capture Phase:
4) Confirm source correlation:
   - First use: \`loc_search_in_sources\`
   - Then use: \`loc_get_script_source\`, \`obs_collect_code\`
   - Collect:
     exact source file or bundle segment containing the write chain.
   - Expected result:
     \`bdms.js\`-side send patch reachable from security loader.
   - Output:
     one local rebuild chain description:
     business request -> security loader -> bdms send-time patch.

5) Record evidence:
   - First use: \`rec_record_reverse_evidence\`
   - Record:
     target request sample, initiator, write point, script URLs, first divergence notes.
   - Output:
     one durable timeline for rebuild and drift recovery.

Seed Schema Checklist:
- route query fields consumed before sign
- \`msToken\` presence and source class
- \`webid\` presence and source class
- time/random controls if visible in runtime
- location/history/screen dependencies
- only record dependency class here; keep real values task-local

Rebuild Boundary:
6) Start local pure-Node rebuild:
   - Build minimal host in \`artifacts/tasks/<task-id>/run/\`
   - Start with:
     \`window/document/navigator/location/history/screen/storage/crypto/fetch/XMLHttpRequest\`
   - Do not guess the whole browser.
   - Output:
     one local harness that can start \`sdk-glue\` and \`bdms\`.

7) Use proxy env logs to patch gaps:
   - First use: local proxy diagnostics
   - Observe:
     first missing env path, host getter crash, or missing function shell.
   - Patch rule:
     one first divergence per loop,
     one patch decision per loop,
     one minimal causal unit per loop.
   - Important lesson:
     do not proxy-wrap brand-sensitive native objects like \`URL\` directly.
     If \`location\` is modeled as \`Proxy(URL)\`, reads like
     \`location.href\` / \`location.toJSON()\` may crash with native brand checks.
   - Output:
     one first divergence note per patch iteration.

Negative Patterns During Patch:
- do not start by simulating the whole browser
- do not model \`location\` as direct \`Proxy(URL)\` if native brand checks are in play
- do not jump to pure extraction before send-time patch path fully runs
- do not trust field names alone without request correlation

Local API Contract:
8) Extract local API:
   - Goal surface:
     \`genABogus(pathQuery)\`
   - Optional debug surface:
     final URL, XHR log, env log.
   - Explicit input contract should answer:
     pathQuery shape,
     route metadata,
     runtimeContext controls,
     environment-derived seed classes.
   - Output:
     one callable local signer API.

Portable Runtime Gate:
9) Export a portable runtime:
   - Goal file:
     \`run/exported-runtime.js\`
   - Goal constraints:
     inline capture + security scripts,
     no external file reads,
     one entry: \`await globalThis.genABogus(pathQuery)\`.
   - Output:
     one task-local callable runtime and one minimal smoke test.

Server Acceptance:
10) Verify server-side acceptance:
    - Compare:
      no-sign / captured-valid-sign / generated-sign.
    - Verify:
      \`HTTP 200\`, \`status_code=0\`, expected response keys.
    - Must record:
      whether failure is network, route contract, or signer-side.
    - Output:
      one pass/fail conclusion for generated \`a_bogus\`.

Failure Triage:
- append hook never fires:
  go back to initiator chain and loader order
- append fires but request still fails:
  compare normalized query and final send-time mutation
- host errors appear early:
  inspect current \`first divergence\` and native brand-check issues first
- pure runtime diverges from browser:
  compare pathQuery normalization and send-time helper boundary first

Pure Extraction Gate:
11) Pure algorithm extraction (only after pass):
    - Preconditions:
      local rebuild runs,
      one generated request already passes server verification,
      exported runtime is callable.
    - Goal:
      extract a readable pure runtime without \`vm\`
      and without reloading original security scripts.
    - Collect:
      deterministic \`pathQuery\` contract,
      runtimeContext knobs such as time/random controls,
      constants boundary,
      intermediate buffers needed for cross-check.
    - Output:
      one task-local \`run/pure-*.js\`
      and, if needed, one task-local \`run/pure_*.py\`.

Pure Algorithm Key Points:
- preserve exact pathQuery normalization before simplifying logic
- make time/random controls explicit in runtimeContext
- isolate send-time helper logic from loader/runtime glue
- keep constants boundary explicit so drift can be localized quickly
- do not hide route-specific toggles inside outer module state

Fixture Contract:
12) Cross-runtime fixture alignment:
    - Build:
      one fixed fixture input,
      one fixed runtimeContext,
      one fixed expected signer output.
    - Verify:
      Node pure runtime,
      Python pure runtime,
      and browser-observed / portable-runtime result stay aligned.
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
    - Output:
      one explicit port boundary and one reusable fixture source.

Drift Watchlist:
14) Drift recovery:
    - When scripts drift, rerun:
      request discovery -> initiator -> write-point hook -> source correlation -> local patch.
    - Watch files:
      \`sdk-glue.js\`, \`secsdk-lastest.umd.js\`, \`bdms.js\`.

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
- Browser-side evidence includes at least one \`a_bogus\` append event with stack.
- One initiator chain is confirmed from request back to security scripts.
- Local Node harness can make the send-time patch path run.
- Exported local API can generate non-empty \`a_bogus\`.
- If pure extraction is attempted, one fixed fixture is recorded and reusable.
- One generated request returns \`HTTP 200\` and \`status_code=0\`.

Repository boundary:
- Keep this file abstract and non-runnable.
- Put executable experiments only in \`artifacts/tasks/<task-id>/run/\`.
- Do not store raw production cookie bundles or reusable production signer code here.

References:
- scripts/cases/mcp-reverse-pure-node-workflow.mjs
- docs/reference/reverse-bootstrap.md
- docs/reference/reverse-workflow.md
- docs/reference/pure-extraction.md
- docs/reference/env-patching.md
- docs/reference/tool-reference.md
- docs/reference/case-safety-policy.md
`);
}

printAbstractCaseGuide();
