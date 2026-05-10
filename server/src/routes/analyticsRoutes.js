const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireAuth, requireAdmin } = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/dashboard', analyticsController.getDashboardAnalytics);
router.get('/pipeline', analyticsController.getPipelineAnalytics);
router.get('/advanced-funnel', analyticsController.getAdvancedFunnelData);
router.get('/admin/reports', requireAdmin, (req, res) => {
  res.json({ success: true, data: { message: 'Admin data' } });
});

module.exports = router;