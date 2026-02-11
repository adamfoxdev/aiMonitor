import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import Joi from 'joi';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.js';

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
  username: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().required(),
}).or('username', 'email'); // Either username or email required

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().required(),
  company: Joi.string().optional(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      const err = new Error('Validation error');
      err.status = 400;
      err.details = error.details;
      return next(err);
    }

    const { username, email, password } = value;
    const supabase = res.locals.supabase;
    
    // Query users table by username or email
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username},email.eq.${email || ''}`)
      .single();

    if (queryError || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password hash
    let passwordValid = false;
    if (user.password_hash) {
      passwordValid = await bcryptjs.compare(password, user.password_hash);
    }

    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token for frontend
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        company: user.company,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      const err = new Error('Validation error');
      err.status = 400;
      err.details = error.details;
      return next(err);
    }

    const { email, username, password, name, company } = value;
    const supabase = res.locals.supabase;

    // Check if email or username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    // Create user in Supabase Auth first (this generates a valid auth.users.id)
    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError || !user) {
      return res.status(400).json({ message: authError?.message || 'Failed to create user' });
    }

    const userId = user.id;

    // Hash password for our users table (redundant but allows offline auth if needed)
    const passwordHash = await bcryptjs.hash(password, 10);

    // Create user profile with hashed password
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          username,
          password_hash: passwordHash,
          name,
          company: company || null,
        },
      ]);

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({ message: profileError.message });
    }

    // Create default alert settings
    await supabase
      .from('alert_settings')
      .insert([
        {
          user_id: userId,
          email_enabled: true,
          spike_threshold_pct: 20,
        },
      ]);

    // Create first team for the user
    const workspaceSlug = `workspace-${userId.substring(0, 8)}`;
    const { data: team } = await supabase
      .from('teams')
      .insert([
        {
          owner_id: userId,
          name: `${name}'s Workspace`,
          workspace_slug: workspaceSlug,
        },
      ])
      .select()
      .single();

    // Add user as team owner
    if (team) {
      await supabase
        .from('team_members')
        .insert([
          {
            team_id: team.id,
            user_id: userId,
            role: 'owner',
          },
        ]);
    }

    // Generate JWT token for frontend
    const token = jwt.sign(
      {
        id: userId,
        email,
        username,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Send welcome email (non-critical)
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
      // Don't fail signup if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      user: {
        id: userId,
        email,
        username,
        name,
        company: company || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      const err = new Error('Validation error');
      err.status = 400;
      err.details = error.details;
      return next(err);
    }

    const { email } = value;
    const supabase = res.locals.supabase;

    // Check if user exists
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      // For security, don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert([
        {
          user_id: user.id,
          token_hash: resetTokenHash,
          expires_at: expiresAt.toISOString(),
        },
      ]);

    if (tokenError) {
      console.error('Token storage error:', tokenError);
      return res.status(500).json({ success: false, message: 'Failed to generate reset link' });
    }

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, process.env.FRONTEND_URL);

    res.json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      const err = new Error('Validation error');
      err.status = 400;
      err.details = error.details;
      return next(err);
    }

    const { token, password } = value;
    const supabase = res.locals.supabase;

    // Hash the token to find it in database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find the reset token
    const { data: resetToken } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .single();

    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token has expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Check if token has already been used
    if (resetToken.used_at) {
      return res.status(400).json({ message: 'Reset token has already been used' });
    }

    // Hash new password
    const passwordHash = await bcryptjs.hash(password, 10);

    // Update password in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', resetToken.user_id);

    if (updateError) {
      return res.status(500).json({ message: 'Failed to reset password' });
    }

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetToken.id);

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const { refreshToken } = req.body;

    const { data: { user }, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/landing-email
// Captures email from landing page and sends welcome email
router.post('/landing-email', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    // Send welcome email using email service (which uses SendGrid)
    await sendWelcomeEmail(email, 'there');

    res.json({
      success: true,
      message: 'Welcome email sent. Check your inbox!',
    });
  } catch (error) {
    console.error('Landing email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email. Please try again.' 
    });
  }
});

// POST /api/auth/oauth-callback
// Handles user profile creation after OAuth login
router.post('/oauth-callback', async (req, res, next) => {
  try {
    const { id, email, name } = req.body;
    const supabase = res.locals.supabase;

    if (!id || !email) {
      return res.status(400).json({ message: 'Missing user data' });
    }

    // Check if user profile already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingUser) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id,
            email,
            name: name || email.split('@')[0],
            company: null,
          },
        ]);

      if (profileError) {
        // Profile might already exist due to RLS, that's ok
        console.warn('Profile creation warning:', profileError);
      }

      // Create default alert settings
      const { error: alertError } = await supabase
        .from('alert_settings')
        .insert([
          {
            user_id: id,
            email_enabled: true,
            spike_threshold_pct: 20,
          },
        ]);

      // Create first team for the user
      const workspaceSlug = `workspace-${id.substring(0, 8)}`;
      const { data: team } = await supabase
        .from('teams')
        .insert([
          {
            owner_id: id,
            name: `${name || email.split('@')[0]}'s Workspace`,
            workspace_slug: workspaceSlug,
          },
        ])
        .select()
        .single();

      // Add user as team owner
      if (team) {
        await supabase
          .from('team_members')
          .insert([
            {
              team_id: team.id,
              user_id: id,
              role: 'owner',
            },
          ]);
      }
    }

    res.json({ success: true, message: 'User profile setup complete' });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to complete authentication' 
    });
  }
});

export default router;
