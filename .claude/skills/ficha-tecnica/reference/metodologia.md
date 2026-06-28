# Metodologia — Fichas Técnicas

Base: "Tecnologias Gerenciais de Restaurantes" (Marcelo Trad Fonseca).
Aplicar a teoria, **sem citações diretas do livro**.

## Conversão de medidas (Aba 1 — técnica)

```
1 colher de chá  = 5 ml
1 colher de sopa = 15 ml
1 xícara         = 240 ml
1 grama          = 1 g (1:1)
1 pitada         ≈ 1 g
```

A **Aba 2 (Receita Operacional)** mantém as unidades domésticas originais
(xícara, colher, ml, un, pitada). NÃO converter na Aba 2.

## Índice de aproveitamento (Aprov.)

Fração aproveitada após limpeza/descarte. `Qtd. Bruta = Qtd. Líquida / Aprov.`

```
Alface ...................... 0.75  (25% descarte)
Batata / legumes c/ casca ... 0.90  (10% descarte)
Fruta com sementes .......... 0.80
Carne com osso/aparas ....... 0.85
Padrão (sem descarte) ....... 1.00
```

## Fórmulas (todas dinâmicas no Excel)

```
Qtd. Líquida     = Qtd. Bruta * Aprov.      (no template: B = C/D, ver nota)
Qtd. Bruta       = Qtd. Líquida / Aprov.
Custo Total ing. = Custo Unit. * Qtd. Bruta
TOTAL CUSTO      = SOMA(custos totais)
CMV %            = (TOTAL CUSTO / Preço de Venda) * 100
Margem Bruta R$  = Preço de Venda - TOTAL CUSTO
Margem Bruta %   = (Margem Bruta R$ / Preço de Venda) * 100
Markup           = Preço de Venda / TOTAL CUSTO
Custo por Porção = TOTAL CUSTO / Nº Porções
Preço Psicológico= INT(Preço de Venda) - 0,10   (termina em ,90)
```

Nota: no gerador, o usuário informa a **Qtd. Bruta** (a comprada). A planilha
deriva a Qtd. Líquida pela Aprov. e o Custo Total usa a Qtd. Bruta.

## Metas de CMV por tipo de estabelecimento

```
Fast Food ............... 25-30%
Restaurante Casual ...... 28-33%   <- Nobre Bistrô
Fine Dining ............. 30-35%
Padaria/Confeitaria ..... 30-40%
Sushi / japonês ......... 30-35%   <- Sushi Boys
```

Markup equivalente: CMV 25% → 4,0x | CMV 30% → 3,33x | CMV 35% → 2,86x.

## Prime Cost (quando houver folha)

```
Prime Cost % = (CMV + Folha de Pagamento) / Faturamento Total
Meta: 60% no máximo  (ex.: CMV 30% + Folha 30%)
```

## Psicologia de preço

- Terminar em **,90** (ou ,99) — parece mais barato que o inteiro seguinte.
- Âncora: mostrar preço anterior ("Era R$ 50, agora R$ 35").
- Premium: justificar com qualidade/exclusividade (prato do chef, importado).
- SEMPRE deixar um campo "Preço Esperado (Pesquise no mercado)".

## Padrão visual (tema Nobre Bistrô)

```
Cabeçalho do título .... fundo verde escuro #2D5016, fonte branca, Arial 14 bold
Headers de tabela ...... fundo verde claro #90EE90, fonte branca, bold
Células de fórmula ..... fundo amarelo claro #FFFFCC
Conteúdo ............... Calibri 11
Rodapé ................. "Elaborado por: [Nome] | Data: [Data]" + "Próxima revisão"
```

## No chat, ao entregar

Mencionar sempre: CMV % com a meta recomendada, margem R$/%, markup, custo por
porção e preço psicológico. Lembrar que custos de mercado são estimativas a
confirmar na Tabela de Preços.
