/**
 * Cross-Check Ranker Utility
 * Implements dynamic risk-based prioritization for approval queue
 * Based on Meta's Cross-Check system
 *
 * Score formula:
 * score = (reach * 0.3 + severity * 0.4 + falsePositive * 0.2 + urgency * 0.1)
 */

import { ApprovalItem, RiskScore, ApprovalItemWithScore } from '../types/governance';

/**
 * Calculate reach/impact score based on platform and content type
 */
function calculateReachScore(item: ApprovalItem): number {
  // Platform multipliers - check content.platform first, fallback to type
  const platform = item.content.platform || item.type;
  const platformMultiplier: Record<string, number> = {
    instagram: 25,
    tiktok: 28,
    linkedin: 20,
    twitter: 22,
    facebook: 18,
    blog: 15,
    whatsapp: 12,
    email: 10,
  };

  // Base reach from platform
  const baseReach = platformMultiplier[platform] || 15;

  // Adjust based on alert severity (Guardian flagged items might have higher impact)
  const alertMultiplier = item.guardianAlerts.length > 0 ? 1.2 : 1;

  // Adjust based on content length (longer content = more engagement potential)
  const contentLength = item.content.copy?.length || 0;
  const lengthBonus = Math.min(contentLength / 500, 10); // Cap at +10

  return Math.min(30, baseReach * alertMultiplier + lengthBonus);
}

/**
 * Calculate severity score based on content and alerts
 */
function calculateSeverityScore(item: ApprovalItem): number {
  let score = 15; // Base severity

  // Check for Guardian warnings
  const warnings = item.guardianAlerts.filter(a => a.status === 'warning').length;
  score += warnings * 8;

  // Check for potential issues in content
  const content = item.content.copy?.toLowerCase() || '';

  // High-risk keywords that increase severity
  const highRiskPatterns = [
    /finance|invest|money|earning/i,
    /medical|health|doctor|medicine/i,
    /legal|lawyer|lawsuit/i,
    /political|election|vote/i,
    /controvers|scandal|expose/i,
  ];

  highRiskPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      score += 5;
    }
  });

  // CTA present increases potential impact
  if (item.content.cta) {
    score += 3;
  }

  return Math.min(40, score);
}

/**
 * Calculate false positive risk (reversal potential)
 */
function calculateFalsePositiveScore(item: ApprovalItem): number {
  let score = 10; // Base FP risk

  // Check Guardian OK signals (reduces FP risk)
  const okSignals = item.guardianAlerts.filter(a => a.status === 'ok').length;
  score -= okSignals * 3;

  // Verified sources reduce FP risk
  if (item.sourcesCount >= 3) {
    score -= 5;
  }

  // Multiple agents in creation = less FP risk
  if (item.agents.length >= 2) {
    score -= 2;
  }

  // Content length (longer = more thought = less FP)
  const contentLength = item.content.copy?.length || 0;
  if (contentLength > 500) {
    score -= 3;
  }

  return Math.max(0, Math.min(20, score));
}

/**
 * Calculate temporal urgency score
 */
function calculateUrgencyScore(item: ApprovalItem): number {
  // Urgency level from item
  const urgencyMap: Record<string, number> = {
    urgent: 10,
    normal: 5,
    low: 2,
  };

  let score = urgencyMap[item.urgency] || 5;

  // Pending time bonus (older items get priority)
  const now = new Date();
  const pendingMs = now.getTime() - new Date(item.pendingSince).getTime();
  const pendingHours = pendingMs / (1000 * 60 * 60);

  // Add up to +5 for items pending more than 24h
  if (pendingHours > 24) {
    score += 5;
  } else if (pendingHours > 12) {
    score += 3;
  } else if (pendingHours > 6) {
    score += 1;
  }

  // Scheduled time adds urgency
  if (item.content.scheduledTime) {
    const scheduled = new Date(item.content.scheduledTime);
    const hoursUntil = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil > 0 && hoursUntil < 2) {
      score += 5; // Very close to scheduled time
    } else if (hoursUntil > 0 && hoursUntil < 6) {
      score += 3;
    }
  }

  return Math.min(10, score);
}

/**
 * Determine rank category from score
 */
function getRankFromScore(score: number): RiskScore['rank'] {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Calculate full risk score for an approval item
 */
export function calculateRiskScore(item: ApprovalItem): RiskScore {
  const reach = calculateReachScore(item);
  const severity = calculateSeverityScore(item);
  const falsePositive = calculateFalsePositiveScore(item);
  const urgency = calculateUrgencyScore(item);

  const total = Math.round(reach * 0.3 + severity * 0.4 + falsePositive * 0.2 + urgency * 0.1);

  return {
    total: Math.min(100, total),
    breakdown: {
      reach: Math.round(reach * 10) / 10,
      severity: Math.round(severity * 10) / 10,
      falsePositive: Math.round(falsePositive * 10) / 10,
      urgency: Math.round(urgency * 10) / 10,
    },
    rank: getRankFromScore(total),
  };
}

/**
 * Score and sort approval items by risk priority
 */
export function rankApprovalItems(items: ApprovalItem[]): ApprovalItemWithScore[] {
  return items
    .map(item => ({
      ...item,
      riskScore: calculateRiskScore(item),
      isEscalated: false,
    }))
    .sort((a, b) => {
      // Critical items always first
      if (a.riskScore.rank === 'critical' && b.riskScore.rank !== 'critical') return -1;
      if (b.riskScore.rank === 'critical' && a.riskScore.rank !== 'critical') return 1;

      // Then by total score descending
      return b.riskScore.total - a.riskScore.total;
    })
    .map((item, index) => ({
      ...item,
      isEscalated: item.riskScore.total >= 80 ||
                   (index < 3 && item.riskScore.rank !== 'low'), // Top 3 non-low items are escalated
    }));
}

/**
 * Get recommendation text for a risk score
 */
export function getRiskRecommendation(score: RiskScore): string {
  switch (score.rank) {
    case 'critical':
      return 'Revisar imediatamente - alto impacto potencial';
    case 'high':
      return 'Revisar em breve - merece atenção prioritária';
    case 'medium':
      return 'Revisar normalmente - processo padrão';
    case 'low':
      return 'Pode aguardar - baixo risco identificado';
  }
}

/**
 * Get color for risk rank
 */
export function getRiskColor(rank: RiskScore['rank']): string {
  switch (rank) {
    case 'critical':
      return '#ef4444'; // red-500
    case 'high':
      return '#f97316'; // orange-500
    case 'medium':
      return '#eab308'; // yellow-500
    case 'low':
      return '#22c55e'; // green-500
  }
}
