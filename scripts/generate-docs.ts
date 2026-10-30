/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';

import {cliOptions} from '../build/src/cli.js';
import * as jshookAnalyzerTools from '../build/src/tools/analyzer.js';
import {ToolCategory, labels} from '../build/src/tools/categories.js';
import * as jshookCollectorTools from '../build/src/tools/collector.js';
import * as consoleTools from '../build/src/tools/console.js';
import * as debuggerTools from '../build/src/tools/debugger.js';
import * as jshookDomTools from '../build/src/tools/dom.js';
import * as framesTools from '../build/src/tools/frames.js';
import * as guideTools from '../build/src/tools/guide.js';
import * as jshookHookTools from '../build/src/tools/hook.js';
import * as networkAdvancedTools from '../build/src/tools/network-advanced.js';
import * as networkTools from '../build/src/tools/network.js';
import * as jshookPageTools from '../build/src/tools/page.js';
import * as pagesTools from '../build/src/tools/pages.js';
import * as rebuildTools from '../build/src/tools/rebuild.js';
import * as screenshotTools from '../build/src/tools/screenshot.js';
import * as scriptTools from '../build/src/tools/script.js';
import * as signerTraceTools from '../build/src/tools/signer-trace.js';
import * as signerTools from '../build/src/tools/signer.js';
import * as jshookStealthTools from '../build/src/tools/stealth.js';
import * as taskTools from '../build/src/tools/task.js';
import * as wasmTools from '../build/src/tools/wasm.js';
import * as websocketTools from '../build/src/tools/websocket.js';

const OUTPUT_PATH = './docs/reference/tool-reference.md';
const README_PATH = './README.md';

interface ToolDef {
  name: string;
  description: string;
  annotations: {category: ToolCategory};
  schema: Record<string, unknown>;
}

function allTools(): ToolDef[] {
  return [
    ...Object.values(consoleTools),
    ...Object.values(debuggerTools),
    ...Object.values(networkTools),
    ...Object.values(networkAdvancedTools),
    ...Object.values(pagesTools),
    ...Object.values(screenshotTools),
    ...Object.values(signerTools),
    ...Object.values(signerTraceTools),
    ...Object.values(taskTools),
    ...Object.values(scriptTools),
    ...Object.values(websocketTools),
    ...Object.values(jshookCollectorTools),
    ...Object.values(jshookAnalyzerTools),
    ...Object.values(jshookHookTools),
    ...Object.values(jshookStealthTools),
    ...Object.values(jshookDomTools),
    ...Object.values(jshookPageTools),
    ...Object.values(wasmTools),
    ...Object.values(rebuildTools),
    ...Object.values(framesTools),
    ...Object.values(guideTools),
  ] as ToolDef[];
}

function uniqueToolsByName(tools: ToolDef[]): ToolDef[] {
  const seen = new Set<string>();
  const deduped: ToolDef[] = [];
  for (const tool of tools) {
    if (seen.has(tool.name)) {
      continue;
    }
    seen.add(tool.name);
    deduped.push(tool);
  }
  return deduped;
}

function generateConfigOptionsMarkdown(): string {
  let markdown = '';
  for (const [optionName, optionConfig] of Object.entries(cliOptions)) {
    if (optionConfig.hidden) continue;
    const aliasText = optionConfig.alias ? `, \`-${optionConfig.alias}\`` : '';
    const description = optionConfig.description || optionConfig.describe || '';

    markdown += `- **\`--${optionName}\`${aliasText}**\n`;
    markdown += `  ${description}\n`;
    markdown += `  - **Type:** ${optionConfig.type}\n`;
    if (optionConfig.choices) {
      markdown += `  - **Choices:** ${optionConfig.choices.map(c => `\`${c}\``).join(', ')}\n`;
    }
    if (optionConfig.default !== undefined) {
      markdown += `  - **Default:** \`${optionConfig.default}\`\n`;
    }
    markdown += '\n';
  }

  return markdown.trim();
}

function updateReadmeBlock(
  beginMarker: string,
  endMarker: string,
  content: string,
): void {
  const readmeContent = fs.readFileSync(README_PATH, 'utf8');
  const beginIndex = readmeContent.indexOf(beginMarker);
  const endIndex = readmeContent.indexOf(endMarker);

  if (beginIndex === -1 || endIndex === -1) {
    return;
  }

  const before = readmeContent.substring(0, beginIndex + beginMarker.length);
  const after = readmeContent.substring(endIndex);
  const updated = `${before}\n\n${content}\n\n${after}`;
  fs.writeFileSync(README_PATH, updated);
}

