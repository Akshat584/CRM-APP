const pool = require('../db/pool');

const getAllContacts = async (userId, options = {}) => {
  const {
    search,
    status,
    sort = 'created_at',
    order = 'desc',
    page = 1,
    limit = 20
  } = options;

  const ALLOWED_SORTS = ['name', 'company', 'email', 'status', 'lifetime_value', 'created_at', 'updated_at'];
  const ALLOWED_ORDERS = ['ASC', 'DESC'];
  const safeSort = ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
  const safeOrder = ALLOWED_ORDERS.includes(order?.toUpperCase()) ? order.toUpperCase() : 'DESC';

  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM contacts WHERE user_id = $1 AND deleted_at IS NULL';
  const params = [userId];
  let paramCount = 1;

  if (search) {
    paramCount++;
    query += ` AND (name ILIKE $${paramCount} OR company ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
    params.push(`%${search}%`);
  }

  if (status) {
    paramCount++;
    query += ` AND status = $${paramCount}`;
    params.push(status);
  }

  paramCount++;
  query += ` ORDER BY ${safeSort} ${safeOrder} LIMIT $${paramCount}`;
  params.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const result = await pool.query(query, params);
  return result.rows;
};

const getContactById = async (userId, id) => {
  const contactResult = await pool.query(
    'SELECT * FROM contacts WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [id, userId]
  );

  if (contactResult.rows.length === 0) {
    return null;
  }

  const contact = contactResult.rows[0];

  const dealsResult = await pool.query(
    'SELECT * FROM deals WHERE contact_id = $1 AND user_id = $2 ORDER BY created_at DESC',
    [id, userId]
  );

  const activitiesResult = await pool.query(
    'SELECT * FROM activities WHERE contact_id = $1 AND user_id = $2 ORDER BY activity_date DESC LIMIT 10',
    [id, userId]
  );

  return {
    ...contact,
    deals: dealsResult.rows,
    recent_activities: activitiesResult.rows
  };
};

const createContact = async (userId, contactData) => {
  const {
    name,
    company,
    email,
    phone,
    status,
    lifetime_value = 0,
    tags = [],
    notes
  } = contactData;

  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const result = await pool.query(
    `INSERT INTO contacts (user_id, name, company, email, phone, status, lifetime_value, tags, avatar_initials, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [userId, name, company, email, phone, status, lifetime_value, tags, initials, notes]
  );

  return result.rows[0];
};

const updateContact = async (userId, id, contactData) => {
  const fields = [];
  const values = [];
  let paramCount = 0;

  const ALLOWED_FIELDS = ['name', 'company', 'email', 'phone', 'status', 'lifetime_value', 'tags', 'avatar_initials', 'notes'];

  for (const [key, value] of Object.entries(contactData)) {
    if (value !== undefined && ALLOWED_FIELDS.includes(key)) {
      paramCount++;
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  paramCount++;
  values.push(id);
  const query = `
    UPDATE contacts
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount} AND user_id = $${paramCount + 1} AND deleted_at IS NULL
    RETURNING *
  `;
  values.push(userId);

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteContact = async (userId, id) => {
  const result = await pool.query(
    'UPDATE contacts SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id',
    [id, userId]
  );

  return result.rows[0];
};

const getContactCount = async (userId) => {
  const result = await pool.query(
    'SELECT COUNT(*) FROM contacts WHERE user_id = $1 AND deleted_at IS NULL',
    [userId]
  );
  return parseInt(result.rows[0].count);
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  getContactCount
};