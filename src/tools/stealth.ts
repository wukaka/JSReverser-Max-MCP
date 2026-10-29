
/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {StealthScripts2025} from '../modules/stealth/StealthScripts2025.js';
import {zod} from '../third_party/index.js';

import {ToolCategory} from './categories.js';
import {getJSHookRuntime} from './runtime.js';
import {defineTool} from './ToolDefinition.js';

const STEALTH_FEATURES = [
  'hideWebDriver', 'mockChrome', 'setUserAgent', 'fixPermissions', 'mockPlugins',
  'canvasNoise', 'webglOverride', 'audioContextNoise', 'fixLanguages', 'mockBattery',
  'mockMediaDevices', 'mockNotifications', 'mockConnection', 'focusOverride',
  'performanceNoise', 'overrideScreen',
];

export const stealth = defineTool({
  name: 'ins_stealth',
  description:
    'Inspect or apply anti-detection stealth settings. action=inject applies stealth scripts to the current page; action=presets lists presets; action=features lists feature toggles; action=set_user_agent sets the page user-agent.',
  annotations: {category: ToolCategory.REVERSE_ENGINEERING, readOnlyHint: false},
  schema: {
    action: zod.enum(['inject', 'presets', 'features', 'set_user_agent']),
    preset: zod.enum(['windows-chrome', 'mac-chrome', 'mac-safari', 'linux-chrome', 'windows-edge']).optional(),
    userAgent: zod.string().min(1).optional(),
  },
  handler: async (request, response) => {
    const runtime = getJSHookRuntime();
    const {action, preset, userAgent} = request.params;

    if (action === 'presets') {
      response.appendResponseLine('```json');
      response.appendResponseLine(JSON.stringify(StealthScripts2025.getPresets(), null, 2));
      response.appendResponseLine('```');
      return;
    }

    if (action === 'features') {
      response.appendResponseLine('```json');
      response.appendResponseLine(JSON.stringify(STEALTH_FEATURES, null, 2));
      response.appendResponseLine('```');
      return;
    }

    if (action === 'set_user_agent') {
      if (!userAgent) {
        throw new Error('userAgent is required for action=set_user_agent.');
      }
      const page = await runtime.collector.getActivePage();
      await page.setUserAgent(userAgent);
      response.appendResponseLine('User-Agent updated.');
      return;
    }

    const page = await runtime.collector.getActivePage();
    await StealthScripts2025.injectAll(page, {preset});
    response.appendResponseLine('Stealth scripts injected.');
  },
});
