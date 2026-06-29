# Estudo: CMV e Ficha Técnica — Base de Conhecimento

> Documento de referência consolidado a partir do material de estudo enviado.
> Data de consolidação: 2026-06-29.
> Objetivo: servir de base conceitual e de fórmulas para um novo projeto/módulo
> de gestão de custos (Ficha Técnica + CMV) no contexto do Nobre Bistro.

## Fontes analisadas

1. **`Bastones_di_Cogumelos__fatima.xlsx`** — planilha de Ficha Técnica preenchida
   (exemplo prático de um petisco).
2. **`CMV Fundamentos — eBook Ficha Técnica` (PDF)** — material teórico do curso
   "CMV Fundamentos" da Escola de Gestão em Negócios da Gastronomia
   (professores Ivan Achcar e Rubens Oliveira; coord. Roberta Shmidt).
3. **`Ficha Técnica — Apresentação CMV` (PDF)** — apresentação "CMV Ferramenta
   Aplicada" da Érika Guedes (gastronomia Anhembi Morumbi, pós em finanças FGV,
   ex-NaMesa Consultoria, Le Jazz Brasserie).

---

## 1. Conceitos fundamentais

### Ficha Técnica
Documento que registra as receitas e preparações de um restaurante. É o ponto de
partida para a **precificação** dos produtos e para aferir o **CMV** (Custo da
Mercadoria Vendida). Cada produto deve ter sua própria ficha (entradas, pratos
principais, acompanhamentos, sobremesas, bebidas, etc.).

### Dois tipos de Ficha Técnica

| Tipo | Foco | Conteúdo |
|------|------|----------|
| **Operacional** ("receituário") | Padrão de produção (cozinha) | Ingredientes, medidas, utensílios, equipamentos, modo de preparo, sequência de montagem, medida caseira, validade, frequência e tempo de preparo |
| **Gerencial** | Custos / precificação | Custos unitários e totais dos itens, peso bruto/líquido, rendimento, fator de correção, custo da porção, CMV %, preço de venda, margem de contribuição |

### Categorias de ficha (na prática)
- **Montagem de prato** = receita de cardápio (o item que o cliente compra).
- **Processados / Subficha** = receita de produção (insumos intermediários
  produzidos na casa: molhos, blends, massas, recheios, etc.).

### Itens que não podem faltar numa ficha técnica
- Nome técnico do prato
- Nome de venda do prato
- Data da última atualização
- Classificação (entrada, prato principal, sobremesa, etc.)
- Ingredientes
- Unidade de medida de cada item (kg, litro, unidade)
- Custo unitário dos itens
- Custo total

---

## 2. CMV — Custo da Mercadoria Vendida

> É descrito como **o índice mais importante do DRE** de um restaurante.

### CMV Teórico (via ficha técnica)
Calculado a partir das fichas técnicas: para cada produto, custo x quantidade
vendida, comparado ao total de vendas.

Exemplo da apresentação:

| Produto | Quant. | Custo | Preço Venda | Custo Total | Total Venda | CMV Teórico |
|---------|-------:|------:|------------:|------------:|------------:|------------:|
| Batata frita | 100 | R$ 4,00 | R$ 14,00 | R$ 400,00 | R$ 1.400,00 | 29% |
| Burger | 50 | R$ 7,00 | R$ 22,00 | R$ 350,00 | R$ 1.100,00 | 32% |
| **TOTAL** | | | | **R$ 750,00** | **R$ 2.500,00** | **30%** |

### CMV Real (consumo)
Fórmula:
```
CMV Real = Estoque Inicial + Compras − Estoque Final
```
Exemplo (Janeiro):
- Faturamento: R$ 380.000
- Estoque inicial (31/12/2020): R$ 24.000
- Compras (Janeiro): R$ 125.000
- Estoque final (30/01/2021): R$ 19.000
- CMV = 24.000 + 125.000 − 19.000 = **R$ 130.000 → 34%**

### Por que comparar Teórico x Real
A diferença entre os dois revela perdas e problemas. No exemplo da apresentação,
o CMV teórico total foi **29,0%** e o real **34,3%** — uma **quebra de ~5,3%**.
Detalhado em desperdício, CMV indireto e quebra geral.

### Causas de divergência (auditoria)
- Recebimento inadequado (sem conferência / espelho de pedido)
- Entrada de nota errada (cadastros errados)
- Desperdício na produção
- Desvios (furtos)
- CMV indireto (mise en place de salão, gordura da fritadeira, etc.)
- Fichas técnicas erradas

---

## 3. Fórmulas de cálculo (referência canônica)

Conjunto de fórmulas extraído da apresentação (slide "CÁLCULOS"):

