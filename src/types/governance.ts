// Governance Types for AIOS Command Center

export type FlowStage = 'research' | 'creation' | 'validation' | 'human_gate' | 'publication';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';
export type UrgencyLevel = 'urgent' | 'normal' | 'low';
export type SensitiveActionStatus = 'awaiting_human' | 'awaiting_clevel' | 'in_delay' | 'approved' | 'rejected';
export type AgentRole = 'strategy' | 'copywriter' | 'studio' | 'guardian' | 'operator' | 'aios_dev' | 'copy_squad' | 'data_squad' | 'legal_compliance' | 'brand_guardian' | 'advisory_board';
export type AgentWorkStatus = 'idle' | 'working' | 'blocked';
export type AuditResult = 'success' | 'draft' | 'approved' | 'published' | 'rejected' | 'warning';

export interface ApprovalItem {
  id: string;
  type: 'instagram' | 'linkedin' | 'whatsapp' | 'email' | 'blog' | 'tiktok';
  title: string;
  account: string;
  content: {
    copy: string;
    thumbnail?: string;
    cta?: string;
    scheduledTime?: string;
    platform?: string;
  };
  guardianAlerts: GuardianAlert[];
  checksum: string;
  sourcesCount: number;
  createdBy: string;
  agents: string[];
  status: ApprovalStatus;
  urgency: UrgencyLevel;
  createdAt: Date;
  pendingSince: Date;
}

export interface GuardianAlert {
  id: string;
  message: string;
  status: 'warning' | 'ok';
}

export interface SensitiveAction {
  id: string;
  type: string;
  description: string;
  value?: string;
  status: SensitiveActionStatus;
  awaitingApproval: string[];
  confirmedApprovals: string[];
  delayHours?: number;
  delayStartedAt?: Date;
  createdAt: Date;
}

export interface AgentRoleData {
  id: AgentRole;
  name: string;
  icon: string;
  status: AgentWorkStatus;
  activeTasks: number;
  queueTasks: number;
  description: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  agent: string;
  action: string;
  checksum?: string;
  approver?: string;
  result: AuditResult;
  details?: string;
}

// Cross-Check Ranker Types (P0 from Benchmark)
export interface RiskScore {
  total: number; // 0-100
  breakdown: {
    reach: number;      // 0-30: predicted reach/impact
    severity: number;   // 0-40: content severity/allegation
    falsePositive: number; // 0-20: risk of false positive
    urgency: number;    // 0-10: temporal urgency
  };
  rank: 'critical' | 'high' | 'medium' | 'low';
}

export interface ApprovalItemWithScore extends ApprovalItem {
  riskScore: RiskScore;
  isEscalated: boolean;
}

export interface GovernanceState {
  // Flow
  currentStage: FlowStage;
  completedStages: FlowStage[];

  // Approvals
  pendingApprovals: ApprovalItem[];
  selectedApprovalId: string | null;

  // Sensitive Actions
  sensitiveActions: SensitiveAction[];

  // Agent Roles
  agentRoles: AgentRoleData[];

  // Audit Log
  auditLog: AuditLogEntry[];

  // UI
  showApprovalModal: boolean;
}
