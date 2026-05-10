const { body } = require('express-validator');
const authService = require('../services/authService');
const { generateTokens } = require('../services/authService');
const { storeRefreshToken, verifyRefreshToken, deleteUserRefreshTokens } = require('../services/authService');

const register = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/).withMessage('Password must contain uppercase, lowercase, number, and special character'),
  async (req, res) => {
    try {
      const { name, email, password, inviteToken } = req.body;

      const existingUser = await authService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered'
        });
      }

      const user = await authService.createUser({ name, email, password }, inviteToken);

      const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.organization_id);
      await storeRefreshToken(user.id, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization_id: user.organization_id
          },
          accessToken
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Registration failed'
      });
    }
  }
];


const loginAttempts = new Map();

const login = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Lockout check
      const attempts = loginAttempts.get(email) || { count: 0, lockoutEnd: 0 };
      if (attempts.lockoutEnd > Date.now()) {
        return res.status(429).json({ success: false, error: 'Account locked. Try again later.' });
      }

      const user = await authService.getUserByEmail(email);
      if (!user) {
        attempts.count += 1;
        loginAttempts.set(email, attempts);
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const isValidPassword = await authService.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        attempts.count += 1;
        if (attempts.count >= 5) {
          attempts.lockoutEnd = Date.now() + 15 * 60 * 1000; // 15 mins
        }
        loginAttempts.set(email, attempts);
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      // Reset attempts
      loginAttempts.delete(email);



      const { accessToken, refreshToken } = generateTokens(user.id, user.role, user.organization_id);
      await storeRefreshToken(user.id, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organization_id: user.organization_id
          },
          accessToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }
];

const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No refresh token provided'
      });
    }

    const tokenData = await verifyRefreshToken(token);
    if (!tokenData) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    const user = await authService.getUserById(tokenData.user_id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role, user.organization_id);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Token refresh failed'
    });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await authService.deleteRefreshToken(token);
    }

    res.clearCookie('refreshToken');

    res.json({
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

const me = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
};

const getInviteInfo = async (req, res) => {
  try {
    const { token } = req.params;
    const invite = await authService.getInvitationByToken(token);
    
    if (!invite) {
      return res.status(404).json({ success: false, error: 'Invalid or expired invitation' });
    }
    
    res.json({ success: true, data: invite });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

const crypto = require('crypto');

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await authService.getUserByEmail(email);

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await authService.storePasswordResetToken(user.id, token);
      
      // In a real app, send an email here.
      console.log(`[STUB EMAIL] Password reset token for ${email}: ${token}`);
    }

    // Always return success to prevent email enumeration
    res.json({
      success: true,
      data: { message: 'If an account exists, a password reset link has been sent.' }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Request failed' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Enforce password complexity
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (newPassword.length < 12 || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        error: 'Password does not meet complexity requirements'
      });
    }

    const resetRecord = await authService.verifyPasswordResetToken(token);

    if (!resetRecord) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    await authService.updatePassword(resetRecord.user_id, newPassword);
    await authService.deletePasswordResetToken(token);

    res.json({ success: true, data: { message: 'Password has been reset' } });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Password reset failed' });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  getInviteInfo,
  forgotPassword,
  resetPassword
};