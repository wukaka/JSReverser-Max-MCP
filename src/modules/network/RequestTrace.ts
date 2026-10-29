/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TraceFrame {
  functionName: string;
  scriptId: string;
  url: string;
  lineNumber: number;
  columnNumber: number;
}

export interface FrameScore {
  score: number;
  reasons: string[];
}

const NAME_PATTERN =
  /(sign|signature|encrypt|decrypt|hash|digest|hmac|md5|sha\d*|token|nonce|auth|secret|salt|enc)/i;
const CRYPTO = /(md5|sha1|sha256|sha512|hmac|aes|rsa|crypto\.subtle|encrypt|decrypt|digest|base64|btoa|atob)/i;
const STRING_OPS = /(charCodeAt|fromCharCode|\.split\(|\.join\(|\.concat\(|\+=|toString\(16\))/;
const TIME = /(Date\.now|new Date|performance\.now|getTime\(\))/;
const RANDOM = /Math\.random/;
const LOOPS = /\b(for|while)\s*\(/;
const ENCODING = /(encodeURIComponent|decodeURIComponent|escape\()/;
const TRANSPORT =
  /^(fetch|XMLHttpRequest\.open|send|dispatchRequest|request|ajax|httpRequest|axios)$/i;
const INTERNAL_URL = /^(chrome|devtools|extensions?):/;

export function scoreFrame(frame: TraceFrame, snippet: string): FrameScore {
  if (!frame.url || INTERNAL_URL.test(frame.url)) {
    return {score: 0, reasons: ['browser-internal frame']};
  }

  const reasons: string[] = [];
  let score = 0;

  const name = frame.functionName || '';
  if (NAME_PATTERN.test(name)) {
    score += 50;
    reasons.push(`function name looks signing-related: ${name}`);
  }
  if (TRANSPORT.test(name)) {
    score -= 20;
    reasons.push(`transport wrapper, unlikely to be the signer: ${name}`);
  }
  if (CRYPTO.test(snippet)) {
    score += 20;
    reasons.push('crypto primitives in surrounding source');
  }
  if (STRING_OPS.test(snippet)) {
    score += 10;
    reasons.push('string building around this location');
  }
  if (TIME.test(snippet)) {
    score += 10;
    reasons.push('timestamp usage around this location');
  }
  if (RANDOM.test(snippet)) {
    score += 8;
    reasons.push('Math.random usage around this location');
  }
  if (LOOPS.test(snippet)) {
    score += 5;
    reasons.push('loop around this location');
  }
  if (ENCODING.test(snippet)) {
    score += 6;
    reasons.push('encoding call around this location');
  }
  if (name) {
    score += 5;
    reasons.push('named frame');
  }

  return {score: Math.max(0, score), reasons};
}

export function extractSnippet(
  source: string,
  lineNumber: number,
  columnNumber: number,
  contextChars = 400,
): string {
  if (!source) {
    return '';
  }

  const lines = source.split('\n');
  if (lines.length > 1) {
    const startLine = Math.max(0, lineNumber - 3);
    const endLine = Math.min(lines.length, lineNumber + 4);
    const block = lines.slice(startLine, endLine).join('\n');
    if (block.length <= contextChars * 4) {
      return block;
    }
  }

  let offset = 0;
  for (let i = 0; i < Math.min(lineNumber, lines.length); i += 1) {
    offset += lines[i]!.length + 1;
  }
  offset += Math.max(0, columnNumber);

  const start = Math.max(0, offset - contextChars);
  const end = Math.min(source.length, offset + contextChars);
  return source.slice(start, end);
}
