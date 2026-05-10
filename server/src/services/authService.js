const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const crypto = require('crypto');

const generateTokens = (userId, role, organizationId) => {
  const accessToken = jwt.sign(
    { userId, role, organizationId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');

  return { accessToken, refreshToken };
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const getUserByEmail = async (email) => {
  const result = await pool.query(
    'SELECT id, name, email, password_hash, role, organization_id FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, email, role, organization_id, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const createUser = async (userData) => {
  const { name, email, password, role = 'admin' } = userData; // Automatically become admin of own org
  const passwordHash = await hashPassword(password);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create Organization
    const orgResult = await client.query(
      'INSERT INTO organizations (name) VALUES ($1) RETURNING id',
      [`${name}'s Organization`]
    );
    const orgId = orgResult.rows[0].id;
    
    // Create User
    const result = await client.query(
      'INSERT INTO users (name, email, password_hash, role, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, organization_id, created_at',
      [name, email, passwordHash, role, orgId]
    );
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const storeRefreshToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
    [token, userId, expiresAt]
  );
};

const verifyRefreshToken = async (token) => {
  const result = await pool.query(
    'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
    [token]
  );

  return result.rows[0];
};

const deleteRefreshToken = async (token) => {
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
};

const deleteUserRefreshTokens = async (userId) => {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
};

const storePasswordResetToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  await pool.query(
    'INSERT INTO password_resets (token, user_id, expires_at) VALUES ($1, $2, $3)',
    [token, userId, expiresAt]
  );
};

const verifyPasswordResetToken = async (token) => {
  const result = await pool.query(
    'SELECT user_id FROM password_resets WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP',
    [token]
  );
  return result.rows[0];
};

const deletePasswordResetToken = async (token) => {
  await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);
};

const updatePassword = async (userId, newPassword) => {
  const passwordHash = await hashPassword(newPassword);
  await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [passwordHash, userId]
  );
};

module.exports = {
  generateTokens,
  hashPassword,
  verifyPassword,
  getUserByEmail,
  getUserById,
  createUser,
  storeRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  deleteUserRefreshTokens,
  storePasswordResetToken,
  verifyPasswordResetToken,
  deletePasswordResetToken,
  updatePassword
};