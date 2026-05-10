const pool = require('../db/pool');

const getAutomations = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const result = await pool.query(
      `SELECT a.*, t.name as template_name 
       FROM whatsapp_automations a
       LEFT JOIN whatsapp_templates t ON a.reply_template_id = t.id
       WHERE a.organization_id = $1
       ORDER BY a.created_at DESC`,
      [organizationId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch automations' });
  }
};

const createAutomation = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { name, keyword, reply_type, reply_text, reply_template_id } = req.body;
    
    const result = await pool.query(
      `INSERT INTO whatsapp_automations (organization_id, name, keyword, reply_type, reply_text, reply_template_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [organizationId, name, keyword, reply_type, reply_text, reply_template_id]
    );
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create automation' });
  }
};

const toggleAutomation = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { id } = req.params;
    const { is_active } = req.body;
    
    const result = await pool.query(
      'UPDATE whatsapp_automations SET is_active = $1 WHERE id = $2 AND organization_id = $3 RETURNING *',
      [is_active, id, organizationId]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Automation not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update automation' });
  }
};

const deleteAutomation = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { id } = req.params;
    
    await pool.query('DELETE FROM whatsapp_automations WHERE id = $1 AND organization_id = $2', [id, organizationId]);
    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete automation' });
  }
};

module.exports = {
  getAutomations,
  createAutomation,
  toggleAutomation,
  deleteAutomation
};