const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', activityController.getActivities);
router.post('/', validate, activityController.createActivity);
router.delete('/:id', activityController.deleteActivity);

module.exports = router;