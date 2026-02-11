import express from 'express';
import Joi from 'joi';
import crypto from 'crypto';

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  name: Joi.string().optional(),
  company: Joi.string().optional(),
  timezone: Joi.string().optional(),
});

const updateAlertSettingsSchema = Joi.object({
  email_enabled: Joi.boolean().optional(),
  slack_enabled: Joi.boolean().optional(),
  slack_webhook_url: Joi.string().allow('', null).optional(),
  spike_threshold_pct: Joi.number().min(1).max(100).optional(),
  daily_digest: Joi.boolean().optional(),
  weekly_report: Joi.boolean().optional(),
}).unknown(false);

const createApiKeySchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
});

// GET /api/user - Get current user profile
router.get('/', async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const userId = req.user.id;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/user - Update user profile
router.patch('/', async (req, res, next) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      const err = new Error('Validation error');
      err.status = 400;
      err.details = error.details;
      return next(err);
    }

    const supabase = res.locals.supabase;
    const userId = req.user.id;

    console.log('Updating user profile:', { userId, updates: value });

    // Build update object, only including fields that were provided
    const updateData = {
      updated_at: new Date().toISOString(),
    };
    
    if (value.name !== undefined) updateData.name = value.name;
    if (value.company !== undefined) updateData.company = value.company;
    if (value.timezone !== undefined) updateData.timezone = value.timezone;

    const { data: user, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(400).json({ message: updateError.message });
    }

    console.log('User updated successfully:', user);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// GET /api/user/alerts - Get user alert settings
router.get('/alerts', async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const userId = req.user.id;

    const { data: alerts, error } = await supabase
      .from('alert_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Create default alert settings if they don't exist
      const { data: defaultAlerts } = await supabase
        .from('alert_settings')
        .insert([
          {
            user_id: userId,
            email_enabled: true,
            spike_threshold_pct: 20,
          },
        ])
        .select()
        .single();

      return res.json({ success: true, alerts: defaultAlerts });
    }

    res.json({ success: true, alerts });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/user/alerts - Update alert settings
router.patch('/alerts', async (req, res, next) => {
  try {
    const { error, value } = updateAlertSettingsSchema.validate(req.body);
    if (error) {
      const err = new Error('Validation error');
      err.status = 400;
      err.details = error.details;
      return next(err);
    }

    const supabase = res.locals.supabase;
    const userId = req.user.id;

    console.log('Updating alert settings for user:', { userId, settings: value });

    // Build update object with explicit fields
    const updateData = {
      updated_at: new Date().toISOString(),
    };
    
    if (value.email_enabled !== undefined) updateData.email_enabled = value.email_enabled;
    if (value.slack_enabled !== undefined) updateData.slack_enabled = value.slack_enabled;
    if (value.slack_webhook_url !== undefined) updateData.slack_webhook_url = value.slack_webhook_url || null;
    if (value.spike_threshold_pct !== undefined) updateData.spike_threshold_pct = value.spike_threshold_pct;
    if (value.daily_digest !== undefined) updateData.daily_digest = value.daily_digest;
    if (value.weekly_report !== undefined) updateData.weekly_report = value.weekly_report;

    console.log('Update payload:', updateData);

    const { data: alerts, error: updateError } = await supabase
      .from('alert_settings')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Alert update error:', updateError);
      return res.status(400).json({ message: updateError.message });
    }

    console.log('Alert settings updated successfully:', alerts);
    res.json({ success: true, alerts });
  } catch (error) {
    console.error('Alert update exception:', error);
    next(error);
  }
});

// POST /api/user/change-password - Change user password
router.post('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const supabase = res.locals.supabase;

    // Update password via Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// API KEYS ENDPOINTS
// ============================================================================

// Helper function to generate API key
function generateApiKey() {
  // Format: tm_live_sk_<32 random characters>
  const randomPart = crypto.randomBytes(24).toString('hex');
  return `tm_live_sk_${randomPart}`;
}

// Helper function to hash API key (for storage)
function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// GET /api/user/api-keys - Get user's API keys (masked)
router.get('/api-keys', async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const userId = req.user.id;

    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, name, created_at, last_used_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ success: true, apiKeys });
  } catch (error) {
    next(error);
  }
});

// POST /api/user/api-keys - Create new API key
router.post('/api-keys', async (req, res, next) => {
  try {
    const { error: validationError, value } = createApiKeySchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ message: 'Invalid API key name' });
    }

    const supabase = res.locals.supabase;
    const userId = req.user.id;

    // Generate new API key
    const plainKey = generateApiKey();
    const hashedKey = hashApiKey(plainKey);

    // Store hashed key in database
    const { data: apiKey, error: insertError } = await supabase
      .from('api_keys')
      .insert([
        {
          user_id: userId,
          name: value.name,
          key_hash: hashedKey,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return res.status(400).json({ message: insertError.message });
    }

    // Return the plain key only once (user must save it)
    res.json({
      success: true,
      message: 'API key created. Save it somewhere safe - you won\'t be able to see it again.',
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        plainKey, // Only returned on creation
        created_at: apiKey.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/user/api-keys/:keyId - Delete an API key
router.delete('/api-keys/:keyId', async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const userId = req.user.id;
    const { keyId } = req.params;

    // Verify key belongs to user
    const { data: key, error: fetchError } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('id', keyId)
      .single();

    if (fetchError || !key || key.user_id !== userId) {
      return res.status(403).json({ message: 'API key not found or not authorized' });
    }

    // Delete the key
    const { error: deleteError } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId);

    if (deleteError) {
      return res.status(400).json({ message: deleteError.message });
    }

    res.json({ success: true, message: 'API key deleted' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/user/api-keys/:keyId - Update API key name
router.patch('/api-keys/:keyId', async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Invalid API key name' });
    }

    const supabase = res.locals.supabase;
    const userId = req.user.id;
    const { keyId } = req.params;

    // Verify key belongs to user
    const { data: key, error: fetchError } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('id', keyId)
      .single();

    if (fetchError || !key || key.user_id !== userId) {
      return res.status(403).json({ message: 'API key not found or not authorized' });
    }

    // Update the name
    const { data: updatedKey, error: updateError } = await supabase
      .from('api_keys')
      .update({ name: name.trim() })
      .eq('id', keyId)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ message: updateError.message });
    }

    res.json({ success: true, apiKey: updatedKey });
  } catch (error) {
    next(error);
  }
});

export default router;
