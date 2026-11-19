import { z } from 'zod';

const schema = z.object({
  amount: z.number().min(1),
  description: z.string(),
  customerName: z.string(),
  paymentMethod: z.enum(['credit_card', 'fiado']),
  mesa: z.number().optional(),
});

export default async function handler(req: { body: any }) {
  try {
    const data = schema.parse(req.body);

    // Pagar.me integration
    const response = await fetch('https://api.pagar.me/core/v5/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAGARMEE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            amount: Math.round(data.amount * 100),
            quantity: 1,
            description: data.description,
          },
        ],
        customer: {
          name: data.customerName,
        },
        payments: [
          {
            payment_method: data.paymentMethod,
          },
        ],
        metadata: {
          mesa: data.mesa || 0,
          restaurant: 'nobre-cafe',
        },
      }),
    });

    const order = await response.json();

    return {
      status: 200,
      body: {
        success: true,
        orderId: order.id,
        status: order.status,
        transactionId: order.transactions?.[0]?.id,
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
