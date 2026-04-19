const { body } = require('express-validator');
const contactService = require('../services/contactService');

const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('status').isIn(['Lead', 'Prospect', 'Customer', 'Churned']).withMessage('Invalid status'),
  body('lifetime_value').optional().isFloat({ min: 0 }).withMessage('Lifetime value must be a positive number')
];

const getContacts = async (req, res) => {
  try {
    const { search, status, sort, order, page, limit } = req.query;

    const contacts = await contactService.getAllContacts(req.user.userId, {
      search,
      status,
      sort,
      order,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contacts'
    });
  }
};

const getContact = async (req, res) => {
  try {
    const contact = await contactService.getContactById(req.user.userId, req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact'
    });
  }
};

const createContact = async (req, res) => {
  try {
    const contact = await contactService.createContact(req.user.userId, req.body);

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create contact'
    });
  }
};

const updateContact = async (req, res) => {
  try {
    const contact = await contactService.updateContact(req.user.userId, req.params.id, req.body);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update contact'
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await contactService.deleteContact(req.user.userId, req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: { message: 'Contact deleted successfully' }
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete contact'
    });
  }
};

module.exports = {
  validateContact,
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact
};