# Auditoria Técnica Completa — Nobre Bistro
**Data:** Julho/2026 · **Escopo:** todo o repositório

---

## 1. O que foi analisado

| Área | Arquivos |
|---|---|
| Painel administrativo | `admin.html` (3.739 linhas, 31 módulos/abas) |
| Cardápio do cliente | `index.html` (259 linhas) |
| Protótipos de referência | `nobre-admin.tsx`, `nobre-cardapio-v2.tsx` (não vão para produção) |
| Backend | `supabase/functions/consultor-ia/index.ts` (Edge Function IA) |
| Banco de dados | 2 migrations SQL (schema normalizado + hardening de segurança) |
| Documentação | `README.md`, `docs/audit-findings.md`, `docs/finalization-roadmap.md` |

**Arquitetura real:** SPA em arquivo único (React 18 via CDN, sem build), Supabase como backend (PostgREST + Edge Functions + Storage), dados em modelo híbrido — arrays JSON na tabela `config` (legado) com write-through para tabelas normalizadas (novo).

---

## 2. Funcionalidades CONCLUÍDAS ✅

**Operação**
- Balcão (venda direta com comissão, fiado, desconto por profissional)
- Pedidos (fila, filtros, mudança de status, chamados de mesa integrados)
- Cozinha (painel com timer de preparo e alteração de status)
- Cardápio do cliente (mesa via QR, carrinho, dados, pagamento, confirmação)
- QR Code por mesa

**Financeiro**
- Caixa do dia, fechamento de caixa, despesas, relatórios de vendas
- Fiado por profissional com quinzena e histórico
- Comissões por atendente

**Gestão**
- Cardápio (CRUD com foto via Supabase Storage), Receitas/Fichas técnicas com CMV
- Engenharia de cardápio (matriz popularidade × margem)
- ERP: produtos, insumos, fornecedores, compras
- Equipe (CRUD, PIN, papel, comissão), horários de funcionamento
- Clientes (ranking, recorrência)

**IA e automações**
- Consultor IA, Central CEO, 2º Cérebro, Tarefas IA, Centro IA (eventos/recomendações/agentes)
- Baixa automática de estoque por ficha técnica ao concluir pedido
- CMV recalculado automaticamente ao salvar receita
- `system_events` + `audit_logs` gravados em todas as ações críticas
- Camada de serviços (`ServiceBus`, `OrderService`, `PaymentService`, `CreditService`, `InventoryService`, `ProductService`, `StaffService`, `AIService`, `EventService`)

**Segurança (implementada nesta rodada e na anterior)**
- Login validado 100% no servidor (RPCs `SECURITY DEFINER`) — senha nunca chega ao navegador
- Hash **bcrypt** das senhas no banco (compatível com senhas legadas até a primeira troca)
- Rate limiting **no servidor** (15 falhas / 5 min bloqueia o endpoint) + bloqueio local (5 falhas / 30 min)
- RLS bloqueando leitura direta de `nb_bA_senhas` pelo anon key
- Troca de senha exige a senha atual do gerente
- Logout automático após 60 min de inatividade
- Content-Security-Policy nas duas páginas (mitiga XSS)
- Cancelamento de pedido exige senha verificada no servidor + trilha de auditoria
- Zero dados pessoais no código (nomes, PINs, telefone e senhas removidos)

---

## 3. Funcionalidades PARCIAIS ⚠️

| Item | Estado |
|---|---|
| Migração `config` JSON → tabelas normalizadas | Write-through pronto; leitura ainda vem do JSON (risco de sobrescrita concorrente) |
| Pagamentos | PIX manual ("paguei"), sem conciliação/webhook/gateway |
| Estoque | Baixa automática ok; faltam validade, inventário físico e registro de perdas |
| Tarefas IA | Salvas em `config`, deveriam usar a tabela `ai_tasks` |
| Agentes IA | Cadastrados no banco (6 agentes), mas `status=inactive` — sem scheduler que os execute |
| Notificações | Eventos gravados, mas sem push/WhatsApp automático |
| PINs de staff | Validados no servidor, porém armazenados em texto no JSON `nb_bA_profs` (legível pelo anon key) |

## 4. Funcionalidades AUSENTES ❌

- Multi-empresa / filiais / multi-tenant
- Mesas: transferência, divisão, unificação de comandas
- Delivery: endereço, CEP, taxa, entregador, tempo estimado
- Impressão (cozinha/térmica), NFC-e, iFood, gateway de pagamento
- Contas a pagar/receber, DRE, centros de custo, conciliação bancária
- Promoções/combos/adicionais no cardápio; pesquisa no cardápio do cliente
- Supabase Auth real (o sistema usa anon key + RPCs próprias)
- Backup automatizado documentado / plano de recuperação
- PWA (manifest + service worker)
- **Testes: não existe nenhum** (unitário, integração, E2E, carga)

---

## 5. Problemas técnicos encontrados

