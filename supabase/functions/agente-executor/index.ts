// Executor dos agentes de IA do Nobre Bistro.
// Chamado de hora em hora pelo pg_cron ({action:"tick"}) ou manualmente pelo
// painel ({action:"tick", force:true}). Cada agente ativo em ai_agents roda na
// sua cadência, analisa os dados reais e grava:
//   - ai_recommendations (aparecem na aba Centro IA)
//   - ai_tasks (itens críticos que viram tarefa)
//   - system_events (trilha AGENT_RUN)
//
// Os agentes são determinísticos (regras sobre os dados — sem custo de API).
// Se o secret ANTHROPIC_API_KEY estiver configurado, o vendas-agent também
// gera uma análise estratégica diária com Claude.

const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

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

async function dbGet(path: string): Promise<any[]> {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: DB });
  if (!r.ok) return [];
  return await r.json().catch(() => []);
}
async function dbPost(path: string, body: unknown): Promise<void> {
  await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: "POST", headers: { ...DB, "Prefer": "return=minimal" }, body: JSON.stringify(body),
  }).catch(() => {});
}
async function dbPatch(path: string, body: unknown): Promise<void> {
  await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: "PATCH", headers: { ...DB, "Prefer": "return=minimal" }, body: JSON.stringify(body),
  }).catch(() => {});
}

