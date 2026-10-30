/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

import {recordTaskEvidence} from '../modules/task/TaskContext.js';
import type {Page} from '../third_party/index.js';
import {zod} from '../third_party/index.js';
import {resolveDefaultArtifactsTasksDir} from '../utils/projectPaths.js';

import {ToolCategory} from './categories.js';
import {getJSHookRuntime} from './runtime.js';
import {defineTool} from './ToolDefinition.js';

interface RegisteredSigner {
  name: string;
  expr: string;
  createdAt: string;
  persisted?: boolean;
}

const signers = new Map<string, RegisteredSigner>();
let persistedLoaded = false;

function signerStorePath(): string {
  return path.join(resolveDefaultArtifactsTasksDir(import.meta.url), '..', 'signers.json');
}

function loadPersistedSigners(): void {
  if (persistedLoaded) {
    return;
  }
  persistedLoaded = true;
  try {
    const file = signerStorePath();
    if (!existsSync(file)) {
      return;
    }
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as RegisteredSigner[];
    for (const signer of parsed) {
      if (signer?.name && signer?.expr && !signers.has(signer.name)) {
        signers.set(signer.name, {...signer, persisted: true});
      }
    }
  } catch {
    // A broken store should not block signing.
  }
}

function persistSigners(): void {
  try {
    const file = signerStorePath();
    mkdirSync(path.dirname(file), {recursive: true});
    writeFileSync(file, JSON.stringify([...signers.values()], null, 2), 'utf8');
  } catch {
    // Persistence is best-effort.
  }
}

function appendJson(
  response: {appendResponseLine(value: string): void},
  data: unknown,
): void {
  response.appendResponseLine('```json');
  response.appendResponseLine(JSON.stringify(data, null, 2));
  response.appendResponseLine('```');
}

async function executeSigner(
  page: Page,
  expr: string,
  payload: unknown,
): Promise<unknown> {
  return page.evaluate(
    async (input: {expr: string; payload: unknown}) => {
       
      const fn = (0, eval)(input.expr) as unknown;
      if (typeof fn !== 'function') {
        throw new Error('Signer expression did not evaluate to a function.');
      }
      return await (fn as (value: unknown) => unknown)(input.payload);
    },
    {expr, payload},
  );
}

function normalizeSignature(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === undefined) {
    return 'undefined';
  }
  return JSON.stringify(value);
}

function perturb(value: unknown): unknown {
  if (typeof value === 'string') {
    return `${value}_x`;
  }
  if (typeof value === 'number') {
    return value + 1;
  }
  if (typeof value === 'boolean') {
    return !value;
  }
  if (value === null) {
    return 'x';
  }
  if (Array.isArray(value)) {
    return [...value, 'x'];
  }
  if (typeof value === 'object') {
    return {...(value as Record<string, unknown>), __probe: 1};
  }
  return 'x';
}

export const signer = defineTool({
  name: 'ins_signer',
  description:
    'Manages signers (page functions used as signing oracles). action=register stores an expression that evaluates to a function; action=list shows registered signers; action=remove deletes one; action=sign calls a signer with a payload and returns its output.',
  annotations: {
    title: 'Signer',
    category: ToolCategory.REVERSE_ENGINEERING,
    readOnlyHint: false,
  },
  schema: {
    action: zod.enum(['register', 'list', 'remove', 'sign']),
    name: zod.string().optional().describe('Signer name.'),
    expr: zod
      .string()
      .optional()
      .describe(
        'For action=register: expression that evaluates to a function, e.g. "window.signature" or "(p) => md5(p)"',
      ),
    payload: zod.unknown().optional().describe('For action=sign: payload passed to the signer.'),
    persist: zod
      .boolean()
      .optional()
      .describe('For action=register: persist the signer to artifacts/signers.json.'),
  },
  handler: async (request, response) => {
    const params = request.params;

    if (params.action === 'register') {
      if (!params.name || !params.expr) {
        throw new Error('name and expr are required for action=register.');
      }
      const entry: RegisteredSigner = {
        name: params.name,
        expr: params.expr,
        createdAt: new Date().toISOString(),
        persisted: params.persist === true,
      };
      signers.set(params.name, entry);
      if (params.persist) {
        persistSigners();
      }
      appendJson(response, {registered: entry, persisted: params.persist === true});
      return;
    }

    if (params.action === 'list') {
      loadPersistedSigners();
      appendJson(response, {total: signers.size, signers: [...signers.values()]});
      return;
    }

    if (params.action === 'remove') {
      if (!params.name) {
        throw new Error('name is required for action=remove.');
      }
      const existing = signers.get(params.name);
      const removed = signers.delete(params.name);
      if (removed && existing?.persisted) {
        persistSigners();
      }
      appendJson(response, {name: params.name, removed});
      return;
    }

    if (!params.name) {
      throw new Error('name is required for action=sign.');
    }
    loadPersistedSigners();
    const registered = signers.get(params.name);
    if (!registered) {
      throw new Error(
        `Signer not found: ${params.name}. Register it first with action=register.`,
      );
    }

    const runtime = getJSHookRuntime();
    const page = await runtime.pageController.getPage();
    const output = await executeSigner(page, registered.expr, params.payload);
    appendJson(response, {
      signer: params.name,
      signature: output,
      signaturePreview: normalizeSignature(output).slice(0, 200),
    });
  },
});

