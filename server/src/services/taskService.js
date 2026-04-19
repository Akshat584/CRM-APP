const pool = require('../db/pool');

const getAllTasks = async (userId, options = {}) => {
  const {
    status,
    priority,
    assignee_id,
    due_before,
    page = 1,
    limit = 20
  } = options;

  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM tasks WHERE user_id = $1';
  const params = [userId];
  let paramCount = 1;

  if (status) {
    paramCount++;
    query += ` AND status = $${paramCount}`;
    params.push(status);
  }

  if (priority) {
    paramCount++;
    query += ` AND priority = $${paramCount}`;
    params.push(priority);
  }

  if (assignee_id) {
    paramCount++;
    query += ` AND assignee_id = $${paramCount}`;
    params.push(assignee_id);
  }

  if (due_before) {
    paramCount++;
    query += ` AND due_date <= $${paramCount}`;
    params.push(due_before);
  }

  paramCount++;
  query += ` ORDER BY
    CASE status
      WHEN 'Todo' THEN 1
      WHEN 'In Progress' THEN 2
      WHEN 'Done' THEN 3
    END,
    due_date ASC
    LIMIT $${paramCount}`;
  params.push(limit);

  paramCount++;
  query += ` OFFSET $${paramCount}`;
  params.push(offset);

  const result = await pool.query(query, params);
  return result.rows;
};

const createTask = async (userId, taskData) => {
  const {
    contact_id,
    deal_id,
    title,
    priority,
    status = 'Todo',
    assignee_id,
    due_date,
    notes
  } = taskData;

  const result = await pool.query(
    `INSERT INTO tasks (user_id, contact_id, deal_id, title, priority, status, assignee_id, due_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [userId, contact_id, deal_id, title, priority, status, assignee_id, due_date, notes]
  );

  return result.rows[0];
};

const updateTask = async (userId, id, taskData) => {
  const fields = [];
  const values = [];
  let paramCount = 0;

  const ALLOWED_FIELDS = ['contact_id', 'deal_id', 'title', 'priority', 'status', 'assignee_id', 'due_date', 'notes'];

  for (const [key, value] of Object.entries(taskData)) {
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
    UPDATE tasks
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
    RETURNING *
  `;
  values.push(userId);

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteTask = async (userId, id) => {
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );

  return result.rows[0];
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
};