// ── datas (horário de Brasília; criadoEm legado = "DD/MM/YYYY HH:mm") ──
function parseBr(str: string | undefined): Date | null {
  if (!str) return null;
  const p = str.split(" ");
  const d = (p[0] || "").split("/");
  if (d.length < 3) return null;
  const hm = (p[1] || "00:00").split(":");
  const dt = new Date(+d[2], +d[1] - 1, +d[0], +(hm[0] || 0), +(hm[1] || 0));
  return isNaN(dt.getTime()) ? null : dt;
}
function spDateStr(offsetDias = 0): string {
  const d = new Date(Date.now() + offsetDias * 86400e3);
  const s = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(d);
  return s; // DD/MM/YYYY
}
function spHour(): number {
  return parseInt(new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", hour: "2-digit", hour12: false }).format(new Date()));
}
function nextRunFor(cadence: string): string {
  const now = Date.now();
  const atHour = (h: number) => {
    let add = (h - spHour() + 24) % 24;
    if (add === 0) add = 24;
    return new Date(now + add * 3600e3).toISOString();
  };
  switch (cadence) {
    case "tempo_real": return new Date(now + 3600e3).toISOString();
    case "diario": return atHour(8);
    case "diario_quinzena": return atHour(10);
    case "fim_do_dia": return atHour(22);
    case "fechamento": return atHour(23);
    case "semanal": return new Date(now + 7 * 86400e3).toISOString();
    default: return new Date(now + 86400e3).toISOString();
  }
}
const fmtR$ = (v: number) => "R$ " + Number(v || 0).toFixed(2).replace(".", ",");

type Rec = { area: string; priority: string; title: string; reasoning: string; suggested_action: string; estimated_impact?: string };
type Task = { area: string; priority: string; title: string; action: string; impact?: string };
type Ctx = Awaited<ReturnType<typeof gatherContext>>;

async function gatherContext() {
  const [ordersRows, ingredientes, fichas, calls, profsCfg, recentRecs, openTasks, donoCfg] = await Promise.all([
    dbGet("orders?select=metadata,status,payment_status,created_at&order=created_at.desc&limit=800"),
    dbGet("ingredientes?select=nome,estoque_atual,estoque_minimo,ativo,unidade,validade&ativo=eq.true"),
    dbGet("fichas_tecnicas?select=nome,cmv_percentual,preco_venda,ativo"),
    dbGet("table_calls?select=metadata,status,created_at&status=eq.open&limit=100"),
    dbGet("config?key=eq.nb_bA_profs&select=value"),
    dbGet(`ai_recommendations?select=title&created_at=gte.${new Date(Date.now() - 36 * 3600e3).toISOString()}`),
    dbGet("ai_tasks?select=title&status=in.(open,aberta,doing,em_andamento)&limit=200"),
    dbGet("config?key=eq.nb_bA_dono&select=value"),
  ]);
  const orders = ordersRows.map((r: any) => r.metadata).filter((o: any) => o && o.id != null);
  const profs = (profsCfg[0]?.value && Array.isArray(profsCfg[0].value)) ? profsCfg[0].value : [];
  const recTitles = new Set(recentRecs.map((r: any) => r.title));
  const taskTitles = new Set(openTasks.map((t: any) => t.title));
  const donoTelefone = String(donoCfg[0]?.value?.telefone || "");
  return { orders, ingredientes, fichas, calls, profs, recTitles, taskTitles, donoTelefone };
}

// ── agentes ──────────────────────────────────────────────────────────────
function agenteVendas(ctx: Ctx): { recs: Rec[]; tasks: Task[] } {
  const recs: Rec[] = [];
  const done = ctx.orders.filter((o: any) => o.status === "concluido");
  const porDia = new Map<string, number>();
  for (const o of done) {
    const dia = String(o.criadoEm || "").split(" ")[0];
    if (dia) porDia.set(dia, (porDia.get(dia) || 0) + Number(o.total || 0));
  }
  const ontem = spDateStr(-1);
  const fatOntem = porDia.get(ontem) || 0;
  let soma = 0, n = 0;
  for (let i = 2; i <= 8; i++) { const v = porDia.get(spDateStr(-i)); if (v != null) { soma += v; n++; } }
  const media = n > 0 ? soma / n : 0;
  if (media > 0 && fatOntem < media * 0.75) {
    recs.push({
      area: "vendas", priority: "alta",
      title: `Queda de vendas ontem (${ontem})`,
      reasoning: `Faturamento de ontem foi ${fmtR$(fatOntem)}, ${Math.round((1 - fatOntem / media) * 100)}% abaixo da média dos 7 dias anteriores (${fmtR$(media)}).`,
      suggested_action: "Verificar se houve problema operacional (fechamento, falta de produto) e considerar ação de divulgação/promoção hoje.",
      estimated_impact: `Recuperar ~${fmtR$(media - fatOntem)}/dia`,
    });
  }
  // produto destaque dos últimos 7 dias
  const prod = new Map<string, { qty: number; total: number }>();
  for (const o of done) {
    const d = parseBr(o.criadoEm);
    if (!d || Date.now() - d.getTime() > 7 * 86400e3) continue;
    for (const i of (o.items || [])) {
      const cur = prod.get(i.name) || { qty: 0, total: 0 };
      cur.qty += Number(i.qty || 1); cur.total += Number(i.price || 0) * Number(i.qty || 1);
      prod.set(i.name, cur);
    }
  }
  const top = [...prod.entries()].sort((a, b) => b[1].total - a[1].total)[0];
  if (top && top[1].qty >= 5) {
    recs.push({
      area: "vendas", priority: "media",
      title: `Produto destaque da semana: ${top[0]}`,
      reasoning: `${top[0]} vendeu ${top[1].qty} unidades (${fmtR$(top[1].total)}) nos últimos 7 dias.`,
      suggested_action: "Usar como produto-âncora: destacar no cardápio, criar combo ou post nas redes.",
    });
  }
  return { recs, tasks: [] };
}

function agenteEstoque(ctx: Ctx): { recs: Rec[]; tasks: Task[] } {
  const recs: Rec[] = []; const tasks: Task[] = [];
  const criticos = ctx.ingredientes.filter((i: any) =>
    i.estoque_atual != null && i.estoque_minimo != null && Number(i.estoque_atual) <= Number(i.estoque_minimo));
  if (criticos.length) {
    const lista = criticos.slice(0, 12).map((i: any) => `${i.nome} (${i.estoque_atual}${i.unidade || ""})`).join(", ");
    tasks.push({
      area: "estoque", priority: "alta",
      title: `Repor ${criticos.length} insumo(s) crítico(s)`,
      action: `Comprar/repor: ${lista}`,
      impact: "Evita ruptura de pratos do cardápio",
    });
  }
  const vencendo = ctx.ingredientes.filter((i: any) => {
    if (!i.validade) return false;
    const dias = (new Date(i.validade + "T12:00:00").getTime() - Date.now()) / 86400e3;
    return dias <= 3;
  });
  if (vencendo.length) {
    const lista = vencendo.slice(0, 10).map((i: any) => {
      const dias = Math.floor((new Date(i.validade + "T12:00:00").getTime() - Date.now()) / 86400e3);
      return `${i.nome} (${dias < 0 ? "VENCIDO" : "vence em " + dias + "d"})`;
    }).join(", ");
    tasks.push({
      area: "estoque", priority: "alta",
      title: `${vencendo.length} insumo(s) vencido(s) ou vencendo em 3 dias`,
      action: `Verificar e usar primeiro (ou registrar perda): ${lista}.`,
      impact: "Evita perda de insumo e uso de produto vencido",
    });
  }
  const cmvAlto = ctx.fichas.filter((f: any) => f.ativo !== false && Number(f.cmv_percentual || 0) > 40);
  if (cmvAlto.length) {
    const lista = cmvAlto.slice(0, 8).map((f: any) => `${f.nome} (${Number(f.cmv_percentual).toFixed(0)}%)`).join(", ");
    recs.push({
      area: "estoque_cmv", priority: "alta",
      title: `${cmvAlto.length} receita(s) com CMV acima de 40%`,
      reasoning: `Receitas com custo alto demais em relação ao preço: ${lista}. Alvo saudável é 30%.`,
      suggested_action: "Renegociar insumos, ajustar porção ou reajustar o preço de venda dessas receitas.",
      estimated_impact: "Cada 5 pontos de CMV recuperados viram margem direta",
    });
  }
  return { recs, tasks };
}

function agenteFiado(ctx: Ctx): { recs: Rec[]; tasks: Task[] } {
  const recs: Rec[] = []; const tasks: Task[] = [];
  const abertos = ctx.orders.filter((o: any) => o.fiado && !o.fiadoPago && o.status !== "cancelado" && o.profFiado);
  const porProf = new Map<string, { total: number; maisAntigo: Date | null }>();
  for (const o of abertos) {
    const cur = porProf.get(o.profFiado) || { total: 0, maisAntigo: null };
    cur.total += Number(o.total || 0);
    const d = parseBr(o.criadoEm);
    if (d && (!cur.maisAntigo || d < cur.maisAntigo)) cur.maisAntigo = d;
    porProf.set(o.profFiado, cur);
  }
  for (const [nome, info] of porProf) {
    const prof = ctx.profs.find((p: any) => p.name === nome);
    const limite = Number(prof?.limiteFiado || 200);
    if (info.total > limite) {
      tasks.push({
        area: "fiado", priority: "alta",
        title: `Fiado de ${nome} acima do limite`,
        action: `${nome} está com ${fmtR$(info.total)} em aberto (limite ${fmtR$(limite)}). Conversar antes de marcar novos fiados.`,
        impact: "Reduz risco de inadimplência",
      });
    }
    if (info.maisAntigo && Date.now() - info.maisAntigo.getTime() > 20 * 86400e3) {
      recs.push({
        area: "fiado", priority: "media",
        title: `Fiado antigo em aberto: ${nome}`,
        reasoning: `${nome} tem consumo fiado desde ${info.maisAntigo.toLocaleDateString("pt-BR")} ainda não acertado (${fmtR$(info.total)} no total).`,
        suggested_action: "Enviar lembrete de cobrança pela aba Fiado (o fechamento automático da quinzena também cobre isso).",
      });
    }
  }
  return { recs, tasks };
}

function agenteClientes(ctx: Ctx): { recs: Rec[]; tasks: Task[] } {
  const recs: Rec[] = [];
  const nomesProfs = new Set(ctx.profs.map((p: any) => p.name));
  const ultimaVisita = new Map<string, { data: Date; visitas: number }>();
  for (const o of ctx.orders) {
    if (o.status !== "concluido" || !o.nome || o.nome === "Balcao" || nomesProfs.has(o.nome)) continue;
    const d = parseBr(o.criadoEm); if (!d) continue;
    const cur = ultimaVisita.get(o.nome);
    if (!cur) ultimaVisita.set(o.nome, { data: d, visitas: 1 });
    else { cur.visitas++; if (d > cur.data) cur.data = d; }
  }
  const sumidos = [...ultimaVisita.entries()]
    .filter(([, v]) => v.visitas >= 2 && Date.now() - v.data.getTime() > 30 * 86400e3)
    .sort((a, b) => b[1].visitas - a[1].visitas);
  if (sumidos.length) {
    const nomes = sumidos.slice(0, 10).map(([n]) => n).join(", ");
    recs.push({
      area: "clientes", priority: "media",
      title: `${sumidos.length} cliente(s) recorrente(s) sem visitar há 30+ dias`,
      reasoning: `Clientes que já voltaram mais de uma vez e sumiram: ${nomes}.`,
      suggested_action: "Campanha de retorno: mensagem com cortesia ou desconto na próxima visita.",
      estimated_impact: "Recuperar clientes recorrentes custa menos que conquistar novos",
    });
  }
  return { recs, tasks: [] };
}

function agenteOperacao(ctx: Ctx): { recs: Rec[]; tasks: Task[] } {
  const recs: Rec[] = []; const tasks: Task[] = [];
  const atrasados = ctx.orders.filter((o: any) => {
    if (o.status !== "em_curso") return false;
    const d = parseBr(o.criadoEm);
    return d && Date.now() - d.getTime() > 45 * 60e3;
  });
  if (atrasados.length) {
    tasks.push({
      area: "operacao", priority: "critica",
      title: `${atrasados.length} pedido(s) há 45+ min na cozinha`,
      action: `Pedidos: ${atrasados.slice(0, 8).map((o: any) => "#" + o.id).join(", ")}. Verificar cozinha agora.`,
      impact: "Cliente esperando — risco de cancelamento",
    });
  }
  const chamadosVelhos = ctx.calls.filter((c: any) => Date.now() - new Date(c.created_at).getTime() > 10 * 60e3);
  if (chamadosVelhos.length) {
    tasks.push({
      area: "operacao", priority: "alta",
      title: `${chamadosVelhos.length} chamado(s) de mesa sem atendimento`,
      action: `Mesas aguardando há 10+ min: ${chamadosVelhos.slice(0, 6).map((c: any) => c.metadata?.mesa).filter(Boolean).join(", ")}.`,
      impact: "Experiência do cliente no salão",
    });
  }
  const hoje = spDateStr(0);
  const cancelHoje = ctx.orders.filter((o: any) => o.status === "cancelado" && String(o.criadoEm || "").startsWith(hoje));
  if (cancelHoje.length >= 3) {
    recs.push({
      area: "operacao", priority: "alta",
      title: `${cancelHoje.length} cancelamentos hoje`,
      reasoning: `Motivos: ${cancelHoje.slice(0, 5).map((o: any) => o.motivo_cancelamento || "não informado").join("; ")}.`,
      suggested_action: "Revisar se há padrão (produto em falta, demora, erro de lançamento).",
    });
  }
  return { recs, tasks };
}

function agenteFinanceiro(ctx: Ctx): { recs: Rec[]; tasks: Task[] } {
  const recs: Rec[] = [];
  const hoje = spDateStr(0);
  const doDia = ctx.orders.filter((o: any) => String(o.criadoEm || "").startsWith(hoje) && o.status === "concluido");
  const total = doDia.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
  const fiadoDia = doDia.filter((o: any) => o.fiado).reduce((s: number, o: any) => s + Number(o.total || 0), 0);
  if (total > 0 && fiadoDia / total > 0.35) {
    recs.push({
      area: "financeiro", priority: "alta",
      title: `Fiado é ${Math.round(fiadoDia / total * 100)}% das vendas de hoje (${hoje})`,
      reasoning: `De ${fmtR$(total)} vendidos hoje, ${fmtR$(fiadoDia)} foram fiado — dinheiro que só entra na quinzena.`,
      suggested_action: "Acompanhar o caixa disponível; considerar limite mais rígido de fiado se o fluxo apertar.",
    });
  }
  const semPagamento = ctx.orders.filter((o: any) =>
    o.status === "concluido" && !o.fiado && !o.payment && String(o.criadoEm || "").startsWith(hoje));
  if (semPagamento.length) {
    recs.push({
      area: "financeiro", priority: "media",
      title: `${semPagamento.length} pedido(s) concluído(s) hoje sem forma de pagamento`,
      reasoning: `Pedidos: ${semPagamento.slice(0, 8).map((o: any) => "#" + o.id).join(", ")}.`,
      suggested_action: "Conferir no fechamento do caixa para o relatório do dia bater.",
    });
  }
  return { recs, tasks: [] };
}

async function analiseClaudeVendas(ctx: Ctx): Promise<Rec | null> {
  if (!ANTHROPIC_KEY) return null;
  try {
    const done = ctx.orders.filter((o: any) => o.status === "concluido").slice(0, 300);
    const porDia = new Map<string, number>();
    for (const o of done) {
      const dia = String(o.criadoEm || "").split(" ")[0];
      if (dia) porDia.set(dia, (porDia.get(dia) || 0) + Number(o.total || 0));
    }
    const serie = [...porDia.entries()].slice(0, 14).map(([d, v]) => `${d}: ${fmtR$(v)}`).join(" | ");
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `Você é o agente de vendas do restaurante Nobre Bistro. Série de faturamento diário: ${serie}. Em no máximo 120 palavras, aponte a tendência mais importante e UMA ação concreta para hoje. Responda em português, direto ao ponto.`,
        }],
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const texto = data?.content?.[0]?.text || "";
    if (!texto) return null;
    return {
      area: "vendas", priority: "media",
      title: `Análise IA de vendas — ${spDateStr(0)}`,
      reasoning: texto,
      suggested_action: "Avaliar a ação sugerida pela análise.",
    };
  } catch { return null; }
}

