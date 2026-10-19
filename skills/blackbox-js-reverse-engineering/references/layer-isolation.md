# Layer Isolation

Purpose: determine where the target rejects a submission before changing generation code.

## Layers

1. Transport and connection — TLS, HTTP client, proxy, cookies.
2. Client context — headers, client hints, referer, origin, device binding.
3. Submitted content — payload fields, signatures, fingerprint values.
4. Time and ordering — freshness, timestamp anchoring, replay windows.
5. Session state — which issuance produced which material; one-time tokens.

This classification is open, not exhaustive. If evidence points outside these five — for example account or authorization state, server-side policy, or rate limiting — name it as its own layer.

## Experiments per layer

- Transport: submit a fresh request from each client and compare outcomes. Do not compare clients by replaying one stored sample; if the target rejects replays, such a comparison only measures replay detection.
- Client context: tamper inside a trusted client; ablate one header at a time.
- Content: replace the payload inside a trusted client with a locally generated one; flip, randomize, or delete one field per run.
- Time: submit first-use payloads at several delays; keep first use separate from repeated use.
- Session state: verify paired materials come from one issuance; check whether a token is single-use.

## Decision rule

- A variant that still succeeds shows the modified part is not required on that path under those conditions. Do not generalize it to other paths.
- A variant that fails identifies a candidate, not a root cause; confirm with a restore experiment.
- Record the layer and the path with every result. Do not carry a gate from one layer or one path to another.
