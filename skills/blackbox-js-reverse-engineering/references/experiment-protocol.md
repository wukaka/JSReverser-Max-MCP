# Experiment Protocol

## Purpose

This document provides the detailed format and guidelines for designing and executing hypothesis-driven experiments in black-box JS reverse engineering.

## Experiment Design Checklist

Before executing any significant experiment, verify:

1. **Question**: What specific question is this experiment answering?
2. **Competing hypotheses**: What are the 2+ explanations being distinguished?
3. **Single variable**: Is only one causal variable being changed?
4. **Prediction**: What would be observed if the current hypothesis is correct?
5. **Falsification**: What observation would prove the hypothesis wrong?
6. **Decision rule**: What happens after each possible outcome?

## Experiment Types by Information Gain

### High Information Gain (prioritize these)

- **Branch isolation**: Modify one input to force a specific branch, confirming which branch is taken.
- **Differential execution**: Run the same code in two environments and compare at a specific checkpoint.
- **Ablation**: Remove a suspected dependency and observe whether behavior changes.
- **Acceptance baseline**: Obtain an accepted sample and replay it unchanged through the same submission path. If replay succeeds, the path is viable and the gap is in generation. If replay is rejected, classify the code; when it is replay detection, build an accepted-sample library from multiple genuine accepted submissions and use fresh requests for later experiments.
- **Stability classification**: For any field that differs between environments, sample it three ways — same process with repeated calls, new process with the same inputs, and same process with different inputs. Classify it as stable, per-process random, per-session fixed, or input-dependent. Do not patch a field as an environment constant until it is shown stable across processes.
- **Boundary probe**: Test the exact threshold where behavior changes (e.g., which property value triggers a branch).

### Medium Information Gain

- **Property addition**: Add a single missing property with a clear causal hypothesis.
- **API mock**: Replace a specific API call with a controlled mock to isolate its effect.
- **Timing manipulation**: Change execution timing to test time-dependent behavior.

### Low Information Gain (avoid without justification)

- **Bulk property addition**: Adding multiple properties without individual causal hypotheses.
- **Environment resemblance**: Adding properties because "the real browser has them" without linking to a specific failure.
- **Output optimization**: Tuning parameters to match output length or format without understanding the cause.

## Recording Format

### Mandatory Fields (always fill)

```
### Experiment: [ID]
- Hypothesis: [one sentence]
- Variable changed: [the single modification]
- Prediction: [expected observation if hypothesis is correct]
- Result: [actual observation] → [supported / rejected / inconclusive]
```

### Optional Fields (fill when relevant)

```
- Alternative hypothesis: [what else could explain the result]
- Baseline: [what was observed before the change]
- Contradicting evidence: [evidence that conflicts with the hypothesis]
- Next decision: [continue / revise / reject / new direction]
- Reproduction: [command or test case to reproduce]
```

Negative results and retractions are recorded in the evidence ledger (see SKILL.md Rule 2); do not delete them when a later experiment contradicts them.

## Time-Sensitive Flows

Separate first use from repeated use. Test the first submission at several delays before concluding that freshness is enforced. A failure on a replayed or second submission may reflect a replay grace window, not a freshness check.

## Common Mistakes

1. **Changing multiple variables at once**: Makes it impossible to attribute the result to a specific cause.
2. **No prediction before execution**: Makes it impossible to distinguish confirmation from coincidence.
3. **Treating "no error" as success**: Absence of exceptions is not evidence of correctness.
4. **Not preserving the baseline**: Makes it impossible to compare before/after.
5. **Skipping the confidence update**: Failing to adjust hypothesis confidence after each experiment.