const AGENTES: Record<string, (ctx: Ctx) => { recs: Rec[]; tasks: Task[] }> = {
  "vendas-agent": agenteVendas,
  "estoque-cmv-agent": agenteEstoque,
  "fiado-agent": agenteFiado,
  "clientes-agent": agenteClientes,
  "operacao-agent": agenteOperacao,
  "financeiro-agent": agenteFinanceiro,
};

async function tick(force: boolean): Promise<Record<string, unknown>> {
  const agents = await dbGet("ai_agents?status=eq.active&select=id,name,cadence,next_run_at");
  const now = Date.now();
  const due = agents.filter((a: any) => force || !a.next_run_at || new Date(a.next_run_at).getTime() <= now);
  if (!due.length) return { ok: true, ran: [], msg: "nenhum agente no horário" };

  const ctx = await gatherContext();
  const ran: Array<Record<string, unknown>> = [];
  const alertasCriticos: Task[] = [];

  for (const a of due) {
    const fn = AGENTES[a.name];
    if (!fn) continue;
    let { recs, tasks } = fn(ctx);
    if (a.name === "vendas-agent") {
      const ia = await analiseClaudeVendas(ctx);
      if (ia) recs.push(ia);
    }
    recs = recs.filter((r) => !ctx.recTitles.has(r.title));
    tasks = tasks.filter((t) => !ctx.taskTitles.has(t.title));

    for (const r of recs) {
      await dbPost("ai_recommendations", { ...r, status: "new", payload: { agent: a.name } });
      ctx.recTitles.add(r.title);
    }
    for (const t of tasks) {
      await dbPost("ai_tasks", { source: a.name, ...t, status: "open", payload: { agent: a.name } });
      ctx.taskTitles.add(t.title);
      if (t.priority === "critica" || t.priority === "alta") alertasCriticos.push(t);
    }
    await dbPost("system_events", {
      event_type: "AGENT_RUN", source: a.name, entity_type: "ai_agent", entity_id: a.name,
      payload: { recomendacoes: recs.length, tarefas: tasks.length },
    });
    await dbPatch(`ai_agents?id=eq.${a.id}`, {
      last_run_at: new Date().toISOString(),
      next_run_at: nextRunFor(a.cadence),
      status: "active",
    });
    ran.push({ agent: a.name, recs: recs.length, tasks: tasks.length });
  }

  // Alertas críticos direto no WhatsApp do proprietário (config nb_bA_dono)
  if (alertasCriticos.length && ctx.donoTelefone) {
    const msg = `🚨 *Nobre Bistro — Alerta dos agentes de IA*\n\n` +
      alertasCriticos.slice(0, 5).map((t) => `• *${t.title}*\n  ${t.action}`).join("\n\n") +
      `\n\nDetalhes na aba Central IA do painel.`;
    await dbPost("notifications", {
      kind: "alerta_critico", recipient_name: "Proprietário", phone: ctx.donoTelefone,
      message: msg, status: "pending", payload: { alertas: alertasCriticos.length },
    });
    // dispara o envio imediato via fiado-notify (dispatcher compartilhado)
    const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    await fetch(`${SB_URL}/functions/v1/fiado-notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": anon, "Authorization": `Bearer ${anon}` },
      body: JSON.stringify({ action: "dispatch" }),
    }).catch(() => {});
  }

  return { ok: true, ran };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* corpo vazio ok */ }
  const action = String(body.action || "tick");
  if (action === "tick") return json(await tick(body.force === true));
  return json({ error: "acao_desconhecida" }, 400);
});
