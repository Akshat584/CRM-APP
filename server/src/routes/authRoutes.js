const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authLimiter = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/requireAuth');

router.get('/csrf', (req, res) => res.json({ success: true }));
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);
router.get('/invite-info/:token', authController.getInviteInfo);

module.exports = router;