/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import assert from 'node:assert';
import { afterEach, beforeEach, describe, it } from 'node:test';

import puppeteer from 'puppeteer';

import { BrowserModeManager } from '../../../src/modules/browser/BrowserModeManager.js';
import { StealthScripts2025 } from '../../../src/modules/stealth/StealthScripts2025.js';

interface BrowserLaunchHarness {
  isConnected(): boolean;
  disconnect?(): Promise<void>;
  newPage?(): Promise<PageHarness>;
}

interface PageHarness {
  evaluateOnNewDocument(): Promise<void>;
  on(event: string, handler: () => void): void;
  setCacheEnabled(value: boolean): Promise<void>;
  setBypassCSP(value: boolean): Promise<void>;
  setJavaScriptEnabled(value: boolean): Promise<void>;
  setCookie(...cookies: Array<{name: string; value: string}>): Promise<void>;
  goto?(url: string): Promise<void>;
}

interface BrowserManagerHarness {
  injectAntiDetectionScripts(page: PageHarness): Promise<void>;
  launch(): Promise<BrowserLaunchHarness>;
  newPage(): Promise<PageHarness>;
  getCurrentPage(): PageHarness | null;
  browser: BrowserLaunchHarness | null;
  currentPage: PageHarness | null;
  sessionData: {cookies?: Array<{name: string; value: string}>};
}

