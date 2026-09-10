// Database Types for Supabase Integration
// These types map to the SQL schema

export interface Workspace {
  id: string
  name: string
  description: string | null
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AiosQueueItem {
  id: string
  workspace_id: string | null
  agent_type: string
  task_data: Record<string, unknown>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  priority: number
  error: string | null
  attempts: number
  created_at: string
  updated_at: string
}

export interface AgentLog {
  id: string
  workspace_id: string | null
  project_id: string | null
  agent: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  metadata: Record<string, unknown>
  created_at: string
}

// Governance Types
export interface ApprovalItem {
  id: string
  type: string
  title: string
  content: Record<string, unknown> | null
  guardian_alerts: Record<string, unknown>[] | null
  checksum: string | null
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested'
  urgency: 'low' | 'normal' | 'high' | 'critical'
  created_at: string
  pending_since?: string
}

export interface Appeal {
  id: string
  approval_item_id: string | null
  approval_item_title: string | null
  status: 'submitted' | 'under_review' | 'approved' | 'rejected'
  grounds: string | null
  justification: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  sla_deadline_hours: number
  submitted_at: string
}

// Agent Types
export interface StrikeRecord {
  id: string
  agent_id: string | null
  agent_name: string | null
  level: 'warning' | 'yellow' | 'red'
  reason: string | null
  timestamp: string
  resolved_by: string | null
  resolved_at: string | null
  notes: string | null
}

export interface StrikeConfig {
  id: string
  warning_threshold: number
  yellow_threshold: number
  red_threshold: number
  auto_reset_days: number
}

export interface ConfidenceThreshold {
  id: string
  enabled: boolean
  min_confidence: number
  warning_threshold: number
  critical_threshold: number
}

export interface ValidationHistory {
  id: string
  timestamp: string
  results: Record<string, unknown>
  decision: string
  combined_confidence: number
}

export interface FeedbackSignal {
  id: string
  item_id: string | null
  item_title: string | null
  item_type: string | null
  decision: string | null
  agent_id: string | null
  agent_name: string | null
  squad_id: string | null
  pattern: string | null
  pattern_confidence: number | null
  reason: string | null
  original_content: string | null
  modified_content: string | null
  was_published: boolean
  agent_acknowledged: boolean
  agent_acknowledged_at: string | null
  created_at: string
}

// Council Types
export interface CouncilMember {
  id: string
  name: string
  title: string | null
  organization: string | null
  email: string | null
  role: 'member' | 'senior' | 'chair'
  specialties: string[]
  status: 'active' | 'inactive'
  joined_at: string
  max_cases_per_month?: number
  cases_reviewed?: number
  opinions_issued?: number
}

export interface CouncilCase {
  id: string
  reference_id: string | null
  reference_title: string | null
  reference_type: string | null
  status: 'pending_assignment' | 'under_review' | 'awaiting_decision' | 'decided'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category: string[]
  summary: string | null
  context: string | null
  questions: string[] | null
  assigned_to: string[] | null
  recommendation: string | null
  confidence: number | null
  created_by: string | null
  created_at: string
  deadline: string | null
}

export interface CouncilOpinion {
  id: string
  case_id: string
  member_id: string | null
  member_name: string | null
  position: 'approve' | 'reject' | 'abstain' | 'request_info'
  opinion: string | null
  reasoning: string | null
  confidence: number | null
  concerns: string[] | null
  suggestions: string[] | null
  created_at: string
}

// Evaluation Types
export interface AgentEvaluation {
  id: string
  name: string
  source: string | null
  source_path: string | null
  category: string | null
  description: string | null
  capabilities: string[]
  fit_with_aios: number | null
  fit_with_xquads: number | null
  reusability: number | null
  business_value: number | null
  maintenance_cost: number | null
  status: 'pending' | 'approved' | 'rejected' | 'needs_review'
  recommendation: string | null
  reasoning: string | null
  integration_steps: string[] | null
  estimated_hours: number | null
  evaluated_at: string
  evaluated_by: string | null
}

// Exception Types
export interface PublicException {
  id: string
  reference_id: string | null
  reference_title: string | null
  reference_type: string | null
  type: string
  title: string
  description: string | null
  justification: string | null
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'revoked'
  severity: 'low' | 'medium' | 'high' | 'critical'
  requested_by: string | null
  requested_by_role: string | null
  approved_by: string | null
  approved_at: string | null
  conditions: string[] | null
  expiration_date: string | null
  is_public: boolean
  impact_metrics: Record<string, unknown> | null
  lessons_learned: string | null
  requested_at: string
}

// Health & Regional Types
export interface HealthMetric {
  id: string
  name: string
  value: number | null
  target: number | null
  unit: string | null
  trend: 'up' | 'down' | 'stable'
  status: 'healthy' | 'warning' | 'critical'
  description: string | null
  updated_at: string
}

export interface HealthTrend {
  id: string
  date: string
  metrics: Record<string, number>
  created_at: string
}

export interface RegionalConfig {
  region: string
  publish_windows: { start: string; end: string }[]
  best_times: { day: string; hour: number }[]
  holiday_aware: boolean
  cultural_adaptation: boolean
}

export interface Holiday {
  id: string
  region: string
  date: string
  name: string
  type: 'public' | 'optional' | 'religious'
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: Workspace
        Insert: Omit<Workspace, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Workspace, 'id'>>
      }
      aios_queue_items: {
        Row: AiosQueueItem
        Insert: Omit<AiosQueueItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AiosQueueItem, 'id'>>
      }
      agent_logs: {
        Row: AgentLog
        Insert: Omit<AgentLog, 'id' | 'created_at'>
        Update: Partial<Omit<AgentLog, 'id'>>
      }
      approval_items: {
        Row: ApprovalItem
        Insert: Omit<ApprovalItem, 'id' | 'created_at'>
        Update: Partial<Omit<ApprovalItem, 'id'>>
      }
      appeals: {
        Row: Appeal
        Insert: Omit<Appeal, 'id' | 'submitted_at'>
        Update: Partial<Omit<Appeal, 'id'>>
      }
      strike_records: {
        Row: StrikeRecord
        Insert: Omit<StrikeRecord, 'id' | 'timestamp'>
        Update: Partial<Omit<StrikeRecord, 'id'>>
      }
      confidence_thresholds: {
        Row: ConfidenceThreshold
        Insert: ConfidenceThreshold
        Update: Partial<ConfidenceThreshold>
      }
      feedback_signals: {
        Row: FeedbackSignal
        Insert: Omit<FeedbackSignal, 'id' | 'created_at'>
        Update: Partial<Omit<FeedbackSignal, 'id'>>
      }
      council_members: {
        Row: CouncilMember
        Insert: Omit<CouncilMember, 'id' | 'joined_at'>
        Update: Partial<Omit<CouncilMember, 'id'>>
      }
      council_cases: {
        Row: CouncilCase
        Insert: Omit<CouncilCase, 'id' | 'created_at'>
        Update: Partial<Omit<CouncilCase, 'id'>>
      }
      council_opinions: {
        Row: CouncilOpinion
        Insert: Omit<CouncilOpinion, 'id' | 'created_at'>
        Update: Partial<Omit<CouncilOpinion, 'id'>>
      }
      agent_evaluations: {
        Row: AgentEvaluation
        Insert: Omit<AgentEvaluation, 'id' | 'evaluated_at'>
        Update: Partial<Omit<AgentEvaluation, 'id'>>
      }
      public_exceptions: {
        Row: PublicException
        Insert: Omit<PublicException, 'id' | 'requested_at'>
        Update: Partial<Omit<PublicException, 'id'>>
      }
      health_metrics: {
        Row: HealthMetric
        Insert: Omit<HealthMetric, 'id' | 'updated_at'>
        Update: Partial<Omit<HealthMetric, 'id'>>
      }
      regional_configs: {
        Row: RegionalConfig
        Insert: RegionalConfig
        Update: Partial<RegionalConfig>
      }
    }
  }
}
