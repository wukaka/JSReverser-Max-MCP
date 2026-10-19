# Server-Side Isolation via In-Client Tampering

Purpose: determine which parts of a request the server actually checks, while keeping the client context trusted.

## Preconditions

1. Replay check: submit one accepted request unchanged through the same path.
2. If the replay is accepted, use it as the positive control.
3. If the replay is rejected, classify the response. When it is replay detection, build an accepted-sample library: multiple genuine accepted requests from different times or sessions, with full submission conditions.
4. Confirm interception neutrality with a live request passed through unmodified; do not rely on replay when the target rejects it.

## Replay caveat

- Treat a replay rejection as its own response class. Classify the code before concluding that the submission path or payload is wrong.
- Run tamper experiments on a live in-flight request, not on a stored one, so replay detection does not confound the result.

## Experiments

- Replace the body with a locally generated one.
- Flip one field; randomize a whole parameter; delete a parameter.
- Delay the first submission at several intervals.
- Change headers or query parameters independently.

## Implementation notes

- `Fetch.continueRequest` with `postData` must also pass `headers`; omitting them changes the request.
- Always let preflight `OPTIONS` pass through untouched.
- Record the response code for every variant in one table.

## Interpretation

- A variant that still succeeds shows the modified part is not required on that path under those conditions. Do not generalize it to other paths.
- A variant that fails identifies a candidate, not a root cause. Confirm with a restore experiment.
