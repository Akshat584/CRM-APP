const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');
const pool = require('../db/pool');

router.get('/', requireAuth, async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.userId;

    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = `%${q}%`;

    const contacts = await pool.query(
      "SELECT id, name, company as sub, 'contact' as type FROM contacts WHERE user_id = $1 AND (name ILIKE $2 OR company ILIKE $2 OR email ILIKE $2) AND deleted_at IS NULL LIMIT 5",
      [userId, searchTerm]
    );

    const deals = await pool.query(
      "SELECT id, title as name, company as sub, 'deal' as type FROM deals WHERE user_id = $1 AND (title ILIKE $2 OR company ILIKE $2) LIMIT 5",
      [userId, searchTerm]
    );

    res.json({
      success: true,
      data: [...contacts.rows, ...deals.rows]
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

module.exports = router;
