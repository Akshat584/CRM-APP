const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/summarize/:conversationId', aiController.getConversationSummary);

module.exports = router;