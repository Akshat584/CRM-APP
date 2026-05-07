const {
  getUserByEmail,
  getUserById,
  createUser,
  verifyPassword,
  generateTokens,
  storeRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  deleteUserRefreshTokens
} = require('../authService');
const pool = require('../../db/pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../db/pool');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('authService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: '1', email: 'test@test.com' };
      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await getUserByEmail('test@test.com');
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('should hash password and create user', async () => {
      bcrypt.hash.mockResolvedValue('hashedPassword');
      const mockUser = { id: '1', email: 'test@test.com' };
      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await createUser({
        name: 'Test',
        email: 'test@test.com',
        password: 'password123'
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for valid password', async () => {
      bcrypt.compare.mockResolvedValue(true);
      const result = await verifyPassword('pass', 'hashed');
      expect(result).toBe(true);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      jwt.sign.mockReturnValue('access');
      const result = generateTokens('1', 'member');
      expect(result.accessToken).toEqual('access');
      expect(result.refreshToken).toHaveLength(80); // 40 bytes = 80 hex chars
    });
  });
});
