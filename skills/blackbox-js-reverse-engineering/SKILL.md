---
name: blackbox-js-reverse-engineering
description: 通过受控实验、运行时观察、差异分析和可证伪假设，对未知 JavaScript 行为进行黑盒逆向分析。适用于排查代码在不同环境下行为不一致、混淆代码分析、定位最早分歧点等场景。
---

# Black-Box JavaScript Reverse Engineering

## 1. Mission

Analyze unknown JavaScript behavior through controlled experiments, runtime observation, differential analysis, and falsifiable hypotheses.

The objective is not to maximize code changes, environmental resemblance, or output size. The objective is to identify and explain the smallest set of causes responsible for the observed behavior.

Prioritize:

1. Evidence over assumptions.
2. Behavioral understanding over environmental imitation.
3. High-information experiments over repeated trial and error.
4. Minimal causal explanations over large collections of patches.
5. Reproducibility over unverified claims of success.

Perform testing only on systems and artifacts that the user is authorized to analyze. Do not attempt to defeat third-party access controls or forge verification artifacts.

## 2. Mandatory Research Rules

### Rule 1: Establish a Reproducible Baseline

Before making substantial changes, record:

- Target artifact and version (file hash, size, source).
- Entry point and invocation method.
- Runtime and execution environment.
- Input data and relevant configuration.
- Observable outputs, errors, and side effects.
- Reproduction steps and known nondeterministic factors.

Preserve original artifacts. Keep experimental modifications separate from the baseline.

**Do not assume that two files with similar names, purposes, or interfaces contain equivalent implementations.** Verify file identity (hash, size, key byte sequences) before treating them as interchangeable.

### Rule 2: Build an Evidence Ledger

Maintain an explicit ledger of hypotheses and experiments.

For each hypothesis, record:

- Hypothesis ID.
- Statement of the hypothesis.
- Supporting evidence.
- Contradicting evidence.
- Confidence: low, medium, or high.
- Next experiment that could falsify it.
- Current status: open, supported, rejected, or inconclusive.

Distinguish observations from interpretations. Use these labels in reports:

- **OBSERVED**: Directly measured or reproduced.
- **INFERRED**: Supported by evidence but not directly established.
- **SPECULATIVE**: Plausible explanation without sufficient evidence.
- **VERIFIED**: Reproduced under explicitly stated conditions.

Never promote a speculative explanation to a verified root cause merely because a patch appears plausible.

Maintain a separate table of rejected and retracted hypotheses with the evidence that killed them. Negative results are assets: they prevent the same experiment from being repeated and expose when a later conclusion contradicts an earlier one.

### Rule 3: Every Significant Experiment Must Be Falsifiable

Before executing a substantial experiment, state:

1. The question being investigated.
2. The competing hypotheses.
3. The variable being changed.
4. The expected result under each hypothesis.
5. The observations that would falsify the current explanation.
6. The decision to make after each possible outcome.

Prefer experiments that distinguish multiple competing explanations.

Change one causal variable at a time when practical. If several variables must change together, document the confounding factors.

An experiment is valuable when it produces discriminating evidence, even if it does not fix the problem.

### Rule 4: Analyze Behavior Before Adding Environment Features

When execution differs between environments, investigate in this order:

1. Entry-point and initialization differences.
2. Execution order and control-flow differences.
3. The earliest observable divergence.
4. Relevant input and state differences.
5. Runtime API behavior differences.
6. Environmental features that have evidence of causal relevance.

**Do not add browser properties, event handlers, prototype patches, or runtime shims merely because they exist in another environment.**

For each proposed environmental patch, explain:

- Which observed failure it addresses.
- Which execution path depends on it.
- How its effect will be measured.
- How the patch can be reverted if the hypothesis is rejected.

If the only justification is "the real browser has this property," the patch is not yet supported by evidence.

### Rule 5: Find the Earliest Meaningful Divergence

When a target and a reference execution are available, compare them at meaningful checkpoints.

Prioritize:

- Function entry and exit.
- Branch decisions.
- Important argument and return values.
- State mutations.
- Data structure changes.
- Exception boundaries.
- External side effects.

Locate the earliest divergence that plausibly explains subsequent differences.

Do not begin by comparing every environmental property or every output byte unless the evidence justifies that level of detail.

When exact execution alignment is impossible, document the uncertainty and compare the nearest semantically equivalent checkpoints.

Instrument failure boundaries before success paths. Silent catch blocks convert a specific failure into a downstream `undefined`, which looks like a missing environment feature. Record the exception and its inputs at the failure site (decrypt, decode, parse, encode), and locate the earliest failure before instrumenting success paths.

### Rule 6: Do Not Confuse Proxies with Correctness

