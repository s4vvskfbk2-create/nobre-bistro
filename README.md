# Nobre Café — Sistema de Gestão com IA

Sistema web completo para gestão de cafeteria/bistrô com cardápio, pedidos, operação de balcão/cozinha, fiado de funcionários, caixa, ERP de insumos e gestão com apoio de IA.

**Status**: ✅ Conectado ao banco de dados - Pronto para testes e deploy

O projeto está em arquitetura HTML+React18 (CDN) com Supabase como backend. Frontend carrega dados em tempo real do banco, com fallback para defaults locais para garantir disponibilidade.

## Status Atual (Setembro 2026)

### ✅ Concluído
- Banco de dados Supabase estruturado com 11 migrações SQL
- Frontend conectado ao banco de dados (carregamento de produtos e equipe)
- 37 produtos de Nobre Café cadastrados com preços em BRL
- 21 funcionários cadastrados (19 equipe salão + gerente + atendente)
- Sistema de autenticação com PIN e senhas
- Fiado com controle de quinzena
- RLS (Row Level Security) ativado
- Edge Functions para autenticação e notificações

### 📋 Próximos Passos
1. Testar os 5 fluxos críticos (ver `TESTING.md`)
2. Deploy em Vercel (ver `DEPLOYMENT.md`)
3. Ativar integração WhatsApp
4. Configurar agentes de IA recorrentes

### 📚 Documentação
- **`TESTING.md`** — Guia completo de testes com 5 fluxos críticos
- **`DEPLOYMENT.md`** — Instruções passo-a-passo para deploy
- **`.env.example`** — Exemplo de variáveis de ambiente

---

## Visão geral

O Nobre Bistrô funciona dentro de um salão de beleza. Por isso, o sistema foi pensado para conectar:

- **Clientes** que compram pelo cardápio digital.
- **Profissionais do salão** que aparecem como indicação/atendimento no cardápio.
- **Fiado dos profissionais**, que pagam ao Nobre Bistrô quando recebem na quinzena.
- **Ranking e desempenho da equipe/profissionais**.
- **Balcão e cozinha**, com telas simples para operação diária.
- **Financeiro, caixa, despesas e fechamento**.
- **IA de gestão**, com Central CEO, Segundo Cérebro e tarefas acionáveis.

## Arquivos principais

| Arquivo | Função |
| --- | --- |
| `index.html` | Cardápio público/mobile para clientes, pedidos e chamados de mesa. |
| `admin.html` | Painel administrativo/operacional com balcão, pedidos, cozinha, caixa, fiado, equipe, IA, ERP e relatórios. |
| `nobre-cardapio-v2.tsx` | Versão React/TSX de referência do cardápio. |
| `nobre-admin.tsx` | Versão React/TSX de referência do admin. |
| `supabase/migrations/20260630000000_core_management_schema.sql` | Migration do schema empresarial normalizado. |
| `docs/finalization-roadmap.md` | Roadmap técnico de finalização e migração. |
| `docs/audit-findings.md` | Achados de auditoria e correções já aplicadas. |

## Módulos atuais

### Cardápio público

- Lista produtos ativos.
- Permite escolher profissional de referência.
- Cria pedidos no app.
- Envia chamados de mesa.
- Possui fila offline em `localStorage` para pedidos/chamados quando a internet falhar.
- Faz escrita em modo **write-through**: mantém fallback em `config`, mas tenta gravar em tabelas reais.

### Admin / operação

- **Balcão fácil**: lançamento rápido de pedidos por funcionários.
- **Pedidos**: gestão de status, cancelamento e chamados.
- **Cozinha**: tela simplificada para produção e conclusão.
- **Caixa e fechamento**: visão de vendas, pagamentos e fechamento diário.
- **Fiado**: controle por profissional do salão, cobrança por WhatsApp, marcação de cobrado/pago e quinzena.
- **Equipe**: cadastro de profissionais/funcionários, PIN, comissão, limite de fiado, ranking e metas.
- **Cardápio/ERP**: produtos, fichas técnicas, ingredientes, fornecedores e compras.
- **IA**: Central CEO, Segundo Cérebro, tarefas IA e consultor.

## Camada de serviços

O admin possui uma camada inicial de serviços para reduzir chamadas REST espalhadas e começar a migrar do `config` JSON para tabelas reais:

- `ServiceBus`
- `OrderService`
- `PaymentService`
- `CreditService`
- `TableCallService`
- `InventoryService`
- `ProductService`
- `StaffService`
- `AIService`
- `EventService`

Esses serviços fazem gravação **best-effort** em tabelas normalizadas e mantêm fallback JSON para preservar a operação durante a migração.

## Banco de dados

A migration principal cria a base empresarial com tabelas como:

- `customers`
- `staff`
- `products`
- `orders`
- `order_items`
- `payments`
- `table_calls`
- `cash_sessions`
- `cash_movements`
- `credit_entries`
- `ai_tasks`
- `ai_recommendations`
- `ai_agents`
- `system_events`
- `audit_logs`

> Importante: as políticas RLS atuais da migration são temporárias e permissivas para a fase de migração/testes. Antes de produção real, devem ser trocadas por regras por papel/autenticação.

## Integração de IA

A IA do projeto está dividida em camadas:

1. **Central CEO** — cruza vendas, estoque, fiado, equipe e cardápio para sugerir ações.
2. **Segundo Cérebro** — guarda regras de gestão, foco do negócio e rotinas operacionais.
3. **Tarefas IA** — transforma recomendações em execução rastreável.
4. **Centro IA / agentes** — estrutura preparada para agentes de vendas, estoque/CMV, fiado, clientes, operação e financeiro.
5. **Consultor IA** — função Supabase Edge Function para análise textual com modelo externo.

## Como rodar localmente

### Opção 1: Server Python (simples)
```bash
python3 -m http.server 8000
```

Depois abra:
- Cardápio público: `http://127.0.0.1:8000/index.html`
- Admin: `http://127.0.0.1:8000/admin.html`

**Nota**: Precisa de Supabase configurado para carregar dados do banco. Caso contrário, usa defaults.

### Opção 2: Vercel CLI (recomendado para testes)
```bash
npm i -g vercel
vercel dev
```

Abra em `http://localhost:3000/admin.html`

### Opção 3: Vercel Preview
```bash
git push origin claude/github-connection-setup-aaoj9k
# Criar PR no GitHub → Vercel cria preview automaticamente
```

## Validações rápidas

Extração e validação dos scripts embutidos:

```bash
python3 - <<'PY'
from pathlib import Path
for f in ['admin.html','index.html']:
    s = Path(f).read_text()
    Path('/tmp/' + f + '.js').write_text(s[s.index('<script>')+8:s.rindex('</script>')])
PY
node --check /tmp/admin.html.js
node --check /tmp/index.html.js
git diff --check
```

Smoke HTTP:

```bash
python3 -m http.server 4173
curl -I http://127.0.0.1:4173/admin.html
curl -I http://127.0.0.1:4173/index.html
```

## Configuração Supabase

### Atual (MVP)
✅ Chaves públicas (Anon Key) estão em `admin.html` — OK para MVP
✅ RLS está ativado em todas as tabelas
✅ 11 migrações aplicadas ao banco
✅ Produtos e equipe carregam do banco com fallback para defaults
✅ Autenticação via PIN com hash server-side

### Para Produção
- Mover Anon Key para variáveis de ambiente (`.env.example` já criado)
- Validar RLS por papel está correto
- Ativar backups automáticos no Supabase
- Configurar monitoramento e alertas
- Testar failover e recuperação de dados

Ver `DEPLOYMENT.md` para instruções completas.

## Estado atual da migração

✅ **Leitura**: Produtos e equipe carregam do banco normalizadas
✅ **Escrita**: Serviços fazem write-through (config + tabelas normalizadas)
✅ **Histórico**: Pedidos e vendas salvos em `orders`, `order_items`, `payments`
✅ **Auditoria**: `system_events` e `audit_logs` rastreiam tudo

**Próxima fase**:
1. Testar os 5 fluxos críticos com dados do banco
2. Validar consistência entre config legado e tabelas
3. Migrar escrita principal para tabelas (remover fallback config)
4. Ativar agentes de IA para análises automáticas

## Próximos passos recomendados

### Imediato (próximas 1-2 semanas)
1. ✅ Conectar frontend ao banco (DONE)
2. **Em progresso**: Testar os 5 fluxos críticos (`TESTING.md`)
3. **Próximo**: Deploy em Vercel (`DEPLOYMENT.md`)
4. Validar funcionamento em produção

### Curto prazo (mês 1)
1. Ativar integração WhatsApp para notificações
2. Ativar agentes de IA recorrentes (vendas, estoque, fiado, etc)
3. Criar dashboard de KPIs
4. Implementar PWA (modo offline aprimorado)

### Médio prazo (mês 2-3)
1. Ativar backup automático e DR
2. Monitoramento com Sentry/Datadog
3. Criar relatórios detalhados
4. Integração com sistema de pagamento (Mercado Pago, etc)

### Longo prazo
1. App nativa iOS/Android
2. Integração com ERP/contabilidade
3. IA generativa para análise de dados
4. Multi-loja suporte

## Observações de negócio

- O fiado é voltado aos profissionais/funcionários do salão.
- Esses profissionais pagam ao Nobre Bistrô quando recebem por quinzena.
- Não é desconto automático em folha.
- A mesma pessoa deve ser usada como profissional do cardápio, pessoa do fiado e participante do ranking de indicações.

## Licença

Projeto privado do Nobre Bistrô. Defina uma licença formal antes de distribuição pública.
