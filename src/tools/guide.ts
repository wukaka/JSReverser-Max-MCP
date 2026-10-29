/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {zod} from '../third_party/index.js';
import {buildGuide, type Scenario} from '../modules/guide/Playbooks.js';

import {ToolCategory} from './categories.js';
import {defineTool} from './ToolDefinition.js';

export const reverseGuide = defineTool({
  name: 'reverse_guide',
  description:
    'Returns a recommended tool path for a reverse-engineering goal. It only suggests routes and next steps; it does not draw conclusions about the target.',
  annotations: {
    title: 'Reverse Guide',
    category: ToolCategory.REVERSE_ENGINEERING,
    readOnlyHint: true,
  },
  schema: {
    goal: zod
      .string()
      .describe(
        'What you are trying to do, e.g. "从 0 还原某接口签名"、"确认这个接口是否改版"、"哪些请求头是必需的".',
      ),
    scenario: zod
      .enum([
        'from_zero',
        'confirm_change',
        'header_necessity',
        'signer_inputs',
        'offline_repro',
      ])
      .optional()
      .describe('Explicit scenario. Inferred from goal when omitted.'),
  },
  handler: async (request, response) => {
    const {playbook, matchedBy} = buildGuide(
      request.params.goal,
      request.params.scenario as Scenario | undefined,
    );

    response.appendResponseLine('```json');
    response.appendResponseLine(
      JSON.stringify(
        {
          goal: request.params.goal,
          matchedBy,
          scenario: playbook.scenario,
          title: playbook.title,
          recommendedPath: playbook.recommendedPath,
          avoid: playbook.avoid,
          note: 'This is a route, not a conclusion. Verify each step with the listed tools.',
        },
        null,
        2,
      ),
    );
    response.appendResponseLine('```');
  },
});
