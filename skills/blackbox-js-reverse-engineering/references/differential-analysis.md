# Differential Analysis

## Purpose

Methods for comparing execution behavior between a real environment (e.g., Chrome via CDP) and a simulated environment (e.g., jsdom) to locate the earliest meaningful divergence.

## Core Principle

Compare **behavior**, not **properties**. The goal is to find where two executions diverge, not to enumerate how many properties differ.

## Analysis Levels

### Level 1: Entry Point Comparison

- Are the same functions called at initialization?
- In the same order?
- With the same arguments?
- Do both reach the same first major branch?

### Level 2: Control Flow Comparison

- At each major branch, which path is taken in each environment?
- What condition determines the branch?
- What input to that condition differs?

### Level 3: Data Flow Comparison

- At key checkpoints, do the same variables hold the same values?
- Where does the first value divergence occur?
- What computation produced the divergent value?

### Level 4: Side Effect Comparison

- Do both environments produce the same external effects (XHR, DOM mutations, console output)?
- Are the effects in the same order?
- Do the effect payloads match in structure (not necessarily content)?

## Practical Techniques

### CDP Instrumentation (Real Browser)

```javascript
// Inject via CDP to log function calls
const origFn = targetFunction;
targetFunction = function(...args) {
  console.log('[TRACE]', functionName, JSON.stringify(args.slice(0, 3)));
  const result = origFn.apply(this, args);
  console.log('[TRACE]', functionName, '→', JSON.stringify(result));
  return result;
};
```

### jsdom Instrumentation (Simulated Environment)

```javascript
// Same pattern, applied to the jsdom window
const origFn = window.targetFunction;
window.targetFunction = function(...args) {
  console.log('[TRACE]', functionName, JSON.stringify(args.slice(0, 3)));
  const result = origFn.apply(this, args);
  console.log('[TRACE]', functionName, '→', JSON.stringify(result));
  return result;
};
```

### Alignment Strategy

1. Identify 5-10 meaningful checkpoints (function entries, branch points, output generation).
2. Instrument both environments at the same checkpoints.
3. Run the same input in both.
4. Compare trace outputs checkpoint by checkpoint.
5. Identify the **first** checkpoint where behavior diverges.
6. Focus investigation on that divergence point.

## What NOT to Do

- **Do not compare all properties**: Enumerating 100 window properties differences does not identify the causal one.
- **Do not compare output bytes**: Comparing every character of two tokens is not informative without understanding the generation process.
- **Do not assume alignment implies correctness**: Two executions can follow the same path and still produce different results due to input differences.
- **Do not ignore nondeterminism**: If the program uses randomness, time, or async behavior, document it before comparing.

## When Exact Alignment Is Impossible

Obfuscated code may have:
- Dynamic branch generation
- Anti-debugging side effects
- Timing-dependent behavior
- Self-modifying code

In these cases:
1. Document what cannot be aligned and why.
2. Compare the nearest semantically equivalent checkpoints.
3. Use statistical comparison (multiple runs) for nondeterministic behavior.
4. Focus on the parts that ARE alignable — they often contain the causal logic.
