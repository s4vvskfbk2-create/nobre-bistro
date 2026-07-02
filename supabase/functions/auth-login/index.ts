// Login do painel: valida a credencial pelas RPCs existentes (check_admin_password /
// check_staff_pin, que já têm bcrypt e rate limiting server-side) e emite um JWT de
// sessão com role "authenticated" — permitindo travar as policies RLS por papel.
//
// Secret necessário (Dashboard → Edge Functions → Secrets):
//   NB_JWT_SECRET — copie de Project Settings → API → JWT Secret
// Sem o secret, a função responde { ok:true, token:null } e o painel continua
// funcionando no modo anon (compatibilidade total até a configuração).

import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const JWT_SECRET = Deno.env.get("NB_JWT_SECRET") ?? "";
const SESSAO_HORAS = 12;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function rpc(nome: string, args: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/rpc/${nome}`, {
      method: "POST",
      headers: {
        "apikey": ANON_KEY,
        "Authorization": `Bearer ${ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

async function emitirToken(appRole: string, nome: string): Promise<string | null> {
  if (!JWT_SECRET) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return await create(
    { alg: "HS256", typ: "JWT" },
    {
      role: "authenticated",
      aud: "authenticated",
      iss: `${SB_URL}/auth/v1`,
      sub: `nb-${appRole}`,
      app_role: appRole,
      app_name: nome,
      exp: getNumericDate(60 * 60 * SESSAO_HORAS),
      iat: getNumericDate(0),
    },
    key,
  );
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

  const kind = String(body.kind || "");
  const value = String(body.value || "").trim();
  if (!value) return json({ ok: false }, 401);

  let appRole = "";
  let nome = "";

  if (kind === "password") {
    const role = String(body.role || "");
    if (role !== "gerente" && role !== "atendente") return json({ ok: false }, 401);
    const res = await rpc("check_admin_password", { role_name: role, password_attempt: value });
    if (!res || res.ok !== true) return json({ ok: false }, 401);
    appRole = role;
    nome = role === "gerente" ? "Gerente" : "Atendente";
  } else if (kind === "pin") {
    const res = await rpc("check_staff_pin", { pin_attempt: value });
    if (!res || res.ok !== true) return json({ ok: false }, 401);
    appRole = String(res.role || "atendente");
    nome = String(res.name || "Equipe");
  } else {
    return json({ error: "kind_invalido" }, 400);
  }

  const token = await emitirToken(appRole, nome);
  return json({ ok: true, token, role: appRole, name: nome, expires_in_hours: token ? SESSAO_HORAS : null });
});
