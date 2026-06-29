# Especificação do Projeto — App de Fichas Técnicas & CMV (MVP)

> Documento de especificação para o **novo app separado** que o Breno vai criar.
> Decisões já tomadas (2026-06-29):
> - **Projeto separado** (não é módulo do Nobre Bistro). Repo próprio.
> - **Multi-estabelecimento desde já**: Nobre Bistrô + Úrica Maison + Sushi Boys.
> - **MVP**: Mercadorias → Ficha técnica (operacional + gerencial) → **export
>   Excel com fórmulas vivas** + PDF padronizado.
> - **Stack**: React + Vite + TypeScript · Supabase (Postgres/Auth/RLS) · ExcelJS
>   (Excel com fórmulas) · geração de PDF.

Esta spec consolida as notas 01–04 em um produto concreto.

---

## 1. Princípios do produto
- **Padronização total:** toda ficha tem o mesmo layout em tela, PDF e Excel.
- **Excel com fórmulas vivas** (requisito central): o `.xlsx` baixado recalcula
  sozinho — custo unitário, custo total, custo/porção, CMV %, margem, markup —
  não vai número congelado.
- **Cascata de custos:** preço da mercadoria → custo do ingrediente → custo da
  receita → custo da porção → indicadores (igual nota 02).
- **Melhor que o MenuControl:** + multi-estabelecimento, + nível DRE/Prime Cost
  (fase 2), + CMV teórico×real, + simulador por meta de CMV.

---

## 2. Arquitetura de informação (espelha nota 04, melhorada)
1. **Mercadorias** (insumos base + preço/fornecedor/histórico).
2. **Receitas / Fichas técnicas** (operacional ⇄ gerencial; composição recursiva).
3. **Cardápio / Precificação** (por canal de venda, embalagens, meta de CMV).
4. **Ferramentas** (lista de compras, rótulo nutricional, **DRE/Prime Cost** — fase 2).
5. **Seletor de estabelecimento** global + visão consolidada.

---

## 3. Modelo de dados (Supabase / Postgres)

```sql
-- Núcleo multi-estabelecimento
estabelecimento (id, nome, segmento, created_at)
usuario_estabelecimento (user_id, estabelecimento_id, papel)   -- RLS por unidade

-- Cadastros
fornecedor (id, estabelecimento_id, nome, contato)
categoria (id, estabelecimento_id, tipo /*mercadoria|receita*/, nome)

-- Mercadorias (insumos base) — "Aba 3"
mercadoria (
  id, estabelecimento_id, nome, categoria_id, unidade_base /*kg,g,l,ml,un,cx,pct*/,
  fornecedor_id, preco_atual, atualizado_em
)
mercadoria_preco_hist (id, mercadoria_id, preco, data, fornecedor_id)  -- histórico

-- Receitas / Fichas técnicas
receita (
  id, estabelecimento_id, nome, categoria_id, foto_url,
  rendimento_valor, rendimento_unidade,
  rendimento_final_peso,                    -- pós-cocção
  tempo_preparo_min,
  validade_congelado_dias, validade_refrigerado_dias, validade_ambiente_dias,
  criado_em, atualizado_em
)

-- Composição: um item pode ser mercadoria, outra receita (subficha) ou porção
receita_item (
  id, receita_id, ordem, titulo_secao,
  tipo /*mercadoria|receita|porcao*/, ref_id,
  qtd_liquida, unidade, perc_aproveitamento,   -- qtd_bruta = liquida / aproveit.
  -- custo_un, custo_total, custo_% são DERIVADOS (calculados)
)

-- Custos extras da receita (embalagem da produção, etc.)
receita_custo_extra (id, receita_id, descricao, valor)

-- Porções reutilizáveis (transformam rendimento em unidades de uso/venda)
porcao (id, receita_id, nome, unidade, quantidade_que_faz)  -- ex.: Fatia=12

-- Modo de preparo
procedimento (id, receita_id, ordem, titulo_secao, texto)
receita_observacao (receita_id, texto)

-- Precificação por canal de venda
canal_venda (id, estabelecimento_id, nome)        -- salão, delivery, balcão...
preco_receita (
  id, receita_id, canal_venda_id, porcao_id,
  preco_venda, exibir_cardapio, codigo_cardapio
)
embalagem (id, preco_receita_id, nome, custo_embalagem, quantidade)

-- Rótulo nutricional (fase posterior)
nutriente (id, nome, unidade, grupo)               -- tabela de referência
mercadoria_nutriente (mercadoria_id, nutriente_id, valor_por_100g)

-- Histórico de custos da receita
receita_custo_hist (id, receita_id, data, custo_unitario, per_capita)
```

