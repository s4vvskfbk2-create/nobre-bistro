# Estudo: Prime Cost, CMO e Modelo Financeiro TRA

> Base de conhecimento consolidada a partir de `LIVRO_COMPLETO_PRIME_COST_E_TUDO.md`
> — o "guia completo" do livro **"Tecnologias Gerenciais de Restaurantes"**
> (Marcelo Trad Fonseca), baseado na metodologia da **TRA (Texas Restaurants
> Association)**. Data de consolidação: 2026-06-29.

> Como se encaixa: enquanto as notas 01 e 02 ficam no nível **prato/ficha
> técnica** (custeio e precificação unitária), esta nota sobe para o nível
> **negócio/DRE**: Prime Cost, mão de obra, custos operacionais e o modelo de
> lucro completo. É o que transforma um "calculador de ficha técnica" em um
> **sistema de gestão financeira de restaurante**.

> **Escopo revelado:** o material indica explicitamente que a implementação visa
> **três estabelecimentos**: **Nobre Bistrô + Úrica Maison + Sushi Boys**. Isso
> sugere que o sistema deve ser **multi-estabelecimento** desde o início.

---

## 1. ⭐ Prime Cost (Custo Primário)

Índice que resume os custos diretos da operação: ingredientes + mão de obra.

```
Prime Cost % = [(CMV + CMO) ÷ Receita] × 100
```
- **CMV** = Custo da Mercadoria Vendida (ingredientes).
- **CMO** = Custo de Mão de Obra (folha de pagamento + encargos + benefícios).

**Exemplo:** Faturamento R$ 100.000; CMV R$ 30.000; CMO R$ 25.000 →
Prime Cost = (30.000+25.000)/100.000 = **55%**.

**Meta:** `< 60%`. Acima disso → preços baixos ou custos altos; investigar.

### Usos
Controle operacional, ajuste de preços, eficiência de pessoal, benchmark contra
concorrentes e como métrica-resumo de saúde financeira.

---

## 2. Modelo Financeiro TRA (estrutura de DRE simplificado)

Referência da Texas Restaurants Association adotada pelo autor:

```
RECEITA BRUTA:                  100%
- CMV (Ingredientes):           -30%   (ideal 30% · realista 35% · máx 40%)
- CMO (Mão de obra):            -30%   (máx recomendado 30%)
──────────────────────────────
Lucro Bruto:                     40%
- Custos Operacionais:          -25%   (aluguel, contas, limpeza, manutenção…)
──────────────────────────────
Lucro Operacional:              15%
- Impostos (Simples/ME):        -5%
──────────────────────────────
Lucro Líquido Esperado:         10%
```

Prime Cost ideal nesse modelo = 30% + 30% = **60%**.

---

## 3. CMV — revisão e refinamentos

```
CMV (período)            = Estoque Inicial + Compras − Estoque Final
CMV (com devoluções)     = EI + Compras + DC − DV − EF
CMV % (por item)         = (Custo por Porção ÷ Preço de Venda) × 100
```
- DC = devolução de compras · DV = devolução de vendas.
- **CMV Teórico** (fichas técnicas, o que *deveria* custar) × **CMV Real**
  (estoque físico, o que *realmente* custou — inclui perdas/roubos/porções extras).
- Variação aceitável: **±5–10%**; preocupante: **> 10%**.

---

## 4. CMO — Custo de Mão de Obra

Componentes: salários base + encargos sociais (INSS, FGTS) + benefícios (VR, VT) +
horas extras + comissões + seguros = **CMO total do mês**.

### Benchmark CMO
- Restaurante típico: **25–30%** (ideal 28%).
- Confeitaria/café: 20–25%.
- High-end: 30–35%.

### Estratégias de controle
Treinar equipe, padronizar receitas (facilita treinar/terceirizar), automatizar
(POS, delivery, takeout), terceirizar faxina/manutenção, reduzir hora extra.

---

## 5. Custos Operacionais

Tudo para manter o restaurante funcionando, **exceto** ingredientes e mão de obra.

- **Fixos:** aluguel, seguro, salário administrativo, internet/telefone, licenças.
- **Variáveis:** energia, água, gás, embalagens (delivery), taxa de cartão,
  combustível (delivery).
- **Periódicos:** manutenção, renovação de licenças, reforma/pintura.

### Benchmark (TRA): meta **25–30%** da receita
Aluguel 8–12% · contas 3–5% · manutenção/limpeza 2–4% · marketing 2–3% ·
administrativo 2–3% · seguros/impostos 3–5%.

---

## 6. Precificação estratégica (nível negócio)

```
CMV %            = (Custo Unitário ÷ Preço Venda) × 100
Margem %         = ((Preço − Custo) ÷ Preço) × 100      [Margem % + CMV % = 100%]
Markup           = Preço ÷ Custo
Preço pelo CMV   = Custo ÷ (CMV desejado em decimal)
```
Ex.: custo R$ 5,00, CMV alvo 30% → preço = 5 / 0,30 = **R$ 16,67**.

### Precificação "completa" (full cost + margem)
```
CUSTO BASE = Ingredientes + Mão de obra alocada
+ Despesas fixas alocadas ao prato
+ Impostos (%)
+ Taxa de cartão (%)
= CUSTO TOTAL
+ Margem de lucro desejada (30–40%)
= PREÇO FINAL
```
Exemplo (Frango à Parmegiana): custo base R$ 10,50 + ajustes → custo total
R$ 13,66 + margem 35% → preço R$ 21,00. **Validação:** CMV 10,50/21,00 = 50% ⚠️ —
mostra que precificar só "por cima do custo" pode estourar o CMV; reavaliar.

