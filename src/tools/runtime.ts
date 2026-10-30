
/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {CodeSummarizer} from '../modules/analyzer/AISummarizer.js';
import {CodeAnalyzer} from '../modules/analyzer/CodeAnalyzer.js';
import {BrowserModeManager} from '../modules/browser/BrowserModeManager.js';
import {CodeCollector} from '../modules/collector/CodeCollector.js';
import {DOMInspector} from '../modules/collector/DOMInspector.js';
import {PageController} from '../modules/collector/PageController.js';
import {CryptoDetector} from '../modules/crypto/CryptoDetector.js';
import {Deobfuscator} from '../modules/deobfuscator/Deobfuscator.js';
import {HookManager} from '../modules/hook/HookManager.js';
import {WasmAnalyzer} from '../modules/wasm/WasmAnalyzer.js';
import {WasmCollector} from '../modules/wasm/WasmCollector.js';
import {WasmDecompiler} from '../modules/wasm/WasmDecompiler.js';
import {WasmRuntimeInspector} from '../modules/wasm/WasmRuntimeInspector.js';
import {ReverseTaskStore} from '../reverse/ReverseTaskStore.js';
import type {Page} from '../third_party/index.js';
import type {PuppeteerConfig} from '../types/index.js';
import {
  CodeCacheAdapter,
  CodeCompressorAdapter,
  DetailedDataManagerAdapter,
} from '../utils/CacheAdapters.js';
import {getBrowserConfig} from '../utils/config.js';
import {DetailedDataManager} from '../utils/detailedDataManager.js';
import {UnifiedCacheManager} from '../utils/UnifiedCacheManager.js';

let runtime: JSHookRuntime | undefined;

export interface JSHookRuntime {
  browserManager: BrowserModeManager;
  collector: CodeCollector;
  domInspector: DOMInspector;
  pageController: PageController;
  hookManager: HookManager;
  analyzer: CodeAnalyzer;
  summarizer: CodeSummarizer;
  deobfuscator: Deobfuscator;
  cryptoDetector: CryptoDetector;
  wasmCollector: WasmCollector;
  wasmAnalyzer: WasmAnalyzer;
  wasmDecompiler: WasmDecompiler;
  wasmRuntimeInspector: WasmRuntimeInspector;
  reverseTaskStore: ReverseTaskStore;
  bindPageContext: (resolver: () => Page) => void;
  syncPageContext: (page: Page) => void;
  clearPageContext: () => void;
}

function toCollectorConfig(): PuppeteerConfig {
  const browser = getBrowserConfig();
  return {
    headless: browser.headless!,
    timeout: 30000,
    remoteDebuggingUrl: browser.remoteDebuggingUrl,
    useStealthScripts: browser.useStealthScripts,
  };
}

export function getJSHookRuntime(): JSHookRuntime {
  if (runtime) {
    return runtime;
  }

  const browserManager = new BrowserModeManager({
    remoteDebuggingUrl: process.env.REMOTE_DEBUGGING_URL,
    remoteDebuggingPort: process.env.REMOTE_DEBUGGING_PORT
      ? Number(process.env.REMOTE_DEBUGGING_PORT)
      : 9222,
    useStealthScripts: process.env.USE_STEALTH_SCRIPTS !== 'false',
  });

  const collector = new CodeCollector(toCollectorConfig(), browserManager);
  const domInspector = new DOMInspector(collector);
  const pageController = new PageController(collector);
  const hookManager = new HookManager();
  const wasmAnalyzer = new WasmAnalyzer();
  const wasmDecompiler = new WasmDecompiler();
  const wasmRuntimeInspector = new WasmRuntimeInspector();
  const detailedDataManager = DetailedDataManager.getInstance();
  const unifiedCacheManager = UnifiedCacheManager.getInstance();
  const reverseTaskStore = new ReverseTaskStore();

  unifiedCacheManager.registerCache(new DetailedDataManagerAdapter(detailedDataManager));
  unifiedCacheManager.registerCache(new CodeCacheAdapter(collector.getCache()));
  unifiedCacheManager.registerCache(new CodeCompressorAdapter(collector.getCompressor()));

  runtime = {
    browserManager,
    collector,
    domInspector,
    pageController,
    hookManager,
    analyzer: new CodeAnalyzer(),
    summarizer: new CodeSummarizer(),
    deobfuscator: new Deobfuscator(),
    cryptoDetector: new CryptoDetector(),
    wasmCollector: new WasmCollector(pageController, wasmAnalyzer, wasmRuntimeInspector),
    wasmAnalyzer,
    wasmDecompiler,
    wasmRuntimeInspector,
    reverseTaskStore,
    bindPageContext: (resolver) => {
      collector.setPageResolver(() => resolver());
    },
    syncPageContext: (page) => {
      collector.setPageResolver(() => page);
      browserManager.setCurrentPage(page);
    },
    clearPageContext: () => {
      collector.setPageResolver(undefined);
      browserManager.setCurrentPage(null);
    },
  };

  return runtime;
}
