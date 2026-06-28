---
name: ficha-tecnica
description: >-
  Cria fichas técnicas profissionais de restaurante em Excel (Nobre Bistrô /
  Sushi Boys) a partir de foto, texto ou descrição de receita. Gera SEMPRE um
  .xlsx com 3 abas — Ficha Técnica Padrão (custos/CMV/margem/markup com fórmulas
  dinâmicas), Receita Operacional (unidades domésticas, sem custos) e Tabela de
  Preços Dinâmica — calculando CMV, margem bruta, markup, custo por porção e
  preço psicológico. Use esta skill SEMPRE que o usuário pedir "ficha técnica",
  "ficha tecnica", "custo de prato/receita", "precificar prato", "CMV de uma
  receita", ou enviar foto/texto de receita para análise de custo. Também use
  para atualizar preços de ingredientes e recalcular fichas existentes.
---

# Skill: Ficha Técnica Automática (Técnicas Gerenciais de Restaurante)

Padrão de criação de fichas técnicas para o **Nobre Bistrô** e **Sushi Boys**,
baseado em "Tecnologias Gerenciais de Restaurantes" (Marcelo Trad Fonseca).
Esta é a forma **padrão e única** de produzir fichas técnicas neste projeto —
siga-a sempre, sem improvisar formato.

## Quando usar (gatilhos)

Acione automaticamente quando o usuário:
- Pedir "ficha técnica" / "ficha tecnica" de qualquer prato.
- Enviar **foto** de uma receita escrita (usar visão para extrair tudo).
- **Colar o texto** de uma receita.
- **Descrever verbalmente** uma receita ("quero fazer um bolo com...").
- Pedir para **precificar**, calcular **CMV**, **margem** ou **custo** de um prato.
- Pedir para **atualizar preços** de ingredientes e recalcular.

## Entregável obrigatório

SEMPRE entregar **um arquivo `.xlsx`** com exatamente **3 abas**, nesta ordem:

1. **`Ficha Técnica Padrão`** — gestão/custo. Ingredientes com Qtd. Líquida,
   Und., Aprov., Qtd. Bruta, Custo Unit., Custo Total, e bloco de cálculos
   (CMV %, Margem R$/%, Markup, Custo por Porção, Psicologia de Preço). Todas as
   fórmulas são **dinâmicas** (Excel recalcula ao mudar qualquer valor).
2. **`Receita Operacional`** — para a cozinha. Ingredientes em **unidades
   domésticas** (xícara, colher, ml, un) e Modo de Preparo. **SEM custos.**
3. **`Tabela Preços Dinâmica`** — preços dos ingredientes por compra. A coluna
   "Custo Unit." da Aba 1 faz **VLOOKUP** nesta aba: mudou o preço aqui →
   CMV/margem/markup da Aba 1 recalculam sozinhos.

## Fluxo de trabalho

1. **Extrair a receita** (foto → visão / texto / descrição): nome, classificação
   (petisco/entrada/prato/sobremesa), ingredientes com quantidade e unidade,
   modo de preparo, nº de porções, tamanho da porção (g).
2. **Normalizar medidas** para a ficha técnica (ver
   `reference/metodologia.md`): 1 colher chá = 5 ml, 1 colher sopa = 15 ml,
   1 xícara = 240 ml. Aba 1 usa kg/L/un; Aba 2 mantém unidades domésticas.
3. **Aplicar índice de aproveitamento** (Aprov.) por ingrediente — padrão 1.00.
4. **Preencher custos** dos ingredientes (preços de mercado se o usuário não
   informar; deixar claro que são estimativas a confirmar).
5. **Perguntar o preço de venda esperado** se ainda não souber — necessário para
   CMV, margem e markup. Se o usuário não souber, sugerir a partir de CMV 30%.
6. **Gerar o Excel** com o script (ver abaixo) e **entregar o arquivo** ao
   usuário com `SendUserFile`.
7. **Resumir no chat**: CMV % (com a meta recomendada por tipo), margem R$/%,
   markup, custo por porção e preço psicológico sugerido. Não citar o livro
   diretamente — apenas aplicar a teoria ("meta de gestão profissional: 28-33%").

Para **atualizar preços**: editar a aba `Tabela Preços Dinâmica`, deixar a Aba 1
recalcular pelo VLOOKUP, reentregar o arquivo e mostrar o novo CMV/margem/lucro.

## Como gerar o arquivo

Use o gerador (cobre todas as 3 abas, fórmulas e estilo). Monte um JSON com os
dados da receita e rode:

```bash
python3 .claude/skills/ficha-tecnica/scripts/gerar_ficha_tecnica.py \
  --dados /caminho/para/receita.json \
  --saida "Ficha_Tecnica_<Prato>.xlsx"
```

O formato do JSON, todos os campos e exemplos estão em
`reference/formato_dados.md`. As fórmulas, metas de CMV, conversões e o padrão
visual estão em `reference/metodologia.md`. Leia esses dois arquivos antes de
gerar a primeira ficha de uma sessão.

Se precisar inspecionar o layout original, o template de referência está em
`assets/Template_Ficha_Tecnica_Automatica.xlsx`.

## Checklist de entrega (não pular nada)

- [ ] Arquivo `.xlsx` com as 3 abas na ordem correta.
- [ ] Aba 1 com fórmulas dinâmicas funcionando (Qtd. Líq., Qtd. Bruta, Custo
      Total, CMV %, Margem R$/%, Markup, Custo/Porção).
- [ ] Custo Unit. da Aba 1 referenciando a Tabela de Preços (VLOOKUP).
- [ ] Aba 2 sem custos, só unidades domésticas + modo de preparo.
- [ ] Aba 3 preenchida com os ingredientes e preços usados.
- [ ] CMV calculado com a meta recomendada mencionada no chat.
- [ ] Preço psicológico (X,90) sugerido + campo de pesquisa de mercado.
- [ ] Arquivo entregue ao usuário e resumo dos números no chat.
- [ ] Estilo Nobre Bistrô: cabeçalho verde #2D5016, headers #90EE90,
      fórmulas em amarelo #FFFFCC.
