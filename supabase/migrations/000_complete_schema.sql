-- aiMonitor Complete Database Schema
-- This unified script creates the complete database from scratch
-- Combines all migrations into a single file for fresh deployments

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  password_hash text,
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

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash text UNIQUE NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Subscription plans available
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price_monthly numeric(10, 2) NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  max_team_members integer DEFAULT 1,
  max_providers integer DEFAULT 3,
  api_access boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_connections_team_id ON public.provider_connections(team_id);
CREATE INDEX IF NOT EXISTS idx_spending_entries_team_id ON public.spending_entries(team_id);
CREATE INDEX IF NOT EXISTS idx_spending_entries_entry_date ON public.spending_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_budgets_team_id ON public.budgets(team_id);
CREATE INDEX IF NOT EXISTS idx_alert_settings_user_id ON public.alert_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- ============================================================================
-- ROW LEVEL SECURITY - ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Users RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id OR id IN (
    SELECT user_id FROM public.team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

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

-- Subscription Plans RLS Policies
CREATE POLICY "Everyone can view subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (true);

-- Subscriptions RLS Policies
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid());

-- Password Reset Tokens RLS Policies
-- Note: Service role bypasses RLS, so this table is only accessible via backend API

-- Seed Subscription Plans
INSERT INTO subscription_plans (name, slug, description, price_monthly, features, max_team_members, max_providers, api_access)
VALUES
  (
    'Starter',
    'starter',
    'Perfect for developers just getting started',
    29,
    '["Real-time cost monitoring", "Up to 2 providers", "Email alerts", "30-day history", "1 team member"]'::jsonb,
    1,
    2,
    false
  ),
  (
    'Pro',
    'pro',
    'For teams actively managing costs',
    99,
    '["Real-time cost monitoring", "Unlimited providers", "Email & Slack alerts", "90-day history", "10 team members", "Custom thresholds", "Weekly reports"]'::jsonb,
    10,
    999,
    true
  ),
  (
    'Enterprise',
    'enterprise',
    'For large organizations with advanced needs',
    299,
    '["Real-time cost monitoring", "Unlimited providers", "Email & Slack & PagerDuty alerts", "1-year history", "Unlimited team members", "Custom thresholds", "Daily reports", "Dedicated support", "Custom integrations"]'::jsonb,
    999,
    999,
    true
  );

-- ============================================================================
-- LLM PROVIDER RATINGS TABLES
-- ============================================================================

-- LLM Provider Ratings Table
CREATE TABLE IF NOT EXISTS public.provider_ratings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id text UNIQUE NOT NULL,
  name text NOT NULL,
  logo text,
  color text,
  rating numeric(2,1) NOT NULL,
  reviews integer DEFAULT 0,
  description text,
  status text DEFAULT 'operational',
  pros jsonb DEFAULT '[]'::jsonb,
  cons jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- LLM Models Table
