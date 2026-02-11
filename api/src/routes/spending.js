import express from 'express';
import { verifyTeamAccess } from '../middleware/auth.js';

const router = express.Router();

// GET /api/spending/:teamId - Get team spending data with filters
router.get('/:teamId', verifyTeamAccess, async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const { teamId } = req.params;
    const { startDate, endDate, providerId, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from('spending_entries')
      .select('*, provider_connections(provider_name)')
      .eq('team_id', teamId)
      .order('entry_date', { ascending: false });

    // Apply filters
    if (startDate) {
      query = query.gte('entry_date', startDate);
    }
    if (endDate) {
      query = query.lte('entry_date', endDate);
    }
    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: entries, error } = await query;

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ success: true, entries });
  } catch (error) {
    next(error);
  }
});

// GET /api/spending/:teamId/summary - Get team spending summary for dashboard
router.get('/:teamId/summary', verifyTeamAccess, async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const { teamId } = req.params;
    const { startDate, endDate } = req.query;

    // Calculate date range for last 30 days if not provided
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const start = startDate || thirtyDaysAgo.toISOString().split('T')[0];
    const end = endDate || now.toISOString().split('T')[0];

    // Get total spend
    const { data: totalSpendResult, error: totalError } = await supabase
      .from('spending_entries')
      .select('cost_usd')
      .eq('team_id', teamId)
      .gte('entry_date', start)
      .lte('entry_date', end);

    if (totalError) {
      return res.status(400).json({ message: totalError.message });
    }

    const totalSpend = totalSpendResult.reduce((sum, entry) => sum + parseFloat(entry.cost_usd), 0);

    // Get spending by provider
    const { data: byProviderResult } = await supabase
      .from('spending_entries')
      .select('provider_connections(provider_name), cost_usd')
      .eq('team_id', teamId)
      .gte('entry_date', start)
      .lte('entry_date', end);

    const byProvider = {};
    byProviderResult?.forEach(entry => {
      const provider = entry.provider_connections?.provider_name || 'Unknown';
      byProvider[provider] = (byProvider[provider] || 0) + parseFloat(entry.cost_usd);
    });

    // Get spending by model
    const { data: byModelResult } = await supabase
      .from('spending_entries')
      .select('model, cost_usd')
      .eq('team_id', teamId)
      .gte('entry_date', start)
      .lte('entry_date', end);

    const byModel = {};
    byModelResult?.forEach(entry => {
      byModel[entry.model] = (byModel[entry.model] || 0) + parseFloat(entry.cost_usd);
    });

    // Get daily trend
    const { data: dailyResult } = await supabase
      .from('spending_entries')
      .select('entry_date, cost_usd')
      .eq('team_id', teamId)
      .gte('entry_date', start)
      .lte('entry_date', end)
      .order('entry_date', { ascending: true });

    const dailyTrend = {};
    dailyResult?.forEach(entry => {
      dailyTrend[entry.entry_date] = (dailyTrend[entry.entry_date] || 0) + parseFloat(entry.cost_usd);
    });

    // Get connected providers
    const { data: providers } = await supabase
      .from('provider_connections')
      .select('id, provider_name, status, last_sync')
      .eq('team_id', teamId)
      .eq('status', 'active');

    // Get budgets
    const { data: budgets } = await supabase
      .from('budgets')
      .select('*, provider_connections(provider_name)')
      .eq('team_id', teamId);

    res.json({
      success: true,
      summary: {
        totalSpend,
        period: { start, end },
        byProvider,
        byModel,
        dailyTrend,
        providers: providers || [],
        budgets: budgets || [],
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/spending/:teamId/import - Import CSV spending data
router.post('/:teamId/import', verifyTeamAccess, async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const { teamId } = req.params;
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: 'No entries provided' });
    }

    // Validate and transform entries
    const validatedEntries = entries.map(entry => ({
      team_id: teamId,
      provider_id: entry.provider_id,
      model: entry.model,
      tokens_used: entry.tokens_used || null,
      cost_usd: parseFloat(entry.cost_usd),
      entry_date: entry.entry_date || new Date().toISOString().split('T')[0],
    }));

    // Insert entries
    const { data, error } = await supabase
      .from('spending_entries')
      .insert(validatedEntries)
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({
      success: true,
      message: `Imported ${data.length} spending entries`,
      imported: data.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
