const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { requireAuth } = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', emailController.getEmails);
router.post('/send', emailController.sendEmail);

module.exports = router;