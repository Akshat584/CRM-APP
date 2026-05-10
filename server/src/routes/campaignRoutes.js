const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/requireAuth');
const whatsappService = require('../modules/whatsapp/whatsappService');
const inboxService = require('../modules/whatsapp/inboxService');

router.use(requireAuth);

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, t.name as template_name 
       FROM whatsapp_campaigns c
       LEFT JOIN whatsapp_templates t ON c.template_id = t.id
       ORDER BY c.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch campaigns' });
  }
});

// Create campaign
router.post('/', async (req, res) => {
  try {
    const { name, template_id, audience_filter } = req.body;
    const result = await pool.query(
      `INSERT INTO whatsapp_campaigns (name, template_id, audience_filter, status)
       VALUES ($1, $2, $3, 'draft')
       RETURNING *`,
      [name, template_id, JSON.stringify(audience_filter)]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create campaign' });
  }
});

// Start campaign (Execute bulk send)
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get campaign and template
    const campRes = await pool.query(
      `SELECT c.*, t.name as template_name, t.language
       FROM whatsapp_campaigns c
       JOIN whatsapp_templates t ON c.template_id = t.id
       WHERE c.id = $1`,
      [id]
    );
    
    if (campRes.rows.length === 0) return res.status(404).json({ success: false, error: 'Campaign not found' });
    const campaign = campRes.rows[0];

    // 2. Update status to running
    await pool.query('UPDATE whatsapp_campaigns SET status = $1 WHERE id = $2', ['running', id]);

    // 3. Find audience (Simple implementation: everyone with a phone number for now, or based on filter)
    // For now, let's just get all contacts belonging to the user
    const contactsRes = await pool.query(
      'SELECT id, name, phone FROM contacts WHERE user_id = $1 AND phone IS NOT NULL AND deleted_at IS NULL',
      [req.user.userId]
    );

    const contacts = contactsRes.rows;
    let successCount = 0;
    let failCount = 0;

    // 4. Send messages (Async background-ish)
    // In a real app, this would be a background job with a queue
    for (const contact of contacts) {
       try {
          const phone = contact.phone.replace(/\D/g, '');
          const result = await whatsappService.sendTemplate(phone, campaign.template_name, campaign.language);
          
          if (result.messages && result.messages[0]) {
             await inboxService.saveOutboundMessage(req.user.userId, {
                phone,
                content: `[Campaign: ${campaign.name}]`,
                type: 'template',
                contact_id: contact.id,
                meta_id: result.messages[0].id
             });
             successCount++;
          }
       } catch (err) {
          console.error(`Failed to send campaign message to ${contact.phone}:`, err);
          failCount++;
       }
    }

    // 5. Update campaign status
    await pool.query(
      'UPDATE whatsapp_campaigns SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [failCount === 0 ? 'completed' : 'failed', id]
    );

    res.json({ 
      success: true, 
      data: { 
        message: `Campaign executed. Success: ${successCount}, Failed: ${failCount}`,
        successCount,
        failCount
      } 
    });
  } catch (error) {
    console.error('Start campaign error:', error);
    res.status(500).json({ success: false, error: 'Failed to start campaign' });
  }
});

module.exports = router;
