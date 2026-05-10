const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { requireAuth, requireAdmin } = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', teamController.getTeam);
router.post('/invite', requireAdmin, teamController.inviteMember);

module.exports = router;