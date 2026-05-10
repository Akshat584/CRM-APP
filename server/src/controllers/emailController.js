const pool = require('../db/pool');

const getEmails = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { contact_id } = req.query;

    let query = `
      SELECT e.*, c.name as contact_name, c.email as contact_email 
      FROM emails e
      LEFT JOIN contacts c ON e.contact_id = c.id
      WHERE e.organization_id = $1
    `;
    const params = [organizationId];

    if (contact_id) {
      query += ` AND e.contact_id = $2`;
      params.push(contact_id);
    }

    query += ` ORDER BY e.sent_at DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch emails' });
  }
};

const sendEmail = async (req, res) => {
  try {
    const { organizationId, userId } = req.user;
    const { contact_id, subject, body } = req.body;

    // In a real app, this would use nodemailer, SendGrid, or Nylas to actually send the email.
    // Here we are creating a stub that logs it to the database.

    const result = await pool.query(
      `INSERT INTO emails (organization_id, user_id, contact_id, subject, body, direction, status)
       VALUES ($1, $2, $3, $4, $5, 'outbound', 'sent')
       RETURNING *`,
      [organizationId, userId, contact_id, subject, body]
    );

    console.log(`[EMAIL STUB] Sent to Contact ${contact_id}: Subject: ${subject}`);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
};

module.exports = {
  getEmails,
  sendEmail
};