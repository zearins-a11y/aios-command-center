// Workspace Types for AIOS Command Center

export type WorkspaceStatus = 'active' | 'paused' | 'blocked' | 'completed' | 'awaiting_approval';
export type TaskStatus = 'pending' | 'in_progress' | 'done';
export type WorkspaceType = 'backend' | 'frontend' | 'mobile' | 'data' | 'design' | 'marketing' | 'other';

export interface WorkspaceTask {
  id: string;
  title: string;
  status: TaskStatus;
  assignedAgent?: string;
}

export interface WorkspaceLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  agent: string;
  message: string;
}

export interface WorkspaceAgent {
  agentId: string;
  squadId: string;
  status: 'working' | 'idle' | 'blocked';
}

export interface Workspace {
  id: string;
  projectId: string;
  name: string;
  type: WorkspaceType;
  status: WorkspaceStatus;
  progress: number;
  squads: string[];
  agents: WorkspaceAgent[];
  tasks: WorkspaceTask[];
  logs: WorkspaceLog[];
  blockedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Squad Suggestion Types for Project Setup
export type SquadSuggestionStatus = 'suggested' | 'optional' | 'not_recommended' | 'selected' | 'removed';

export interface SquadSuggestion {
  squadId: string;
  name: string;
  icon: string;
  confidence: number; // 0-100
  status: SquadSuggestionStatus;
  reason: string;
  description: string;
  agentCount: number;
}

export interface SquadRecommendation {
  squadId: string;
  name: string;
  icon: string;
  confidence: number;
  reason: string;
  agents: string[];
  description: string;
}

// Project Squad Configuration
export interface ProjectSquadConfig {
  squadId: string;
  selected: boolean;
  suggestedBy: 'system' | 'user';
  confidence?: number;
  reason?: string;
}

// Project Setup State
export interface ProjectSetupState {
  projectName: string;
  projectDescription: string;
  projectType: string;
  selectedSquads: ProjectSquadConfig[];
  analysisComplete: boolean;
}

// Workspace Type Colors
export const WORKSPACE_TYPE_COLORS: Record<WorkspaceType, string> = {
  backend: '#3b82f6',    // Blue
  frontend: '#8b5cf6',   // Purple
  mobile: '#22c55e',     // Green
  data: '#06b6d4',       // Cyan
  design: '#ec4899',     // Pink
  marketing: '#f59e0b',  // Amber
  other: '#6b7280',      // Gray
};

// Status Colors
export const STATUS_COLORS: Record<WorkspaceStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  paused: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  blocked: { bg: 'bg-error/10', text: 'text-error', dot: 'bg-error' },
  completed: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
  awaiting_approval: { bg: 'bg-accent/10', text: 'text-accent', dot: 'bg-accent' },
};

// Confidence Level Colors
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 90) return 'text-success';
  if (confidence >= 75) return 'text-success';
  if (confidence >= 60) return 'text-warning';
  return 'text-text-dim';
};

export const getConfidenceBg = (confidence: number): string => {
  if (confidence >= 90) return 'bg-success/10 border-success/30';
  if (confidence >= 75) return 'bg-success/10 border-success/30';
  if (confidence >= 60) return 'bg-warning/10 border-warning/30';
  return 'bg-bg-card border-border-default';
};
