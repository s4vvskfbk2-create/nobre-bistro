// Leitura de nota fiscal por foto: o Claude (visão) extrai os itens e o
// sistema atualiza preços e estoque com um toque.
//
// Ações:
//   { action:"extrair", imagem: <base64 jpeg>, media_type? }
//     → IA lê a foto e devolve { fornecedor, data, itens:[{nome, quantidade,
//       unidade, preco_unitario, total, match_id, match_nome}] } já casando
//       cada item com os insumos cadastrados.
//   { action:"aplicar", fornecedor, itens:[{ingrediente_id|null, nome,
//       quantidade, unidade, preco_unitario}], operador }
//     → dá entrada no estoque, atualiza o custo unitário, cria insumos novos
//       quando necessário e registra tudo em stock_movements + system_events.
//
// Secret necessário: ANTHROPIC_API_KEY (o mesmo dos agentes de IA).

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
  return r.ok ? await r.json().catch(() => []) : [];
}
async function dbPost(path: string, body: unknown, prefer = "return=minimal"): Promise<any> {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: "POST", headers: { ...DB, "Prefer": prefer }, body: JSON.stringify(body),
  });
  if (prefer === "return=minimal") return r.ok;
  return r.ok ? await r.json().catch(() => null) : null;
}
async function dbPatch(path: string, body: unknown): Promise<boolean> {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
    method: "PATCH", headers: { ...DB, "Prefer": "return=minimal" }, body: JSON.stringify(body),
  });
  return r.ok;
}

function extrairJson(texto: string): any {
  const ini = texto.indexOf("{");
  const fim = texto.lastIndexOf("}");
  if (ini < 0 || fim <= ini) return null;
  try { return JSON.parse(texto.slice(ini, fim + 1)); } catch { return null; }
}

async function extrair(body: Record<string, unknown>): Promise<Response> {
  if (!ANTHROPIC_KEY) return json({ ok: false, reason: "ia_nao_configurada", msg: "Configure o secret ANTHROPIC_API_KEY para ler notas por foto." });
  const imagem = String(body.imagem || "");
  if (!imagem || imagem.length < 100) return json({ ok: false, reason: "imagem_invalida" }, 400);
  const mediaType = String(body.media_type || "image/jpeg");

  const ingredientes = await dbGet("ingredientes?select=id,nome,unidade,custo_unitario&ativo=eq.true&order=nome");
  const catalogo = ingredientes.map((i: any) => `${i.id}|${i.nome}|${i.unidade}`).join("\n");

  const prompt =
    `Você lê fotos de notas fiscais/cupons fiscais brasileiros de compras de restaurante.\n\n` +
    `INSUMOS JÁ CADASTRADOS (id|nome|unidade):\n${catalogo || "(nenhum)"}\n\n` +
    `TAREFA: extraia da foto TODOS os itens comprados e responda APENAS com JSON válido, sem texto antes ou depois, neste formato:\n` +
    `{"fornecedor":"nome do emissor ou vazio","data":"DD/MM/AAAA ou vazio","itens":[{"nome":"nome limpo do produto","quantidade":1.5,"unidade":"kg|g|L|ml|un","preco_unitario":12.90,"total":19.35,"match_id":123}]}\n\n` +
    `REGRAS:\n` +
    `- quantidade e preços como números (ponto decimal). preco_unitario = preço por unidade da medida informada.\n` +
    `- Converta a unidade da nota para uma das aceitas (kg,g,L,ml,un).\n` +
    `- match_id: o id do insumo cadastrado quando for CLARAMENTE o mesmo produto (ex.: "FILE MIGNON KG" → "Filé mignon"); senão null.\n` +
    `- Ignore taxas, descontos de rodapé, impostos e linhas ilegíveis.\n` +
    `- Se a foto não for uma nota fiscal, responda {"erro":"nao_e_nota"}.`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imagem } },
          { type: "text", text: prompt },
        ],
      }],
    }),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    return json({ ok: false, reason: "ia_erro", detail: detail.slice(0, 300) }, 502);
  }
  const data = await r.json();
  const texto = data?.content?.[0]?.text || "";
  const parsed = extrairJson(texto);
  if (!parsed) return json({ ok: false, reason: "extracao_falhou" }, 422);
  if (parsed.erro === "nao_e_nota") return json({ ok: false, reason: "nao_e_nota", msg: "A foto não parece ser uma nota fiscal." });

  const mapa = new Map(ingredientes.map((i: any) => [Number(i.id), i]));
  const itens = (Array.isArray(parsed.itens) ? parsed.itens : []).map((it: any) => {
    const m = it.match_id != null ? mapa.get(Number(it.match_id)) : null;
    return {
      nome: String(it.nome || "Item").slice(0, 120),
      quantidade: Number(it.quantidade || 0),
      unidade: ["kg", "g", "L", "ml", "un"].includes(it.unidade) ? it.unidade : "un",
      preco_unitario: Number(it.preco_unitario || 0),
      total: Number(it.total || 0) || Number(it.quantidade || 0) * Number(it.preco_unitario || 0),
      match_id: m ? Number(it.match_id) : null,
      match_nome: m ? m.nome : null,
      custo_atual: m ? Number(m.custo_unitario || 0) : null,
    };
  }).filter((it: any) => it.quantidade > 0 && it.nome);

  await dbPost("system_events", {
    event_type: "INVOICE_SCANNED", source: "nota-fiscal", entity_type: "compra",
    entity_id: String(parsed.fornecedor || ""), payload: { itens: itens.length, fornecedor: parsed.fornecedor },
  });

  return json({ ok: true, fornecedor: String(parsed.fornecedor || ""), data: String(parsed.data || ""), itens });
}

