/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export type Scenario =
  | 'from_zero'
  | 'confirm_change'
  | 'header_necessity'
  | 'signer_inputs'
  | 'offline_repro';

export interface GuideStep {
  step: number;
  tools: string[];
  why: string;
}

export interface Playbook {
  scenario: Scenario;
  title: string;
  recommendedPath: GuideStep[];
  avoid: string[];
}

const KEYWORDS: Array<{scenario: Scenario; pattern: RegExp}> = [
  {scenario: 'confirm_change', pattern: /(改版|变更|差异|变了|是否一致|对比|diff|regression|回归)/i},
  {scenario: 'header_necessity', pattern: /(请求头|header|必需|必要|必填|token 头|哪些头)/i},
  {scenario: 'signer_inputs', pattern: /(签名字段|签名输入|参与签名|敏感|nonce|时间戳|扰动)/i},
  {scenario: 'offline_repro', pattern: /(离线|复现|本地|node|补环境|offline)/i},
];

const PLAYBOOKS: Record<Scenario, Playbook> = {
  from_zero: {
    scenario: 'from_zero',
    title: '陌生站点：从 0 定位并还原签名',
    recommendedPath: [
      {step: 1, tools: ['sys_check_browser_health', 'nav_page'], why: '先确认可接管的浏览器与页面上下文。'},
      {step: 2, tools: ['obs_list_network_requests'], why: '找到目标请求，不要凭猜测。'},
      {step: 3, tools: ['obs_get_network_request'], why: '默认只看头；需要 payload 时再传 includeBody=true。'},
      {step: 4, tools: ['loc_get_request_initiator'], why: '拿到发起请求的调用栈。'},
      {step: 5, tools: ['loc_trace_request_to_signer'], why: '从栈上找候选签名/构建函数。'},
      {step: 6, tools: ['loc_search_in_sources', 'loc_get_script_source'], why: '在候选脚本里定位关键代码。'},
      {step: 7, tools: ['ins_breakpoint', 'loc_trace_function'], why: '在候选函数上取证入参、出参和调用栈。'},
      {step: 8, tools: ['ins_signer', 'ver_analyze_signer'], why: '把找到的函数注册为签名器，扰动字段确认签名输入。'},
      {step: 9, tools: ['ins_signer', 'run_replay_request'], why: '重签并重放，验证假设。'},
    ],
    avoid: [
      '不要一上来就全量反混淆整包，先用运行时代码定位。',
      '在没有候选函数前不要注册 signer，避免把猜测当结论。',
    ],
  },
  confirm_change: {
    scenario: 'confirm_change',
    title: '判断接口是否改版',
    recommendedPath: [
      {step: 1, tools: ['obs_list_network_requests'], why: '取改版前后的两个 reqid。'},
      {step: 2, tools: ['ver_diff_network_requests'], why: '只看 method/query/header/body 的差异。'},
      {step: 3, tools: ['run_replay_request'], why: '用旧参数重放，确认失败点。'},
      {step: 4, tools: ['loc_search_in_sources'], why: '若参数结构变了，再回到代码侧确认。'},
    ],
    avoid: ['不要重新全量搜索；先用 diff 缩小范围。'],
  },
  header_necessity: {
    scenario: 'header_necessity',
    title: '确认哪些请求头是必需的',
    recommendedPath: [
      {step: 1, tools: ['obs_get_network_request'], why: '默认只读头，减少上下文成本。'},
      {step: 2, tools: ['run_replay_request'], why: '先跑通一次基线。'},
      {step: 3, tools: ['run_header_ablation'], why: '自动消融头，得到必需集合。'},
      {step: 4, tools: ['run_export_request'], why: '导出最小可执行请求。'},
    ],
    avoid: [
      '不要手工 monkey-patch fetch；先确认基线是否能跑通。',
      '消融结果只给证据，仍需你自己判断风控与登录态。',
    ],
  },
  signer_inputs: {
    scenario: 'signer_inputs',
    title: '判断哪些字段参与签名',
    recommendedPath: [
      {step: 1, tools: ['loc_trace_request_to_signer'], why: '先找到候选签名函数。'},
      {step: 2, tools: ['ins_signer'], why: '注册为签名器（action=register）。'},
      {step: 3, tools: ['ver_analyze_signer'], why: '扰动字段并做稳定性检测。'},
      {step: 4, tools: ['ins_signer', 'run_replay_request'], why: '重签后重放，闭合验证。'},
    ],
    avoid: [
      '不要在签名函数未确认前批量扰动，结论不可信。',
      '签名不稳定时先处理时间戳/nonce，再做字段分析。',
    ],
  },
  offline_repro: {
    scenario: 'offline_repro',
    title: '离线复现',
    recommendedPath: [
      {step: 1, tools: ['obs_get_hook_data'], why: '取运行时入参与返回值。'},
      {step: 2, tools: ['run_export_request'], why: '先导出单请求，确认离线可跑。'},
      {step: 3, tools: ['rec_export_rebuild_bundle'], why: '导出最小复现环境。'},
      {step: 4, tools: ['ver_diff_env_requirements'], why: '对比本地失败与浏览器能力，补齐环境。'},
    ],
    avoid: ['不要在没有运行时证据的情况下直接手写补环境。'],
  },
};

export function inferScenario(goal: string): Scenario {
  for (const entry of KEYWORDS) {
    if (entry.pattern.test(goal)) {
      return entry.scenario;
    }
  }
  return 'from_zero';
}

export function buildGuide(
  goal: string,
  scenario?: Scenario,
): {playbook: Playbook; matchedBy: 'explicit' | 'keyword' | 'default'} {
  if (scenario) {
    return {playbook: PLAYBOOKS[scenario], matchedBy: 'explicit'};
  }
  const inferred = inferScenario(goal);
  return {
    playbook: PLAYBOOKS[inferred],
    matchedBy: inferred === 'from_zero' ? 'default' : 'keyword',
  };
}