```
Rendimento (%)            = Quant. Líquida / Quant. Bruta
Fator de correção (FC)    = Quant. Bruta  / Quant. Líquida
Peso/Valor Bruto          = Quant. Líquida × FC
                            (se em rendimento: FC = 1 / rendimento)
Peso/Valor Líquido        = Quant. Bruta × Rendimento
                            (se em FC: Quant. Bruta / FC)
Custo (do ingrediente)    = Custo do ingrediente × Quant. Bruta
Custo Total               = Soma de todos os custos dos ingredientes
Preço do Kg               = Custo Total / Peso final da preparação
Custo da Porção           = Custo Total / Número de porções
CMV (%)                   = Custo da Porção / Preço de Venda
Margem de Contribuição($) = Preço de Venda − Custo da Porção
Margem de Contribuição(%) = MC($) / Preço de Venda
```

### Rendimento vs. Fator de correção
- **Rendimento**: percentual que efetivamente se utiliza; exclui as perdas de
  limpeza no pré-preparo.
- **Fator de correção**: relação entre quantidade bruta e líquida; permite
  avaliar perdas das aparas no pré-preparo.
- Relação: `FC = 1 / Rendimento`. Ex.: rendimento de 50,1% ⇔ FC de 1,99.

### Dúvidas comuns deixadas em aberto no material (para decidir no projeto)
- Embalagem deve entrar na ficha técnica?
- Como tratar itens de CMV indireto (mise en place de salão, gordura de
  fritadeira)?
- Tabela padrão de fator de correção: usar ou medir na casa?
- Ovo tem fator de correção?
- Peça de carne com vários cortes: como ratear o fator de correção?

---

## 4. Exemplo prático — Ficha "Espaguete ao Molho de Tomates Frescos"
(modelo gerencial completo da apresentação, classificação "Pratos Kids")

| Cod | Ingrediente | Und | Peso Líq | Rend% | Peso Bruto | Unit. Bruto (R$) | Custo (R$) |
|-----|-------------|-----|---------:|------:|-----------:|-----------------:|-----------:|
| 203 | Espaguete porcionado | KG | 0,230 | 100% | 0,230 | 1,74 | 0,40 |
| 207 | Molho sugo | KG | 0,190 | 100% | 0,190 | 35,68 | 6,78 |
| 205 | Queijo parmesão em peça | KG | 0,002 | 90% | 0,002 | 150,00 | 0,30 |
| 209 | (azeite/óleo) | LT | 0,005 | 71% | 0,007 | 30,00 | 0,21 |

- **Custo Total**: R$ 7,69
- Peso final da preparação: 0,350 kg · Nº de porções: 1
- Custo da porção (CMV $): R$ 7,69 · Custo/kg: R$ 21,97
- Índice de CMV: **25,6%**
- Preço de venda: R$ 30,00
- Margem de contribuição: R$ 22,31 (**74%**)

Campos operacionais que acompanham a ficha: equipamentos necessários, utensílios,
modo de preparo numerado, sequência de montagem, foto do prato, medida caseira,
validade, frequência e tempo de preparo.

---

## 5. Exemplo prático — Planilha "Bastones di Cogumelos" (XLSX)

Petisco (classificação: petisco · setor: Alimentos e Bebidas).
- **Tamanho da receita**: 1 porção · **Tamanho da porção**: 240 g.
- Estrutura de colunas da planilha: `Ingredientes | Qtd. Líquida | Und. |
  Aprov. (rendimento) | Qtd. Bruta | Custo Bruto Unitário | Custo Total |
  Observações`.
- Campos de saída (ainda zerados no arquivo, pois faltam preços de compra):
  Preço de venda por receita, Preço de venda por porção, Preço de custo por
  porção, Preço de custo por receita.

### Ingredientes (Qtd. Líquida em Kg/L/Und e aproveitamento)
Massa/recheio:
- Farinha de trigo 0,0429 kg (aprov. 1,0)
- Batata 0,0357 kg (aprov. **0,85**)
- Óleo 0,0143 L · Água 0,0714 L
- Mussarela 0,0357 kg · Manteiga 0,0036 kg
- Shiitake 0,0071 kg · Shimeji preto 0,0071 kg · Porcini desidratado 0,0071 kg ·
  Portobelo 0,0071 kg
- Sal 0,0036 kg · Pimenta 0,0036 kg

Empanamento:
- Farinha de trigo 0,0714 kg · Ovo 0,714 un · Farinha de rosca 0,0714 kg ·
  Óleo (fritura) 0,214 L

