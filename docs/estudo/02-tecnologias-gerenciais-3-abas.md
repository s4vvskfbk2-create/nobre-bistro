# Estudo: Tecnologias Gerenciais de Restaurantes — Sistema de 3 Abas

> Base de conhecimento consolidada a partir de dois arquivos enviados:
> `LIVRO_REFERENCIA_CLAUDE_CODE.md` e `LIVRO_DADOS_ESTRUTURADOS.json`.
> Ambos compilam o livro **"Tecnologias Gerenciais de Restaurantes"** de
> **Marcelo Trad Fonseca** (págs. 10–348) em um formato pronto para implementação.
> Data de consolidação: 2026-06-29.

> Diferença em relação ao material anterior (`01-cmv-e-ficha-tecnica.md`): aquele
> é mais **conceitual/teórico** (curso CMV Fundamentos + Érika Guedes). Este aqui
> é a **especificação prática de produto**: define a arquitetura de 3 abas,
> fórmulas com fórmula de Excel, benchmarks por segmento e validações — é o
> material que mais se aproxima de um "spec" do novo projeto.

---

## 1. Arquitetura central: Sistema de 3 Abas

Sistema de **Ficha Técnica Universal** para gestão de custos de restaurante.
Três planilhas/telas interligadas, com cálculo em **cascata**.

### Aba 1 — Ficha Técnica Padrão (custos e rentabilidade)
**Propósito:** calcular o custo total da receita e os indicadores de rentabilidade.

- **Identificação:** Nome do prato, Código (ex.: `FT-001`), Categoria, Rendimento
  (nº de porções), Tamanho da porção.
- **Tabela de ingredientes:** `Ingrediente | Qtd na receita | Unidade | Custo
  Unitário (referencia a Aba 3) | Custo Total (= Custo Unit × Qtd)`.
- **Cálculos automáticos:** Total de Custo (SUM), Preço de Venda (input), CMV %,
  Margem Bruta R$, Margem Bruta %, Markup, Preço Psicológico.
- **Validações:** preço > 0; CMV entre 5% e 60% (alerta se >40%); Margem % + CMV %
  sempre = 100%.

### Aba 2 — Receita Operacional (padrão de cozinha)
**Propósito:** guiar a equipe no preparo padronizado.

- Ingredientes em **unidades domésticas** (xícara, colher, grama, ml).
- Modo de preparo passo a passo com tempos.
- Notas de segurança alimentar.
- Dicas de técnica e plating.
- **NÃO inclui custos** (isso fica na Aba 1).

### Aba 3 — Tabela de Preços (histórico de compras)
**Propósito:** gerenciar o custo unitário dos insumos a partir de compras reais.

- Colunas: `Ingrediente | Descrição da embalagem | Preço Pago | Quantidade |
  Unidade Base | Custo Unitário (= Preço Pago ÷ Quantidade) | Data da Compra |
  Fornecedor`.
- Funciona para **qualquer tipo de compra** (lata, kg, unidade, granel).
- O Custo Unitário alimenta automaticamente a Aba 1.
- Histórico permite rastrear evolução de preços.

---

## 2. Fluxo de dados em cascata

```
ABA 3 (Tabela Preços)
  Preço Pago ÷ Quantidade  ──►  Custo Unitário
        │
        ▼
ABA 1 (Ficha Técnica)
  Custo Unitário × Qtd da Receita  ──►  Custo Total do Ingrediente
  SUM(custos)                      ──►  Custo Total da Receita
  Custo Total ÷ Porções            ──►  Custo por Porção
  Custo por Porção ÷ Preço Venda   ──►  CMV %
  Preço Venda − Custo              ──►  Margem Bruta R$
  Margem R$ ÷ Preço                ──►  Margem Bruta %
  Preço ÷ Custo                    ──►  Markup
```

**Propagação:** alterar um preço na Aba 3 recalcula o Custo Unitário e atualiza
automaticamente tudo na Aba 1. Alterar o preço de venda na Aba 1 recalcula CMV,
Margem e Markup.

