-- =====================================================
-- AIOS Command Center - Supabase Schema Migration
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AIOS Queue Items table
CREATE TABLE IF NOT EXISTS aios_queue_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  agent_type TEXT NOT NULL,
  task_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 0,
  error TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Logs table
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  project_id UUID,
  agent TEXT NOT NULL,
  level TEXT DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- GOVERNANCE TABLES
-- =====================================================

-- Approval Items table
CREATE TABLE IF NOT EXISTS approval_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB,
  guardian_alerts JSONB,
  checksum TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  pending_since TIMESTAMPTZ DEFAULT NOW()
);

-- Appeals table
CREATE TABLE IF NOT EXISTS appeals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_item_id UUID REFERENCES approval_items(id) ON DELETE SET NULL,
  approval_item_title TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
  grounds TEXT,
  justification TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  sla_deadline_hours INTEGER DEFAULT 48,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AGENT TABLES
-- =====================================================

-- Strike Records table
CREATE TABLE IF NOT EXISTS strike_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT,
  agent_name TEXT,
  level TEXT NOT NULL CHECK (level IN ('warning', 'yellow', 'red')),
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  notes TEXT
);

-- Strike Configuration table
CREATE TABLE IF NOT EXISTS strike_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warning_threshold INTEGER DEFAULT 1,
  yellow_threshold INTEGER DEFAULT 2,
  red_threshold INTEGER DEFAULT 3,
  auto_reset_days INTEGER DEFAULT 30
);

-- Confidence Thresholds table
CREATE TABLE IF NOT EXISTS confidence_thresholds (
  id TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT TRUE,
  min_confidence INTEGER DEFAULT 70,
  warning_threshold INTEGER DEFAULT 80,
  critical_threshold INTEGER DEFAULT 60
);

-- Validation History table
CREATE TABLE IF NOT EXISTS validation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  results JSONB,
  decision TEXT,
  combined_confidence INTEGER
);

-- Feedback Signals table
CREATE TABLE IF NOT EXISTS feedback_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id TEXT,
  item_title TEXT,
  item_type TEXT,
  decision TEXT,
  agent_id TEXT,
  agent_name TEXT,
  squad_id TEXT,
  reviewer_id TEXT,
  reviewer_name TEXT,
  pattern TEXT,
  pattern_confidence INTEGER,
  reason TEXT,
  original_content TEXT,
  modified_content TEXT,
  was_published BOOLEAN DEFAULT FALSE,
  agent_acknowledged BOOLEAN DEFAULT FALSE,
  agent_acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COUNCIL TABLES
-- =====================================================

-- Council Members table
CREATE TABLE IF NOT EXISTS council_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  email TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'senior', 'chair')),
  specialties TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  max_cases_per_month INTEGER DEFAULT 5
);

-- Council Cases table
CREATE TABLE IF NOT EXISTS council_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_id TEXT,
  reference_title TEXT,
  reference_type TEXT,
  status TEXT DEFAULT 'pending_assignment' CHECK (status IN ('pending_assignment', 'under_review', 'awaiting_decision', 'decided')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT[] DEFAULT '{}',
  summary TEXT,
  context TEXT,
  questions TEXT[] DEFAULT '{}',
  assigned_to UUID[] DEFAULT '{}',
  recommendation TEXT,
  confidence INTEGER,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ
);

-- Council Opinions table
CREATE TABLE IF NOT EXISTS council_opinions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES council_cases(id) ON DELETE CASCADE,
  member_id UUID REFERENCES council_members(id) ON DELETE SET NULL,
  member_name TEXT,
  position TEXT CHECK (position IN ('approve', 'reject', 'abstain', 'request_info')),
  opinion TEXT,
  reasoning TEXT,
  confidence INTEGER,
  concerns TEXT[] DEFAULT '{}',
  suggestions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EVALUATION TABLES
-- =====================================================

-- Agent Evaluations table
CREATE TABLE IF NOT EXISTS agent_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  source TEXT,
  source_path TEXT,
  category TEXT,
  description TEXT,
  capabilities TEXT[] DEFAULT '{}',
  fit_with_aios INTEGER,
  fit_with_xquads INTEGER,
  reusability INTEGER,
  business_value INTEGER,
  maintenance_cost INTEGER,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review')),
  recommendation TEXT,
  reasoning TEXT,
  integration_steps TEXT[] DEFAULT '{}',
  estimated_hours INTEGER,
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  evaluated_by TEXT
);

-- =====================================================
-- EXCEPTION TABLES
-- =====================================================

-- Public Exceptions table
CREATE TABLE IF NOT EXISTS public_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_id TEXT,
  reference_title TEXT,
  reference_type TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  justification TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'revoked')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  requested_by TEXT,
  requested_by_role TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  conditions TEXT[] DEFAULT '{}',
  expiration_date TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT TRUE,
  impact_metrics JSONB,
  lessons_learned TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- HEALTH & REGIONAL TABLES
