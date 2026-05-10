const pool = require('../../db/pool');
const { getIO } = require('../../socket');

const getConversations = async (options = {}) => {
  const { assignedTo, status } = options;
  let query = `
    SELECT c.*, cont.name as contact_name, cont.avatar_initials, u.name as assignee_name,
    (SELECT content FROM whatsapp_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
    FROM whatsapp_conversations c
    LEFT JOIN contacts cont ON c.contact_id = cont.id
    LEFT JOIN users u ON c.assigned_to = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 0;

  if (assignedTo) {
    paramCount++;
    if (assignedTo === 'unassigned') {
      query += ' AND c.assigned_to IS NULL';
    } else {
      query += ` AND c.assigned_to = $${paramCount}`;
      params.push(assignedTo);
    }
  }

  if (status) {
    paramCount++;
    query += ` AND c.status = $${paramCount}`;
    params.push(status);
  }

  query += ' ORDER BY c.last_message_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
};

const assignConversation = async (id, userId) => {
  const result = await pool.query(
    'UPDATE whatsapp_conversations SET assigned_to = $1 WHERE id = $2 RETURNING *',
    [userId === 'unassigned' ? null : userId, id]
  );
  return result.rows[0];
};

const getTeam = async () => {
  const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY name ASC');
  return result.rows;
};

const getTemplates = async () => {
  const result = await pool.query('SELECT * FROM whatsapp_templates ORDER BY name ASC');
  return result.rows;
};

const syncTemplates = async (metaTemplates) => {
  // Simple sync: Clear and reload (or upsert)
  // For production, upsert is better to avoid breaking references
  for (const t of metaTemplates) {
    const content = t.components.find(c => c.type === 'BODY')?.text || '';
    const variables = t.components.filter(c => c.type === 'BODY' && c.example?.header_text); // simplified variable detection

    await pool.query(
      `INSERT INTO whatsapp_templates (name, category, language, content, variables, meta_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (name) DO UPDATE 
       SET category = $2, language = $3, content = $4, variables = $5, meta_status = $6, updated_at = CURRENT_TIMESTAMP`,
      [t.name, t.category, t.language, content, JSON.stringify(variables), t.status]
    );
  }
  return { count: metaTemplates.length };
};

const getMessages = async (conversationId) => {
  const result = await pool.query(
    'SELECT * FROM whatsapp_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [conversationId]
  );
  return result.rows;
};

const handleInboundMessage = async ({ phone, content, type, metaId, raw }) => {
  // 1. Find or create contact
  let contactId = null;
  const contactRes = await pool.query('SELECT id FROM contacts WHERE phone = $1 OR phone = $2', [phone, `+${phone}`]);
  
  if (contactRes.rows.length > 0) {
    contactId = contactRes.rows[0].id;
  } else {
    // Create lead if not found
    const name = raw.contacts ? raw.contacts[0].profile.name : `WA User ${phone}`;
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    // We need a userId to assign the contact. For now, we'll assign to the first admin or leave null
    // Ideally, we have a default system user or round-robin logic.
    const adminRes = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const systemUserId = adminRes.rows[0].id;

    const newContact = await pool.query(
      `INSERT INTO contacts (user_id, name, phone, status, avatar_initials, notes)
       VALUES ($1, $2, $3, 'Lead', $4, 'Created via WhatsApp inbound')
       RETURNING id`,
      [systemUserId, name, phone, initials]
    );
    contactId = newContact.rows[0].id;
  }

  // 2. Find or create conversation
  let conversationId;
  const convRes = await pool.query('SELECT id FROM whatsapp_conversations WHERE phone = $1', [phone]);
  
  if (convRes.rows.length > 0) {
    conversationId = convRes.rows[0].id;
    await pool.query(
      'UPDATE whatsapp_conversations SET last_message_at = CURRENT_TIMESTAMP, last_inbound_at = CURRENT_TIMESTAMP, contact_id = $1 WHERE id = $2',
      [contactId, conversationId]
    );
  } else {
    const newConv = await pool.query(
      'INSERT INTO whatsapp_conversations (contact_id, phone, last_inbound_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id',
      [contactId, phone]
    );
    conversationId = newConv.rows[0].id;
  }

  // 3. Save message
  const messageRes = await pool.query(
    `INSERT INTO whatsapp_messages (conversation_id, direction, message_type, content, meta)
     VALUES ($1, 'inbound', $2, $3, $4)
     RETURNING *`,
    [conversationId, type, content, JSON.stringify({ meta_id: metaId })]
  );

  const savedMessage = messageRes.rows[0];

  // 4. Emit via Socket.io
  const io = getIO();
  io.emit('whatsapp:message', {
    conversationId,
    message: savedMessage,
    phone
  });

  // 5. Check for Automations
  if (type === 'text' && content) {
    const automationRes = await pool.query(
      `SELECT a.*, t.name as template_name, t.language as template_lang 
       FROM whatsapp_automations a
       LEFT JOIN whatsapp_templates t ON a.reply_template_id = t.id
       WHERE a.organization_id = (SELECT organization_id FROM whatsapp_conversations WHERE id = $1)
       AND LOWER($2) LIKE '%' || LOWER(a.keyword) || '%'
       AND a.is_active = true
       LIMIT 1`,
      [conversationId, content]
    );

    if (automationRes.rows.length > 0) {
      const auto = automationRes.rows[0];
      const whatsappService = require('./whatsappService'); 
      let meta_id;

      try {
        if (auto.reply_type === 'template' && auto.template_name) {
          const result = await whatsappService.sendTemplate(phone, auto.template_name, auto.template_lang);
          meta_id = result.messages?.[0]?.id;
          
          await pool.query(
            `INSERT INTO whatsapp_messages (conversation_id, direction, message_type, content, meta, status)
             VALUES ($1, 'outbound', 'template', $2, $3, 'sent')`,
            [conversationId, `[Auto-Reply Template: ${auto.template_name}]`, JSON.stringify({ meta_id })]
          );
        } else if (auto.reply_text) {
          const result = await whatsappService.sendTextMessage(phone, auto.reply_text);
          meta_id = result.messages?.[0]?.id;
          
          await pool.query(
            `INSERT INTO whatsapp_messages (conversation_id, direction, message_type, content, meta, status)
             VALUES ($1, 'outbound', 'text', $2, $3, 'sent')`,
            [conversationId, auto.reply_text, JSON.stringify({ meta_id })]
          );
        }
      } catch (err) {
        console.error('Automation reply failed:', err.message);
      }
    }
  }

  return savedMessage;
};

const saveOutboundMessage = async (userId, { phone, content, type, contact_id, meta_id }) => {
  // 1. Find or create conversation
  let conversationId;
  const convRes = await pool.query('SELECT id FROM whatsapp_conversations WHERE phone = $1', [phone]);
  
  if (convRes.rows.length > 0) {
    conversationId = convRes.rows[0].id;
    await pool.query(
      'UPDATE whatsapp_conversations SET last_message_at = CURRENT_TIMESTAMP, assigned_to = $1 WHERE id = $2',
      [userId, conversationId]
    );
  } else {
    const newConv = await pool.query(
      'INSERT INTO whatsapp_conversations (contact_id, phone, assigned_to) VALUES ($1, $2, $3) RETURNING id',
      [contact_id, phone, userId]
    );
    conversationId = newConv.rows[0].id;
  }

  // 2. Save message
  const result = await pool.query(
    `INSERT INTO whatsapp_messages (conversation_id, direction, message_type, content, meta, status)
     VALUES ($1, 'outbound', $2, $3, $4, 'sent')
     RETURNING *`,
    [conversationId, type, content, JSON.stringify({ meta_id })]
  );

  return result.rows[0];
};

const handleStatusUpdate = async ({ metaId, status, timestamp, recipientId }) => {
  // Update message status in DB
  const result = await pool.query(
    `UPDATE whatsapp_messages 
     SET status = $1 
     WHERE meta->>'meta_id' = $2 
     RETURNING id, conversation_id, status`,
    [status, metaId]
  );

  if (result.rows.length > 0) {
    const updatedMessage = result.rows[0];
    
    // Emit via Socket.io
    const io = getIO();
    io.emit('whatsapp:status', {
      messageId: updatedMessage.id,
      conversationId: updatedMessage.conversation_id,
      status: updatedMessage.status
    });

    return updatedMessage;
  }
  return null;
};

module.exports = {
  getConversations,
  getMessages,
  handleInboundMessage,
  saveOutboundMessage,
  handleStatusUpdate,
  assignConversation,
  getTeam,
  getTemplates,
  syncTemplates
};
