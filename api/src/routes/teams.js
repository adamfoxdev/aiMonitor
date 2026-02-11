import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { verifyTeamAccess, verifyAdminAccess } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createTeamSchema = Joi.object({
  name: Joi.string().required(),
});

const inviteSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('member', 'admin').default('member'),
});

// GET /api/teams - List user's teams
router.get('/', async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const userId = req.user.id;

    console.log('Fetching teams for user:', userId);

    // Query through team_members to get all teams the user is part of
    const { data: memberRecords, error: memberError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    if (memberError) {
      console.error('Error fetching team memberships:', memberError);
      return res.status(400).json({ message: memberError.message });
    }

    if (!memberRecords || memberRecords.length === 0) {
      console.log('User has no teams');
      return res.json({ success: true, teams: [] });
    }

    const teamIds = memberRecords.map(m => m.team_id);
    console.log('User team IDs:', teamIds);

    // Get the actual team data
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds);

    if (error) {
      console.error('Error fetching teams:', error);
      return res.status(400).json({ message: error.message });
    }

    console.log('Teams found:', teams?.length || 0);
    res.json({ success: true, teams: teams || [] });
  } catch (error) {
    next(error);
  }
});

// POST /api/teams - Create new team
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = createTeamSchema.validate(req.body);
    if (error) {
      const err = new Error('Validation error');
      err.status = 400;
      err.details = error.details;
      return next(err);
    }

    const { name } = value;
    const supabase = res.locals.supabase;
    const userId = req.user.id;

    // Generate workspace slug
    const workspaceSlug = `${name.toLowerCase().replace(/\s+/g, '-')}-${uuidv4().substring(0, 8)}`;

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([
        {
          owner_id: userId,
          name,
          workspace_slug: workspaceSlug,
        },
      ])
      .select()
      .single();

    if (teamError) {
      return res.status(400).json({ message: teamError.message });
    }

    // Add user as team owner
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([
        {
          team_id: team.id,
          user_id: userId,
          role: 'owner',
          joined_at: new Date().toISOString(),
        },
      ]);

    if (memberError) {
      return res.status(400).json({ message: memberError.message });
    }

    res.status(201).json({ success: true, team });
  } catch (error) {
    next(error);
  }
});

// GET /api/teams/:teamId - Get team details
router.get('/:teamId', verifyTeamAccess, async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const { teamId } = req.params;

    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ success: true, team });
  } catch (error) {
    next(error);
  }
});

// GET /api/teams/:teamId/members - List team members (including pending invitations)
router.get('/:teamId/members', verifyTeamAccess, async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const { teamId } = req.params;

    // Fetch actual team members
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('id, user_id, role, joined_at, users(id, email, name)')
      .eq('team_id', teamId);

    if (membersError) {
      return res.status(400).json({ message: membersError.message });
    }

    // Fetch pending invitations
    const { data: invitations, error: invitationsError } = await supabase
      .from('team_invitations')
      .select('id, email, role, created_at, expires_at')
      .eq('team_id', teamId)
      .is('claimed_at', null); // Only show unclaimed invitations

    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError);
      // Don't fail if invitations fetch fails, just continue with members
    }

    // Format members with status
    const formattedMembers = (members || []).map(member => ({
      id: member.id,
      user_id: member.user_id,
      email: member.users?.email,
      name: member.users?.name,
      role: member.role,
      joined_at: member.joined_at,
      status: 'active',
    }));

    // Format invitations with pending status
    const formattedInvitations = (invitations || []).map(invitation => ({
      id: invitation.id,
      email: invitation.email,
      name: null,
      role: invitation.role,
      created_at: invitation.created_at,
      expires_at: invitation.expires_at,
      status: 'pending',
    }));

    // Combine members and invitations
    const allMembers = [...formattedMembers, ...formattedInvitations];

    console.log(`Fetched ${formattedMembers.length} active members and ${formattedInvitations.length} pending invitations for team ${teamId}`);

    res.json({ success: true, members: allMembers });
  } catch (error) {
    next(error);
  }
});

// POST /api/teams/:teamId/members/invite - Invite team member
router.post('/:teamId/members/invite', verifyTeamAccess, verifyAdminAccess, async (req, res, next) => {
  try {
    const { error, value } = inviteSchema.validate(req.body);
    if (error) {
      console.error('Validation error:', error.details);
      const err = new Error('Validation error');
      err.status = 400;
      err.details = error.details;
      return next(err);
    }

    const { email, role } = value;
    const supabase = res.locals.supabase;
    const { teamId } = req.params;

    console.log('Creating invitation:', { teamId, email, role });

    // Generate invitation token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    console.log('Invitation details:', { token, expiresAt });

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .insert([
        {
          team_id: teamId,
          email,
          role,
          token,
          expires_at: expiresAt,
        },
      ])
      .select()
      .single();

    if (inviteError) {
      console.error('Invitation insert error:', inviteError);
      if (inviteError.code === '23505') {
        return res.status(400).json({ message: 'User already invited or is a member' });
      }
      return res.status(400).json({ message: inviteError.message });
    }

    console.log('Invitation created successfully:', invitation);

    // TODO: Send invitation email with token
    // For now, return the token so frontend can handle it

    res.status(201).json({
      success: true,
      message: 'Invitation sent',
      invitation: {
        id: invitation.id,
        email,
        role,
        inviteToken: token, // In production, don't expose this in response
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/teams/:teamId/members/:memberId - Remove team member
router.delete('/:teamId/members/:memberId', verifyTeamAccess, verifyAdminAccess, async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const { teamId, memberId } = req.params;

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('team_id', teamId);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ success: true, message: 'Member removed' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/teams/:teamId/members/:memberId - Update member role
router.patch('/:teamId/members/:memberId', verifyTeamAccess, verifyAdminAccess, async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const { teamId, memberId } = req.params;
    const { role } = req.body;

    if (!['member', 'admin', 'owner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const { data: member, error } = await supabase
      .from('team_members')
      .update({ role })
      .eq('id', memberId)
      .eq('team_id', teamId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ success: true, member });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/teams/:teamId/members/invitations/:invitationId - Cancel invitation
router.delete('/:teamId/members/invitations/:invitationId', verifyTeamAccess, verifyAdminAccess, async (req, res, next) => {
  try {
    const supabase = res.locals.supabase;
    const { teamId, invitationId } = req.params;

    const { error } = await supabase
      .from('team_invitations')
      .delete()
      .eq('id', invitationId)
      .eq('team_id', teamId);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ success: true, message: 'Invitation canceled' });
  } catch (error) {
    next(error);
  }
});

export default router;
