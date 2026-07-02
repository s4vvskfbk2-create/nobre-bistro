// Notificações de fiado via WhatsApp (Meta Cloud API).
// Ações:
//   { action: "novo_fiado", profissional, telefone, itens, total, desconto, totalAcumulado, pedidoId }
//     → monta a mensagem, registra em notifications e tenta enviar na hora.
//   { action: "dispatch" }
//     → envia todas as notificações pendentes (chamado pelo pg_cron e após o fechamento da quinzena).
//
// Secrets necessários para envio real (Dashboard → Edge Functions → Secrets):
//   WHATSAPP_TOKEN     — token permanente da Meta Cloud API
//   WHATSAPP_PHONE_ID  — ID do número de telefone do WhatsApp Business
// Sem os secrets, as mensagens ficam como "pending" em public.notifications (nada é perdido).

const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const WPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN") ?? "";
const WPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID") ?? "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DB_HEADERS = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function fmtMoeda(v: number): string {
  return "R$ " + Number(v || 0).toFixed(2).replace(".", ",");
}

function normalizarTelefone(tel: string): string {
  let t = String(tel || "").replace(/\D/g, "");
  if (t.length >= 10 && t.length <= 11) t = "55" + t;
  return t;
}

async function enviarWhatsApp(telefone: string, mensagem: string): Promise<{ sent: boolean; error?: string }> {
  const to = normalizarTelefone(telefone);
  if (!to || to.length < 12) return { sent: false, error: "telefone_invalido" };
  if (!WPP_TOKEN || !WPP_PHONE_ID) return { sent: false, error: "whatsapp_nao_configurado" };
  try {
    const r = await fetch(`https://graph.facebook.com/v20.0/${WPP_PHONE_ID}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${WPP_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: mensagem },
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return { sent: false, error: `meta_api_${r.status}: ${detail.slice(0, 300)}` };
    }
    return { sent: true };
  } catch (e) {
    return { sent: false, error: (e as Error).message };
  }
}

async function inserirNotificacao(row: Record<string, unknown>): Promise<string | null> {
  const r = await fetch(`${SB_URL}/rest/v1/notifications`, {
    method: "POST",
    headers: { ...DB_HEADERS, "Prefer": "return=representation" },
    body: JSON.stringify(row),
  });
  if (!r.ok) return null;
  const rows = await r.json().catch(() => null);
  return rows && rows[0] ? rows[0].id : null;
}

async function atualizarNotificacao(id: string, patch: Record<string, unknown>): Promise<void> {
  await fetch(`${SB_URL}/rest/v1/notifications?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...DB_HEADERS, "Prefer": "return=minimal" },
    body: JSON.stringify(patch),
  }).catch(() => {});
}

function mensagemNovoFiado(p: {
  profissional: string;
  itens: Array<{ qty?: number; name?: string; price?: number }>;
  total: number;
  desconto: number;
  totalAcumulado: number;
  pedidoId?: string | number;
}): string {
  const linhas = (p.itens || [])
    .map((i) => `• ${i.qty || 1}x ${i.name || "Item"} — ${fmtMoeda((i.price || 0) * (i.qty || 1))}`)
    .join("\n");
  const desc = Number(p.desconto || 0);
  return (
    `🌿 *Nobre Bistro — Fiado marcado*\n\n` +
    `Olá, ${p.profissional}! Acabamos de marcar no seu fiado` +
    (p.pedidoId ? ` (pedido #${p.pedidoId})` : "") + `:\n\n` +
    `${linhas}\n\n` +
    `💰 Valor deste consumo: ${fmtMoeda(p.total)}\n` +
    (desc > 0 ? `🏷️ Seu desconto na quinzena: ${desc}%\n` : "") +
    `📒 Total em aberto: ${fmtMoeda(p.totalAcumulado)}\n\n` +
    `O acerto acontece a cada quinzena. Qualquer dúvida é só chamar. Obrigado! 💚`
  );
}

async function dispatch(): Promise<{ enviadas: number; falhas: number; pendentes_sem_config: number }> {
  const r = await fetch(
    `${SB_URL}/rest/v1/notifications?status=eq.pending&order=created_at.asc&limit=30`,
    { headers: DB_HEADERS },
  );
  if (!r.ok) return { enviadas: 0, falhas: 0, pendentes_sem_config: 0 };
  const pendentes = await r.json().catch(() => []);
  let enviadas = 0, falhas = 0, semConfig = 0;
  for (const n of pendentes) {
    if (!WPP_TOKEN || !WPP_PHONE_ID) { semConfig++; continue; }
    const res = await enviarWhatsApp(n.phone, n.message);
    if (res.sent) {
      enviadas++;
      await atualizarNotificacao(n.id, { status: "sent", sent_at: new Date().toISOString(), error: null });
    } else {
      falhas++;
      const permanente = res.error === "telefone_invalido";
      await atualizarNotificacao(n.id, { status: permanente ? "failed" : "pending", error: res.error });
    }
  }
  return { enviadas, falhas, pendentes_sem_config: semConfig };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const action = String(body.action || "");

  if (action === "dispatch") {
    const resultado = await dispatch();
    return json({ ok: true, ...resultado });
  }

  if (action === "novo_fiado") {
    const profissional = String(body.profissional || "").slice(0, 120);
    if (!profissional) return json({ error: "profissional_obrigatorio" }, 400);
    const telefone = String(body.telefone || "");
    const itens = Array.isArray(body.itens) ? body.itens as Array<Record<string, unknown>> : [];
    const total = Number(body.total || 0);
    const desconto = Number(body.desconto || 0);
    const totalAcumulado = Number(body.totalAcumulado || total);

    const mensagem = mensagemNovoFiado({
      profissional,
      itens: itens as Array<{ qty?: number; name?: string; price?: number }>,
      total,
      desconto,
      totalAcumulado,
      pedidoId: body.pedidoId as string | number | undefined,
    });

    const notifId = await inserirNotificacao({
      kind: "novo_fiado",
      recipient_name: profissional,
      phone: telefone,
      message: mensagem,
      status: "pending",
      payload: { pedidoId: body.pedidoId, total, desconto, totalAcumulado },
    });

    const res = await enviarWhatsApp(telefone, mensagem);
    if (notifId) {
      if (res.sent) {
        await atualizarNotificacao(notifId, { status: "sent", sent_at: new Date().toISOString() });
      } else if (res.error === "telefone_invalido") {
        await atualizarNotificacao(notifId, { status: "failed", error: res.error });
      } else {
        await atualizarNotificacao(notifId, { status: "pending", error: res.error });
      }
    }
    return json({ ok: true, sent: res.sent, error: res.error || null });
  }

  return json({ error: "acao_desconhecida" }, 400);
});