Output length, property counts, successful initialization, and absence of exceptions are not sufficient evidence of semantic correctness.

Use separate validation levels:

- **Execution**: Does the program run?
- **Structure**: Does the output satisfy the expected schema?
- **Semantics**: Do important values have the expected meaning?
- **Behavior**: Are relevant execution paths and side effects consistent?
- **End-to-end**: Does the authorized test scenario satisfy its acceptance criteria?

A result at one level does not automatically establish success at the next level.

Do not set "make the output length match" as an optimization target. Instead, explain why the outputs differ.

#### Decompose before attributing differences

Length is a structural property, not a semantic one. Before attributing a length difference to missing environment features:

1. Determine whether the output is serialized, encoded, compressed, or encrypted, and decode it if so.
2. Decompose it into named fields.
3. Explain the length difference as a field-level difference.
4. Verify which of those fields the target system actually checks.

If no field-level explanation exists, the length difference is not yet a lead.

#### Preserve Data Lineage

Derived values must trace to the same issuance that produced their inputs. When two materials are issued together, never combine one from one issuance with the other from a different one.

Do not pre-populate a value that the target code derives lazily. If the code writes the value only when it is absent, a preset value permanently masks the correct derivation.

## 3. Research Workflow

### Phase A: Scope and Baseline

- Define the observable problem.
- Identify the target entry point.
- Record the runtime, inputs, and expected behavior.
- Reproduce the failure.
- Preserve a minimal test case.

**Exit condition**: The problem can be reproduced, or the exact source of nondeterminism is documented.

#### Establish an Acceptance Baseline Before Optimization

Before improving a local reproduction, obtain an accepted sample and replay it unchanged through the same submission path.

- If replay succeeds, the path is viable; the remaining gap is in generation.
- If replay is rejected, classify the rejection first. If it is replay detection, do not treat it as a path failure: build an accepted-sample library instead — collect multiple genuine accepted submissions from different times or sessions with their full conditions, and use fresh submissions for subsequent experiments.

A generated output that has never been submitted to the target is not evidence.

Record a response-code taxonomy as part of the baseline: code, literal message, observed trigger, and which layer it implies. Classify replay rejections as a separate response class. A new code is a new hypothesis, not another instance of the same failure.

### Phase B: Execution Model

- Map the initialization sequence.
- Identify important functions and module boundaries.
- Trace relevant state and data flow.
- Identify the major observable branches.
- Record unknowns without prematurely filling them with assumptions.

**Exit condition**: There is a testable model of the relevant execution path.

**This phase is a hard gate.** Do not proceed to large-scale environment modification without a basic execution model. If the program is heavily obfuscated, the model can be partial — but it must identify the entry point, the major branches, and the observable outputs.

### Phase C: Hypothesis Formation

- Generate a small set of competing explanations.
- Rank them by supporting evidence, uncertainty, and experimental cost.
- Select the experiment with the highest expected information gain.
- Define its expected outcomes before running it.

**Exit condition**: The next experiment can distinguish at least two plausible explanations, or its limited diagnostic value is explicitly justified.

#### Isolate the Rejection Layer First

Classify the failure into one of these layers before proposing patches:

1. Transport and connection (TLS, HTTP client, proxy, cookies).
2. Client context (headers, client hints, referer, origin, device binding).
3. Submitted content (payload fields, signatures, fingerprint values).
4. Time and ordering (freshness, timestamp anchoring, replay windows).
5. Session state (which issuance produced which material; one-time tokens).

This is an open classification, not an exhaustive list. If the evidence points to a rejection source outside these five (for example account or authorization state, server-side policy, or rate limiting), name it as its own layer.

Design one experiment per layer. Do not add environment properties while the rejection layer is still unknown.

See `references/layer-isolation.md` for layer-specific experiments.

### Phase D: Controlled Experimentation

For each experiment:

1. Preserve the current baseline.
2. State the hypothesis and predictions.
3. Make the smallest practical change.
4. Execute the test.
5. Capture relevant observations.
6. Compare the result against the predictions.
7. Update the evidence ledger.
8. Decide whether to continue, revise, or reject the hypothesis.

Never treat a successful code modification as proof that its assumed explanation was correct.

### Phase E: Root-Cause Analysis

A root-cause claim should identify:

- The observed failure.
- The earliest relevant divergence.
- The mechanism connecting the divergence to the failure.
- Evidence supporting the mechanism.
- Alternative explanations considered.
- A reproducible experiment supporting the conclusion.

If the evidence is insufficient, report the leading hypothesis and remaining uncertainty instead of claiming a definitive root cause.

#### Root-Cause Claim Checklist

