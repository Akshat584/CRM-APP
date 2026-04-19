const { body } = require('express-validator');
const activityService = require('../services/activityService');

const validateActivity = [
  body('type').isIn(['call', 'email', 'meeting', 'note', 'task']).withMessage('Invalid activity type'),
  body('body').trim().notEmpty().withMessage('Activity body is required'),
  body('contact_id').notEmpty().withMessage('Contact ID is required')
];

const getActivities = async (req, res) => {
  try {
    const { contact_id, deal_id, type, page, limit } = req.query;

    const activities = await activityService.getAllActivities(req.user.userId, {
      contact_id,
      deal_id,
      type,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activities'
    });
  }
};

const createActivity = async (req, res) => {
  try {
    const activity = await activityService.createActivity(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create activity'
    });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const activity = await activityService.deleteActivity(req.user.userId, req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }

    res.json({
      success: true,
      data: { message: 'Activity deleted successfully' }
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete activity'
    });
  }
};

module.exports = {
  validateActivity,
  getActivities,
  createActivity,
  deleteActivity
};