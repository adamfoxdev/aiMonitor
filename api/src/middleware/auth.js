import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const verifyTeamAccess = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const { data: member, error } = await res.locals.supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (error || !member) {
      return res.status(403).json({ message: 'Access denied to this team' });
    }

    req.team = { id: teamId, role: member.role };
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verifying team access', error: error.message });
  }
};

export const verifyAdminAccess = (req, res, next) => {
  if (!req.team || !['owner', 'admin'].includes(req.team.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