interface ZodLike {
  _def?: {
    typeName?: string;
    innerType?: ZodLike;
    type?: ZodLike;
    schema?: ZodLike;
    values?: string[];
    defaultValue?: unknown | (() => unknown);
    typeNameLower?: string;
  };
  description?: string;
}

interface FieldInfo {
  type: string;
  required: boolean;
  enumValues?: string[];
  defaultValue?: unknown;
  description?: string;
}

function unwrapZod(field: ZodLike): {
  inner: ZodLike;
  required: boolean;
  defaultValue?: unknown;
} {
  let current: ZodLike = field;
  let required = true;
  let defaultValue: unknown;

  while (current?._def) {
    const typeName = current._def.typeName;
    if (typeName === 'ZodOptional') {
      required = false;
      current = current._def.innerType!;
      continue;
    }
    if (typeName === 'ZodNullable') {
      current = current._def.innerType!;
      continue;
    }
    if (typeName === 'ZodDefault') {
      required = false;
      try {
        defaultValue =
          typeof current._def.defaultValue === 'function'
            ? (current._def.defaultValue as () => unknown)()
            : current._def.defaultValue;
      } catch {
        defaultValue = undefined;
      }
      current = current._def.innerType!;
      continue;
    }
    if (typeName === 'ZodEffects') {
      current = current._def.schema!;
      continue;
    }
    if (typeName === 'ZodBranded' || typeName === 'ZodReadonly') {
      current = current._def.type!;
      continue;
    }
    break;
  }

  return {inner: current, required, defaultValue};
}

function zodTypeLabel(field: ZodLike): string {
  const typeName = field?._def?.typeName;
  switch (typeName) {
    case 'ZodString':
      return 'string';
    case 'ZodNumber':
      return 'number';
    case 'ZodBoolean':
      return 'boolean';
    case 'ZodEnum':
      return 'enum';
    case 'ZodLiteral':
      return 'literal';
    case 'ZodObject':
    case 'ZodRecord':
      return 'object';
    case 'ZodArray': {
      const element = unfoldType(field._def?.type);
      return `array<${zodTypeLabel(element)}>`;
    }
    case 'ZodUnion':
      return 'union';
    case 'ZodUnknown':
    case 'ZodAny':
      return 'unknown';
    default:
      return 'unknown';
  }
}

function unfoldType(field: ZodLike | undefined): ZodLike {
  return field ? unwrapZod(field).inner : {};
}

function describeField(field: ZodLike): FieldInfo {
  const {inner, required, defaultValue} = unwrapZod(field);
  const enumValues =
    inner?._def?.typeName === 'ZodEnum' ? inner._def.values : undefined;

  return {
    type: zodTypeLabel(inner),
    required,
    enumValues,
    defaultValue,
    description: field.description ?? inner.description,
  };
}

function renderDefault(value: unknown): string {
  if (typeof value === 'string') {
    return `\`${value}\``;
  }
  return `\`${JSON.stringify(value)}\``;
}

