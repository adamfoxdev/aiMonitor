import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: './api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔄 Applying database migration...');

    // SQL to create provider tables and seed data
    const providerTablesSQL = `
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
  )
ON CONFLICT (provider_id) DO NOTHING;

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
SELECT id, 'Llama 3 70B', 2.65, 3.50, '8K', 'Medium', 4, 'Open source needs', false FROM public.provider_ratings WHERE provider_id = 'aws'
ON CONFLICT DO NOTHING;
    `;

    // Execute the SQL using the Supabase RPC or raw SQL
    const { error } = await supabase.rpc('sql_statement', { sql: providerTablesSQL });

    // If RPC doesn't work, try with a simpler approach
    if (error) {
      console.log('RPC method not available, trying direct SQL...');
      // For direct execution, we'd need a different approach
      console.error('Error:', error.message);
    } else {
      console.log('✅ Migration completed successfully!');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
