const { body } = require('express-validator');
const dealService = require('../services/dealService');

const validateDeal = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('stage').isIn(['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']).withMessage('Invalid stage'),
  body('probability').optional().isInt({ min: 0, max: 100 }).withMessage('Probability must be between 0 and 100')
];

const getDeals = async (req, res) => {
  try {
    const { stage, contact_id, sort, order, page, limit } = req.query;

    const deals = await dealService.getAllDeals(req.user.userId, {
      stage,
      contact_id,
      sort,
      order,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.json({
      success: true,
      data: deals
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deals'
    });
  }
};

const getDeal = async (req, res) => {
  try {
    const deal = await dealService.getDealById(req.user.userId, req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    res.json({
      success: true,
      data: deal
    });
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deal'
    });
  }
};

const createDeal = async (req, res) => {
  try {
    const deal = await dealService.createDeal(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      data: deal
    });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create deal'
    });
  }
};

const updateDeal = async (req, res) => {
  try {
    const deal = await dealService.updateDeal(req.user.userId, req.params.id, req.body);

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    res.json({
      success: true,
      data: deal
    });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update deal'
    });
  }
};

const deleteDeal = async (req, res) => {
  try {
    const deal = await dealService.deleteDeal(req.user.userId, req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    res.json({
      success: true,
      data: { message: 'Deal deleted successfully' }
    });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete deal'
    });
  }
};

module.exports = {
  validateDeal,
  getDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal
};