const CAPABILITY_GROUPS: Array<{
  title: string;
  description: string;
  tools: string[];
}> = [
  {
    title: '任务入口',
    description: '不确定从哪开始？先要一条路线（只给路线，不给结论）',
    tools: ['reverse_guide'],
  },
  {
    title: '页面与 Frame 管理',
    description: '打开、切换、枚举页面与 iframe',
    tools: ['nav_page', 'nav_frame'],
  },
  {
    title: '页面观察与脚本定位',
    description: '先回答“页面里有哪些脚本、目标代码大概在哪”',
    tools: [
      'obs_list_scripts',
      'loc_get_script_source',
      'loc_find_in_script',
      'obs_list_collected_scripts',
    ],
  },
  {
    title: 'Hook 与运行时采样',
    description: '先做最小侵入式观测，确认运行时到底调用了什么',
    tools: ['ins_hook', 'obs_get_hook_data', 'loc_trace_function', 'obs_monitor_events'],
  },
  {
    title: '断点与调试控制',
    description: '当 hook 不够时，再进入暂停式调试',
    tools: [
      'ins_breakpoint',
      'ins_debug_control',
      'ins_get_paused_info',
      'ins_evaluate_on_callframe',
      'ins_xhr_breakpoint',
    ],
  },
  {
    title: '请求链路与网络分析',
    description: '定位目标请求，确认是谁发起、带了什么参数',
    tools: [
      'obs_list_network_requests',
      'obs_get_network_request',
      'loc_get_request_initiator',
    ],
  },
  {
    title: '请求验证与重放',
    description: '验证某个头/字段是否必需，并导出最小可执行请求',
    tools: [
      'run_replay_request',
      'run_header_ablation',
      'ver_diff_network_requests',
      'run_export_request',
    ],
  },
  {
    title: '签名 Oracle 与输入敏感度',
    description: '从 initiator 栈自动找候选签名函数；注册签名器并扰动字段判断参与签名的输入',
    tools: [
      'loc_trace_request_to_signer',
      'ins_signer',
      'ver_analyze_signer',
    ],
  },
  {
    title: '页面状态与运行前检查',
    description: '补看页面运行状态、控制台输出和本地状态依赖',
    tools: [
      'sys_check_browser_health',
      'obs_list_console_messages',
      'obs_get_console_message',
      'obs_get_storage',
      'ins_evaluate_script',
      'ins_evaluate_script_to_file',
      'loc_search_in_sources',
      'obs_inspect_object',
      'obs_get_performance_metrics',
    ],
  },
  {
    title: 'WebSocket 观察与消息分组',
    description: '处理长连接、直播流或二进制帧时，用这组工具先分流再细看',
    tools: [
      'obs_list_websocket_connections',
      'obs_analyze_websocket_messages',
      'obs_get_websocket_messages',
      'obs_get_websocket_message',
    ],
  },
  {
    title: '任务上下文与总结',
    description: '设置任务后自动记录实验证据，并导出总结',
    tools: ['rec_task_context', 'rec_export_reverse_summary'],
  },
  {
    title: '本地复现与补环境',
    description: '把页面证据带回本地，逐步补齐 Node 运行环境',
    tools: [
      'rec_export_rebuild_bundle',
      'ver_diff_env_requirements',
      'rec_record_reverse_evidence',
    ],
  },
  {
    title: '页面自动化',
    description: '做最小必要的页面操作，复现触发条件并辅助取证',
    tools: [
      'nav_navigate_page',
      'obs_query_dom',
      'obs_get_dom_structure',
      'nav_click_element',
      'nav_type_text',
      'nav_wait_for_element',
      'obs_take_screenshot',
    ],
  },
  {
    title: '注入与隐身',
    description: '预注入脚本、stealth 特性与 UA 伪装',
    tools: ['ins_inject_preload_script', 'ins_stealth'],
  },
  {
    title: '深度分析',
    description: '拿到代码和运行时证据后，做结构理解、去混淆和一键分析',
    tools: [
      'run_analyze_target',
      'obs_collect_code',
      'ver_collection_diff',
      'loc_analyze_code',
    ],
  },
  {
    title: '会话与登录态复用',
    description: '保存并复用浏览器会话与登录态',
    tools: ['rec_session_state', 'rec_export_session_report'],
  },
  {
    title: 'Wasm 与 JSON 插件',
    description:
      '覆盖采集、结构分析、导出使用情况、JS→Wasm 边界链路和 WAT 反汇编；Hook 体系内置 `json` 插件',
    tools: [
      'wasm_collect',
      'wasm_list_modules',
      'wasm_analyze_module',
      'wasm_inspect_exports',
      'wasm_summarize_boundary',
      'wasm_signature_diff',
      'wasm_decompile',
    ],
  },
];

function summarizeParams(schema: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [paramName, field] of Object.entries(schema)) {
    const info = describeField(field as ZodLike);
    const required = info.required ? '*' : '';
    if (info.type === 'enum' && info.enumValues && info.enumValues.length > 0) {
      parts.push(`\`${paramName}${required}\` (${info.enumValues.join('/')})`);
    } else if (info.type.startsWith('array<')) {
      parts.push(`\`${paramName}${required}[]\``);
    } else {
      parts.push(`\`${paramName}${required}\``);
    }
  }
  return parts.length > 0 ? parts.join(', ') : '—';
}

function generateCapabilityTable(tools: ToolDef[]): string {
  const byName = new Map(tools.map((tool) => [tool.name, tool]));
  const grouped = new Set(CAPABILITY_GROUPS.flatMap((group) => group.tools));
  const ungrouped = tools
    .map((tool) => tool.name)
    .filter((name) => !grouped.has(name));

  const groups = [...CAPABILITY_GROUPS];
  if (ungrouped.length > 0) {
    groups.push({
      title: '其他',
      description: '尚未归类的工具。',
      tools: ungrouped,
    });
  }

  const lines = [
    '| 能力分类 | 说明 | 工具函数 | 入参 |',
    '| --- | --- | --- | --- |',
  ];

  for (const group of groups) {
    group.tools.forEach((toolName, index) => {
      const tool = byName.get(toolName);
      const params = tool ? summarizeParams(tool.schema as Record<string, unknown>) : '（未注册）';
      const title = index === 0 ? group.title : '';
      const description = index === 0 ? group.description : '';
      lines.push(`| ${title} | ${description} | \`${toolName}\` | ${params} |`);
    });
  }

  lines.push('');
  lines.push(
    '> 入参列：`name*` 表示必填；枚举值以 `(a/b)` 标注；`name[]` 表示数组。完整说明见 [tool-reference](docs/reference/tool-reference.md)。',
  );

  return lines.join('\n');
}

