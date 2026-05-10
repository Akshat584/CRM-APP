const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automationController');
const { requireAuth } = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', automationController.getAutomations);
router.post('/', automationController.createAutomation);
router.patch('/:id/toggle', automationController.toggleAutomation);
router.delete('/:id', automationController.deleteAutomation);

module.exports = router;