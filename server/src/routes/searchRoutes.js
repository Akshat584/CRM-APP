const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');
const pool = require('../db/pool');

router.get('/', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    const { organizationId } = req.user;

    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = `%${q}%`;

    const contacts = await pool.query(
      "SELECT id, name, company as sub, 'contact' as type FROM contacts WHERE organization_id = $1 AND (name ILIKE $2 OR company ILIKE $2 OR email ILIKE $2) AND deleted_at IS NULL LIMIT 5",
      [organizationId, searchTerm]
    );

    const deals = await pool.query(
      "SELECT id, title as name, company as sub, 'deal' as type FROM deals WHERE organization_id = $1 AND (title ILIKE $2 OR company ILIKE $2) LIMIT 5",
      [organizationId, searchTerm]
    );

    const conversations = await pool.query(
      `SELECT c.id, COALESCE(cont.name, c.phone) as name, c.phone as sub, 'whatsapp' as type 
       FROM whatsapp_conversations c
       LEFT JOIN contacts cont ON c.contact_id = cont.id
       WHERE c.organization_id = $1 AND (cont.name ILIKE $2 OR c.phone ILIKE $2)
       LIMIT 5`,
      [organizationId, searchTerm]
    );

    res.json({
      success: true,
      data: [...contacts.rows, ...deals.rows, ...conversations.rows]
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

module.exports = router;
