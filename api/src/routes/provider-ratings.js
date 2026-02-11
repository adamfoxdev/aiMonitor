import express from 'express';

const router = express.Router();

// GET /api/provider-ratings - Get all provider ratings with their models (public endpoint)
router.get('/', async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    // Fetch all provider ratings
    const { data: providers, error: providersError } = await supabase
      .from('provider_ratings')
      .select('*')
      .order('rating', { ascending: false });

    if (providersError) throw providersError;

    if (!providers || providers.length === 0) {
      return res.json([]);
    }

    // Fetch all models
    const { data: models, error: modelsError } = await supabase
      .from('llm_models')
      .select('*')
      .order('name');

    if (modelsError) throw modelsError;

    // Group models by provider_id
    const modelsByProviderId = {};
    (models || []).forEach((model) => {
      if (!modelsByProviderId[model.provider_id]) {
        modelsByProviderId[model.provider_id] = [];
      }
      modelsByProviderId[model.provider_id].push({
        id: model.id,
        name: model.name,
        input: parseFloat(model.input_price),
        output: parseFloat(model.output_price),
        context: model.context_window,
        speed: model.speed,
        quality: model.quality,
        bestFor: model.best_for,
        bestDeal: model.best_deal,
      });
    });

    // Combine providers with their models
    const providersWithModels = providers.map((provider) => ({
      id: provider.provider_id,
      name: provider.name,
      logo: provider.logo,
      color: provider.color,
      rating: parseFloat(provider.rating),
      reviews: provider.reviews,
      description: provider.description,
      status: provider.status,
      pros: provider.pros || [],
      cons: provider.cons || [],
      models: modelsByProviderId[provider.id] || [],
    }));

    res.json(providersWithModels);
  } catch (error) {
    next(error);
  }
});

// GET /api/provider-ratings/:providerId - Get a specific provider with its models
router.get('/:providerId', async (req, res, next) => {
  try {
    const { providerId } = req.params;

    const { data: provider, error: providerError } = await supabase
      .from('provider_ratings')
      .select('*')
      .eq('provider_id', providerId)
      .single();

    if (providerError) throw providerError;

    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const { data: models, error: modelsError } = await supabase
      .from('llm_models')
      .select('*')
      .eq('provider_id', provider.id);

    if (modelsError) throw modelsError;

    const responseData = {
      id: provider.provider_id,
      name: provider.name,
      logo: provider.logo,
      color: provider.color,
      rating: parseFloat(provider.rating),
      reviews: provider.reviews,
      description: provider.description,
      status: provider.status,
      pros: provider.pros || [],
      cons: provider.cons || [],
      models: (models || []).map((model) => ({
        id: model.id,
        name: model.name,
        input: parseFloat(model.input_price),
        output: parseFloat(model.output_price),
        context: model.context_window,
        speed: model.speed,
        quality: model.quality,
        bestFor: model.best_for,
        bestDeal: model.best_deal,
      })),
    };

    res.json(responseData);
  } catch (error) {
    next(error);
  }
});

export default router;
