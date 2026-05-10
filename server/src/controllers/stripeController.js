const stripeService = require('../services/stripeService');
const pool = require('../db/pool');

const createCheckout = async (req, res) => {
  try {
    const { organizationId, email } = req.user; // Added in token
    const returnUrl = process.env.CLIENT_URL + '/settings/billing';

    const session = await stripeService.createCheckoutSession(organizationId, email, returnUrl);
    
    res.json({ success: true, data: { url: session.url } });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, error: 'Failed to create checkout session' });
  }
};

const createPortal = async (req, res) => {
  try {
    const { organizationId } = req.user;
    
    const orgResult = await pool.query('SELECT stripe_customer_id FROM organizations WHERE id = $1', [organizationId]);
    const customerId = orgResult.rows[0]?.stripe_customer_id;

    if (!customerId) {
      return res.status(400).json({ success: false, error: 'No active subscription found' });
    }

    const returnUrl = process.env.CLIENT_URL + '/settings/billing';
    const session = await stripeService.createBillingPortalSession(customerId, returnUrl);

    res.json({ success: true, data: { url: session.url } });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ success: false, error: 'Failed to create billing portal session' });
  }
};

const webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Note: We use req.body directly as a Buffer, assuming webhook route is configured with raw body parser
    event = stripeService.stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await stripeService.processWebhook(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Webhook processing error');
  }
};

module.exports = {
  createCheckout,
  createPortal,
  webhook
};