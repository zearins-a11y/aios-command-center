-- ============================================
-- AIOS Command Center - Database Schema
-- ============================================

-- 1. Approval Items (aprovacoes)
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'post',
  status TEXT DEFAULT 'pending',
  submitted_by TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  confidence_score INTEGER,
  validator TEXT,
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  pending_since TIMESTAMPTZ
);

-- 2. Appeals (recursos)
CREATE TABLE IF NOT EXISTS appeals (
  id TEXT PRIMARY KEY,
  approval_item_id TEXT,
  approval_item_title TEXT,
  status TEXT DEFAULT 'submitted',
  grounds TEXT,
  justification TEXT,
  priority TEXT DEFAULT 'normal',
  sla_deadline_hours INTEGER DEFAULT 48,
  assigned_reviewer_id TEXT,
  assigned_reviewer_name TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Strike Records (avisos de agentes)
CREATE TABLE IF NOT EXISTS strike_records (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  agent_name TEXT,
  level TEXT DEFAULT 'warning',
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  notes TEXT
);

-- 4. Feedback Signals (sinais de feedback)
CREATE TABLE IF NOT EXISTS feedback_signals (
  id TEXT PRIMARY KEY,
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

-- 5. Agent Evaluations (avaliações de agentes)
CREATE TABLE IF NOT EXISTS agent_evaluations (
  id TEXT PRIMARY KEY,
  name TEXT,
  source TEXT,
  source_path TEXT,
  category TEXT,
  description TEXT,
  capabilities TEXT[],
  fit_with_aios INTEGER,
  fit_with_xquads INTEGER,
  reusability INTEGER,
  business_value INTEGER,
  maintenance_cost INTEGER,
  status TEXT,
  recommendation TEXT,
  reasoning TEXT,
  integration_steps TEXT[],
  estimated_hours INTEGER,
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  evaluated_by TEXT
);

-- 6. Confidence Thresholds (thresholds de validação)
CREATE TABLE IF NOT EXISTS confidence_thresholds (
  id TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT TRUE,
  min_confidence INTEGER DEFAULT 70,
  warning_threshold INTEGER DEFAULT 80,
  critical_threshold INTEGER DEFAULT 50
);

-- 7. Validation History (histórico de validações)
CREATE TABLE IF NOT EXISTS validation_history (
  id TEXT PRIMARY KEY,
  results JSONB,
  decision TEXT,
  combined_confidence INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Health Metrics (métricas de saúde)
CREATE TABLE IF NOT EXISTS health_metrics (
  id SERIAL PRIMARY KEY,
  date TIMESTAMPTZ DEFAULT NOW(),
  score INTEGER,
  metrics JSONB,
  status TEXT
);

-- 9. Public Exceptions (exceções públicas)
CREATE TABLE IF NOT EXISTS public_exceptions (
  id TEXT PRIMARY KEY,
  reference_id TEXT,
  reference_title TEXT,
  reference_type TEXT,
  type TEXT,
  status TEXT DEFAULT 'pending',
  severity TEXT DEFAULT 'low',
  title TEXT,
  description TEXT,
  justification TEXT,
  business_impact TEXT,
  risk_assessment TEXT,
  requested_by TEXT,
  requested_by_role TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  conditions TEXT[],
  monitoring_required BOOLEAN DEFAULT FALSE,
  expiration_date TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT FALSE,
  stakeholder_notification BOOLEAN DEFAULT FALSE,
  stakeholder_notification_date TIMESTAMPTZ,
  impact_metrics JSONB,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  lessons_learned TEXT,
  tags TEXT[],
  related_exceptions TEXT[]
);

-- 10. Council Members (membros do conselho)
CREATE TABLE IF NOT EXISTS council_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  email TEXT,
  role TEXT DEFAULT 'member',
  specialties TEXT[],
  status TEXT DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  max_cases_per_month INTEGER DEFAULT 5,
  cases_reviewed INTEGER DEFAULT 0,
  opinions_issued INTEGER DEFAULT 0
);

-- 11. Council Cases (casos do conselho)
CREATE TABLE IF NOT EXISTS council_cases (
  id TEXT PRIMARY KEY,
  reference_id TEXT,
  reference_title TEXT,
  reference_type TEXT,
  status TEXT DEFAULT 'pending_assignment',
  priority TEXT DEFAULT 'normal',
  category TEXT[],
  assigned_to TEXT[],
  summary TEXT,
  context TEXT,
  questions TEXT[],
  recommendation TEXT,
  confidence INTEGER,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deadline TIMESTAMPTZ
);

-- ============================================
-- Enable RLS (Row Level Security)
-- ============================================
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE strike_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE confidence_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE council_cases ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies (allow all for anon for demo)
-- ============================================
CREATE POLICY "Allow all" ON approvals FOR ALL TO anon USING (true);
CREATE POLICY "Allow all" ON appeals FOR ALL TO anon USING (true);
CREATE POLICY "Allow all" ON strike_records FOR ALL TO anon USING (true);
CREATE POLICY "Allow all" ON feedback_signals FOR ALL TO anon USING (true);
CREATE POLICY "Allow all" ON agent_evaluations FOR ALL TO anon USING (true);
CREATE POLICY "Allow all" ON confidence_thresholds FOR ALL TO anon USING (true);
CREATE POLICY "Allow all" ON validation_history FOR ALL TO anon USING (true);
CREATE POLICY "Allow all" ON health_metrics FOR ALL TO anon USING (true);
CREATE POLICY "Allow all" ON public_exceptions FOR ALL TO anon USING (true);
CREATE POLICY "Allow all" ON council_members FOR ALL TO anon USING (true);
CREATE POLICY "Allow all" ON council_cases FOR ALL TO anon USING (true);

-- ============================================
-- Enable Realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE appeals;
ALTER PUBLICATION supabase_realtime ADD TABLE strike_records;
ALTER PUBLICATION supabase_realtime ADD TABLE feedback_signals;