async function aplicar(body: Record<string, unknown>): Promise<Response> {
  const itens = Array.isArray(body.itens) ? body.itens as any[] : [];
  const fornecedor = String(body.fornecedor || "").slice(0, 120);
  const operador = String(body.operador || "gerente").slice(0, 60);
  if (!itens.length) return json({ ok: false, reason: "sem_itens" }, 400);

  let atualizados = 0, criados = 0, falhas = 0;
  let totalCompra = 0;

  for (const it of itens) {
    const qtd = Number(it.quantidade || 0);
    const preco = Number(it.preco_unitario || 0);
    const nome = String(it.nome || "").slice(0, 120);
    const unidade = ["kg", "g", "L", "ml", "un"].includes(it.unidade) ? it.unidade : "un";
    if (qtd <= 0 || !nome) { falhas++; continue; }
    totalCompra += qtd * preco;

    let ingId = it.ingrediente_id != null ? Number(it.ingrediente_id) : null;
    let ingNome = nome;

    if (ingId) {
      const atual = await dbGet(`ingredientes?id=eq.${ingId}&select=id,nome,estoque_atual`);
      if (atual[0]) {
        ingNome = atual[0].nome;
        const novoEstoque = Number(atual[0].estoque_atual || 0) + qtd;
        const okUpd = await dbPatch(`ingredientes?id=eq.${ingId}`, {
          estoque_atual: novoEstoque,
          ...(preco > 0 ? { custo_unitario: preco } : {}),
        });
        if (okUpd) atualizados++; else { falhas++; continue; }
      } else { ingId = null; }
    }
    if (!ingId) {
      const novo = await dbPost("ingredientes", {
        nome, unidade, custo_unitario: preco, estoque_atual: qtd, estoque_minimo: 0, ativo: true,
      }, "return=representation");
      if (novo && novo[0]) { ingId = Number(novo[0].id); criados++; } else { falhas++; continue; }
    }

    await dbPost("stock_movements", {
      ingrediente_id: ingId, ingrediente_nome: ingNome, tipo: "entrada",
      quantidade: qtd, unidade, motivo: "Compra via nota fiscal" + (fornecedor ? " — " + fornecedor : ""),
      custo_estimado: qtd * preco, operador,
      metadata: { fornecedor, preco_unitario: preco, origem: "nota-fiscal" },
    });
  }

  await dbPost("system_events", {
    event_type: "INVOICE_APPLIED", source: "nota-fiscal", entity_type: "compra",
    entity_id: fornecedor, payload: { atualizados, criados, falhas, total: totalCompra, operador },
  });

  return json({ ok: true, atualizados, criados, falhas, total: totalCompra });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const action = String(body.action || "");
  if (action === "extrair") return await extrair(body);
  if (action === "aplicar") return await aplicar(body);
  return json({ error: "acao_desconhecida" }, 400);
});
