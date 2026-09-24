# Guia de Deployment - Nobre Café

## Pré-requisitos

- [ ] Conta Supabase criada (https://supabase.com)
- [ ] Projeto Supabase criado
- [ ] Vercel conectado ao repositório GitHub
- [ ] Variáveis de ambiente configuradas

---

## Passo 1: Preparar o Supabase

### 1.1 Criar o Projeto
1. Ir para https://app.supabase.com
2. Clicar em "New project"
3. Preencher:
   - Name: "nobre-cafe" ou similar
   - Database password: gerar senha forte
   - Region: "Brazil (São Paulo)"
4. Aguardar criação (2-5 minutos)

### 1.2 Copiar Credenciais
1. Ir para "Project Settings" → "API"
2. Copiar:
   - **Project URL**: `https://[project-id].supabase.co`
   - **Anon Key**: (público, pode expor no frontend)
   - **Service Role Key**: (privado, NUNCA expor no frontend)
   - **JWT Secret**: (privado, para Edge Functions)

### 1.3 Aplicar Migrações
Opção A: Via Dashboard do Supabase
1. Ir para "SQL Editor"
2. Clicker "New query"
3. Copiar conteúdo de cada arquivo em `supabase/migrations/` na ordem:
   - `20260630000000_core_management_schema.sql` (principal)
   - `20260701000000_security_hardening.sql`
   - `20260702000000_fiado_automation.sql`
   - `20260702100000_rls_por_papel.sql`
   - `20260703000000_realtime.sql`
   - `20260704000000_ai_agents_scheduler.sql`
   - `20260705000000_estoque_avancado_e_resumo.sql`
   - `20260706000000_fix_search_path_pgcrypto.sql`
   - `20260707000000_recalculo_automatico_fichas.sql`
   - `20260924000000_nobre_cafe_cardapio.sql` (produtos)
   - `20260924100000_nobre_cafe_equipe.sql` (equipe)
4. Executar cada uma em sequência

Opção B: Via Supabase CLI (recomendado)
```bash
# Instalar CLI
npm install -g supabase

# Fazer login
supabase login

# Aplicar migrações
supabase migration up --project-id [project-id]
```

### 1.4 Configurar Edge Functions
1. Ir para "Edge Functions"
2. Criar uma nova function com base em `supabase/functions/auth-login/index.ts`
3. Repetir para as outras 5 functions

Ou via CLI:
```bash
supabase functions deploy --project-id [project-id]
```

### 1.5 Configurar Secrets (Variáveis de Ambiente)
1. Ir para "Edge Functions" → "Secrets"
2. Adicionar:
   - `NB_JWT_SECRET`: copiar de Project Settings → API → JWT Secret
   - `SUPABASE_ANON_KEY`: copiar de Project Settings → API
   - `SUPABASE_URL`: URL do projeto
   - `WHATSAPP_TOKEN`: (opcional, para integração WhatsApp)

### 1.6 Verificar Banco de Dados
```sql
-- Executar no SQL Editor para verificar
SELECT COUNT(*) FROM public.products WHERE active = true;
SELECT COUNT(*) FROM public.staff WHERE active = true;
SELECT * FROM public.ai_agents LIMIT 5;
```

Esperado:
- 37 produtos ativos
- 21 funcionários ativos (19 salão + 1 gerente + 1 atendente)
- 6 agentes de IA

---

## Passo 2: Configurar Vercel

### 2.1 Conectar Repositório
1. Ir para https://vercel.com
2. Clicar "New Project"
3. Selecionar repositório GitHub (s4vvskfbk2-create/nobre-bistro)
4. Clicar "Import"

### 2.2 Definir Variáveis de Ambiente
Na tela de configuração, ir para "Environment Variables" e adicionar:

```
VITE_SUPABASE_URL = https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY = eyJ...
VITE_APP_NAME = Nobre Café
VITE_TIMEZONE = America/Sao_Paulo
```

**IMPORTANTE**: Não adicione a Service Role Key ou JWT Secret aqui (são privadas)

### 2.3 Configurar Build
- Build Command: `npm install` (ou vazio se não houver build)
- Output Directory: `.` (raiz do projeto)
- Install Command: `npm install` (ou vazio)

### 2.4 Deploy
1. Clicar "Deploy"
2. Aguardar build (1-2 minutos)
3. Verificar se não há erros

---

## Passo 3: Verificar o Deploy

### 3.1 Teste de Acesso
1. Ir para a URL do projeto (ex: `https://nobre-cafe.vercel.app`)
2. Aguardar página carregar
3. Verificar console do navegador (F12 → Console)
4. Não deve haver erros em vermelho

### 3.2 Teste de Login
1. Clicar em "Entrar"
2. Tentar login com:
   - Senha de Gerente: (conforme configurado no Supabase)
   - Ou PIN de funcionário: (conforme no banco)

Esperado: Login bem-sucedido

### 3.3 Teste de Carregamento de Dados
No console do navegador (F12 → Console):
```javascript
// Verificar se produtos carregaram
await loadProdsPrimary().then(prods => {
  console.log('Produtos carregados:', prods.length);
  console.log('Primeiro produto:', prods[0]);
});

// Verificar se equipe carregou
await loadProfsPrimary().then(profs => {
  console.log('Funcionários carregados:', profs.length);
  console.log('Primeiro funcionário:', profs[0]);
});
```

Esperado:
- 37 produtos (ou fallback para defaults)
- 21 funcionários (ou fallback para defaults)

### 3.4 Teste de Fluxos
Ver `TESTING.md` para os 5 fluxos críticos

---

## Passo 4: Configuração Adicional (Opcional)

### WhatsApp Integration
Se quiser ativar notificações via WhatsApp:

1. Criar conta em Twilio ou similar
2. Obter token de API
3. Adicionar `WHATSAPP_TOKEN` aos secrets do Supabase
4. Adicionar número de telefone do proprietário em "Ajustes" → "WhatsApp do proprietário"

### Custom Domain
1. Ir para Vercel → Project Settings → Domains
2. Adicionar seu domínio (ex: nobre-cafe.com)
3. Configurar DNS conforme instruções do Vercel

### SSL/TLS
Vercel configura automaticamente HTTPS para todos os projetos ✓

---

## Troubleshooting

### Produtos não carregam do Supabase
**Sintomas**: Aplicação mostra defaults mas não consegue conectar ao banco

**Diagnóstico**:
1. Verificar se a chave de API está correta em `admin.html`
2. Verificar se a tabela `products` existe no Supabase
3. Verificar se há 37 produtos com `active = true`

**Solução**:
```bash
# No SQL Editor do Supabase
SELECT COUNT(*) FROM public.products WHERE active = true;
```

### Erro 403 ao conectar ao Supabase
**Causa**: CORS ou API key inválida

**Solução**:
1. Verificar se a URL do Supabase está correta (sem trailing slash)
2. Verificar se a Anon Key é válida
3. Verificar Project Settings → CORS no Supabase

### Passwords/PINs não funcionam
**Causa**: RPC functions não foram criadas ou não estão retornando dados

**Solução**:
1. Executar migration `20260701000000_security_hardening.sql` novamente
2. Verificar se as funções RPC existem:
   ```sql
   SELECT proname FROM pg_proc WHERE proname LIKE 'check_%';
   ```

### Produtos mostram preço errado
**Causa**: Dados no banco não foram atualizados

**Solução**:
1. Verificar se a migration `20260924000000_nobre_cafe_cardapio.sql` foi aplicada
2. Executar no SQL Editor:
   ```sql
   SELECT name, price FROM public.products WHERE name = 'Kibe Assado';
   ```
   Esperado: `Kibe Assado | 45.00`

---

## Monitoramento Pós-Deploy

### Métricas a Acompanhar
- [ ] Uptime: verificar Vercel Dashboard
- [ ] Performance: verificar Web Vitals
- [ ] Erros: verificar Sentry ou logs do console
- [ ] Uso de banda: verificar Supabase Dashboard

### Backups
1. Supabase faz backups automáticos diários
2. Para backup manual:
   ```bash
   supabase db pull --project-id [project-id] > backup.sql
   ```

### Updates Futuros
Para fazer update do código:
1. Fazer commit e push no branch
2. Vercel detecta automaticamente e faz novo deploy
3. Verificar na dashboard se o deploy foi bem-sucedido

---

## Checklist de Segurança Pré-Deploy

- [ ] Nenhuma API key exposta em commits
- [ ] Service Role Key não está no `admin.html`
- [ ] JWT Secret não está no frontend
- [ ] RLS está ativado em todas as tabelas
- [ ] CSP headers estão em `vercel.json`
- [ ] Senhas de teste foram removidas ou alteradas
- [ ] Backups foram feitos do banco

---

## URLs Importantes

- **Aplicação**: https://[seu-dominio]
- **Supabase Dashboard**: https://app.supabase.com/project/[project-id]
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/s4vvskfbk2-create/nobre-bistro

---

Última atualização: 2026-09-24
Status: Pronto para deploy ✓
