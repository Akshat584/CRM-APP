const Stripe = require('stripe');
const pool = require('../db/pool');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (organizationId, email, returnUrl) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID, // Ensure this is set in .env
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    customer_email: email,
    client_reference_id: organizationId,
  });

  return session;
};

const createBillingPortalSession = async (customerId, returnUrl) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session;
};

const processWebhook = async (event) => {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const organizationId = session.client_reference_id;
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    await pool.query(
      'UPDATE organizations SET stripe_customer_id = $1, stripe_subscription_id = $2, subscription_tier = $3 WHERE id = $4',
      [customerId, subscriptionId, 'premium', organizationId]
    );
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    await pool.query(
      'UPDATE organizations SET subscription_tier = $1 WHERE stripe_subscription_id = $2',
      ['free', subscription.id]
    );
  }
};

module.exports = {
  stripe,
  createCheckoutSession,
  createBillingPortalSession,
  processWebhook
};