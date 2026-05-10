const analyticsService = require('../services/analyticsService');

const getDashboardAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getDashboardAnalytics(req.user.userId);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
};

const getPipelineAnalytics = async (req, res) => {
  try {
    const funnelData = await analyticsService.getPipelineFunnel(req.user.userId);

    res.json({
      success: true,
      data: funnelData
    });
  } catch (error) {
    console.error('Get pipeline analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pipeline analytics'
    });
  }
};

const getAdvancedFunnelData = async (req, res) => {
  try {
    const data = await analyticsService.getAdvancedFunnel(req.user.organizationId);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get advanced funnel error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch advanced funnel' });
  }
};

module.exports = {
  getDashboardAnalytics,
  getPipelineAnalytics,
  getAdvancedFunnelData
};