export const analyzeSigner = defineTool({
  name: 'ver_analyze_signer',
  description:
    'Probes a signer to find which payload fields affect the signature, and checks whether the signature is stable across identical calls (timestamp/nonce detection). Returns raw per-field evidence, not just conclusions.',
  annotations: {
    title: 'Analyze Signer',
    category: ToolCategory.REVERSE_ENGINEERING,
    readOnlyHint: true,
  },
  schema: {
    name: zod.string().optional().describe('Registered signer name.'),
    expr: zod
      .string()
      .optional()
      .describe('Ad-hoc signer expression (used when name is omitted).'),
    payload: zod
      .record(zod.string(), zod.unknown())
      .describe('Object payload. Fields are perturbed one at a time.'),
    fields: zod
      .array(zod.string())
      .optional()
      .describe('Subset of top-level fields to probe (default: all).'),
    trials: zod
      .number()
      .int()
      .min(1)
      .max(5)
      .optional()
      .describe('Identical-call repetitions for the stability check (default: 2).'),
  },
  handler: async (request, response) => {
    const params = request.params;
    let expr = params.expr;

    if (params.name) {
      loadPersistedSigners();
      const registered = signers.get(params.name);
      if (!registered) {
        throw new Error(`Signer not found: ${params.name}.`);
      }
      expr = registered.expr;
    }
    if (!expr) {
      throw new Error('Either name or expr is required.');
    }

    const runtime = getJSHookRuntime();
    const page = await runtime.pageController.getPage();
    const fields = params.fields ?? Object.keys(params.payload);
    if (fields.length === 0) {
      throw new Error('Payload has no top-level fields to probe.');
    }
    if (fields.length > 20) {
      throw new Error('Too many fields to probe (max 20). Pass fields to narrow the set.');
    }

    const trials = params.trials ?? 2;
    const baseline = normalizeSignature(
      await executeSigner(page, expr, params.payload),
    );

    const stability: Array<{trial: number; signaturePreview: string}> = [];
    let stable = true;
    for (let trial = 1; trial < trials; trial += 1) {
      const current = normalizeSignature(
        await executeSigner(page, expr, params.payload),
      );
      stability.push({trial: trial + 1, signaturePreview: current.slice(0, 120)});
      if (current !== baseline) {
        stable = false;
      }
    }

    const matrix: Array<{
      field: string;
      changed: boolean;
      signaturePreview: string;
    }> = [];
    for (const field of fields) {
      const probePayload = {...params.payload, [field]: perturb(params.payload[field])};
      const signature = normalizeSignature(
        await executeSigner(page, expr, probePayload),
      );
      matrix.push({
        field,
        changed: signature !== baseline,
        signaturePreview: signature.slice(0, 120),
      });
    }

    const sensitiveFields = matrix
      .filter((entry) => entry.changed)
      .map((entry) => entry.field);
    const insensitiveFields = matrix
      .filter((entry) => !entry.changed)
      .map((entry) => entry.field);

    const recorded = await recordTaskEvidence('experiments', {
      tool: 'ver_analyze_signer',
      signer: params.name ?? 'expr',
      stable,
      sensitiveFields,
      insensitiveFields,
      baselinePreview: baseline.slice(0, 120),
    });

    appendJson(response, {
      stable,
      baselinePreview: baseline.slice(0, 120),
      stability,
      sensitiveFields,
      insensitiveFields,
      matrix,
      notes: stable
        ? []
        : ['Identical payloads produced different signatures; the signer likely includes a timestamp or nonce.'],
      evidenceRecorded: recorded,
    });
  },
});
