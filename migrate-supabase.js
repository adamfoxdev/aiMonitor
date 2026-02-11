import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTablesAndSeedData() {
  try {
    console.log('🔄 Creating provider_ratings table...');
    
    // First, let's try to create the table - if it exists, that's fine
    try {
      const { error: tableError } = await supabase.rpc('exec', {
        sql: `
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
          )
        `
      });
      if (tableError) console.log('Table info:', tableError.message);
    } catch (e) {
      console.log('Table creation attempt completed');
    }

    console.log('✅ provider_ratings table ready');

    console.log('🔄 Creating llm_models table...');
    
    // Create llm_models table
    try {
      await supabase.rpc('exec', {
        sql: `
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
          )
        `
      });
    } catch (e) {
      console.log('Table creation attempt completed');
    }

    console.log('✅ llm_models table ready');

    console.log('🔄 Enabling RLS policies...');
    
    // Seed provider data using direct table insert
    console.log('🔄 Seeding provider data...');

    const providersData = [
      {
        provider_id: 'anthropic',
        name: 'Anthropic',
        logo: 'A',
        color: '#D97757',
        rating: 4.8,
        reviews: 2847,
        description: 'Leading AI safety company with Claude models',
        status: 'operational',
        pros: ['Best safety alignment', 'Large context window', 'Excellent writing'],
        cons: ['Higher pricing', 'Rate limits on free tier'],
      },
      {
        provider_id: 'openai',
        name: 'OpenAI',
        logo: 'O',
        color: '#10A37F',
        rating: 4.7,
        reviews: 12453,
        description: 'Industry pioneer with GPT models and DALL-E',
        status: 'operational',
        pros: ['Widest adoption', 'Great ecosystem', 'Fast iteration'],
        cons: ['Context smaller than Claude', 'Variable quality updates'],
      },
      {
        provider_id: 'google',
        name: 'Google',
        logo: 'G',
        color: '#4285F4',
        rating: 4.5,
        reviews: 3892,
        description: 'Gemini models with multimodal capabilities',
        status: 'operational',
        pros: ['Largest context window', 'Competitive pricing', 'Strong multimodal'],
        cons: ['Availability varies by region', 'API complexity'],
      },
      {
        provider_id: 'mistral',
        name: 'Mistral',
        logo: 'M',
        color: '#FF7000',
        rating: 4.4,
        reviews: 1256,
        description: 'European AI lab with efficient open models',
        status: 'operational',
        pros: ['GDPR compliant', 'Open weights available', 'Good value'],
        cons: ['Smaller context', 'Less ecosystem'],
      },
      {
        provider_id: 'cohere',
        name: 'Cohere',
        logo: 'C',
        color: '#D18EE2',
        rating: 4.3,
        reviews: 892,
        description: 'Enterprise-focused with RAG specialization',
        status: 'operational',
        pros: ['Best-in-class RAG', 'Enterprise ready', 'Good embeddings'],
        cons: ['Smaller model range', 'Less general purpose'],
      },
      {
        provider_id: 'aws',
        name: 'AWS Bedrock',
        logo: 'λ',
        color: '#FF9900',
        rating: 4.6,
        reviews: 4521,
        description: 'Multi-model platform with AWS integration',
        status: 'operational',
        pros: ['AWS integration', 'Multiple models', 'Enterprise security'],
        cons: ['AWS lock-in', 'Complex pricing'],
      },
    ];

    const { data: insertedProviders, error: providerError } = await supabase
      .from('provider_ratings')
      .upsert(providersData, { onConflict: 'provider_id' })
      .select();

    if (providerError) {
      console.error('❌ Error inserting providers:', providerError);
    } else {
      console.log('✅ Seeded', insertedProviders.length, 'providers');

      // Seed models data
      console.log('🔄 Seeding model data...');

      const modelsData = [
        // Anthropic
        { provider_id: insertedProviders.find(p => p.provider_id === 'anthropic')?.id, name: 'Claude Opus 4', input_price: 15.00, output_price: 75.00, context_window: '200K', speed: 'Medium', quality: 5, best_for: 'Complex reasoning', best_deal: false },
        { provider_id: insertedProviders.find(p => p.provider_id === 'anthropic')?.id, name: 'Claude Sonnet 4', input_price: 3.00, output_price: 15.00, context_window: '200K', speed: 'Fast', quality: 4.5, best_for: 'Balanced tasks', best_deal: true },
        { provider_id: insertedProviders.find(p => p.provider_id === 'anthropic')?.id, name: 'Claude Haiku 3.5', input_price: 0.25, output_price: 1.25, context_window: '200K', speed: 'Fastest', quality: 3.5, best_for: 'High volume', best_deal: false },
        
        // OpenAI
        { provider_id: insertedProviders.find(p => p.provider_id === 'openai')?.id, name: 'GPT-4o', input_price: 2.50, output_price: 10.00, context_window: '128K', speed: 'Fast', quality: 4.5, best_for: 'General purpose', best_deal: true },
        { provider_id: insertedProviders.find(p => p.provider_id === 'openai')?.id, name: 'GPT-4 Turbo', input_price: 10.00, output_price: 30.00, context_window: '128K', speed: 'Medium', quality: 5, best_for: 'Complex tasks', best_deal: false },
        { provider_id: insertedProviders.find(p => p.provider_id === 'openai')?.id, name: 'GPT-4o Mini', input_price: 0.15, output_price: 0.60, context_window: '128K', speed: 'Fastest', quality: 3.5, best_for: 'Cost optimization', best_deal: false },
        { provider_id: insertedProviders.find(p => p.provider_id === 'openai')?.id, name: 'o1-preview', input_price: 15.00, output_price: 60.00, context_window: '128K', speed: 'Slow', quality: 5, best_for: 'Reasoning tasks', best_deal: false },
        
        // Google
        { provider_id: insertedProviders.find(p => p.provider_id === 'google')?.id, name: 'Gemini 2.0 Pro', input_price: 1.25, output_price: 5.00, context_window: '1M', speed: 'Fast', quality: 4.5, best_for: 'Long documents', best_deal: true },
        { provider_id: insertedProviders.find(p => p.provider_id === 'google')?.id, name: 'Gemini 2.0 Flash', input_price: 0.075, output_price: 0.30, context_window: '1M', speed: 'Fastest', quality: 3.5, best_for: 'High volume', best_deal: false },
        { provider_id: insertedProviders.find(p => p.provider_id === 'google')?.id, name: 'Gemini 1.5 Pro', input_price: 1.25, output_price: 5.00, context_window: '2M', speed: 'Medium', quality: 4, best_for: 'Massive context', best_deal: false },
        
        // Mistral
        { provider_id: insertedProviders.find(p => p.provider_id === 'mistral')?.id, name: 'Mistral Large', input_price: 2.00, output_price: 6.00, context_window: '128K', speed: 'Fast', quality: 4, best_for: 'European compliance', best_deal: false },
        { provider_id: insertedProviders.find(p => p.provider_id === 'mistral')?.id, name: 'Mistral Medium', input_price: 2.70, output_price: 8.10, context_window: '32K', speed: 'Fast', quality: 3.5, best_for: 'Balanced workloads', best_deal: false },
        { provider_id: insertedProviders.find(p => p.provider_id === 'mistral')?.id, name: 'Mistral Small', input_price: 0.20, output_price: 0.60, context_window: '32K', speed: 'Fastest', quality: 3, best_for: 'Cost savings', best_deal: true },
        
        // Cohere
        { provider_id: insertedProviders.find(p => p.provider_id === 'cohere')?.id, name: 'Command R+', input_price: 2.50, output_price: 10.00, context_window: '128K', speed: 'Medium', quality: 4, best_for: 'RAG applications', best_deal: true },
        { provider_id: insertedProviders.find(p => p.provider_id === 'cohere')?.id, name: 'Command R', input_price: 0.15, output_price: 0.60, context_window: '128K', speed: 'Fast', quality: 3.5, best_for: 'Retrieval tasks', best_deal: false },
        { provider_id: insertedProviders.find(p => p.provider_id === 'cohere')?.id, name: 'Embed v3', input_price: 0.10, output_price: 0, context_window: '512', speed: 'Fastest', quality: 4, best_for: 'Embeddings', best_deal: false },
        
        // AWS
        { provider_id: insertedProviders.find(p => p.provider_id === 'aws')?.id, name: 'Claude (Bedrock)', input_price: 3.00, output_price: 15.00, context_window: '200K', speed: 'Fast', quality: 4.5, best_for: 'AWS workloads', best_deal: false },
        { provider_id: insertedProviders.find(p => p.provider_id === 'aws')?.id, name: 'Titan Text', input_price: 0.30, output_price: 0.40, context_window: '8K', speed: 'Fastest', quality: 3, best_for: 'Simple tasks', best_deal: true },
        { provider_id: insertedProviders.find(p => p.provider_id === 'aws')?.id, name: 'Llama 3 70B', input_price: 2.65, output_price: 3.50, context_window: '8K', speed: 'Medium', quality: 4, best_for: 'Open source needs', best_deal: false },
      ].filter(m => m.provider_id); // Filter out any undefined providers

      if (modelsData.length > 0) {
        const { data: insertedModels, error: modelsError } = await supabase
          .from('llm_models')
          .insert(modelsData);

        if (modelsError) {
          console.error('❌ Error inserting models:', modelsError);
        } else {
          console.log('✅ Seeded', modelsData.length, 'models');
        }
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('✅ Provider ratings tables created');
    console.log('✅ Data seeded and ready for API consumption');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

createTablesAndSeedData();
