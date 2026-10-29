function printAbstractCaseGuide() {
  console.log(`Case: 某手 falcon 风控参数
Category: 风控参数
Status: abstract-case
Runtime: pure-node
Scope: non-runnable

Kuaishou __NS_hxfalcon Abstract Case (Non-runnable)

This case intentionally does NOT contain executable signing code.
It is a high-density abstract case for reusing the Kuaishou \`__NS_hxfalcon\` workflow without exposing task-local implementation.

Overview:
- Goal: reconstruct \`__NS_hxfalcon\`, verify on strict-check API, then extract pure runtime only after \`env-pass\`.
- Repository boundary: keep this file abstract; put executable code only in \`artifacts/tasks/<task-id>/run/\`.
- Read order: \`docs/reference/reverse-bootstrap.md\` -> \`docs/reference/case-safety-policy.md\` -> \`docs/reference/reverse-workflow.md\` -> optional \`docs/reference/pure-extraction.md\`.

Target Contract:
- entry_url_b64: \`aHR0cHM6Ly9rdGFnNm5yOTMubS5jaGVuemhvbmd0ZWNoLmNvbS9mdy90YWcvdGV4dD9jYz1zaGFyZV9jb3B5bGluayZrcGY9QU5EUk9JRF9QSE9ORSZmaWQ9MTk2NjQwNTA1MSZzaGFyZU1ldGhvZD10b2tlbiZrcG49S1VBSVNIT1Umc3ViQml6PVRFWFRfVEFHJnJpY2g9dHJ1ZSZzaGFyZUlkPTE4NjM3ODA4NDgzOTcxJnNoYXJlVG9rZW49WDVCOE12SXJKYjNNMXQwJnRhZ05hbWU9amsmc2hhcmVUeXBlPTcmc2hhcmVNb2RlPWFwcCZhcHBUeXBlPTIxJnNoYXJlT2JqZWN0SWQ9amsmdGltZXN0YW1wPTE3NjExMTA3ODI5MDk=\`
- field: \`__NS_hxfalcon\`
- weak-check sample: \`/rest/wd/kconf/get\`
- strict-check sample: \`/rest/wd/ugH5App/tag/text/feed/recent\`
- note:
  do NOT judge success by \`HTTP 200\` only

Success Signals:
- one weak-check sample and one strict-check sample are preserved
- one stable VM call shape for encoder path is confirmed
- one local signer API generates candidate \`__NS_hxfalcon\`
- strict-check API returns \`result=1\` and \`hasData=true\`
- if pure extraction is attempted, one fixed fixture is recorded and reusable

Fast Repro Path:
- first capture one weak-check request and one strict-check request
- then trace initiator chain back to VM bridge and encode call
- then hook VM bridge call and request send timing together
- always judge success on strict-check before discussing pure extraction

Search Keywords:
- field keywords:
  \`__NS_hxfalcon\`, \`$encode\`, \`cat-version\`
- likely runtime keywords:
  \`Ee.call\`, \`createFiber\`, \`eval\`, \`run\`, \`call\`
- endpoint keywords:
  \`/rest/wd/kconf/get\`, \`/rest/wd/ugH5App/tag/text/feed/recent\`

Hook Points:
- VM bridge call site
- encoder wrapper near \`$encode\`
- \`fetch\`
- \`XMLHttpRequest.prototype.open\`
- \`XMLHttpRequest.prototype.send\`
- optional callback bridge that receives encoded result

Breakpoint Hints:
- set breakpoint where \`$encode\` or equivalent VM bridge call is issued
- set breakpoint where encoded value is written into request payload
- if multiple VM objects exist, prefer the one whose initiator chain reaches strict-check request
- if request-level tracing is noisy, break on strict-check URL first and walk upward

Watch Variables:
- payload before encode
- VM bridge arguments
- cat-version reads and version toggles
- callback wiring / async return path
- final request payload after sign write
- strict-check response shape

Branch Markers:
- whether weak-check and strict-check use identical encode path
- whether cat-version changes payload shape or signer branch
- whether VM bridge returns sync value or callback-based value
- whether host storage/performance values gate encoder behavior

Observe Phase:
1) Find weak-check and strict-check requests:
   - First use: \`obs_list_network_requests\`
   - Then use: \`obs_get_network_request\`
   - Collect:
     one weak-check sample and one strict-check sample, both with response body preview.
   - Output:
     one baseline pair for later A/B verification.

2) Confirm initiator chain:
   - First use: \`loc_get_request_initiator\`
   - Then use: \`obs_list_scripts\`, \`loc_get_script_source\`
   - Collect:
     runtime VM entry, encoder call site, cat-version retrieval path.
   - Expected chain example:
     business payload -> VM bridge -> \`Ee.call("$encode", ...)\`.
   - Output:
     one stable caller stack for the falcon sign path.

3) Capture write point and VM interaction:
   - First use: \`ins_hook_function\` / \`ins_create_hook\`
   - Collect:
     payload before encode, callback wiring, cat-version reads, final request send timing.
   - Output:
     one confirmed sign call shape and one confirmed request patch timing.

Capture Phase:
4) Confirm source correlation:
   - First use: \`loc_search_in_sources\`
   - Then use: \`loc_get_script_source\`, \`obs_collect_code\`
   - Collect:
     VM object capability, loader order, encoder adapter, strict-check and weak-check path differences.
   - Expected capability example:
     VM object contains methods like \`eval/run/call/createFiber\`.
   - Output:
     one local rebuild chain description:
     business payload -> VM bridge -> encode runtime -> \`__NS_hxfalcon\`.

5) Record evidence:
   - First use: \`rec_record_reverse_evidence\`
   - Record:
     weak/strict request pair, VM call shape, cat-version source, first divergence notes.
   - Output:
     one durable timeline for rebuild and drift recovery.

Seed Schema Checklist:
- storage keys involved, if any
- performance/time usage, if any
- cat-version source class
- weak-check vs strict-check route differences
- callback/bridge behavior category
- only record dependency class here; keep real values task-local

Rebuild Boundary:
6) Start local pure-Node rebuild:
   - Build minimal host in \`artifacts/tasks/<task-id>/run/\`
   - Start with:
     \`window/document/navigator/storage/performance\`
   - Load local runtime module and verify signer object availability.
   - Output:
     one local harness that can call the falcon encoder.

7) Use proxy env logs to patch gaps:
   - First use: local proxy diagnostics
   - Observe:
     missing VM host methods, storage/performance reads, callback or bridge mismatches.
   - Patch rule:
     one first divergence per loop,
     one patch decision per loop,
     one minimal causal unit per loop.
   - Output:
     one first divergence note per patch iteration.

Negative Patterns During Patch:
- do not use weak-check alone as final acceptance
- do not trust \`HTTP 200\` without business result fields
- do not patch VM host blindly without current \`first divergence\`
- do not go to Python port before strict-check passes

Local API Contract:
8) Extract local API:
   - Goal surface:
     \`genFalcon(payload)\` or equivalent encoder function.
   - Required output:
     one sign for weak-check payload and one sign for strict-check payload.
   - Explicit input contract should answer:
     payload shape,
     route metadata,
     cat-version behavior,
     runtimeContext or environment dependencies.
   - Output:
     one callable local signer API.

Portable Runtime Gate:
9) Export a portable runtime:
   - Goal file:
     \`run/exported-runtime.js\`
   - Goal constraints:
     inline required capture and runtime scripts,
     no external file reads,
     one entry such as \`genFalcon(payload)\`.
   - Output:
     one task-local callable runtime and one minimal smoke test.

Server Acceptance:
10) Verify server-side acceptance:
    - Compare:
      no-sign / fake-sign / captured-valid-sign / generated-sign.
    - Verify weak-check:
      \`result=1\` may not be strict enough alone.
    - Verify strict-check:
      real sign should return \`result=1\` and \`hasData=true\`.
    - Output:
      one pass/fail conclusion based on strict-check API.

Failure Triage:
- weak-check passes but strict-check fails:
  signing chain is still incomplete; inspect route-specific path and cat-version effects
- timeout or connect error:
  classify as network path issue before touching signer logic
- encoder exists but output rejected:
  compare VM bridge arguments and strict-check payload shape
- pure runtime diverges:
  compare fixed fixture around \`$encode\` boundary first

Pure Extraction Gate:
11) Pure algorithm extraction (only after pass):
    - Preconditions:
      local rebuild runs,
      strict-check generated request already passes server verification,
      exported runtime is callable.
    - Goal:
      extract a readable pure runtime without full VM shell.
    - Collect:
      explicit payload contract,
      runtimeContext knobs such as time/performance controls,
      constants boundary,
      VM-return intermediate values needed for cross-check.
    - Output:
      one task-local \`run/pure-*.js\`
      and, if needed, one task-local \`run/pure_*.py\`.

Pure Algorithm Key Points:
- preserve exact payload normalization before simplifying bridge logic
- separate VM bridge glue from encoder math/logic
- keep cat-version and route toggles explicit
- preserve callback or async boundary semantics before flattening into pure API
- always validate pure runtime on strict-check fixture, not weak-check only

Fixture Contract:
12) Cross-runtime fixture alignment:
    - Build:
      one fixed fixture input,
      one fixed runtimeContext,
      one fixed expected signer output.
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
      jump from VM-loaded browser scripts straight to Python pure.
    - Output:
      one explicit port boundary and one reusable fixture source.

Drift Watchlist:
14) Drift recovery:
    - Compare Node response body shape with MCP-captured browser response.
    - Allow gateway host-name drift, focus on business keys under \`data\`.
    - When scripts drift, rerun:
      request discovery -> initiator -> VM hook -> source correlation -> local patch.

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
- One weak-check sample and one strict-check sample are preserved.
- One VM call shape for \`$encode\` is confirmed.
- One local signer API can generate candidate \`__NS_hxfalcon\` values.
- Strict-check API with generated sign returns \`result=1\` and \`hasData=true\`.
- One first divergence note exists for each failed rebuild iteration.

Failure Classification:
- \`UND_ERR_CONNECT_TIMEOUT\`: network path issue, not signing logic issue.
- \`result=50\` or sign-fail message on strict API: signing chain not fully reconstructed.

Repository Boundary:
- Keep this file abstract and non-runnable.
- Put executable experiments only in \`artifacts/tasks/<task-id>/run/\`.
- Do not store raw production cookie/token bundles or reusable signer code here.

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
