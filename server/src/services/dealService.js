const pool = require('../db/pool');

const getAllDeals = async (userId, options = {}) => {
  const {
    stage,
    contact_id,
    sort = 'created_at',
    order = 'desc',
    page = 1,
    limit = 20
  } = options;

  const ALLOWED_SORTS = ['title', 'company', 'value', 'stage', 'probability', 'due_date', 'created_at', 'updated_at'];
  const ALLOWED_ORDERS = ['ASC', 'DESC'];
  const safeSort = ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
  const safeOrder = ALLOWED_ORDERS.includes(order?.toUpperCase()) ? order.toUpperCase() : 'DESC';

  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM deals WHERE user_id = $1';
  const params = [userId];
  let paramCount = 1;

  if (stage) {
    paramCount++;
    query += ` AND stage = $${paramCount}`;
    params.push(stage);
  }

  if (contact_id) {
    paramCount++;
    query += ` AND contact_id = $${paramCount}`;
    params.push(contact_id);
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

const getDealById = async (userId, id) => {
  const result = await pool.query(
    'SELECT * FROM deals WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  return result.rows[0];
};

const createDeal = async (userId, dealData) => {
  const {
    contact_id,
    title,
    company,
    value,
    stage,
    probability,
    due_date,
    notes,
    property_id
  } = dealData;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO deals (user_id, contact_id, title, company, value, stage, probability, due_date, notes, property_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, contact_id, title, company, value, stage, probability, due_date, notes, property_id]
    );

    const deal = result.rows[0];

    // Log initial stage history
    await client.query(
      `INSERT INTO deal_stage_history (deal_id, stage) VALUES ($1, $2)`,
      [deal.id, deal.stage]
    );

    await client.query('COMMIT');
    return deal;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateDeal = async (userId, id, dealData) => {
  const fields = [];
  const values = [];
  let paramCount = 0;

  const ALLOWED_FIELDS = ['contact_id', 'property_id', 'title', 'company', 'value', 'stage', 'probability', 'due_date', 'notes'];

  for (const [key, value] of Object.entries(dealData)) {
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
    UPDATE deals
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
    RETURNING *
  `;
  values.push(userId);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check old stage to see if it changed
    const oldDealRes = await client.query('SELECT stage FROM deals WHERE id = $1', [id]);
    const oldStage = oldDealRes.rows[0]?.stage;

    const result = await client.query(query, values);
    const newStage = result.rows[0]?.stage;

    if (newStage && oldStage && newStage !== oldStage) {
      // Close out old stage
      await client.query(
        `UPDATE deal_stage_history SET exited_at = CURRENT_TIMESTAMP WHERE deal_id = $1 AND stage = $2 AND exited_at IS NULL`,
        [id, oldStage]
      );
      // Insert new stage
      await client.query(
        `INSERT INTO deal_stage_history (deal_id, stage) VALUES ($1, $2)`,
        [id, newStage]
      );
    }

    if (result.rows.length > 0 && dealData.stage && ['Closed Won', 'Closed Lost'].includes(dealData.stage)) {
      await client.query(
        `INSERT INTO activities (user_id, contact_id, deal_id, type, subject, body, activity_date)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [userId, result.rows[0].contact_id, id, 'note', 'Deal Closed', `Deal marked as ${dealData.stage}`]
      );
    }
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deleteDeal = async (userId, id) => {
  const result = await pool.query(
    'DELETE FROM deals WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );

  return result.rows[0];
};

const getPipelineStats = async (userId) => {
  const result = await pool.query(
    `SELECT stage, COUNT(*) as count, SUM(value) as total_value
     FROM deals
     WHERE user_id = $1
     GROUP BY stage
     ORDER BY
       CASE stage
         WHEN 'New' THEN 1
         WHEN 'Qualified' THEN 2
         WHEN 'Proposal' THEN 3
         WHEN 'Negotiation' THEN 4
         WHEN 'Closed Won' THEN 5
         WHEN 'Closed Lost' THEN 6
       END`,
    [userId]
  );

  return result.rows;
};

const getTotalPipelineValue = async (userId) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(value), 0) as total
     FROM deals
     WHERE user_id = $1 AND stage NOT IN ('Closed Won', 'Closed Lost')`,
    [userId]
  );

  return parseFloat(result.rows[0].total);
};

const getClosedRevenue = async (userId) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(value), 0) as total
     FROM deals
     WHERE user_id = $1 AND stage = 'Closed Won'`,
    [userId]
  );

  return parseFloat(result.rows[0].total);
};

const getWinRate = async (userId) => {
  const totalResult = await pool.query(
    'SELECT COUNT(*) as total FROM deals WHERE user_id = $1',
    [userId]
  );

  const wonResult = await pool.query(
    'SELECT COUNT(*) as won FROM deals WHERE user_id = $1 AND stage = \'Closed Won\'',
    [userId]
  );

  const total = parseInt(totalResult.rows[0].total);
  const won = parseInt(wonResult.rows[0].won);

  return total > 0 ? Math.round((won / total) * 100) : 0;
};

module.exports = {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  getPipelineStats,
  getTotalPipelineValue,
  getClosedRevenue,
  getWinRate
};