-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  company text,
  timezone text DEFAULT 'UTC',
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  workspace_slug text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  invited_at timestamp with time zone DEFAULT now(),
  joined_at timestamp with time zone,
  UNIQUE(team_id, user_id)
);

-- Provider connections table
CREATE TABLE IF NOT EXISTS public.provider_connections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  provider_name text NOT NULL,
  api_key_encrypted text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_sync timestamp with time zone,
  last_error text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(team_id, provider_name)
);

-- Spending entries table
CREATE TABLE IF NOT EXISTS public.spending_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.provider_connections(id) ON DELETE CASCADE,
  model text NOT NULL,
  tokens_used bigint,
  cost_usd numeric(12, 6) NOT NULL,
  entry_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES public.provider_connections(id) ON DELETE CASCADE,
  monthly_limit_usd numeric(12, 2) NOT NULL,
  alert_threshold_pct integer DEFAULT 80,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(team_id, provider_id)
);

-- Alert settings table
CREATE TABLE IF NOT EXISTS public.alert_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  slack_enabled boolean DEFAULT false,
  slack_webhook_url text,
  spike_threshold_pct integer DEFAULT 20,
  daily_digest boolean DEFAULT true,
  weekly_report boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  token text UNIQUE NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  claimed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(team_id, email)
);

-- API keys table (for user's own API keys to access the platform)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_hash text NOT NULL,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR id IN (
    SELECT user_id FROM public.team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id OR role() = 'service_role');

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id OR role() = 'service_role');

-- Teams RLS Policies
CREATE POLICY "Teams are accessible to team members"
  ON public.teams FOR SELECT
  USING (id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  ) OR owner_id = auth.uid());

CREATE POLICY "Users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Only team owners can update teams"
  ON public.teams FOR UPDATE
  USING (owner_id = auth.uid());

-- Team Members RLS Policies
CREATE POLICY "Team members can view their team's members"
  ON public.team_members FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Only admins can add team members"
  ON public.team_members FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Only admins can modify team members"
  ON public.team_members FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Only admins can delete team members"
  ON public.team_members FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Provider Connections RLS Policies
CREATE POLICY "Team members can view their team's providers"
  ON public.provider_connections FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Only admins can add providers"
  ON public.provider_connections FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Only admins can update providers"
  ON public.provider_connections FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Only admins can delete providers"
  ON public.provider_connections FOR DELETE
  USING (team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Spending Entries RLS Policies
CREATE POLICY "Team members can view team's spending"
  ON public.spending_entries FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Only admins can insert spending entries"
  ON public.spending_entries FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Budgets RLS Policies
CREATE POLICY "Team members can view team's budgets"
  ON public.budgets FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Only admins can create budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Only admins can update budgets"
  ON public.budgets FOR UPDATE
  USING (team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Alert Settings RLS Policies
CREATE POLICY "Users can view their own alert settings"
  ON public.alert_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own alert settings"
  ON public.alert_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own alert settings"
  ON public.alert_settings FOR UPDATE
  USING (user_id = auth.uid());

-- Team Invitations RLS Policies
CREATE POLICY "Team admins can view invitations"
  ON public.team_invitations FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Team admins can create invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (team_id IN (
    SELECT team_id FROM public.team_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- API Keys RLS Policies
CREATE POLICY "Users can view their own API keys"
  ON public.api_keys FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own API keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_connections_team_id ON public.provider_connections(team_id);
CREATE INDEX IF NOT EXISTS idx_spending_entries_team_id ON public.spending_entries(team_id);
CREATE INDEX IF NOT EXISTS idx_spending_entries_entry_date ON public.spending_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_budgets_team_id ON public.budgets(team_id);
CREATE INDEX IF NOT EXISTS idx_alert_settings_user_id ON public.alert_settings(user_id);
