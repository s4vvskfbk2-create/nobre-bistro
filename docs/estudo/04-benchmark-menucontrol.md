# Estudo: Benchmark de Produto — MenuControl

> Análise de **19 prints** do **MenuControl** (`app.menucontrol.com.br`), um SaaS
> brasileiro de fichas técnicas e precificação para restaurantes. Serve como
> **referência de produto/UX** (concorrente direto) para o novo projeto.
> Data: 2026-06-29. Conta observada: Breno Ribas (plano free — CTA "Assine já!").

> Por que importa: enquanto as notas 01–03 são a base **conceitual/financeira**,
> esta nota mostra **como um produto real materializa isso em telas** — arquitetura
> de informação, modelo de dados, fluxos e recursos que valem como baseline (e
> onde dá para superar).

---

## 1. Arquitetura de informação (menu principal)

Menu lateral/hambúrguer (`menu·control`, branding laranja):

| Seção | Subtítulo | Função |
|-------|-----------|--------|
| **Mercadorias** | & Ingredientes | Cadastro de insumos base + preços de compra |
| **Receitas** | Ficha técnica | Fichas técnicas (operacional + gerencial) |
| **Cardápio** | Precificação | Precificação e cardápio de venda |
| **Ferramentas** | (dropdown) | **Setup financeiro**, **Lista de compras**, **Rotulagem** |
| **Cadastros** | (dropdown) | Categorias, fornecedores, etc. |

Extras: CTA de assinatura ("Assine já!" 👑 — freemium), menu do usuário,
breadcrumb (`Fichas técnicas › Receitas › [Receita]`), widget de chat (Intercom).

---

## 2. Mercadorias (insumos base) — equivalente à "Aba 3" das notas 01/02

Tela **"Lista de Mercadorias — Itens base"** (ex.: Açúcar, sal, farinha, mignon).
- Contador (ex.: **82 itens**).
- Ações: **Atualizar mercadorias**, **Importar mercadorias** (import em massa),
  **Ações em lote**.
- Filtros: busca textual, **categoria**, **fornecedor**.
- Lista: `Nome | Preço/unidade | Data (última compra) | excluir`. Exemplos reais:
  - Chocolate em pó — 22,00 / Kg — 10/08/2020
  - Chocolate meio amargo — 30,90 / Un
  - Creme de leite — 15,75 / pct
  - Farinha de trigo — 5,79 / Kg — 15/12/2021
  - Leite — 4,50 / L · Ovo de galinha — 15,00 / cx · Óleo de soja — 3,90 / Un
  - Champagne — 40,00 / L · Vinho branco seco — 45,00 / L
- Cada mercadoria tem unidade base própria (Kg, Un, L, pct, cx) e guarda a **data
  da última atualização de preço** → base do custo unitário das fichas.

---

## 3. Receita / Ficha Técnica — entidade central

Cabeçalho: **Nome**, **Tipo** (ex.: "Receita"), **Categoria** (ex.: "tortas"),
foto, **Última alteração**.

### Ações
- **Voltar** · **Baixar** (exporta PDF) · **Editar receita**
- **Trocar para gerencial** ⭐ — alterna a MESMA ficha entre visão **operacional**
  e **gerencial** (confirma a dualidade das notas 01/02).
- **Outras opções** (dropdown) · **Ver rótulo nutricional** · **Gerar ficha
  técnica** · **Precificar** ⭐ (botão de destaque).

### Abas
`Composição` · `Modo de preparo` · `Em uso` · `Informação nutricional` ·
`Histórico`.

### Cabeçalho de receita (cards)
- **Rendimento**: valor + **unidade selecionável** (ex.: 1,0 Quilo).
- **Tempo de preparo** (min).
- **Criado em** (data).
- **Validade (em dias)**: ❄️ Congelado · 🌬️ Refrigerado · ☀️ Temperatura ambiente.

---

## 4. Aba Composição (ingredientes)

Tabela cujas **colunas mudam conforme o modo**:

- **Operacional:** `Tipo | Nome | Medida | Qtd. Líquida | Qtd. Bruta`.
- **Gerencial:** `Tipo | Nome | Quant. líquida | % de aproveitamento | Quant.
  bruta | Custo/Un | Custo total | Custo %`.

- A coluna **Tipo** indica que um item pode ser um **insumo (mercadoria)** ou
  outra **receita/subficha** → **composição recursiva**.
- **% de aproveitamento** = rendimento/fator de correção por ingrediente (a
  Qtd. bruta é derivada da líquida).
- **Custo %** = participação de cada ingrediente no custo total (engenharia de
  custo por item).
- Ações: **+ Adicionar ingrediente**, **T Adicionar título** (seções como
  "massa"/"recheio"). Estado vazio: "Nenhum ingrediente adicionado ainda".

### Bloco "Rendimento final"
Peso final **após o preparo** (orienta inserir peso **pós-cocção** — captura
perda/ganho de cocção, distinto do FC de pré-preparo). Campo + **Atualizar**;
"Quantidade líquida total"; checkbox **"Aplicar quantidade líquida total da
receita"**.

### Bloco "Custos" (visão gerencial)
```
(+) Custo de mercadoria   R$ ...
(+) Custos Extras          R$ ...
(=) Custo Total            R$ ...
    Custo por Quilo        R$ ...   (custo por unidade de rendimento)
```

### Bloco "Porções"
- Tabela `Nome | Custo (R$) | Esta receita faz`.
- **Múltiplas porções/unidades** por receita (ex.: Quilo = 1; Grama = 1.000).
- **+ Nova porção** → modal **"Criar porção"**: *"Defina porções para transformar
  o rendimento da receita em unidades práticas de uso (Unidade, Cento, Concha,
  Fatia). Você poderá utilizar essas porções em outras receitas e precificá-las."*
  → ou seja, uma **porção também é reutilizável como ingrediente** de outra ficha.

---

## 5. Aba Modo de preparo
- Campo de etapa + **+ Procedimento** e **+ Título**; tabela `Ordem | Procedimento`.
- **Observações** (texto livre).
- **Tempo de Preparo** (min) e **Validade (em dias)** (congelado/refrigerado/ambiente).

## 6. Aba "Em uso"
Tabela `Tipo | Nome | Quant. | Unidade de medida`: mostra em quais receitas esta
ficha é usada como ingrediente/subficha (**impacto reverso** de mudanças).

## 7. Aba "Informação nutricional" (rótulo)
Cálculo de **tabela nutricional** do prato, em colunas **Porção de 100g** e
**Porção de 1Kg**. Origem dos dados por mercadoria/receita. Campos cobrem o rótulo
brasileiro completo:
- **Dados obrigatórios:** valor energético (kcal), carboidratos, proteínas, fibras,
  açúcares totais, açúcares adicionados, gorduras totais, saturadas, trans, sódio.
- **Outras gorduras:** colesterol, monoinsaturadas, poliinsaturadas.
- **Minerais:** cálcio, magnésio, manganês, fósforo, ferro, potássio, cobre,
  zinco, cromo, selênio…
- **Vitaminas:** A, retinol, B1–B9 (tiamina etc.), C, D, E, K.
- **Outros nutrientes/açúcares:** cloreto, colina, flúor, iodo, molibdênio,
  ômega 3 e 6, lactose, galactose. **Polióis** totais.

## 8. Aba "Histórico" (auditoria de custos)
**"Histórico de custos"** — `Data | Custo Unitário | Per capita` (ex.: 25/03/26 —
R$ 0,00/Kg). Rastreia a evolução de custo da receita ao longo do tempo.

---

## 9. Precificação (tela "Precificar")

- Organizada por **canais de venda** (aba "Canal de venda padrão" → sugere
  múltiplos canais: salão, delivery, etc.). Botão **Editar receita** e export
  **PDF**.
- **Dados de precificação:**
  - **"Como será vendido?"** → Quantidade + **unidade de venda** (Selecione).
  - **Preço de venda** (input) + botão **Simulador**.
  - Gráfico de custos: *"Defina como o produto será vendido acima para ver os
    detalhes do custo."*