-- =====================================================

-- Health Metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  value INTEGER,
  target INTEGER,
  unit TEXT,
  trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
  status TEXT CHECK (status IN ('healthy', 'warning', 'critical')),
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Trends table
CREATE TABLE IF NOT EXISTS health_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regional Configs table
CREATE TABLE IF NOT EXISTS regional_configs (
  region TEXT PRIMARY KEY,
  publish_windows JSONB,
  best_times JSONB,
  holiday_aware BOOLEAN DEFAULT TRUE,
  cultural_adaptation BOOLEAN DEFAULT TRUE
);

-- Holidays table
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region TEXT NOT NULL,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'public' CHECK (type IN ('public', 'optional', 'religious'))
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Queue indexes
CREATE INDEX IF NOT EXISTS idx_queue_status ON aios_queue_items(status);
CREATE INDEX IF NOT EXISTS idx_queue_agent_type ON aios_queue_items(agent_type);
CREATE INDEX IF NOT EXISTS idx_queue_workspace ON aios_queue_items(workspace_id);

-- Logs indexes
CREATE INDEX IF NOT EXISTS idx_logs_created ON agent_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_workspace ON agent_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_logs_agent ON agent_logs(agent);

-- Governance indexes
CREATE INDEX IF NOT EXISTS idx_approval_status ON approval_items(status);
CREATE INDEX IF NOT EXISTS idx_appeals_item ON appeals(approval_item_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON appeals(status);

-- Agent indexes
CREATE INDEX IF NOT EXISTS idx_strikes_agent ON strike_records(agent_id);
CREATE INDEX IF NOT EXISTS idx_feedback_agent ON feedback_signals(agent_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_signals(created_at DESC);

-- Council indexes
CREATE INDEX IF NOT EXISTS idx_cases_status ON council_cases(status);
CREATE INDEX IF NOT EXISTS idx_opinions_case ON council_opinions(case_id);

-- =====================================================
-- REALTIME
-- =====================================================

-- Enable realtime for important tables
-- Note: Requires Supabase Pro plan or higher for multiple tables
ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE aios_queue_items;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE approval_items;
ALTER PUBLICATION supabase_realtime ADD TABLE appeals;
ALTER PUBLICATION supabase_realtime ADD TABLE strike_records;
ALTER PUBLICATION supabase_realtime ADD TABLE feedback_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE council_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE council_opinions;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE aios_queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE strike_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE confidence_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_configs ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (customize as needed)
-- For now, allow all operations (customize for production)
CREATE POLICY "Allow all" ON workspaces FOR ALL USING (true);
CREATE POLICY "Allow all" ON aios_queue_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON agent_logs FOR ALL USING (true);
CREATE POLICY "Allow all" ON approval_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON appeals FOR ALL USING (true);
CREATE POLICY "Allow all" ON strike_records FOR ALL USING (true);
CREATE POLICY "Allow all" ON confidence_thresholds FOR ALL USING (true);
CREATE POLICY "Allow all" ON feedback_signals FOR ALL USING (true);
CREATE POLICY "Allow all" ON council_members FOR ALL USING (true);
CREATE POLICY "Allow all" ON council_cases FOR ALL USING (true);
CREATE POLICY "Allow all" ON council_opinions FOR ALL USING (true);
CREATE POLICY "Allow all" ON agent_evaluations FOR ALL USING (true);
CREATE POLICY "Allow all" ON public_exceptions FOR ALL USING (true);
CREATE POLICY "Allow all" ON health_metrics FOR ALL USING (true);
CREATE POLICY "Allow all" ON regional_configs FOR ALL USING (true);

-- =====================================================
-- SEED DATA (Optional)
-- =====================================================

-- Insert default regional configs
INSERT INTO regional_configs (region, publish_windows, best_times) VALUES
  ('br', '[{"start": "09:00", "end": "12:00"}, {"start": "14:00", "end": "18:00"}]', '[{"day": "monday", "hour": 10}, {"day": "wednesday", "hour": 15}]'),
  ('us', '[{"start": "09:00", "end": "17:00"}]', '[{"day": "tuesday", "hour": 10}, {"day": "thursday", "hour": 14}]'),
  ('eu', '[{"start": "09:00", "end": "18:00"}]', '[{"day": "monday", "hour": 10}, {"day": "wednesday", "hour": 11}]')
ON CONFLICT (region) DO NOTHING;

-- Insert default confidence thresholds
INSERT INTO confidence_thresholds (id, enabled, min_confidence, warning_threshold, critical_threshold) VALUES
  ('default', true, 70, 80, 60)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- COMPLETION
-- =====================================================

-- Grant permissions (adjust role name as needed)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

SELECT 'Migration completed successfully!' as status;
