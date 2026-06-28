# Formato do JSON de entrada do gerador

O script `scripts/gerar_ficha_tecnica.py` recebe um JSON com a receita
estruturada. Campos:

```jsonc
{
  "prato": "Pudim Úrica Maison",          // obrigatório
  "classificacao": "sobremesa",            // petisco/entrada/prato/sobremesa
  "setor": "Alimentos e Bebidas",
  "porcoes": 8,                            // nº de porções da receita
  "tamanho_porcao_g": 120,                 // gramas por porção
  "tempo_preparo_min": 60,
  "preco_venda": 4.90,                     // preço de venda (R$). 0 se indefinido
  "preco_esperado_mercado": 5.00,          // pesquisa de mercado. 0 se indefinido
  "elaborado_por": "Breno",

  // Aba 1 (técnica) + Aba 3 (tabela de preços). Cada item vira uma linha nas duas.
  "ingredientes": [
    {
      "nome": "Leite Condensado",
      "unidade": "un",                     // kg / L / un
      "aprov": 1.00,                       // índice de aproveitamento (0-1)
      "qtd_bruta": 1,                      // quantidade comprada/usada
      "custo_unit": 4.50,                  // preço por unidade (vai p/ Aba 3)
      "fornecedor": "Fornecedor A",        // opcional (Aba 3)
      "data_compra": "10/06/2026",         // opcional (Aba 3)
      "obs": ""                            // opcional (Aba 3)
    }
  ],

  // Aba 2 (operacional) — unidades DOMÉSTICAS, sem custo. Lista própria porque
  // as medidas de cozinha diferem das de compra (ex.: "2 xícaras" vs "0.3 kg").
  "ingredientes_operacional": [
    { "nome": "Leite condensado", "quantidade": "1", "unidade": "lata (395g)" },
    { "nome": "Leite fresco",     "quantidade": "600", "unidade": "ml" },
    { "nome": "Ovos",             "quantidade": "3", "unidade": "unidades" }
  ],

  "modo_preparo": [
    "Bata todos os ingredientes no liquidificador.",
    "Despeje na forma caramelizada.",
    "Asse em banho-maria por 60 min."
  ],

  "dicas": [
    "Ponto ideal: espeta um palito e sai limpo."
  ],

  "validade": { "geladeira_dias": 5, "freezer_dias": 30 }
}
```

## Regras

- Se `preco_venda` for 0, a planilha ainda é gerada; CMV/margem aparecem como
  erro até preencher. Prefira perguntar o preço ao usuário, ou sugerir a partir
  de CMV 30% (`preco = custo_total / 0.30`).
- `ingredientes` (Aba 1) e `ingredientes_operacional` (Aba 2) são listas
  separadas e podem diferir — é o esperado (compra vs. cozinha).
- A coluna **Custo Unit.** da Aba 1 é gerada como **VLOOKUP** na aba
  `Tabela Preços Dinâmica`, então editar o preço lá recalcula a Aba 1.
- Campos opcionais omitidos recebem valores em branco/padrão.

## Exemplo mínimo

```json
{
  "prato": "Brigadeiro Gourmet",
  "classificacao": "sobremesa",
  "porcoes": 30,
  "tamanho_porcao_g": 20,
  "preco_venda": 0,
  "ingredientes": [
    {"nome": "Chocolate em pó", "unidade": "kg", "aprov": 1, "qtd_bruta": 0.1, "custo_unit": 35},
    {"nome": "Leite condensado", "unidade": "un", "aprov": 1, "qtd_bruta": 1, "custo_unit": 4.5},
    {"nome": "Manteiga", "unidade": "kg", "aprov": 1, "qtd_bruta": 0.05, "custo_unit": 45}
  ],
  "ingredientes_operacional": [
    {"nome": "Chocolate em pó", "quantidade": "100", "unidade": "g"},
    {"nome": "Leite condensado", "quantidade": "1", "unidade": "lata"},
    {"nome": "Manteiga", "quantidade": "1", "unidade": "colher de sopa"}
  ],
  "modo_preparo": ["Misture tudo em fogo baixo até desgrudar da panela."]
}
```
