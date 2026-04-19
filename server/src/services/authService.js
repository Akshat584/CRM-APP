const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const crypto = require('crypto');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
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
    'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

const createUser = async (userData) => {
  const { name, email, password, role = 'member' } = userData;
  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
    [name, email, passwordHash, role]
  );

  return result.rows[0];
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
  deleteUserRefreshTokens
};