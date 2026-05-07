const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/requireAuth');

router.use(requireAuth);

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/export', contactController.exportContacts);
router.post('/import', upload.single('file'), contactController.importContacts);

router.get('/', contactController.getContacts);
router.get('/:id', contactController.getContact);
router.post('/', validate, contactController.createContact);
router.put('/:id', validate, contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

module.exports = router;