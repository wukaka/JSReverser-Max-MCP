
/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';

import { logger } from '../../utils/logger.js';
import { StealthScripts2025, type StealthPreset } from '../stealth/StealthScripts2025.js';

export interface BrowserModeConfig {
  useStealthScripts?: boolean;
  stealthPreset?: StealthPreset;
  remoteDebuggingUrl?: string;
  remoteDebuggingPort?: number;
}

interface SessionData {
  cookies?: any[];
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;
}

type NormalizedBrowserModeConfig = Required<BrowserModeConfig>;

export class BrowserModeManager {
  private browser: Browser | null = null;
  private currentPage: Page | null = null;
  private readonly config: NormalizedBrowserModeConfig;
  private sessionData: SessionData = {};

  constructor(config: BrowserModeConfig = {}) {
    const port = config.remoteDebuggingPort ?? 9222;
    this.config = {
      useStealthScripts: config.useStealthScripts ?? true,
      stealthPreset: config.stealthPreset ?? 'windows-chrome',
      remoteDebuggingUrl: config.remoteDebuggingUrl ?? `http://127.0.0.1:${port}`,
      remoteDebuggingPort: port,
    };
  }

  async launch(): Promise<Browser> {
    if (this.browser && this.browser.isConnected()) {
      logger.info('🔁 Browser already connected, reusing existing session.');
      return this.browser;
    }

    logger.info(`🌐 Connecting to browser at ${this.config.remoteDebuggingUrl}...`);

    try {
      this.browser = await puppeteer.connect({
        browserURL: this.config.remoteDebuggingUrl,
      });

      logger.info('✅ Successfully connected to browser');
      return this.browser;
    } catch (error) {
      logger.warn('⚠️ Failed to connect to existing browser:', error);
      throw new Error(
        `Failed to connect to browser at ${this.config.remoteDebuggingUrl}. ` +
        `Please ensure your browser is running with remote debugging enabled. ` +
        `Example: --remote-debugging-port=${this.config.remoteDebuggingPort}`
      );
    }
  }

  async newPage(): Promise<Page> {
    if (!this.browser) {
      await this.launch();
    }

    const page = await this.browser!.newPage();
    this.currentPage = page;
    page.on('close', () => {
      if (this.currentPage === page) {
        this.currentPage = null;
      }
    });

    await page.setCacheEnabled(true);
    await page.setBypassCSP(true);
    await page.setJavaScriptEnabled(true);

    if (this.config.useStealthScripts) {
      // 使用平台预设注入反检测脚本（默认 windows-chrome）
      const preset = this.config.stealthPreset ?? 'windows-chrome';
      await StealthScripts2025.injectAll(page, { preset });
    }

    await this.injectAntiDetectionScripts(page);

    if (this.sessionData.cookies?.length) {
      await page.setCookie(...this.sessionData.cookies);
    }

    return page;
  }

  async goto(url: string, page?: Page): Promise<Page> {
    const targetPage = page ?? this.currentPage;
    if (!targetPage) {
      throw new Error('No page available. Call newPage() first.');
    }

    logger.info(`🌐 Navigating to ${url}`);
    await targetPage.goto(url, { waitUntil: 'networkidle2' });

    return targetPage;
  }

  private async injectAntiDetectionScripts(page: Page): Promise<void> {
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

      (window as any).chrome = {
        runtime: {
          connect: () => {},
          sendMessage: () => {},
          onMessage: {
            addListener: () => {},
            removeListener: () => {},
          },
        },
      };

      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format' },
            description: 'Portable Document Format',
            filename: 'internal-pdf-viewer',
            length: 1,
            name: 'Chrome PDF Plugin',
          },
        ],
      });

      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: (Notification as any).permission } as PermissionStatus)
          : originalQuery(parameters);

      Object.defineProperty(navigator, 'languages', {
        get: () => ['zh-CN', 'zh', 'en-US', 'en'],
      });
    });

    logger.info('🛡️ Anti-detection scripts injected');
  }

  async close(): Promise<void> {
    if (!this.browser) {
      return;
    }

    try {
      await this.browser.disconnect();
      logger.info('🔌 Disconnected from browser.');
    } catch (error) {
      logger.warn('Failed to disconnect from browser', error);
    } finally {
      this.browser = null;
      this.currentPage = null;
    }
  }

  getBrowser(): Browser | null {
    return this.browser;
  }

  getCurrentPage(): Page | null {
    return this.currentPage;
  }

  setCurrentPage(page: Page | null): void {
    this.currentPage = page;
  }
}