describe('BrowserModeManager extended', () => {
  let originalConnect: typeof puppeteer.connect;
  let originalInjectAll: typeof StealthScripts2025.injectAll;

  beforeEach(() => {
    originalConnect = puppeteer.connect;
    originalInjectAll = StealthScripts2025.injectAll;
  });

  afterEach(() => {
    puppeteer.connect = originalConnect;
    (StealthScripts2025 as unknown as {injectAll: typeof StealthScripts2025.injectAll}).injectAll = originalInjectAll;
  });

  it('launch connects to the existing browser', async () => {
    const manager = new BrowserModeManager({
      useStealthScripts: false,
    });

    const browser: BrowserLaunchHarness = { isConnected: () => true };
    puppeteer.connect = (async () => browser as unknown as Awaited<ReturnType<typeof puppeteer.connect>>) as typeof puppeteer.connect;
    const connected = await manager.launch();
    assert.strictEqual(connected, browser as unknown as typeof connected);
  });

  it('launch throws an actionable error when connect fails', async () => {
    const manager = new BrowserModeManager({
      useStealthScripts: false,
      remoteDebuggingPort: 9333,
    });

    puppeteer.connect = (async () => {
      throw new Error('connect fail');
    }) as typeof puppeteer.connect;

    await assert.rejects(
      async () => {
        await manager.launch();
      },
      /Failed to connect to browser/,
    );
  });

  it('injects anti-detection scripts and exposes getters', async () => {
    const manager = new BrowserModeManager({
      useStealthScripts: false,
    });

    let injected = 0;
    const browser: BrowserLaunchHarness = { isConnected: () => true };
    const page: PageHarness = {
      evaluateOnNewDocument: async () => {
        injected += 1;
      },
      on: () => undefined,
      setCacheEnabled: async () => undefined,
      setBypassCSP: async () => undefined,
      setJavaScriptEnabled: async () => undefined,
      setCookie: async () => undefined,
    };
    await (manager as unknown as BrowserManagerHarness).injectAntiDetectionScripts(page);
    assert.strictEqual(injected, 1);

    (manager as unknown as BrowserManagerHarness).browser = browser;
    (manager as unknown as BrowserManagerHarness).currentPage = page;
    assert.ok(manager.getBrowser());
    assert.ok(manager.getCurrentPage());
  });

  it('newPage triggers stealth injection when enabled', async () => {
    let injected = 0;
    (StealthScripts2025 as unknown as {injectAll: typeof StealthScripts2025.injectAll}).injectAll = async () => {
      injected += 1;
      return {
        preset: 'linux-chrome',
        injectedFeatures: ['x'],
        skippedFeatures: [],
        userAgent: 'ua',
        platform: 'linux',
        scriptCount: 1,
        injectedScripts: ['x'],
        errors: [],
      };
    };

    const manager = new BrowserModeManager({
      useStealthScripts: true,
      stealthPreset: 'linux-chrome',
    });

    const page: PageHarness = {
      on: () => undefined,
      setCacheEnabled: async () => undefined,
      setBypassCSP: async () => undefined,
      setJavaScriptEnabled: async () => undefined,
      setCookie: async () => undefined,
      evaluateOnNewDocument: async () => undefined,
    };
    (manager as unknown as BrowserManagerHarness).browser = {
      newPage: async () => page,
      isConnected: () => true,
    };

    await manager.newPage();
    assert.strictEqual(injected, 1);
  });

  it('goto throws without a page and navigates with one', async () => {
    const manager = new BrowserModeManager({
      useStealthScripts: false,
    });

    await assert.rejects(
      async () => {
        await manager.goto('https://example.com');
      },
      /No page available/,
    );

    let navigated = 0;
    const page = {
      goto: async (url: string) => {
        navigated += Number(url.includes('example.com'));
      },
    };
    (manager as unknown as BrowserManagerHarness).currentPage = page as unknown as PageHarness;
    const out = await manager.goto('https://example.com');
    assert.strictEqual(out, page as unknown as typeof out);
    assert.strictEqual(navigated, 1);
  });

  it('covers newPage launch-on-demand and close handler cleanup', async () => {
    const manager = new BrowserModeManager({
      useStealthScripts: false,
    }) as unknown as BrowserManagerHarness;

    let closeHandler: (() => void) | undefined;
    const page = {
      on: (event: string, handler: () => void) => {
        if (event === 'close') {
          closeHandler = handler;
        }
      },
      setCacheEnabled: async () => undefined,
      setBypassCSP: async () => undefined,
      setJavaScriptEnabled: async () => undefined,
      setCookie: async () => undefined,
      evaluateOnNewDocument: async () => undefined,
    };

    manager.injectAntiDetectionScripts = async () => undefined;
    manager.launch = async () => {
      manager.browser = { newPage: async () => page, isConnected: () => true };
      return manager.browser;
    };
    manager.sessionData = { cookies: [{ name: 'k', value: 'v' }] };

    const out = await manager.newPage();
    assert.strictEqual(out, page as unknown as typeof out);
    assert.ok(closeHandler);

    closeHandler!();
    assert.strictEqual(manager.getCurrentPage(), null);
  });

  it('executes anti-detection callback and close cleanup branches', async () => {
    const globals = globalThis as typeof globalThis & {
      navigator?: { permissions: { query: (permission: {name: string}) => Promise<{state: string}> }; webdriver?: undefined };
      window?: { navigator: { permissions: { query: (permission: {name: string}) => Promise<{state: string}> } }; chrome?: unknown };
      Notification?: { permission: string };
    };
    const backup = {
      navigator: globals.navigator,
      window: globals.window,
      Notification: globals.Notification,
    };
    const setGlobal = (key: string, value: unknown) => {
      Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    };

    const nav = { permissions: { query: (_p: {name: string}) => Promise.resolve({ state: 'granted' }) } };
    setGlobal('navigator', nav);
    setGlobal('window', { navigator: nav });
    setGlobal('Notification', { permission: 'default' });

    try {
      const manager = new BrowserModeManager({
        useStealthScripts: false,
      });
      const page = {
        evaluateOnNewDocument: async (fn: () => void) => {
          fn();
        },
        on: () => undefined,
        setCacheEnabled: async () => undefined,
        setBypassCSP: async () => undefined,
        setJavaScriptEnabled: async () => undefined,
        setCookie: async () => undefined,
      } as unknown as PageHarness & {
        evaluateOnNewDocument(fn: () => void): Promise<void>;
      };
      await (manager as unknown as BrowserManagerHarness).injectAntiDetectionScripts(page);
      const navigatorState = globals.navigator as {webdriver?: undefined} | undefined;
      assert.strictEqual(navigatorState?.webdriver, undefined);

      (manager as unknown as BrowserManagerHarness).browser = {
        disconnect: async () => {
          throw new Error('disconnect failed');
        },
        isConnected: () => true,
      };

      await manager.close();
      assert.strictEqual((manager as unknown as BrowserManagerHarness).browser, null);
      assert.strictEqual((manager as unknown as BrowserManagerHarness).currentPage, null);
    } finally {
      setGlobal('navigator', backup.navigator);
      setGlobal('window', backup.window);
      setGlobal('Notification', backup.Notification);
    }
  });
});
