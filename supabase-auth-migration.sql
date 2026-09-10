-- ============================================
-- AIOS Command Center - Auth & Permissions
-- ============================================

-- ============================================
-- Auth Tables (extending Supabase Auth)
-- ============================================

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Hierarchy: Workspace > Project > Team > Member
-- ============================================

-- Workspaces (top level)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects inside workspaces
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams inside projects
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Roles & Permissions
-- ============================================

-- System roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default roles
INSERT INTO roles (name, description, is_system) VALUES
  ('super_admin', 'Super Admin - full access', TRUE),
  ('admin', 'Admin - project management', TRUE),
  ('gestor', 'Gestor - team management', TRUE),
  ('membro', 'Membro - standard access', TRUE),
  ('viewer', 'Viewer - read only', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Modules (features)
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Default modules
INSERT INTO modules (name, description, icon, sort_order) VALUES
  ('governance', 'Aprovações e governança', 'shield', 1),
  ('appeals', 'Recursos e apelações', 'scale', 2),
  ('strikes', 'Sistema de avisos', 'alert-triangle', 3),
  ('feedback', 'Feedback loop', 'message-circle', 4),
  ('council', 'Conselho consultivo', 'users', 5),
  ('evaluations', 'Avaliação de agentes', 'star', 6),
  ('exceptions', 'Exceções públicas', 'alert-circle', 7),
  ('health', 'Métricas de saúde', 'activity', 8),
  ('regional', 'Adaptação regional', 'globe', 9)
ON CONFLICT (name) DO NOTHING;

-- Role permissions (which role can do what in which module)
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  module_name TEXT NOT NULL,
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  can_approve BOOLEAN DEFAULT FALSE,
  UNIQUE(role_id, module_name)
);

-- Default permissions for each role
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete, can_approve)
SELECT r.id, m.name,
  CASE r.name
    WHEN 'viewer' THEN TRUE
    WHEN 'membro' THEN TRUE
    WHEN 'gestor' THEN TRUE
    WHEN 'admin' THEN TRUE
    WHEN 'super_admin' THEN TRUE
    ELSE FALSE
  END,
  CASE r.name
    WHEN 'membro' THEN TRUE
    WHEN 'gestor' THEN TRUE
    WHEN 'admin' THEN TRUE
    WHEN 'super_admin' THEN TRUE
    ELSE FALSE
  END,
  CASE r.name
    WHEN 'gestor' THEN TRUE
    WHEN 'admin' THEN TRUE
    WHEN 'super_admin' THEN TRUE
    ELSE FALSE
  END,
  CASE r.name
    WHEN 'gestor' THEN TRUE
    WHEN 'admin' THEN TRUE
    WHEN 'super_admin' THEN TRUE
    ELSE FALSE
  END,
  CASE r.name
    WHEN 'gestor' THEN TRUE
    WHEN 'admin' THEN TRUE
    WHEN 'super_admin' THEN TRUE
    ELSE FALSE
  END
FROM roles r, modules m
ON CONFLICT (role_id, module_name) DO NOTHING;

-- Team members (user with role in a team)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES roles(id) NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- ============================================
-- Invitations System
-- ============================================

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role_id UUID REFERENCES roles(id) NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_status ON invitations(status);

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_invitation(p_token TEXT)
RETURNS UUID AS $$
DECLARE
  v_invitation invitations;
  v_team_member_id UUID;
BEGIN
  -- Get invitation
  SELECT * INTO v_invitation
  FROM invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Convite inválido ou expirado';
  END IF;

  -- Add user to team
  INSERT INTO team_members (team_id, user_id, role_id, assigned_by)
  VALUES (v_invitation.team_id, auth.uid(), v_invitation.role_id, v_invitation.invited_by)
  RETURNING id INTO v_team_member_id;

  -- Update invitation status
  UPDATE invitations SET status = 'accepted' WHERE id = v_invitation.id;

  RETURN v_team_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Audit Logs
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  module_name TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_team ON audit_logs(team_id);
CREATE INDEX idx_audit_logs_module ON audit_logs(module_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Function to create audit log
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action TEXT,
  p_module TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_team_id UUID;
  v_log_id UUID;
BEGIN
  -- Get user's team (most recent membership)
  SELECT team_id INTO v_team_id
  FROM team_members
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT 1;

  INSERT INTO audit_logs (user_id, team_id, action, module_name, resource_type, resource_id, old_value, new_value, ip_address, user_agent)
  VALUES (
    auth.uid(),
    v_team_id,
    p_action,
    p_module,
    p_resource_type,
    p_resource_id,
    p_old_value,
    p_new_value,
    NULLIF(current_setting('request.headers', true)::json->>'x-forwarded-for', '')::INET,
    NULLIF(current_setting('request.headers', true)::json->>'user-agent', '')
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Row Level Security
-- ============================================

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for workspaces
CREATE POLICY "Users can view workspaces they own or belong to"
  ON workspaces FOR SELECT
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    JOIN projects p ON t.project_id = p.id
    WHERE p.workspace_id = workspaces.id AND tm.user_id = auth.uid()
  ));

CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update workspaces"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid());

-- Policies for projects
CREATE POLICY "Users can view projects in their workspace"
  ON projects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workspaces w
    WHERE w.id = projects.workspace_id AND (
      w.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM team_members tm
        JOIN teams t ON tm.team_id = t.id
        WHERE t.project_id = projects.id AND tm.user_id = auth.uid()
      )
    )
  ));

-- Policies for teams
CREATE POLICY "Users can view teams in their projects"
  ON teams FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = teams.project_id AND EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = p.workspace_id AND (
        w.owner_id = auth.uid() OR EXISTS (
          SELECT 1 FROM team_members tm
          JOIN teams t2 ON tm.team_id = t2.id
          WHERE t2.project_id = p.id AND tm.user_id = auth.uid()
        )
      )
    )
  ));

-- Policies for team_members
CREATE POLICY "Users can view their team memberships"
  ON team_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Gestores can manage team members"
  ON team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM team_members tm2
    JOIN roles r ON tm2.role_id = r.id
    WHERE tm2.team_id = team_members.team_id
      AND tm2.user_id = auth.uid()
      AND r.name IN ('gestor', 'admin', 'super_admin')
  ));

-- Policies for invitations
CREATE POLICY "Gestores can view invitations"
  ON invitations FOR SELECT
  USING (invited_by = auth.uid() OR EXISTS (
    SELECT 1 FROM team_members tm
    JOIN roles r ON tm.role_id = r.id
    WHERE tm.team_id = invitations.team_id
      AND tm.user_id = auth.uid()
      AND r.name IN ('gestor', 'admin', 'super_admin')
  ));

CREATE POLICY "Gestores can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (invited_by = auth.uid());

CREATE POLICY "Anyone can accept invitation with token"
  ON invitations FOR UPDATE
  USING (status = 'pending');

-- Policies for audit_logs
CREATE POLICY "Users can view audit logs from their teams"
  ON audit_logs FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members tm WHERE tm.team_id = audit_logs.team_id AND tm.user_id = auth.uid()
    )
  );

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- Policies for roles and modules (read-only for all authenticated)
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view modules"
  ON modules FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view role_permissions"
  ON role_permissions FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- Enable Realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
