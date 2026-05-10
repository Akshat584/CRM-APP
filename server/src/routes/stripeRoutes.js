const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { requireAuth } = require('../middleware/requireAuth');

// Protected routes
router.use(requireAuth);
router.post('/checkout', stripeController.createCheckout);
router.post('/portal', stripeController.createPortal);

module.exports = router;