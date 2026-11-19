export default async function handler(req: { body: any; headers: any }) {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Trigger NF-e generation here
        console.log('✅ Payment successful:', paymentIntent.id);
        return {
          status: 200,
          body: { received: true, action: 'payment_succeeded' },
        };

      case 'payment_intent.payment_failed':
        console.log('❌ Payment failed');
        return {
          status: 200,
          body: { received: true, action: 'payment_failed' },
        };

      default:
        return {
          status: 200,
          body: { received: true },
        };
    }
  } catch (error: any) {
    return {
      status: 400,
      body: { error: error.message },
    };
  }
}
