const express = require('express');
const router = express.Router();
const multer = require('multer');
const whatsappController = require('./whatsappController');
const webhookController = require('./webhookController');
const { requireAuth } = require('../../middleware/requireAuth');

const upload = multer({ storage: multer.memoryStorage() });

// Webhook endpoints (Public - Meta calls these)
router.get('/webhook', webhookController.verify);
router.post('/webhook', webhookController.events);

// Authenticated endpoints
router.use(requireAuth);

router.get('/conversations', whatsappController.getConversations);
router.put('/conversations/:id/assign', whatsappController.assignConversation);
router.get('/conversations/:id/messages', whatsappController.getMessages);
router.post('/messages', whatsappController.sendMessage);
router.post('/media/upload', upload.single('file'), whatsappController.uploadMedia);
router.get('/templates', whatsappController.getTemplates);
router.post('/templates/sync', whatsappController.syncTemplates);
router.get('/team', whatsappController.getTeam);

module.exports = router;
