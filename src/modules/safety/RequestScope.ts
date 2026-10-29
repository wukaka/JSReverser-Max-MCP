/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const RATE_WINDOW_MS = 60_000;
const DEFAULT_MAX_PER_MINUTE = 60;
const TWO_LEVEL_SUFFIXES = new Set([
  'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'co.uk', 'org.uk', 'com.hk',
  'com.tw', 'co.jp', 'com.au', 'com.sg',
]);

const recentHits: number[] = [];

export interface ScopeOptions {
  allowHosts?: string[];
  maxPerMinute?: number;
}

function siteOf(hostname: string): string {
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return hostname;
  }
  const parts = hostname.split('.');
  if (parts.length <= 2) {
    return hostname;
  }
  const lastTwo = parts.slice(-2).join('.');
  return TWO_LEVEL_SUFFIXES.has(lastTwo)
    ? parts.slice(-3).join('.')
    : lastTwo;
}

function hostMatches(hostname: string, allowed: string): boolean {
  return hostname === allowed || hostname.endsWith(`.${allowed}`);
}

export function assertAllowedUrl(
  targetUrl: string,
  pageUrl: string,
  options: ScopeOptions = {},
): void {
  const target = new URL(targetUrl);
  const allowHosts = options.allowHosts ?? [];

  if (allowHosts.some((host) => hostMatches(target.hostname, host))) {
    return;
  }

  let pageHost = '';
  try {
    pageHost = new URL(pageUrl).hostname;
  } catch {
    // No usable page URL; fall through to the default-deny branch.
  }

  if (pageHost && siteOf(target.hostname) === siteOf(pageHost)) {
    return;
  }

  throw new Error(
    `Blocked replay to ${target.hostname}: cross-site requests are disabled by default. ` +
      `Pass allowHosts: ["${target.hostname}"] to allow it.`,
  );
}

export function assertRateLimit(limit = DEFAULT_MAX_PER_MINUTE): void {
  const now = Date.now();
  while (recentHits.length > 0 && now - recentHits[0]! > RATE_WINDOW_MS) {
    recentHits.shift();
  }
  if (recentHits.length >= limit) {
    throw new Error(
      `Replay rate limit reached (${limit}/minute). Wait before running more replays.`,
    );
  }
  recentHits.push(now);
}

export interface ReplayAuditEntry {
  timestamp: string;
  method: string;
  url: string;
  classification: string;
  status?: number;
  durationMs: number;
}

const auditEntries: ReplayAuditEntry[] = [];

export function recordReplayAudit(entry: ReplayAuditEntry): void {
  auditEntries.push(entry);
  if (auditEntries.length > 500) {
    auditEntries.shift();
  }
}

export function getReplayAudit(): ReplayAuditEntry[] {
  return [...auditEntries];
}
