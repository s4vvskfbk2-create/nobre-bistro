import { z } from 'zod';

const schema = z.object({
  amount: z.number().min(1),
  description: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  mesa: z.number().optional(),
});

export default async function handler(req: { body: any }) {
  try {
    const data = schema.parse(req.body);

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100),
      currency: 'brl',
      payment_method_types: ['card', 'boleto'],
      metadata: {
        description: data.description,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        mesa: data.mesa || 0,
        restaurant: 'nobre-cafe',
      },
    });

    return {
      status: 200,
      body: {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    };
  } catch (error: any) {
    return {
      status: 400,
      body: {
        success: false,
        error: error.message,
      },
    };
  }
}
