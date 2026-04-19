const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', dealController.getDeals);
router.get('/:id', dealController.getDeal);
router.post('/', validate, dealController.createDeal);
router.put('/:id', validate, dealController.updateDeal);
router.delete('/:id', dealController.deleteDeal);

module.exports = router;