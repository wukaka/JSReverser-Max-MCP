/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {zod} from '../third_party/index.js';

import {ToolCategory} from './categories.js';
import {getJSHookRuntime} from './runtime.js';
import {defineTool, timeoutSchema} from './ToolDefinition.js';

// Default navigation timeout in milliseconds (10 seconds)
const DEFAULT_NAV_TIMEOUT = 10000;

const listPagesTool = defineTool({
  name: 'nav_page(action=list)',
  description: `Get a list of pages open in the browser.`,
  annotations: {
    category: ToolCategory.NAVIGATION,
    readOnlyHint: true,
  },
  schema: {},
  handler: async (_request, response) => {
    response.setIncludePages(true);
  },
});

const selectPageTool = defineTool({
  name: 'nav_page(action=select)',
  description: `Select a page as a context for future tool calls.`,
  annotations: {
    category: ToolCategory.NAVIGATION,
    readOnlyHint: true,
  },
  schema: {
    pageIdx: zod
      .number()
      .describe(
        'The index of the page to select. Call nav_page(action=list) to list pages.',
      ),
  },
  handler: async (request, response, context) => {
    const page = context.getPageByIdx(request.params.pageIdx);
    await page.bringToFront();
    context.selectPage(page);
    getJSHookRuntime().syncPageContext(page);
    response.setIncludePages(true);
  },
});

const newPageTool = defineTool({
  name: 'nav_page(action=new)',
  description: `Creates a new page and navigates to the specified URL. Waits for DOMContentLoaded event (not full page load). Default timeout is 10 seconds.`,
  annotations: {
    category: ToolCategory.NAVIGATION,
    readOnlyHint: false,
  },
  schema: {
    url: zod.string().describe('URL to load in a new page.'),
    ...timeoutSchema,
  },
  handler: async (request, response, context) => {
    const page = await context.newPage();

    await context.waitForEventsAfterAction(async () => {
      await page.goto(request.params.url, {
        timeout: request.params.timeout ?? DEFAULT_NAV_TIMEOUT,
        waitUntil: 'domcontentloaded',
      });
    });

    response.setIncludePages(true);
  },
});

export const navigatePage = defineTool({
  name: 'nav_navigate_page',
  description: `Navigates the currently selected page to a URL, or performs back/forward/reload navigation. Waits for DOMContentLoaded event (not full page load). Default timeout is 10 seconds.`,
  annotations: {
    category: ToolCategory.NAVIGATION,
    readOnlyHint: false,
  },
  schema: {
    type: zod
      .enum(['url', 'back', 'forward', 'reload'])
      .optional()
      .describe(
        'Navigate the page by URL, back or forward in history, or reload.',
      ),
    url: zod.string().optional().describe('Target URL (only type=url)'),
    ignoreCache: zod
      .boolean()
      .optional()
      .describe('Whether to ignore cache on reload.'),
    ...timeoutSchema,
  },
  handler: async (request, response, context) => {
    const page = context.getSelectedPage();
    const options = {
      timeout: request.params.timeout ?? DEFAULT_NAV_TIMEOUT,
    };

    if (!request.params.type && !request.params.url) {
      throw new Error('Either URL or a type is required.');
    }

    if (!request.params.type) {
      request.params.type = 'url';
    }

    await context.waitForEventsAfterAction(async () => {
      switch (request.params.type) {
        case 'url':
          if (!request.params.url) {
            throw new Error('A URL is required for navigation of type=url.');
          }
          try {
            await page.goto(request.params.url, {
              ...options,
              waitUntil: 'domcontentloaded',
            });
            response.appendResponseLine(
              `Successfully navigated to ${request.params.url}.`,
            );
          } catch (error) {
            response.appendResponseLine(
              `Unable to navigate in the  selected page: ${error.message}.`,
            );
          }
          break;
        case 'back':
          try {
            await page.goBack({
              ...options,
              waitUntil: 'domcontentloaded',
            });
            response.appendResponseLine(
              `Successfully navigated back to ${page.url()}.`,
            );
          } catch (error) {
            response.appendResponseLine(
              `Unable to navigate back in the selected page: ${error.message}.`,
            );
          }
          break;
        case 'forward':
          try {
            await page.goForward({
              ...options,
              waitUntil: 'domcontentloaded',
            });
            response.appendResponseLine(
              `Successfully navigated forward to ${page.url()}.`,
            );
          } catch (error) {
            response.appendResponseLine(
              `Unable to navigate forward in the selected page: ${error.message}.`,
            );
          }
          break;
        case 'reload':
          try {
            await page.reload({
              ...options,
              waitUntil: 'domcontentloaded',
              ignoreCache: request.params.ignoreCache,
            });
            response.appendResponseLine(`Successfully reloaded the page.`);
          } catch (error) {
            response.appendResponseLine(
              `Unable to reload the selected page: ${error.message}.`,
            );
          }
          break;
      }
    });

    response.setIncludePages(true);
  },
});

/**
 * Unified page context management.
 */
export const page = defineTool({
  name: 'nav_page',
  description:
    'Manages pages: action=list lists open pages; action=select selects one by index; action=new opens a new page at a URL.',
  annotations: {
    category: ToolCategory.NAVIGATION,
    readOnlyHint: false,
  },
  schema: {
    action: zod.enum(['list', 'select', 'new']),
    pageIdx: zod.number().optional().describe('For action=select: page index from action=list.'),
    url: zod.string().optional().describe('For action=new: URL to load.'),
    ...timeoutSchema,
  },
  handler: async (request, response, context) => {
    const params = request.params;

    if (params.action === 'list') {
      await listPagesTool.handler({params: {}}, response, context);
      return;
    }

    if (params.action === 'select') {
      if (params.pageIdx === undefined) {
        throw new Error('pageIdx is required for action=select.');
      }
      await selectPageTool.handler({params: {pageIdx: params.pageIdx}}, response, context);
      return;
    }

    if (!params.url) {
      throw new Error('url is required for action=new.');
    }
    await newPageTool.handler(
      {params: {url: params.url, timeout: params.timeout}},
      response,
      context,
    );
  },
});
