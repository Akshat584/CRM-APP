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

    const result = await contactService.getAllContacts(req.user.userId, {
      search,
      status,
      sort,
      order,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.json({
      success: true,
      data: result.contacts,
      meta: {
        count: result.count,
        totalPages: result.totalPages
      }
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

const exportContacts = async (req, res) => {
  try {
    const { Parser } = require('json2csv');
    const result = await contactService.getAllContacts(req.user.userId, { limit: 10000 }); // Large limit for export
    const contacts = result.contacts;
    
    if (!contacts || contacts.length === 0) {
      return res.status(404).json({ success: false, error: 'No contacts found to export' });
    }

    const fields = ['name', 'email', 'phone', 'company', 'role', 'status', 'lifetime_value', 'created_at'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(contacts);

    res.header('Content-Type', 'text/csv');
    res.attachment('contacts_export.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Export contacts error:', error);
    res.status(500).json({ success: false, error: 'Failed to export contacts' });
  }
};

const importContacts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { parse } = require('csv-parse/sync');
    const records = parse(req.file.buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (records.length === 0) {
      return res.status(400).json({ success: false, error: 'CSV is empty' });
    }

    // Call service to bulk insert
    const importedCount = await contactService.bulkCreateContacts(req.user.userId, records);

    res.status(201).json({
      success: true,
      data: { message: `Successfully imported ${importedCount} contacts` }
    });
  } catch (error) {
    console.error('Import contacts error:', error);
    res.status(500).json({ success: false, error: 'Failed to import contacts. Please check CSV format.' });
  }
};

module.exports = {
  validateContact,
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  exportContacts,
  importContacts
};