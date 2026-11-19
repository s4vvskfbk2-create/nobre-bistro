import { z } from 'zod';

const schema = z.object({
  orderId: z.string(),
  amount: z.number(),
  items: z.array(z.object({ name: z.string(), quantity: z.number(), price: z.number() })),
  paymentMethod: z.enum(['pix', 'credit_card', 'boleto', 'fiado']),
});

export default async function handler(req: { body: any }) {
  try {
    const data = schema.parse(req.body);

    const nfeData = {
      numero_nfe: `NF-${Date.now()}`,
      serie_nfe: '1',
      data_emissao: new Date().toISOString(),
      emitente: {
        razao_social: 'Nobre Café',
        nome_fantasia: 'Nobre Café',
        cpf_cnpj: process.env.NOBRE_CNPJ || '',
      },
      itens: data.items.map((item, idx) => ({
        numero_item: idx + 1,
        descricao: item.name,
        quantidade: item.quantity,
        valor_unitario: item.price,
        valor_total: item.quantity * item.price,
      })),
      valor_total: data.amount,
      forma_pagamento: { pix: '01', credit_card: '02', boleto: '03', fiado: '04' }[data.paymentMethod],
    };

    const response = await fetch('https://api.nuvemfiscal.com.br/v1/nfe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NUVEM_FISCAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nfeData),
    });

    const nfe = await response.json();

    // Send via WhatsApp
    if (process.env.WHATSAPP_API_KEY) {
      await fetch('https://api.whatsapp.com/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          type: 'document',
          document: { link: nfe.pdf_url },
        }),
      });
    }

    return {
      status: 200,
      body: { success: true, nfeId: nfe.id, nfeNumber: nfe.numero_nfe },
    };
  } catch (error: any) {
    return { status: 400, body: { error: error.message } };
  }
}