- **Embalagens:** tabela `Nome | Custo da embalagem | Custo unitário | Quantidade
  | Custo total` + **Adicionar embalagem** / **Copiar embalagem** (custo de
  embalagem entra na precificação — responde a uma das "dúvidas" da nota 01).
- **Dados do cardápio:** checkbox **"Exibir no cardápio"**, **Categoria** (+ Nova
  categoria), **Código** para exportação em CSV.

---

## 10. Modelo de dados inferido (do MenuControl)
```
Mercadoria (insumo base)
  └─ nome, categoria, fornecedor, unidade_base, preço, data_última_compra

Receita (Ficha Técnica)
  ├─ nome, tipo, categoria, foto, criado_em, atualizado_em
  ├─ rendimento (valor + unidade), rendimento_final (pós-cocção)
  ├─ tempo_preparo, validade {congelado, refrigerado, ambiente}
  ├─ Composição: Itens[]
  │     ├─ tipo (mercadoria | receita | porção)   ← recursivo
  │     ├─ qtd_liquida, %_aproveitamento, qtd_bruta
  │     └─ custo_un, custo_total, custo_%          ← gerencial
  ├─ títulos/seções de composição
  ├─ Custos: custo_mercadoria + custos_extras = custo_total, custo_por_unidade
  ├─ Porções[]: { nome, unidade, "esta receita faz", custo } (reutilizáveis)
  ├─ Modo de preparo: Procedimentos[] + títulos + observações
  ├─ Informação nutricional (rótulo: 100g / 1Kg, ~50 nutrientes)
  └─ Histórico de custos[]: { data, custo_unitário, per_capita }

Precificação (por Canal de venda)
  ├─ unidade de venda + quantidade
  ├─ preço de venda + simulador
  ├─ Embalagens[]: { nome, custo_embalagem, custo_unit, qtd, custo_total }
  └─ Dados de cardápio: exibir?, categoria, código CSV
```

---

## 11. Lições para o nosso projeto

**Adotar (paridade de baseline):**
- IA em 4 pilares: **Mercadorias → Receitas → Cardápio/Precificação →
  Ferramentas**.
- **Mercadorias** com preço por unidade, fornecedor, data e **import em massa**.
- Receita única com **dois modos** (operacional ⇄ gerencial) via toggle.
- **Composição recursiva** (mercadoria / receita / porção) com **% de
  aproveitamento por item** e **Custo %** (engenharia de custo por ingrediente).
- **Porções reutilizáveis** (transformam rendimento em unidades de venda/uso).
- **Custos Extras** além de mercadoria; **embalagem** na precificação.
- **Múltiplos canais de venda** com preço/simulador por canal.
- **Rótulo nutricional** (100g/porção) — diferencial forte e exigência regulatória.
- **Histórico de custos**, aba **"Em uso"**, export **PDF/CSV**.
- **Lista de compras** e **Setup financeiro** como ferramentas.

**Onde superar o MenuControl (nossos diferenciais):**
- **Nível negócio/DRE** (nota 03): Prime Cost, CMO, custos operacionais, DRE TRA
  — o MenuControl tem "Setup financeiro", mas nosso foco é gestão financeira
  completa por estabelecimento.
- **Multi-estabelecimento** nativo (Nobre Bistrô + Úrica Maison + Sushi Boys) com
  consolidação — a conta vista é single-tenant.
- **CMV teórico × real** integrado a estoque/compras.
- **Simulador de precificação por meta de CMV** e **alertas por benchmark de
  segmento/categoria**.
- Integração com o que o Nobre Bistro **já tem** (admin, cardápio, engenharia de
  cardápio/BCG).

**UX observada:** estados vazios bem tratados; freemium com CTA de assinatura;
fluxos guiados passo a passo; mobile-first responsivo.

---

> Fonte: prints de `app.menucontrol.com.br` enviados em 2026-06-29 (IMG_2872–2888,
> IMG_2896–2897). Produto de terceiros usado apenas como referência de
> mercado/benchmark.