### Modo de preparo
**Massa:** 1) cozinhar a batata até purê; 2) acrescentar óleo; 3) aquecer a água,
diluir a farinha e juntar tudo até homogêneo; 4) enrolar em papel filme e
refrigerar até esfriar.
**Recheio:** 1) cortar cogumelos em pedaços pequenos e refogar na manteiga;
2) ajustar temperos; 3) processar a mussarela fina e misturar com o refogado.
**Montagem:** 4) fazer bastones com 40 g de massa + 20 g de recheio;
5) empanamento padrão; 6) fritar a 190 ºC; 7) servir 4 unidades por porção.

### CMV projetados (cenários de meta listados na planilha)
0,25 · 0,30 · 0,35 · 0,40 · 0,45 (ou seja, simular preço de venda para metas de
CMV de 25% a 45%).

---

## 6. Vantagens da Ficha Técnica (porque vale implementar)
- Registro das receitas do estabelecimento
- Padronização dos pratos independente de cozinheiro/turno
- Controle de custos do cardápio e de processos de produção
- Diminui perdas na cozinha
- Facilita treinamento de novos funcionários
- Facilita lista de insumos correta e o trabalho do setor de compras
- Permite comparar consumo × venda (CMV teórico × real)
- Ajuda no controle de desvios
- Possibilita engenharia de cardápio
- Gera informações para análise e tomada de decisão

### Por que poucos têm fichas técnicas
Demanda tempo, é trabalhoso, exige análise minuciosa, implantação de melhorias
com engajamento da equipe e manutenção/amostragens periódicas.

---

## 7. Roteiro de implantação (passo a passo da apresentação)
1. **Definir o formato** da ficha (tenho sistema? quero custo e receituário?).
2. **Analisar o cardápio** e listar todos os pratos que terão ficha.
3. **Listar fichas técnicas** (montagem de prato + subfichas/processados).
4. **Cronograma de execução** (classificação, produções, datas, responsável).
5. **Definir responsáveis** por setor (cozinha e bar).
6. **Executar as fichas** no setor de produção (precisa de **balança de
   precisão**; usar modelo base; executar a receita inteira para ter rendimento
   real).
7. **Elaborar lista de insumos** com base nas fichas; cadastrar fator de correção;
   conferir unidade de medida × entrada de nota × conversões × preço.
8. **Passar a limpo** para a ferramenta escolhida (sistema, Excel ou receituário).
9. **Manutenção periódica** via amostragens (a cada ~6 meses).

> Obs.: em estabelecimentos novos, as fichas devem ser elaboradas previamente
> (receita) e ajustadas na fase de degustação/aprovação do cardápio.

### Dicas operacionais
- Para drinks, pode-se usar água no lugar das bebidas alcoólicas na execução.
- Para o receituário, adotar **medida caseira padrão**.
- Ao usar sistema de gestão, verificar: há campo para peso bruto e líquido? A
  baixa de estoque é feita a partir de qual informação? As subfichas são
  contabilizadas ou exigem entrada de produção no sistema?

---

## 8. Implicações para o novo projeto (notas de produto)
Pontos que este material sugere modelar no software:

- **Entidade Ficha Técnica** com dois "modos" (operacional e gerencial) sobre a
  mesma receita.
- **Subfichas/processados** reutilizáveis como insumos de outras fichas
  (composição recursiva: uma ficha pode conter outra ficha como ingrediente).
- Por ingrediente: `qtd. líquida`, `unidade`, `rendimento%`/`fator de correção`,
  `qtd. bruta` (derivada), `custo unitário bruto`, `custo total` (derivado).
- Cálculos automáticos: custo total, custo/kg, custo da porção, CMV%, margem de
  contribuição ($ e %).
- **Simulador de precificação** por meta de CMV (ex.: gerar preço de venda para
  CMV alvo de 25%–45%, como na planilha dos bastones).
- **Comparativo CMV Teórico × Real** (real a partir de estoque inicial + compras
  − estoque final) e relatório de quebra/desperdício/CMV indireto.
- Campos operacionais: equipamentos, utensílios, modo de preparo, sequência de
  montagem, foto, medida caseira, validade, tempo/frequência de preparo,
  responsável.
- Cadastro de insumos integrado a compras (unidade de medida, conversões, preço,
  fator de correção).

---

## Referências bibliográficas (citadas no material)
1. *Gestão da gastronomia: custos, formação de preços, gerenciamento e
   planejamento do lucro* — Roberto M. M. Braga. São Paulo: Senac, 2008.
2. *Tecnologias gerenciais de restaurantes* — Marcelo Traldi Fonseca. São Paulo:
   Senac, 1999.
3. *Menu: como montar um cardápio eficiente* — Frederico Vasconcellos, Eudemar
   Cavalcanti, Lourdes Barbosa. São Paulo: Roca, 2002.
