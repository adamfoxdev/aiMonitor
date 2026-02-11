import express from 'express';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/billing/current - Get current subscription and available plans
router.get('/current', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const supabase = res.locals.supabase;

    // Fetch current subscription for user
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        plan_id,
        status,
        current_period_start,
        current_period_end,
        subscription_plans:plan_id (
          id,
          name,
          slug,
          description,
          price_monthly,
          features,
          max_team_members,
          max_providers,
          api_access
        )
      `)
      .eq('user_id', userId)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subscriptionError);
      return res.status(500).json({ error: 'Failed to fetch subscription' });
    }

    // Fetch all available plans
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (plansError) {
      console.error('Error fetching plans:', plansError);
      return res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }

    // If user has no subscription, return all plans
    if (!subscription) {
      return res.json({
        currentSubscription: null,
        availablePlans: plans,
      });
    }

    // Return current subscription and available plans
    res.json({
      currentSubscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        plan: subscription.subscription_plans,
      },
      availablePlans: plans,
    });
  } catch (error) {
    console.error('Billing current error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/billing/change-plan - Change subscription plan
router.post('/change-plan', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const supabase = res.locals.supabase;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    // Verify the plan exists
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Fetch current subscription
    const { data: currentSubscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error fetching current subscription:', subscriptionError);
      return res.status(500).json({ error: 'Failed to fetch current subscription' });
    }

    // Check if trying to change to same plan
    if (currentSubscription && currentSubscription.plan_id === planId) {
      return res.status(400).json({ error: 'Already on this plan' });
    }

    // Calculate period dates (immediate change with current period end preserved if upgrading)
    const now = new Date();
    let periodStart = now;
    let periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // If user is currently on a plan, try to preserve the end date for upgrades
    if (currentSubscription) {
      periodEnd = new Date(currentSubscription.current_period_end);
    }

    if (currentSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_id: planId,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('user_id', userId)
        .select();

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return res.status(500).json({ error: 'Failed to update subscription' });
      }

      return res.json({
        message: `Successfully changed to ${plan.name} plan`,
        plan: plan,
      });
    } else {
      // Create new subscription if user doesn't have one
      const { data: newSubscription, error: insertError } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: userId,
            plan_id: planId,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
          },
        ])
        .select();

      if (insertError) {
        console.error('Error creating subscription:', insertError);
        return res.status(500).json({ error: 'Failed to create subscription' });
      }

      return res.json({
        message: `Successfully subscribed to ${plan.name} plan`,
        plan: plan,
      });
    }
  } catch (error) {
    console.error('Billing change-plan error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

