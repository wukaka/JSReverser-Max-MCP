
/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Configuration management for jshook-integration
 * Handles environment variables and system configuration
 */

import { existsSync } from 'node:fs';

import { config as dotenvConfig } from 'dotenv';

import { resolveDefaultEnvPath } from './projectPaths.js';

// Load .env file if it exists
const envPath = resolveDefaultEnvPath(import.meta.url);
if (existsSync(envPath)) {
  dotenvConfig({ path: envPath });
}

/**
 * Browser Configuration
 */
export interface BrowserConfig {
  headless?: boolean;
  executablePath?: string;
  channel?: 'chrome' | 'chrome-beta' | 'chrome-dev' | 'chrome-canary' | 'msedge';
  isolated?: boolean;
  remoteDebuggingUrl?: string;
  remoteDebuggingPort?: number;
  useStealthScripts?: boolean;
}

/**
 * System Configuration
 */
export interface SystemConfig {
  browser: BrowserConfig;
  debug?: boolean;
}

/**
 * Get browser configuration from environment variables
 */
export function getBrowserConfig(): BrowserConfig {
  const config: BrowserConfig = {
    headless: process.env.BROWSER_HEADLESS !== 'false',
    isolated: process.env.BROWSER_ISOLATED !== 'false',
    useStealthScripts: process.env.USE_STEALTH_SCRIPTS === 'true',
  };

  if (process.env.BROWSER_EXECUTABLE_PATH) {
    config.executablePath = process.env.BROWSER_EXECUTABLE_PATH;
  }

  if (process.env.BROWSER_CHANNEL) {
    config.channel = process.env.BROWSER_CHANNEL as BrowserConfig['channel'];
  }

  if (process.env.REMOTE_DEBUGGING_URL) {
    config.remoteDebuggingUrl = process.env.REMOTE_DEBUGGING_URL;
  }

  if (process.env.REMOTE_DEBUGGING_PORT) {
    config.remoteDebuggingPort = parseInt(process.env.REMOTE_DEBUGGING_PORT, 10);
  }

  return config;
}

/**
 * Get complete system configuration
 */
export function getSystemConfig(): SystemConfig {
  return {
    browser: getBrowserConfig(),
    debug: isDebugEnabled(),
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: SystemConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate browser config
  if (config.browser.remoteDebuggingPort !== undefined) {
    const port = config.browser.remoteDebuggingPort;
    if (port < 1 || port > 65535) {
      errors.push(`Invalid REMOTE_DEBUGGING_PORT: ${port}. Must be between 1 and 65535.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

/**
 * Check if debug mode is enabled
 */
export function isDebugEnabled(): boolean {
  return process.env.DEBUG === 'true' || process.env.DEBUG?.includes('mcp') || false;
}
