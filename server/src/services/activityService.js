const pool = require('../db/pool');

const getAllActivities = async (userId, options = {}) => {
  const {
    contact_id,
    deal_id,
    type,
    page = 1,
    limit = 20
  } = options;

  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM activities WHERE user_id = $1';
  const params = [userId];
  let paramCount = 1;

  if (contact_id) {
    paramCount++;
    query += ` AND contact_id = $${paramCount}`;
    params.push(contact_id);
  }

  if (deal_id) {
    paramCount++;
    query += ` AND deal_id = $${paramCount}`;
    params.push(deal_id);
  }

  if (type) {
    paramCount++;
    query += ` AND type = $${paramCount}`;
    params.push(type);
  }

  paramCount++;
  query += ` ORDER BY activity_date DESC LIMIT $${paramCount}`;
  params.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const result = await pool.query(query, params);
  return result.rows;
};

const createActivity = async (userId, activityData) => {
  const {
    contact_id,
    deal_id,
    type,
    subject,
    body,
    activity_date
  } = activityData;

  const result = await pool.query(
    `INSERT INTO activities (user_id, contact_id, deal_id, type, subject, body, activity_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, contact_id, deal_id, type, subject, body, activity_date || new Date()]
  );

  return result.rows[0];
};

const deleteActivity = async (userId, id) => {
  const result = await pool.query(
    'DELETE FROM activities WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );

  return result.rows[0];
};

const getActivityCounts = async (userId) => {
  const result = await pool.query(
    `SELECT type, COUNT(*) as count
     FROM activities
     WHERE user_id = $1
     GROUP BY type`,
    [userId]
  );

  return result.rows;
};

const getRecentActivities = async (userId, limit = 4) => {
  const result = await pool.query(
    `SELECT * FROM activities
     WHERE user_id = $1
     ORDER BY activity_date DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows;
};

module.exports = {
  getAllActivities,
  createActivity,
  deleteActivity,
  getActivityCounts,
  getRecentActivities
};