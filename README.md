# Nobre Bistrô — Sistema de Gestão com IA

Sistema web para cardápio, pedidos, operação de balcão/cozinha, fiado de profissionais do salão, caixa, ERP de insumos/fichas técnicas e gestão com apoio de IA.

O projeto está em fase de evolução de um MVP baseado em arquivos HTML estáticos e chaves JSON no Supabase para uma arquitetura mais empresarial, com escrita em tabelas normalizadas e serviços de domínio no front-end.

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

Como o projeto é majoritariamente estático, você pode servir a pasta com Python:

```bash
python3 -m http.server 4173
```

Depois abra:

- Cardápio público: `http://127.0.0.1:4173/index.html`
- Admin: `http://127.0.0.1:4173/admin.html`

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

As URLs e chaves públicas do Supabase ainda estão diretamente nos arquivos HTML. Isso facilita o MVP, mas para produção recomenda-se:

- Separar ambiente de produção/homologação.
- Migrar credenciais para variáveis/configuração segura.
- Aplicar a migration SQL no Supabase.
- Validar tabelas normalizadas contra os dados legados em `config`.
- Trocar RLS temporário por políticas reais por papel.

## Estado atual da migração

O sistema está em modo **write-through**:

1. Continua salvando em chaves legadas do `config` para não interromper a operação.
2. Também tenta gravar em tabelas normalizadas.
3. Eventos e auditoria alimentam a IA e a rastreabilidade.
4. A próxima fase é comparar dados entre legado e tabelas, corrigir diferenças e então migrar leitura/escrita principal para as tabelas reais.

## Próximos passos recomendados

1. Aplicar a migration no Supabase.
2. Validar gravações em `orders`, `order_items`, `payments`, `credit_entries`, `table_calls`, `cash_sessions`, `cash_movements`, `ai_tasks` e `ai_recommendations`.
3. Migrar leituras principais do admin/cardápio para tabelas normalizadas.
4. Criar autenticação real e RLS por perfil.
5. Ativar agentes de IA recorrentes.
6. Implantar PWA, backup, monitoramento e domínio de produção.

## Observações de negócio

- O fiado é voltado aos profissionais/funcionários do salão.
- Esses profissionais pagam ao Nobre Bistrô quando recebem por quinzena.
- Não é desconto automático em folha.
- A mesma pessoa deve ser usada como profissional do cardápio, pessoa do fiado e participante do ranking de indicações.

## Licença

Projeto privado do Nobre Bistrô. Defina uma licença formal antes de distribuição pública.