---

## 3. Fórmulas (com sintaxe Excel de referência)

| Indicador | Fórmula | Excel |
|-----------|---------|-------|
| Custo Unitário | Preço Pago ÷ Qtd da Embalagem | `=C5/D5` |
| Custo Total do Ingrediente | Custo Unitário × Qtd na Receita | `=D8*B8` |
| Custo Total da Receita | ∑ custos dos ingredientes | `=SUM(E8:E12)` |
| Custo por Porção | Custo Total ÷ Nº de Porções | `=E12/80` |
| CMV % | (Custo por Porção ÷ Preço Venda) × 100 | `=IF(C16=0,"Defina preço",(C17/C16)*100)` |
| Margem Bruta R$ | Preço Venda − Custo por Porção | `=C16-C17` |
| Margem Bruta % | (Margem R$ ÷ Preço Venda) × 100 | `=(C19/C16)*100` |
| Markup | Preço Venda ÷ Custo por Porção | `=C16/C17` |
| Preço Psicológico | INT(Preço) − 0,10 | `=INT(C16)-0.10` |

### Regra de ouro
```
Margem % + CMV % = 100%
```

### Markup ≠ Margem (alerta crítico)
- Markup 20,66x **não é** margem de 20,66%.
- Markup 2x ⇔ margem de **50%** (não 100%).
- Markup de 100% (2x) resulta em margem de apenas 50%.

### Preço psicológico
`INT(Preço) − 0,10` é uma simplificação. O ideal é terminar em `.90` ou `.99`
(ex.: R$ 10,00 → R$ 9,90).

---

## 4. Benchmarks (validação de mercado)

### CMV ideal por segmento
| Segmento | CMV |
|----------|-----|
| Restaurante à la carte | 28–35% |
| Fast food / delivery | 25–32% |
| Self-service | até 42% |
| Bar | < 25% |
| Café | 25–35% |
| Pizzaria | 25–35% |
| Padaria | 30–40% |
| Confeitaria / doces | 5–25% |

Faixa saudável geral (Abrasel): **25%–40%**. Acima de 40% → revisar ficha ou
preço. Abaixo de 25% → muito bom (típico de confeitaria).

### Margem Bruta esperada
Restaurante 60–70% · Confeitaria 75–95% · Bebidas 65–80%.

### Markup esperado
Restaurante 2,5x–3,5x · Confeitaria 10x–30x · Bebidas 3x–5x.

---

## 5. Princípios fundamentais

1. **Custo Unitário é universal:** `Custo Unitário = Preço Pago ÷ Qtd da
   embalagem`, aplicável a ovo (dúzia), leite (litro), granel (grama), lata, etc.
   **Regra de ouro:** a unidade usada na Aba 1 deve ser a mesma da Aba 3.
2. **Desperdício é matemático:** a receita usa sempre **quantidade bruta** (500g
   de abóbora com casca, não 350g). Para contabilizar perda explicitamente, usar
   Fator de Correção `FC = Peso Líquido ÷ Peso Bruto` e multiplicar o custo por
   `1 ÷ FC`. Forma mais simples recomendada pelo livro: **sempre usar peso bruto
   na ficha**.
3. **CMV é relacional** — `CMV = f(custo, preço)`:
   - Aumentar preço é mais eficaz que reduzir custo;
   - Mas ambos importam;
   - Estratégia ideal: reduzir custo **e** aumentar preço (dupla).

---

## 6. Workflow de uso

### Novo prato
1. Definir receita (nome, porções, ingredientes em qtd bruta, preparo).
2. Pesquisar custos e registrar na Aba 3 (preço pago + qtd embalagem →
   Custo Unitário automático).
3. Montar a ficha na Aba 1 (Custo Unit puxado da Aba 3; Custo Total automático;
   preencher Preço de Venda; indicadores calculam sozinhos).