**RLS:** toda tabela com `estabelecimento_id` filtra pelo vínculo do usuário; o
seletor de estabelecimento define o contexto ativo.

---

## 4. Fórmulas (do nota 02/03 — fonte da verdade do cálculo)
```
qtd_bruta            = qtd_liquida / (perc_aproveitamento)      (aprov. em decimal)
custo_un_bruto       = preco_mercadoria (na unidade base)
custo_item           = custo_un_bruto * qtd_bruta
custo_mercadoria     = Σ custo_item
custo_total          = custo_mercadoria + Σ custos_extras
custo_por_unid_rend  = custo_total / rendimento_final
custo_por_porcao     = custo_total / (quantidade_que_faz da porção)
CMV %                = custo_por_porcao / preco_venda * 100
margem_R$            = preco_venda - custo_por_porcao
margem %             = margem_R$ / preco_venda * 100        (margem% + CMV% = 100)
markup               = preco_venda / custo_por_porcao
preco_por_meta_CMV   = custo_por_porcao / (CMV_alvo decimal)
```

---

## 5. Export Excel com fórmulas vivas (o diferencial)

Biblioteca: **ExcelJS** (`cell.value = { formula: '...', result: ... }`).

**Estrutura de 3 abas (espelha nota 02), com fórmulas reais:**
- **Aba "Tabela de Preços":** mercadorias usadas; coluna Custo Unitário =
  `=PreçoPago/Qtd`.
- **Aba "Ficha Técnica":** ingredientes; `Custo Unit` referencia a aba de preços
  (`='Tabela de Preços'!F5`), `Custo Total = CustoUnit*Qtd`, `Custo da Receita =
  SUM(...)`, `Custo/Porção = Total/Porções`, `CMV% = Custo/Preço`,
  `Margem = Preço-Custo`, `Markup = Preço/Custo`.
- **Aba "Receita Operacional":** ingredientes em medida caseira + modo de preparo
  (sem custos).

Assim, quando o usuário altera um preço na aba de preços, **todo o Excel
recalcula** — exatamente o que o Breno pediu. Geração também de **PDF** no layout
padronizado (operacional para a cozinha, com responsável/assinatura).

---

## 6. Escopo do MVP (fase 1) vs depois
**MVP (fase 1):**
- Auth + seletor de estabelecimento (3 unidades) + RLS.
- CRUD de **Mercadorias** (com histórico de preço) e import simples.
- CRUD de **Receita/Ficha** (operacional + gerencial, composição recursiva,
  % aproveitamento, custos extras, porções).
- Cálculo em cascata em tempo real na tela.
- **Export Excel com fórmulas vivas** + **PDF** padronizado.

**Fase 2:**
- Precificação por canal de venda + embalagens + simulador por meta de CMV.
- **DRE / Prime Cost / CMO / custos operacionais** (nota 03), por unidade e
  consolidado.
- **CMV teórico × real** (estoque + compras).
- **Rótulo nutricional** (100g/porção).
- Lista de compras gerada a partir das fichas.

---

## 7. Próximos passos (assim que o repo novo existir e eu tiver acesso)
1. Scaffold Vite + React + TS + ESLint/Prettier.
2. Configurar Supabase (client, env, migrations das tabelas acima + RLS).
3. Implementar Mercadorias e Receita com motor de cálculo (núcleo de fórmulas
   compartilhado entre tela, Excel e PDF — fonte única da verdade).
4. Implementar export Excel (ExcelJS) e PDF.
5. Seed das 3 unidades e dados de exemplo (ex.: Bastones di Cogumelos, da nota 01).