1. **CRÍTICO — Concorrência:** pedidos/produtos/chamados são arrays JSON em `config`; dois operadores salvando ao mesmo tempo sobrescrevem um ao outro. Mitigação já existente: write-through para tabelas normalizadas. Conserto definitivo: inverter a fonte de leitura.
2. **CRÍTICO — RLS permissiva:** todas as tabelas normalizadas têm policy `anon ALL` temporária. Qualquer pessoa com o anon key (público por design) pode ler/escrever pedidos, clientes e financeiro. Precisa de Supabase Auth + policies por papel antes de expor dados reais de clientes.
3. **ALTO — PINs em texto puro** no JSON `nb_bA_profs`, legível pelo anon key (o schema novo já tem `staff.pin_hash` esperando a migração).
4. **MÉDIO — Polling** (8–10 s) em vez de Supabase Realtime; gera carga desnecessária e latência.
5. **MÉDIO — Duplicação:** os `.tsx` são versões antigas do que está no HTML; headers Supabase re-montados em vários pontos (parcialmente consolidado).
6. **BAIXO — Clickjacking:** `frame-ancestors` não funciona via meta tag; exige header HTTP no host (Vercel/Netlify).
7. **BAIXO — Código morto:** `nobre-admin.tsx`/`nobre-cardapio-v2.tsx` não são usados em produção; manter como referência ou arquivar.

---

## 6. Grau de maturidade (0–100)

| Dimensão | Nota | Justificativa |
|---|---|---|
| Arquitetura | 48 | SPA monolítica sem build; camada de serviços emergente é o caminho certo |
| Banco de dados | 62 | Schema normalizado bom; convive com JSON legado; RLS ampla |
| Segurança | 70 | Auth server-side + bcrypt + rate limit + CSP + auditoria; falta Auth real e RLS por papel |
| Desempenho | 50 | Polling, arrays crescem sem paginação, 332 KB de HTML |
| Usabilidade | 78 | Mobile-first consistente, fluxos claros, bem polido |
| Organização | 42 | 3.700 linhas num arquivo; duplicação com TSX |
| Automações | 65 | Estoque, CMV, eventos e IA integrados; agentes ainda não rodam sozinhos |
| Escalabilidade | 30 | Mono-loja; config JSON impede concorrência alta |

---

## 7. O que foi corrigido/implementado NESTA auditoria

1. **Hash bcrypt** nas senhas (`pgcrypto`): `update_admin_password` grava hash; `check_admin_password` aceita hash e legado (compatibilidade total — nada quebra na transição).
2. **Rate limiting server-side**: tabela `auth_attempts` (sem policy para anon — invisível ao cliente) + funções `auth_rate_limited`/`auth_log_attempt`; 15 falhas em 5 min bloqueiam o endpoint independentemente do navegador do atacante.
3. **Trilha de tentativas de login** no banco (sucesso/falha com timestamp), com limpeza automática após 24 h.
4. Relatório de auditoria consolidado (este documento).

*Rodadas anteriores desta mesma sessão já haviam entregue: RPCs de auth, RLS da chave de senhas, bloqueio local de força bruta, session timeout, CSP, remoção de dados pessoais e deduplicação de credenciais.*

---

## 8. Roteiro recomendado (ordem de prioridade)

1. Aplicar a migration `20260701000000_security_hardening.sql` no Supabase (**pré-requisito para o login funcionar**) e definir as senhas iniciais.
2. Inverter a fonte de leitura: `orders`/`table_calls` normalizados como fonte primária, `config` só como fallback.
3. Migrar PINs para `staff.pin_hash` e bloquear leitura de PINs pelo anon key.
4. Adotar Supabase Auth (e-mail/senha do gerente) e substituir as policies `anon ALL` por policies por papel — **maior salto de segurança restante**.
5. Trocar polling por Supabase Realtime.
6. Scheduler dos agentes IA (pg_cron ou Edge Function agendada) para o sistema se autogerir de fato.
7. Perdas/validade/inventário no estoque; depois delivery e impressão.
8. Testes E2E (Playwright) dos fluxos: login, pedido, cancelamento, fechamento.

---

## 9. Percentuais finais

| Métrica | % | Observação |
|---|---|---|
| Conclusão do sistema (escopo restaurante único) | **72%** | Operação diária completa; faltam delivery, mesas avançadas e conciliação |
| Conclusão vs. checklist ERP completo (Fase 2 do goal) | **38%** | Multi-filial, NFC-e, iFood, DRE etc. não existem |
| Segurança | **70%** | Após aplicar a migration; chega a ~90% com Supabase Auth + RLS por papel |
| Qualidade de código | **55%** | Funcional e consistente, mas monolítico e sem testes |
| Escalabilidade | **30%** | Adequado a 1 loja com poucos operadores simultâneos |
| Prontidão para produção | **65%** | Pronto para uso interno controlado; NÃO pronto para dados sensíveis de clientes em escala sem o item 4 do roteiro |
