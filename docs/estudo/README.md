# 📚 Base de Conhecimento — Estudo para Novo Projeto

Consolidação dos materiais de estudo enviados, organizada para servir de
referência conceitual e de especificação para um novo módulo/projeto de
**Gestão de Custos (Ficha Técnica + CMV)** no contexto do Nobre Bistro.

Última atualização: 2026-06-29.

## Documentos

| Doc | Conteúdo | Natureza |
|-----|----------|----------|
| [`01-cmv-e-ficha-tecnica.md`](./01-cmv-e-ficha-tecnica.md) | CMV Fundamentos (curso) + apresentação "CMV Ferramenta Aplicada" (Érika Guedes) + planilha dos Bastones di Cogumelos | **Conceitual / teórico** (nível prato) |
| [`02-tecnologias-gerenciais-3-abas.md`](./02-tecnologias-gerenciais-3-abas.md) | Livro "Tecnologias Gerenciais de Restaurantes" (Marcelo Trad Fonseca), compilado em MD + JSON | **Especificação prática (3 abas, fórmulas, benchmarks)** (nível prato) |
| [`03-prime-cost-cmo-modelo-tra.md`](./03-prime-cost-cmo-modelo-tra.md) | Guia completo do mesmo livro (metodologia TRA): Prime Cost, CMO, custos operacionais, DRE, indicadores | **Gestão financeira do negócio** (nível DRE/empresa) |

## Materiais originais recebidos
1. `Bastones_di_Cogumelos__fatima.xlsx` — ficha técnica preenchida (exemplo).
2. `CMV Fundamentos — eBook Ficha Técnica` (PDF) — teoria.
3. `Ficha Técnica — Apresentação CMV` (PDF) — CMV teórico × real e fórmulas.
4. `LIVRO_REFERENCIA_CLAUDE_CODE.md` — spec de sistema de 3 abas.
5. `LIVRO_DADOS_ESTRUTURADOS.json` — mesma spec em dados estruturados.
6. `LIVRO_COMPLETO_PRIME_COST_E_TUDO.md` — guia completo (Prime Cost, CMO, TRA).

## 🎯 Escopo do projeto (revelado nos materiais)
- **Multi-estabelecimento:** o material 03 cita explicitamente **Nobre Bistrô +
  Úrica Maison + Sushi Boys** → o sistema deve suportar várias unidades (com DRE
  e benchmarks por unidade + visão consolidada).
- **Dois níveis de gestão:**
  - **Prato/ficha técnica** (notas 01 e 02): custeio e precificação unitária.
  - **Negócio/DRE** (nota 03): Prime Cost, CMO, custos operacionais, lucro
    líquido, indicadores — modelo financeiro TRA.

---

## Síntese: o que os materiais convergem

Todas as fontes apontam para o mesmo núcleo:

- **Ficha técnica** como documento base de padronização e custeio.
- Dois "lados" da ficha: **operacional** (cozinha/padrão) e **gerencial**
  (custos/precificação).
- **CMV** como indicador-chave do DRE, com duas medições:
  - **Teórico** (a partir das fichas técnicas);
  - **Real** (`Estoque Inicial + Compras − Estoque Final`), comparado ao teórico
    para detectar perdas/desvios.
- Fórmulas de custeio essencialmente idênticas: custo unitário → custo total →
  custo por porção → CMV % → margem de contribuição/bruta → markup.
- Necessidade de **subfichas/processados** (insumos produzidos na casa) e de um
  **histórico de preços de compra** alimentando os custos.

---

## ⚠️ Pontos a reconciliar no projeto (divergências entre as fontes)

1. **Tratamento de peso bruto x líquido / fator de correção:**
   - Material 01 (apresentação) modela explicitamente `Peso Líquido`,
     `Rendimento %` e `Fator de Correção`, derivando o peso bruto.
   - Material 02 (livro) recomenda a simplificação: **sempre lançar o peso bruto**
     na ficha e tratar o FC como opcional.
   - **Decisão sugerida:** suportar os dois — campo de FC/rendimento opcional por
     ingrediente, com peso bruto como base do custo. (Cobrir os dois fluxos evita
     retrabalho.)

2. **Nomenclatura de margem:**
   - Material 01 usa **Margem de Contribuição** (preço − custo da porção).
   - Material 02 usa **Margem Bruta** (mesma conta).
   - São o mesmo cálculo neste nível; padronizar o rótulo na UI.

3. **Faixa de validação de CMV:**
   - Geral: 25–40% (Abrasel).
   - Mas o material 02 traz **benchmarks por segmento** (bar < 25%, confeitaria
     5–25%, self-service até 42%). O alerta de CMV deve idealmente considerar a
     **categoria do prato**, não um range único.

4. **Markup × Margem:** atenção ao alerta crítico do material 02 — não confundir
   markup (multiplicador) com margem (%). Importante para a UI de precificação.

---

## Implicações de produto (consolidado)

Entidades/recursos que os materiais sugerem para o novo módulo:

**Nível prato (notas 01 e 02):**
- **Insumo** + **Histórico de Preços de Compra** (Aba 3): preço pago, qtd da
  embalagem, unidade base, fornecedor, data → custo unitário automático.
- **Ficha Técnica** com modo gerencial (custos) e operacional (preparo) sobre a
  mesma receita.
- **Subficha/Processado** reutilizável como ingrediente de outra ficha
  (composição recursiva).
- **Motor de cálculo em cascata:** custo unitário → custo total → custo/porção →
  CMV % → margem → markup → preço psicológico.
- **Simulador de precificação** por meta de CMV (ex.: 25%–45%, como na planilha
  dos bastones), por benchmark de segmento e por "full cost + margem".
- **Comparativo CMV Teórico × Real** com relatório de quebra/desperdício/CMV
  indireto.
- **Validações:** preço > custo; Margem % + CMV % = 100%; unidades consistentes;
  alerta de CMV fora da faixa (idealmente por categoria).

**Nível negócio/DRE (nota 03):**
- **Estabelecimento** (Nobre Bistrô, Úrica Maison, Sushi Boys) como entidade raiz
  multi-unidade, com benchmarks e DRE por unidade + consolidado.
- **Folha de pagamento (CMO):** funcionários, salário, encargos %, benefícios →
  CMO mensal.
- **Lançamentos financeiros:** faturamento, compras, estoque inicial/final,
  custos operacionais (fixos/variáveis/periódicos), impostos.
- **Dashboard de indicadores:** Prime Cost (< 60%), CMV teórico × real, Food
  Cost, custo operacional %, giro de estoque, ponto de equilíbrio, lucro líquido.
- **DRE modelo TRA** com alertas quando fora da meta, por segmento/unidade.
- **Rotinas periódicas:** Prime Cost semanal e DRE completo mensal.

> Quando formos iniciar o projeto, decidir: **módulo dentro do Nobre Bistro**
> (que já tem admin, cardápio e engenharia de cardápio/BCG) **ou projeto
> separado**. Os documentos acima cobrem a base conceitual e a especificação
> funcional para qualquer das opções.