CREATE TABLE IF NOT EXISTS public.llm_models (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid NOT NULL REFERENCES public.provider_ratings(id) ON DELETE CASCADE,
  name text NOT NULL,
  input_price numeric(10,4) NOT NULL,
  output_price numeric(10,4) NOT NULL,
  context_window text,
  speed text,
  quality numeric(2,1),
  best_for text,
  best_deal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on provider tables
ALTER TABLE public.provider_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_models ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider ratings (public read access)
CREATE POLICY "Everyone can view provider ratings"
  ON public.provider_ratings FOR SELECT
  USING (true);

CREATE POLICY "Everyone can view LLM models"
  ON public.llm_models FOR SELECT
  USING (true);

-- Seed Provider Ratings Data
INSERT INTO public.provider_ratings (provider_id, name, logo, color, rating, reviews, description, status, pros, cons)
VALUES
  (
    'anthropic',
    'Anthropic',
    'A',
    '#D97757',
    4.8,
    2847,
    'Leading AI safety company with Claude models',
    'operational',
    '["Best safety alignment", "Large context window", "Excellent writing"]'::jsonb,
    '["Higher pricing", "Rate limits on free tier"]'::jsonb
  ),
  (
    'openai',
    'OpenAI',
    'O',
    '#10A37F',
    4.7,
    12453,
    'Industry pioneer with GPT models and DALL-E',
    'operational',
    '["Widest adoption", "Great ecosystem", "Fast iteration"]'::jsonb,
    '["Context smaller than Claude", "Variable quality updates"]'::jsonb
  ),
  (
    'google',
    'Google',
    'G',
    '#4285F4',
    4.5,
    3892,
    'Gemini models with multimodal capabilities',
    'operational',
    '["Largest context window", "Competitive pricing", "Strong multimodal"]'::jsonb,
    '["Availability varies by region", "API complexity"]'::jsonb
  ),
  (
    'mistral',
    'Mistral',
    'M',
    '#FF7000',
    4.4,
    1256,
    'European AI lab with efficient open models',
    'operational',
    '["GDPR compliant", "Open weights available", "Good value"]'::jsonb,
    '["Smaller context", "Less ecosystem"]'::jsonb
  ),
  (
    'cohere',
    'Cohere',
    'C',
    '#D18EE2',
    4.3,
    892,
    'Enterprise-focused with RAG specialization',
    'operational',
    '["Best-in-class RAG", "Enterprise ready", "Good embeddings"]'::jsonb,
    '["Smaller model range", "Less general purpose"]'::jsonb
  ),
  (
    'aws',
    'AWS Bedrock',
    'λ',
    '#FF9900',
    4.6,
    4521,
    'Multi-model platform with AWS integration',
    'operational',
    '["AWS integration", "Multiple models", "Enterprise security"]'::jsonb,
    '["AWS lock-in", "Complex pricing"]'::jsonb
  );

-- Seed LLM Models Data
INSERT INTO public.llm_models (provider_id, name, input_price, output_price, context_window, speed, quality, best_for, best_deal)
SELECT id, 'Claude Opus 4', 15.00, 75.00, '200K', 'Medium', 5, 'Complex reasoning', false FROM public.provider_ratings WHERE provider_id = 'anthropic'
UNION ALL
SELECT id, 'Claude Sonnet 4', 3.00, 15.00, '200K', 'Fast', 4.5, 'Balanced tasks', true FROM public.provider_ratings WHERE provider_id = 'anthropic'
UNION ALL
SELECT id, 'Claude Haiku 3.5', 0.25, 1.25, '200K', 'Fastest', 3.5, 'High volume', false FROM public.provider_ratings WHERE provider_id = 'anthropic'
UNION ALL
SELECT id, 'GPT-4o', 2.50, 10.00, '128K', 'Fast', 4.5, 'General purpose', true FROM public.provider_ratings WHERE provider_id = 'openai'
UNION ALL
SELECT id, 'GPT-4 Turbo', 10.00, 30.00, '128K', 'Medium', 5, 'Complex tasks', false FROM public.provider_ratings WHERE provider_id = 'openai'
UNION ALL
SELECT id, 'GPT-4o Mini', 0.15, 0.60, '128K', 'Fastest', 3.5, 'Cost optimization', false FROM public.provider_ratings WHERE provider_id = 'openai'
UNION ALL
SELECT id, 'o1-preview', 15.00, 60.00, '128K', 'Slow', 5, 'Reasoning tasks', false FROM public.provider_ratings WHERE provider_id = 'openai'
UNION ALL
SELECT id, 'Gemini 2.0 Pro', 1.25, 5.00, '1M', 'Fast', 4.5, 'Long documents', true FROM public.provider_ratings WHERE provider_id = 'google'
UNION ALL
SELECT id, 'Gemini 2.0 Flash', 0.075, 0.30, '1M', 'Fastest', 3.5, 'High volume', false FROM public.provider_ratings WHERE provider_id = 'google'
UNION ALL
SELECT id, 'Gemini 1.5 Pro', 1.25, 5.00, '2M', 'Medium', 4, 'Massive context', false FROM public.provider_ratings WHERE provider_id = 'google'
UNION ALL
SELECT id, 'Mistral Large', 2.00, 6.00, '128K', 'Fast', 4, 'European compliance', false FROM public.provider_ratings WHERE provider_id = 'mistral'
UNION ALL
SELECT id, 'Mistral Medium', 2.70, 8.10, '32K', 'Fast', 3.5, 'Balanced workloads', false FROM public.provider_ratings WHERE provider_id = 'mistral'
UNION ALL
SELECT id, 'Mistral Small', 0.20, 0.60, '32K', 'Fastest', 3, 'Cost savings', true FROM public.provider_ratings WHERE provider_id = 'mistral'
UNION ALL
SELECT id, 'Command R+', 2.50, 10.00, '128K', 'Medium', 4, 'RAG applications', true FROM public.provider_ratings WHERE provider_id = 'cohere'
UNION ALL
SELECT id, 'Command R', 0.15, 0.60, '128K', 'Fast', 3.5, 'Retrieval tasks', false FROM public.provider_ratings WHERE provider_id = 'cohere'
UNION ALL
SELECT id, 'Embed v3', 0.10, 0, '512', 'Fastest', 4, 'Embeddings', false FROM public.provider_ratings WHERE provider_id = 'cohere'
UNION ALL
SELECT id, 'Claude (Bedrock)', 3.00, 15.00, '200K', 'Fast', 4.5, 'AWS workloads', false FROM public.provider_ratings WHERE provider_id = 'aws'
UNION ALL
SELECT id, 'Titan Text', 0.30, 0.40, '8K', 'Fastest', 3, 'Simple tasks', true FROM public.provider_ratings WHERE provider_id = 'aws'
UNION ALL
SELECT id, 'Llama 3 70B', 2.65, 3.50, '8K', 'Medium', 4, 'Open source needs', false FROM public.provider_ratings WHERE provider_id = 'aws';

