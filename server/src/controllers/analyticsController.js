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

module.exports = {
  getDashboardAnalytics,
  getPipelineAnalytics
};