4. Validar: CMV 25–40%? Margem > 60%? Preço competitivo? Markup coerente? → aprova.

### Manutenção semanal
- **Segunda (preços):** atualizar Aba 3 com novos preços → fichas atualizam; se
  CMV subiu, revisar preço de venda.
- **Quinta (auditoria):** comparar CMV teórico (Aba 1) × CMV real (estoque
  físico). Gap > 10% indica problema (treinamento, roubo, estoque mal
  registrado).

---

## 7. Exemplos resolvidos

### Brigadeiro (rende 80) — produto de baixo custo
| Ingrediente | Qtd receita | Emb. | Preço emb. | Custo Unit | Custo Total |
|-------------|------------:|-----:|-----------:|-----------:|------------:|
| Chocolate em pó | 100 g | 500 g | R$ 12,50 | 0,025/g | R$ 2,50 |
| Leite condensado | 1 lata | 1 | R$ 4,50 | 4,50 | R$ 4,50 |
| Leite fresco | 0,1 L | 1 | R$ 4,20 | 4,20 | R$ 0,42 |
| Manteiga | 50 g | 200 g | R$ 6,80 | 0,034/g | R$ 1,70 |
| Açúcar confeiteiro | 100 g | 1000 g | R$ 5,50 | 0,0055/g | R$ 0,55 |

- Custo total: **R$ 9,67** → custo/porção R$ 0,121 → preço R$ 2,50
- CMV **4,84%** · Margem **95,16%** · Markup **20,66x** · Preço psicológico R$ 2,40
- Status: aprovado (excelente).

### Frango à Parmegiana (1 prato) — refeição
- Total ingredientes: R$ 11,95 · Preço R$ 35,00
- CMV **34,14%** · Margem **65,86%** → saudável, aprovado.

### Revisar preço com CMV alto (Bolo de Chocolate)
- Custo R$ 8,50 · Preço R$ 20,00 → CMV **42,5%** (alto ⚠️).
- Opções: (1) preço R$ 25 → CMV 34%; (2) custo R$ ~7 → CMV 35%; (3) **ambos**:
  preço R$ 24 + custo R$ 7,50 → CMV 31% (recomendado).

---

## 8. Validações automáticas (para o software)
- CMV entre 25–40% (alerta fora do range).
- Margem % + CMV % = 100% (consistência matemática).
- Preço > Custo (evita preço zero/negativo).
- Unidades consistentes entre Aba 1 e Aba 3.

---

## 9. Instruções de implementação (do próprio material para o Claude Code)
1. Usar **sempre** a estrutura de 3 abas (Ficha, Operacional, Histórico).
2. Implementar as fórmulas exatamente como especificado.
3. Criar referências automáticas entre abas.
4. Adicionar validações para evitar erros comuns.
5. Incluir histórico de preços para rastreabilidade.
6. Calcular indicadores em cascata (mudança propaga).

---

## 10. Glossário
| Termo | Definição |
|-------|-----------|
| CMV | Custo de Mercadoria Vendida (% do preço que é custo de ingredientes) |
| Ficha Técnica | Documento que padroniza receita e calcula custos unitários |
| Custo Unitário | Preço por unidade de medida (R$/g, R$/L, etc.) |
| Custo Total da Receita | Soma dos custos de todos os ingredientes |
| Custo por Porção | Custo total ÷ nº de porções |
| Margem Bruta | Preço de venda − custo (lucro bruto) |
| Markup | Quantas vezes o preço é maior que o custo |
| FC (Fator de Correção) | Peso líquido ÷ peso bruto |
| Preço Psicológico | Preço que "parece" menor (R$ X,90) |

---

## Fontes e validação citadas
- Livro: *Tecnologias Gerenciais de Restaurantes* — Marcelo Trad Fonseca.
- Validação de mercado: Abrasel.
- Benchmarks: Saipos, TOTVS, Sischef, Sebrae.
- Padrões internacionais: Universidade do Porto (mestrado em Gastronomia).
