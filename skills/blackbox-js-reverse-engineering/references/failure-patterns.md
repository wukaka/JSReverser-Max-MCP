# Failure Patterns

Common anti-patterns in black-box JS reverse engineering that lead to wasted effort and incorrect conclusions.

## 1. Environment Property Stacking

**Pattern**: Adding browser properties to the simulated environment one by one because "the real browser has them," without linking each property to a specific observed failure.

**Why it fails**: The simulated environment may need only a small subset of properties. Adding 50 properties when 3 are relevant creates a large surface area for new bugs and makes it impossible to determine which property (if any) caused a behavior change.

**Recognition**: 
- Multiple properties added in sequence without individual causal hypotheses.
- Justification is "the real browser has this" rather than "the program reads this at checkpoint X and branches based on it."
- Total property count grows while target behavior remains unchanged.

**Correction**: Stop adding properties. Identify which specific program behavior is failing. Trace which property (if any) that behavior depends on. Add only that property, with a clear prediction of the expected change.

## 2. Output Length Illusion

**Pattern**: Treating the length of an output token/string as a proxy for correctness. "The real token is 16000 chars, mine is 4700 chars, so I'm missing environment features."

**Why it fails**: Output length is a structural characteristic, not a semantic one. Two valid outputs can have different lengths. Two invalid outputs can have the same length. Chasing length leads to environment stacking without understanding the generation process.

**Recognition**:
- Optimization target is "make the output longer/shorter/same length."
- No analysis of which internal fields contribute to the length difference.
- Length changes after environment patches but semantic content is not verified.

**Correction**: Determine the output's transformation (serialization, encoding, compression, encryption) and decode it if applicable, then decompose it into fields. Explain the length difference as a field-level difference and verify which of those fields the target actually checks. If no field-level explanation exists, the length difference is not yet a lead.

## 3. Correlation-to-Causation Drift

**Pattern**: Observing that environment A differs from environment B in property X, and that the target program behaves differently, then concluding that property X causes the behavior difference.

**Why it fails**: The property may be correlated with the real difference but not causal. The program may read property X but not branch on it. The actual causal property may be Y, which happens to co-vary with X.

**Recognition**:
- A property is identified as "the problem" without an isolation experiment.
- Fixing the property does not change the target behavior (but the conclusion is "there must be more properties to fix").
- No ablation test (removing the property from the real environment to see if behavior changes).

**Correction**: Design an isolation experiment. Change only property X and observe whether the target behavior changes. If not, property X is not the cause (or not the only cause). Update the hypothesis accordingly.

## 4. Reference Implementation Misuse

**Pattern**: Finding a working reference implementation and immediately copying its environment setup, without verifying that the reference uses the same core code as the target.

**Why it fails**: The reference may use a different version, a different build, or a different module entirely. Copying its environment setup assumes code equivalence that may not exist.

**Recognition**:
- File sizes differ significantly between target and reference.
- File contents (first/last bytes, function names) differ.
- The reference's environment setup is copied without verifying code identity.

**Correction**: Before using a reference implementation, verify:
1. File identity (hash, size, key sequences).
2. Entry point equivalence.
3. Module dependency equivalence.
4. Output equivalence under identical inputs.

Only after confirming code equivalence should the reference's environment setup be used as a starting point.

## 5. File Identity Assumption

**Pattern**: Assuming that a file with a similar name, purpose, or interface is equivalent to the file used by the reference implementation.

**Why it fails**: Different builds, versions, or distribution channels can produce files with the same name but different content. A 324KB file and a 713KB file with the same purpose are not the same file.

**Recognition**:
- File sizes differ by more than a small margin.
- File contents differ in structure (not just obfuscation).
- The assumption of equivalence is never explicitly verified.

**Correction**: Always verify file identity before treating two files as interchangeable. Use hash comparison, size comparison, and content sampling (first/last N bytes, key function names).

## 6. Progress Illusion

**Pattern**: Confusing "I made a code change" with "I reduced uncertainty about the root cause." Each patch feels like progress, but the core question remains unanswered.

**Why it fails**: In complex reverse engineering, the space of possible environment configurations is enormous. Random exploration will eventually find a working configuration by chance, but it will not produce understanding. Without understanding, the solution is fragile and non-generalizable.

**Recognition**:
- Many code changes have been made.
- The target behavior has not materially changed.
- The root cause hypothesis has not been updated.
- The evidence ledger has not grown.
- The same type of experiment is being repeated.

**Correction**: Trigger a research review (see SKILL.md Section 4). Answer: what new fact was established? What was eliminated? Is the current direction still supported? If not, change direction.

## 7. Single-Environment Tunnel Vision

**Pattern**: Working exclusively in the simulated environment, treating the real browser as a property reference rather than an experimental tool.

**Why it fails**: The real browser is the ground truth. Without continuous comparison against it, the simulated environment drifts further from reality in ways that are not observable from the simulated side alone.

**Recognition**:
- The real browser is used once (to capture initial data) and then not referenced again.
- All experimentation happens in the simulated environment.
- There is no ongoing differential comparison.

**Correction**: Maintain the real browser as an active experimental tool. Periodically run the same test in both environments and compare. Use the real browser to validate hypotheses, not just to collect initial data.

## 8. Path-Specific Blocker Labeled as Root Cause

**Pattern**: A change makes one submission path succeed, and the conclusion is promoted to "root cause."

**Why it fails**: Different paths (browser, local rebuild, hybrid, alternate clients) expose different gates. A fix that only unblocks one path explains neither the other path's failure nor earlier successes on a different path.

**Recognition**:
- The claim is supported by a single path.
- Another path still fails with the same symptom.
- Earlier successful samples are not accounted for.

**Correction**: Apply the root-cause checklist: remove → fail, restore → succeed (or an equivalent ablation and restore where direct removal is impossible), and the explanation covers all earlier samples. Otherwise record it as a path-specific blocker and state which path it applies to.