function generateParamMarkdown(schema: Record<string, unknown>): string {
  let markdown = '';
  for (const [paramName, field] of Object.entries(schema)) {
    const info = describeField(field as ZodLike);
    const meta = [
      `\`${info.type}\``,
      info.required ? 'required' : 'optional',
      info.defaultValue !== undefined
        ? `default ${renderDefault(info.defaultValue)}`
        : '',
    ]
      .filter(Boolean)
      .join(' · ');

    markdown += `- **\`${paramName}\`** — ${meta}\n`;
    if (info.enumValues && info.enumValues.length > 0) {
      markdown += `  - Allowed: ${info.enumValues
        .map((value) => `\`${value}\``)
        .join(' | ')}\n`;
    }
    if (info.description) {
      markdown += `  - ${info.description}\n`;
    }
    markdown += '\n';
  }
  return markdown;
}

function generateDocs(): void {
  const tools = uniqueToolsByName(allTools()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const categories = new Map<string, ToolDef[]>();

  for (const tool of tools) {
    const category = tool.annotations.category;
    if (!categories.has(category)) categories.set(category, []);
    categories.get(category)!.push(tool);
  }

  const categoryOrder = Object.values(ToolCategory);
  let markdown = `<!-- AUTO GENERATED DO NOT EDIT - run 'npm run docs' to update-->\n\n# Chrome DevTools MCP Tool Reference\n\n> 快速按逆向目标查工具，请先看：[\`docs/reference/reverse-task-index.md\`](./reverse-task-index.md)\n\n`;

  for (const category of categoryOrder) {
    const toolsInCategory = categories.get(category) || [];
    if (toolsInCategory.length === 0) continue;
    markdown += `- **[${labels[category]}](#${labels[category].toLowerCase().replace(/\s+/g, '-')})** (${toolsInCategory.length} tools)\n`;
    for (const tool of toolsInCategory) {
      markdown += `  - [\`${tool.name}\`](#${tool.name.toLowerCase()})\n`;
    }
  }

  markdown += '\n';

  for (const category of categoryOrder) {
    const toolsInCategory = categories.get(category) || [];
    if (toolsInCategory.length === 0) continue;

    markdown += `## ${labels[category]}\n\n`;
    for (const tool of toolsInCategory) {
      markdown += `### \`${tool.name}\`\n\n`;
      markdown += `**Description:** ${tool.description}\n\n`;

      if (tool.schema && Object.keys(tool.schema).length > 0) {
        markdown += '**Parameters:**\n\n';
        markdown += generateParamMarkdown(
          tool.schema as Record<string, unknown>,
        );
      }
    }
  }

  fs.writeFileSync(OUTPUT_PATH, markdown);

  const toolsTOC = Array.from(categories.entries())
    .map(([category, categoryTools]) => {
      const lines = [
        `- **${labels[category as ToolCategory]}** (${categoryTools.length} tools)`,
      ];
      for (const tool of categoryTools) {
        lines.push(
          `  - [\`${tool.name}\`](docs/reference/tool-reference.md#${tool.name.toLowerCase()})`,
        );
      }
      return lines.join('\n');
    })
    .join('\n');

  updateReadmeBlock(
    '<!-- BEGIN AUTO GENERATED TOOLS -->',
    '<!-- END AUTO GENERATED TOOLS -->',
    toolsTOC,
  );
  updateReadmeBlock(
    '<!-- BEGIN AUTO GENERATED OPTIONS -->',
    '<!-- END AUTO GENERATED OPTIONS -->',
    generateConfigOptionsMarkdown(),
  );
  updateReadmeBlock(
    '<!-- BEGIN CAPABILITY TABLE -->',
    '<!-- END CAPABILITY TABLE -->',
    generateCapabilityTable(tools),
  );

  console.log(`Generated ${OUTPUT_PATH} with ${tools.length} tools.`);
}

generateDocs();
