const pool = require('../db/pool');
const crypto = require('crypto');

const inviteMember = async (req, res) => {
  try {
    const { organizationId, userId: invitedBy } = req.user;
    const { email, role = 'member' } = req.body;
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await pool.query(
      `INSERT INTO invitations (organization_id, email, role, token, invited_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [organizationId, email, role, token, invitedBy, expiresAt]
    );
    
    // In a real app, send email with: ${process.env.CLIENT_URL}/register?invite=${token}
    console.log(`[INVITE STUB] Link for ${email}: ${process.env.CLIENT_URL}/register?invite=${token}`);
    
    res.json({ success: true, data: { message: 'Invitation sent' } });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ success: false, error: 'Failed to send invitation' });
  }
};

const getTeam = async (req, res) => {
  try {
    const { organizationId } = req.user;
    
    const members = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE organization_id = $1 ORDER BY name ASC',
      [organizationId]
    );
    
    const invites = await pool.query(
      'SELECT id, email, role, status, created_at FROM invitations WHERE organization_id = $1 AND status = \'pending\'',
      [organizationId]
    );
    
    res.json({ 
      success: true, 
      data: { 
        members: members.rows,
        invitations: invites.rows
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch team' });
  }
};

module.exports = { inviteMember, getTeam };