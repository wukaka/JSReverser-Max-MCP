# Output Transform Instrumentation

Goal: determine how an opaque output is produced before analyzing its contents.

## Principle

Do not assume the output is encrypted, compressed, or encoded, and do not infer the transformation from length or appearance. Determine which transformation path is actually executed, then decode accordingly.

## Procedure

1. From page observation, list the plausible output transformation boundaries in this target: serialization, encoding, compression, encryption, worker / WASM / native calls.
2. Hook only the boundaries the target code actually reaches.
3. Produce two outputs under different inputs.
4. Record which boundaries fire and in what order.
5. Classify the transformation path from that trace.
6. Only then decode and compare plaintext fields.

## Rules

- A length difference is not evidence of a different transformation path; a boundary firing (or not firing) is.
- If no transformation boundary fires, treat the output as opaque until the producing code is located; do not guess a format.
