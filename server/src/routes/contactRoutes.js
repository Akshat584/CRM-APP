const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', contactController.getContacts);
router.get('/:id', contactController.getContact);
router.post('/', validate, contactController.createContact);
router.put('/:id', validate, contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

module.exports = router;