---

## 7. Indicadores de desempenho

| Indicador | Fórmula | Meta |
|-----------|---------|------|
| Prime Cost | (CMV + CMO) ÷ Receita | < 60% |
| Food Cost | (Custo Ingredientes ÷ Faturamento) × 100 | 25–35% |
| Custo Operacional % | Custos Operacionais ÷ Receita | 25–30% |
| Giro de Estoque | Faturamento ÷ Estoque Médio | quanto maior, menos desperdício |
| Ponto de Equilíbrio | Custos Fixos ÷ Margem de Contribuição | — |

**Break-even exemplo:** custos fixos R$ 10.000, margem de contribuição média 40%
→ 10.000/0,40 = **R$ 25.000/mês** para não ter prejuízo.

### Food Cost × CMV × Prime Cost (distinção)
- **Food Cost:** só ingredientes ÷ preço; foco em eficiência de compras.
- **CMV:** ingredientes + custos indiretos, considera estoque inicial/final.
- **Prime Cost:** ingredientes + mão de obra; foco nos custos diretos da operação.

> **Atenção (por item vs global):** uma média global de food cost (ex.: 32%) pode
> mascarar pratos ruins (50%) compensados por ótimos (15%). Analisar **por item**
> além do global.

### Benchmarks adicionais
- **Markup por segmento:** à la carte 2,5–3,5x · fast food 2–3x · confeitaria
  10–30x · bebidas 3–5x · café 3–4x.
- **Food cost por segmento:** casual 28–35% · fine dining 25–35% · fast casual
  25–32% · cafeterias 25–35% · pizzarias 25–32%.

---

## 8. Exemplo aplicado — Nobre Bistrô (junho/2026)

```
Faturamento: R$ 50.000

CMV:  R$ 15.000 (30%)   ✓ ideal
  Carne/proteínas 8.000 · grãos/verduras 3.500 · laticínios 2.000 · bebidas 1.500
CMO:  R$ 14.300 (~28,6%) ✓ bom
  Chef (Breno) 5.000 + enc. · cozinheiro 3.000 + enc. · ajudante 2.000 + enc.

PRIME COST ≈ 58,6%   ✓ excelente (< 60%)

Custos Operacionais: R$ 12.500 (25%) — aluguel (Osasco) 5.000, contas 2.000,
  manutenção 1.500, marketing/delivery 2.000, administrativo 2.000
Lucro Bruto: R$ 8.200 (16,4%)
Impostos (ME/Simples): R$ 2.500 (5%)
LUCRO LÍQUIDO: R$ 5.700 (11,4%)  ✓ acima do padrão TRA (10%)
```

---

## 9. Casos práticos (playbook de ações corretivas)

- **CMV alto (45%):** revisar fichas/desperdício, treinar porcionamento, auditar
  fornecedores, subir preço 10–15%, substituir ingredientes. Meta: voltar a ~33%.
- **CMO inchada (35%):** auditar quadro/cargos, salários vs mercado, reduzir hora
  extra (escala), terceirizar limpeza/manutenção. Meta: ~28%.
- **Precificação errada (Moqueca, CMV 68%):** revisar receita, ingredientes
  alternativos, subir preço moderadamente, ou remover do cardápio se vende pouco.

---

## 10. Roteiro de implementação (do material)
1. Montar fichas técnicas (3 abas) por receita.
2. **Controlar Prime Cost semanal** (segunda): CMV da semana (EI+compras−EF) + CMO
   ÷ faturamento; se > 60%, investigar.
3. **Indicadores mensais:** Prime Cost geral, CMV por categoria, CMO/faturamento,
   custos operacionais, lucro líquido.
4. **Ações corretivas** quando Prime Cost > 60%.

---

## 11. Implicações de produto (acréscimos a partir desta nota)
Além do motor de ficha técnica (notas 01/02), o sistema deve abranger o **nível
financeiro do negócio**:

- **Multi-estabelecimento:** modelar `Estabelecimento` (Nobre Bistrô, Úrica
  Maison, Sushi Boys) com benchmarks e DRE por unidade, e visão consolidada.
- **Folha de pagamento (CMO):** funcionários, salário, encargos (%), benefícios →
  CMO mensal por estabelecimento.
- **Lançamentos financeiros:** faturamento, compras, estoque inicial/final,
  custos operacionais (fixos/variáveis/periódicos), impostos.
- **Dashboard de indicadores:** Prime Cost, CMV teórico × real, Food Cost, custo
  operacional %, giro de estoque, ponto de equilíbrio, lucro líquido.
- **DRE no modelo TRA** com comparação contra benchmark (alertas quando fora da
  meta — por segmento/estabelecimento).
- **Periodicidade:** rotinas semanais (Prime Cost) e mensais (DRE completo).
- **Precificação por meta de CMV** e por "full cost + margem", já validando CMV
  resultante.

---

## Referências e fontes
- Livro: *Tecnologias Gerenciais de Restaurantes* — Marcelo Trad Fonseca.
- Metodologia: **TRA (Texas Restaurants Association)**.
- Blog do autor; benchmarks Menu Control, Saipos, Sebrae; estudos Univ. do Porto.