A root-cause claim is only supported when all three hold:

1. Removing the claimed cause reproduces the failure.
2. Restoring it restores success.
3. The explanation accounts for every earlier success and failure, not only the current experiment.

When the cause cannot be removed directly (for example a server-side gate), use an equivalent ablation and restore: a controlled request, client, or condition that isolates the same variable. State the equivalence and its limits.

If a fix only makes one path succeed while another path still fails, record it as a **path-specific blocker**, not a root cause.

#### Retraction Protocol

When new evidence invalidates an earlier conclusion, do not silently overwrite it. Add a dated retraction entry with:

- the original claim and its experiment or section ID;
- the experiment that invalidated it;
- what remains true and what is now false.

Retractions are evidence. Deleting them makes the same wrong path likely to be retried.

### Phase F: Validation and Regression

- Re-run the original baseline.
- Test the smallest reproducible case.
- Validate relevant edge cases.
- Check that the fix does not introduce unrelated regressions.
- Separate demonstrated results from unresolved behavior.
- Preserve a concise record of the final findings.

## 4. Anti-Loop Guard

Detect and interrupt low-information investigation loops.

**Warning signs:**

- Multiple patches (3+) without a measurable change in the target behavior.
- Repeatedly adding environmental features without evidence of dependency.
- Repeating essentially identical experiments.
- Changing several variables without isolating their effects.
- Optimizing output length or superficial similarity instead of semantics.
- Continuing to defend a hypothesis after contradictory evidence appears.
- Accumulating instrumentation without narrowing the candidate explanations.
- The justification for a new patch is "the real environment has this" without a causal link to the observed failure.

**When a warning sign appears, pause implementation work and perform a research review.**

### Research Review Procedure

Answer these questions:

1. What new fact did the last experiments establish?
2. Which hypotheses were eliminated or weakened?
3. Has the earliest known divergence changed?
4. Is the current problem definition still supported by evidence?
5. What alternative explanation has not been tested?
6. Which next experiment offers the greatest information gain?
7. What result would justify abandoning the current approach?

If repeated experiments yield no meaningful reduction in uncertainty, **change the research strategy rather than adding another speculative patch.**

Do not impose an arbitrary fixed experiment count. Evaluate progress by information gained, uncertainty reduced, and reproducibility.

## 5. Experiment Record Template

Use a concise record for each significant experiment. The first four fields are mandatory; the rest are optional.

### Experiment: [ID]

**Mandatory:**
- **Hypothesis**: (one sentence — what causal mechanism is being tested)
- **Variable changed**: (the single thing being modified)
- **Prediction**: (if the hypothesis is correct, what should be observed)
- **Result + Confidence update**: (what was actually observed; supported / rejected / inconclusive)

**Optional:**
- Alternative hypothesis:
- Supporting evidence:
- Baseline:
- Contradicting evidence:
- Next decision:
- Scope / chain: (which path this result applies to: browser, local rebuild, hybrid, or a named submission chain — required when more than one chain is in play)
- Reproduction command or test case:

Keep raw logs and large traces outside the main conversational context. Store compact summaries and retrieve detailed evidence only when needed.

## 6. Completion Criteria

Do not declare the investigation complete merely because the program runs.

A successful investigation should provide:

- A reproducible baseline.
- A documented execution model for the relevant path.
- A traceable set of experiments.
- Evidence-backed explanations for confirmed behavior.
- A minimal implementation change when a fix is required.
- Regression results.
- Explicit unresolved questions and confidence levels.

If the target remains unresolved, produce a useful partial result:

- What is established.
- What has been ruled out.
- What remains uncertain.
- Which experiments were inconclusive.
- The next highest-information experiment.

A well-supported partial result is better than an unsupported claim of success.

## 7. Final Reporting Format

Report findings in this order:

1. Executive conclusion.
2. Confirmed observations.
3. Root cause or leading hypotheses.
4. Key experiments and their results.
5. Changes made and their demonstrated effects.
6. Validation results.
7. Remaining uncertainty.
8. Recommended next experiment.

Keep the report concise, evidence-linked, and reproducible.

## 8. Failure Patterns to Recognize

See `references/failure-patterns.md` for detailed descriptions of common anti-patterns:

- **Environment property stacking**: Adding browser properties without causal evidence.
- **Output length illusion**: Treating token/string length as a correctness proxy.
- **Correlation-to-causation drift**: Assuming a detected difference is the root cause without isolation.
- **Reference implementation misuse**: Using a reference as code material instead of a control group.
- **File identity assumption**: Treating similarly-named files as equivalent without verification.
- **Progress illusion**: Confusing "I made a code change" with "I reduced uncertainty about the root cause."
