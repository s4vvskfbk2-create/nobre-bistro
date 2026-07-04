// PIX automático via Mercado Pago.
//
// Ações:
//   { action:"criar", pedidoId, total, cliente } → cria cobrança PIX no Mercado
//     Pago e retorna o código copia-e-cola + QR em base64. Registra em payments.
//   Webhook (POST do Mercado Pago com ?source=mp) → confirma o pagamento:
//     marca o pedido como pago, atualiza payments, grava evento PAYMENT_RECEIVED.
//
// Secret necessário: MP_ACCESS_TOKEN (Mercado Pago → Suas integrações →
// Credenciais de produção → Access Token).
//
// IMPORTANTE: publique com --no-verify-jwt para o webhook do Mercado Pago
// funcionar:  supabase functions deploy pix-gateway --no-verify-jwt
// Configure o webhook no painel MP apontando para:
//   https://zxpnguynjrsixsomaieg.supabase.co/functions/v1/pix-gateway?source=mp
//
// Sem o MP_ACCESS_TOKEN, "criar" responde { ok:false, reason:"nao_configurado" }
// e o cardápio continua mostrando a chave PIX estática (fallback automático).

const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const MP_TOKEN = Deno.env.get("MP_ACCESS_TOKEN") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const DB = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

async function dbPost(path: string, body: unknown, prefer = "return=minimal"): Promise<any> {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: "POST", headers: { ...DB, "Prefer": prefer }, body: JSON.stringify(body),
  });
  if (prefer === "return=minimal") return null;
  return r.ok ? await r.json().catch(() => null) : null;
}
async function dbPatch(path: string, body: unknown): Promise<void> {
  await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: "PATCH", headers: { ...DB, "Prefer": "return=minimal" }, body: JSON.stringify(body),
  }).catch(() => {});
}
async function dbGet(path: string): Promise<any[]> {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: DB });
  return r.ok ? await r.json().catch(() => []) : [];
}

async function criarCobranca(body: Record<string, unknown>): Promise<Response> {
  if (!MP_TOKEN) return json({ ok: false, reason: "nao_configurado" });
  const pedidoId = String(body.pedidoId || "");
  const total = Number(body.total || 0);
  const cliente = String(body.cliente || "Cliente").slice(0, 60);
  if (!pedidoId || total <= 0) return json({ ok: false, reason: "dados_invalidos" }, 400);

  const r = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${MP_TOKEN}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": `nb-pix-${pedidoId}`,
    },
    body: JSON.stringify({
      transaction_amount: Math.round(total * 100) / 100,
      description: `Nobre Bistro — Pedido #${pedidoId}`,
      payment_method_id: "pix",
      external_reference: pedidoId,
      payer: { email: "cliente@nobrebistro.pix", first_name: cliente },
    }),
  });
  if (!r.ok) {
    const err = await r.text().catch(() => "");
    return json({ ok: false, reason: "mp_error", detail: err.slice(0, 300) }, 502);
  }
  const mp = await r.json();
  const tx = mp?.point_of_interaction?.transaction_data || {};

  await dbPost("payments", {
    method: "pix",
    provider: "mercadopago",
    provider_reference: String(mp.id),
    status: "pending",
    amount: total,
    raw_payload: { legacy_order_id: pedidoId, mp_status: mp.status },
  });
  await dbPost("system_events", {
    event_type: "PIX_CHARGE_CREATED", source: "pix-gateway", entity_type: "order",
    entity_id: pedidoId, payload: { mp_id: mp.id, total },
  });

  return json({
    ok: true,
    mpId: mp.id,
    copiaECola: tx.qr_code || "",
    qrBase64: tx.qr_code_base64 || "",
    expira: mp.date_of_expiration || null,
  });
}

async function webhook(req: Request): Promise<Response> {
  if (!MP_TOKEN) return json({ ok: true });
  let body: any = {};
  try { body = await req.json(); } catch { /* MP também manda query-only pings */ }
  const paymentId = body?.data?.id || new URL(req.url).searchParams.get("data.id");
  if (!paymentId) return json({ ok: true, skip: "sem_payment_id" });

  const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { "Authorization": `Bearer ${MP_TOKEN}` },
  });
  if (!r.ok) return json({ ok: true, skip: "consulta_falhou" });
  const mp = await r.json();
  const pedidoId = String(mp.external_reference || "");

  if (mp.status === "approved" && pedidoId) {
    // marca o pedido como pago (metadata completo preservado)
    const rows = await dbGet(`orders?legacy_id=eq.${encodeURIComponent(pedidoId)}&select=id,metadata`);
    if (rows[0]) {
      const meta = rows[0].metadata || {};
      const novoStatus = meta.status === "aguardando_pagamento" ? "em_curso" : meta.status;
      await dbPatch(`orders?legacy_id=eq.${encodeURIComponent(pedidoId)}`, {
        payment_status: "paid",
        status: novoStatus === "em_curso" ? "in_production" : undefined,
        metadata: { ...meta, status: novoStatus, pagoAutomatico: true, pagoVia: "pix_mercadopago", pagoEm: new Date().toISOString() },
      });
    }
    await dbPatch(`payments?provider_reference=eq.${paymentId}`, { status: "paid", paid_at: new Date().toISOString() });
    await dbPost("system_events", {
      event_type: "PAYMENT_RECEIVED", source: "pix-gateway.webhook", entity_type: "order",
      entity_id: pedidoId, payload: { mp_id: paymentId, valor: mp.transaction_amount, automatico: true },
    });
  }
  return json({ ok: true });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = new URL(req.url);
  if (url.searchParams.get("source") === "mp") return await webhook(req);

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  if (String(body.action) === "criar") return await criarCobranca(body);
  return json({ error: "acao_desconhecida" }, 400);
});
