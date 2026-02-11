import express from 'express';
import crypto from 'crypto';
import { verifyTeamAccess, verifyAdminAccess } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const connectProviderSchema = Joi.object({
  providerName: Joi.string().valid('openai', 'anthropic', 'azure', 'github', 'vercel', 'aws', 'google').required(),
  apiKey: Joi.string().required(),
  teamId: Joi.string().uuid().required(),
});

// Helper function to encrypt API key
const encryptApiKey = (apiKey) => {
  const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-32-character-minimum';
  
  // Derive a proper 32-byte key from the encryption key
  const key = crypto.createHash('sha256').update(encryptionKey).digest();
  
  // Generate a random 16-byte IV
  const iv = crypto.randomBytes(16);
  
  // Create cipher with the proper key and IV
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV + encrypted data (IV is not secret, just needed for decryption)
  return iv.toString('hex') + ':' + encrypted;
};

// Helper function to decrypt API key (for actual API calls)
const decryptApiKey = (encryptedData) => {
  const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-32-character-minimum';
  
  // Split IV and encrypted data
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  
  // Derive the same key
  const key = crypto.createHash('sha256').update(encryptionKey).digest();
  
  // Create decipher with the proper key and IV
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// GET /api/providers/:teamId - List team's connected providers
router.get('/:teamId', verifyTeamAccess, async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const { teamId } = req.params;

    console.log('Fetching providers for team:', teamId);

    const { data: providers, error } = await supabase
      .from('provider_connections')
      .select('id, team_id, provider_name, status, last_sync, created_at')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching providers:', error);
      return res.status(400).json({ message: error.message });
    }

    console.log('Found', providers?.length || 0, 'providers');
    res.json({ success: true, providers });
  } catch (error) {
    next(error);
  }
});

// POST /api/providers/:teamId/connect - Connect new provider
router.post('/:teamId/connect', verifyTeamAccess, verifyAdminAccess, async (req, res, next) => {
  try {
    const { error, value } = connectProviderSchema.validate({
      ...req.body,
      teamId: req.params.teamId,
    });

    if (error) {
      console.error('Provider connection validation error:', error.details);
      const err = new Error('Validation error');
      err.status = 400;
      err.details = error.details;
      return next(err);
    }

    const { providerName, apiKey } = value;
    const { teamId } = req.params;
    const supabase = res.locals.supabase;

    console.log('Connecting provider:', { teamId, providerName });

    // Encrypt API key before storing
    const encryptedKey = encryptApiKey(apiKey);

    // Store provider connection
    const { data: provider, error: insertError } = await supabase
      .from('provider_connections')
      .insert([
        {
          team_id: teamId,
          provider_name: providerName,
          api_key_encrypted: encryptedKey,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Provider insertion error:', insertError);
      if (insertError.code === '23505') {
        return res.status(400).json({ message: 'Provider already connected' });
      }
      return res.status(400).json({ message: insertError.message });
    }

    console.log('Provider connected successfully:', provider.id);

    // Verify connection by making a test API call
    // TODO: Implement provider-specific verification logic

    res.status(201).json({
      success: true,
      message: 'Provider connected successfully',
      provider: {
        id: provider.id,
        provider_name: provider.provider_name,
        status: provider.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/providers/:teamId/disconnect/:providerId - Disconnect provider
router.delete('/:teamId/disconnect/:providerId', verifyTeamAccess, verifyAdminAccess, async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const { teamId, providerId } = req.params;

    const { error } = await supabase
      .from('provider_connections')
      .delete()
      .eq('id', providerId)
      .eq('team_id', teamId);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ success: true, message: 'Provider disconnected' });
  } catch (error) {
    next(error);
  }
});

// POST /api/providers/:teamId/sync/:providerId - Manually sync provider data
router.post('/:teamId/sync/:providerId', verifyTeamAccess, verifyAdminAccess, async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const { teamId, providerId } = req.params;

    // Get provider connection details
    const { data: provider, error: providerError } = await supabase
      .from('provider_connections')
      .select('*')
      .eq('id', providerId)
      .eq('team_id', teamId)
      .single();

    if (providerError || !provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // TODO: Implement provider-specific sync logic
    // This would call the appropriate provider API and fetch latest spending data
    // Then upsert into spending_entries table

    // For now, update last_sync timestamp
    const { error: updateError } = await supabase
      .from('provider_connections')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', providerId);

    if (updateError) {
      return res.status(400).json({ message: updateError.message });
    }

    res.json({
      success: true,
      message: 'Sync started',
      provider: {
        id: provider.id,
        provider_name: provider.provider_name,
        last_sync: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
