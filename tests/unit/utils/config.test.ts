
/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Unit tests for configuration management
 * Tests browser configuration loading, validation, and environment variable parsing
 */

import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from 'node:test';

import {
  getBrowserConfig,
  getSystemConfig,
  validateConfig,
  getEnv,
  isDebugEnabled,
  type SystemConfig,
} from '../../../src/utils/config.js';

describe('Configuration Management', () => {
  // Store original environment variables
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear environment variables before each test
    delete process.env.BROWSER_HEADLESS;
    delete process.env.BROWSER_ISOLATED;
    delete process.env.BROWSER_EXECUTABLE_PATH;
    delete process.env.BROWSER_CHANNEL;
    delete process.env.REMOTE_DEBUGGING_URL;
    delete process.env.REMOTE_DEBUGGING_PORT;
    delete process.env.USE_STEALTH_SCRIPTS;
    delete process.env.DEBUG;
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = { ...originalEnv };
  });

  describe('getBrowserConfig', () => {
    it('should return default browser configuration', () => {
      const config = getBrowserConfig();

      assert.strictEqual(config.headless, true);
      assert.strictEqual(config.isolated, true);
      assert.strictEqual(config.useStealthScripts, false);
    });

    it('should set headless to false when BROWSER_HEADLESS is false', () => {
      process.env.BROWSER_HEADLESS = 'false';
      const config = getBrowserConfig();

      assert.strictEqual(config.headless, false);
    });

    it('should set isolated to false when BROWSER_ISOLATED is false', () => {
      process.env.BROWSER_ISOLATED = 'false';
      const config = getBrowserConfig();

      assert.strictEqual(config.isolated, false);
    });

    it('should enable stealth scripts when USE_STEALTH_SCRIPTS is true', () => {
      process.env.USE_STEALTH_SCRIPTS = 'true';
      const config = getBrowserConfig();

      assert.strictEqual(config.useStealthScripts, true);
    });

    it('should set executable path when BROWSER_EXECUTABLE_PATH is set', () => {
      process.env.BROWSER_EXECUTABLE_PATH = '/path/to/chrome';
      const config = getBrowserConfig();

      assert.strictEqual(config.executablePath, '/path/to/chrome');
    });

    it('should set channel when BROWSER_CHANNEL is set', () => {
      process.env.BROWSER_CHANNEL = 'chrome-beta';
      const config = getBrowserConfig();

      assert.strictEqual(config.channel, 'chrome-beta');
    });

    it('should set remote debugging URL when REMOTE_DEBUGGING_URL is set', () => {
      process.env.REMOTE_DEBUGGING_URL = 'http://localhost:9222';
      const config = getBrowserConfig();

      assert.strictEqual(config.remoteDebuggingUrl, 'http://localhost:9222');
    });

    it('should parse remote debugging port when REMOTE_DEBUGGING_PORT is set', () => {
      process.env.REMOTE_DEBUGGING_PORT = '9222';
      const config = getBrowserConfig();

      assert.strictEqual(config.remoteDebuggingPort, 9222);
    });

    it('should handle all browser configuration options together', () => {
      process.env.BROWSER_HEADLESS = 'false';
      process.env.BROWSER_ISOLATED = 'false';
      process.env.USE_STEALTH_SCRIPTS = 'true';
      process.env.BROWSER_EXECUTABLE_PATH = '/path/to/chrome';
      process.env.BROWSER_CHANNEL = 'chrome-dev';
      process.env.REMOTE_DEBUGGING_URL = 'http://localhost:9222';
      process.env.REMOTE_DEBUGGING_PORT = '9222';

      const config = getBrowserConfig();

      assert.strictEqual(config.headless, false);
      assert.strictEqual(config.isolated, false);
      assert.strictEqual(config.useStealthScripts, true);
      assert.strictEqual(config.executablePath, '/path/to/chrome');
      assert.strictEqual(config.channel, 'chrome-dev');
      assert.strictEqual(config.remoteDebuggingUrl, 'http://localhost:9222');
      assert.strictEqual(config.remoteDebuggingPort, 9222);
    });
  });

  describe('getSystemConfig', () => {
    it('should return complete system configuration', () => {
      process.env.DEBUG = 'true';

      const config = getSystemConfig();

      assert.ok(config);
      assert.ok(config.browser);
      assert.strictEqual(config.debug, true);
    });

    it('should detect debug mode from DEBUG=true', () => {
      process.env.DEBUG = 'true';
      const config = getSystemConfig();

      assert.strictEqual(config.debug, true);
    });

    it('should detect debug mode from DEBUG=mcp:*', () => {
      process.env.DEBUG = 'mcp:*';
      const config = getSystemConfig();

      assert.strictEqual(config.debug, true);
    });
  });

  describe('validateConfig', () => {
    it('should validate valid configuration', () => {
      const config: SystemConfig = {
        browser: {
          headless: true,
          isolated: true,
        },
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should reject invalid remote debugging port (too low)', () => {
      const config: SystemConfig = {
        browser: {
          remoteDebuggingPort: 0,
        },
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.length > 0);
      assert.ok(result.errors[0].includes('Invalid REMOTE_DEBUGGING_PORT'));
    });

    it('should reject invalid remote debugging port (too high)', () => {
      const config: SystemConfig = {
        browser: {
          remoteDebuggingPort: 70000,
        },
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.length > 0);
      assert.ok(result.errors[0].includes('Invalid REMOTE_DEBUGGING_PORT'));
    });

    it('should accept valid remote debugging port', () => {
      const config: SystemConfig = {
        browser: {
          remoteDebuggingPort: 9222,
        },
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });
  });

  describe('getEnv', () => {
    it('should return environment variable value when set', () => {
      process.env.TEST_VAR = 'test-value';
      const value = getEnv('TEST_VAR');

      assert.strictEqual(value, 'test-value');
    });

    it('should return undefined when environment variable is not set', () => {
      const value = getEnv('NON_EXISTENT_VAR');

      assert.strictEqual(value, undefined);
    });

    it('should return default value when environment variable is not set', () => {
      const value = getEnv('NON_EXISTENT_VAR', 'default-value');

      assert.strictEqual(value, 'default-value');
    });

    it('should prefer environment variable over default value', () => {
      process.env.TEST_VAR = 'env-value';
      const value = getEnv('TEST_VAR', 'default-value');

      assert.strictEqual(value, 'env-value');
    });
  });

  describe('isDebugEnabled', () => {
    it('should return false when DEBUG is not set', () => {
      const enabled = isDebugEnabled();

      assert.strictEqual(enabled, false);
    });

    it('should return true when DEBUG is true', () => {
      process.env.DEBUG = 'true';
      const enabled = isDebugEnabled();

      assert.strictEqual(enabled, true);
    });

    it('should return true when DEBUG contains mcp', () => {
      process.env.DEBUG = 'mcp:*';
      const enabled = isDebugEnabled();

      assert.strictEqual(enabled, true);
    });
  });
});
