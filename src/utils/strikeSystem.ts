/**
 * Strike System for AI Agents
 * Based on YouTube's progressive warning system
 *
 * Implements escalation when agents cause repeated issues
 */

import { AgentRoleData, AgentWorkStatus } from '../types/governance';

export type StrikeLevel = 'none' | 'warning' | 'yellow' | 'red' | 'suspended';

export interface StrikeRecord {
  id: string;
  agentId: AgentRoleData['id'];
  agentName: string;
  level: StrikeLevel;
  reason: string;
  timestamp: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  notes?: string;
}

export interface StrikeConfig {
  // Max strikes before each level
  warningThreshold: number;       // 1st violation
  yellowThreshold: number;        // 2nd violation
  redThreshold: number;           // 3rd violation
  suspensionThreshold: number;    // 4th violation
  // Time window for counting strikes
  lookbackDays: number;           // Default: 90 days
  // Auto-reset
  autoResetAfterDays: number;     // Default: 30 days clean
}

export const DEFAULT_STRIKE_CONFIG: StrikeConfig = {
  warningThreshold: 1,
  yellowThreshold: 2,
  redThreshold: 3,
  suspensionThreshold: 4,
  lookbackDays: 90,
  autoResetAfterDays: 30,
};

/**
 * Get strike level based on count of violations within lookback window
 */
export function getStrikeLevel(
  violationCount: number,
  config: StrikeConfig = DEFAULT_STRIKE_CONFIG
): StrikeLevel {
  if (violationCount >= config.suspensionThreshold) return 'suspended';
  if (violationCount >= config.redThreshold) return 'red';
  if (violationCount >= config.yellowThreshold) return 'yellow';
  if (violationCount >= config.warningThreshold) return 'warning';
  return 'none';
}

/**
 * Get strike level display info
 */
export function getStrikeLevelInfo(level: StrikeLevel): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
  action: string;
} {
  switch (level) {
    case 'warning':
      return {
        label: '⚠️ Warning',
        color: '#fbbf24',
        bgColor: 'rgba(251, 191, 36, 0.1)',
        icon: '⚠️',
        description: 'Primeira violação - agente notificado',
        action: 'Log + notificação ao agente',
      };
    case 'yellow':
      return {
        label: '🟡 Alerta Amarelo',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: '🟡',
        description: 'Segunda violação - pausa para análise',
        action: 'Pausa automática + análise obrigatória',
      };
    case 'red':
      return {
        label: '🔴 Alerta Vermelho',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        icon: '🔴',
        description: 'Terceira violação - revisão de escopo',
        action: 'Revisão obrigatória de escopo + restrições',
      };
    case 'suspended':
      return {
        label: '❌ Suspenso',
        color: '#dc2626',
        bgColor: 'rgba(220, 38, 38, 0.1)',
        icon: '❌',
        description: 'Quarta violação - suspensão até revisão manual',
        action: 'Suspensão total - requer intervenção humana',
      };
    default:
      return {
        label: 'Limpo',
        color: '#22c55e',
        bgColor: 'rgba(34, 197, 94, 0.1)',
        icon: '✅',
        description: 'Sem violações recentes',
        action: 'Operação normal',
      };
  }
}

/**
 * Determine if agent should be auto-paused based on strike level
 */
export function shouldAutoPause(level: StrikeLevel): boolean {
  return level === 'yellow' || level === 'red' || level === 'suspended';
}

/**
 * Determine if agent needs human review
 */
export function needsHumanReview(level: StrikeLevel): boolean {
  return level === 'red' || level === 'suspended';
}

/**
 * Count recent violations within lookback window
 */
export function countRecentViolations(
  strikes: StrikeRecord[],
  agentId: string,
  config: StrikeConfig = DEFAULT_STRIKE_CONFIG
): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - config.lookbackDays);

  return strikes.filter(
    (s) => s.agentId === agentId && new Date(s.timestamp) >= cutoff
  ).length;
}

/**
 * Calculate time since last violation (for auto-reset)
 */
export function getDaysSinceLastViolation(
  strikes: StrikeRecord[],
  agentId: string
): number | null {
  const agentStrikes = strikes
    .filter((s) => s.agentId === agentId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (agentStrikes.length === 0) return null;
  const lastStrike = agentStrikes[0];
  const diff = Date.now() - new Date(lastStrike.timestamp).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Determine if strikes should auto-reset
 */
export function shouldAutoReset(
  strikes: StrikeRecord[],
  agentId: string,
  config: StrikeConfig = DEFAULT_STRIKE_CONFIG
): boolean {
  const daysSince = getDaysSinceLastViolation(strikes, agentId);
  return daysSince !== null && daysSince >= config.autoResetAfterDays;
}

/**
 * Get recommended status for agent role based on strike level
 */
export function getRecommendedAgentStatus(level: StrikeLevel): AgentWorkStatus {
  if (level === 'suspended') return 'blocked';
  if (level === 'red' || level === 'yellow') return 'blocked';
  return 'idle';
}
