# Plano de Testes - Nobre Café Sistema de Gestão

## Status: Conectado ao banco de dados (PASSO 5 concluído)

### Alterações Recentes
- ✅ Conectado frontend ao banco de dados Supabase
- ✅ Produtos agora carregam de `public.products` com fallback para defaults
- ✅ Equipe agora carrega de `public.staff` com fallback para defaults
- ✅ Criadas funções: `loadProdsFromDB()`, `loadProfsFromDB()`, `loadProdsPrimary()`, `loadProfsPrimary()`
- ✅ Ambiente de exemplo criado em `.env.example`

---

## Fluxos Críticos para Testar (PASSO 6)

### Fluxo A: Venda no Balcão com Fiado
**Objetivo**: Verificar se o PDV (Balcão) consegue vender produtos com desconto de funcionário e registrar na conta

**Passos**:
1. Acessar `/admin` e fazer login com gerente/atendente
2. Ir para aba "Balcão"
3. Selecionar "Torta de Frango" (R$38)
4. Adicionar à sacola
5. Selecionar "Coca-Cola" (R$12)
6. Adicionar à sacola
7. Clicar em "Vendedor:" e selecionar "Alessandra Martins"
8. Verificar se desconto de 20% foi aplicado automaticamente
9. Confirmar venda
10. Verificar se a venda aparece no histórico
11. Ir para aba "Fiado" e verificar se a venda aparece na conta de Alessandra

**Esperado**:
- Subtotal: R$50,00 (38 + 12)
- Desconto 20%: R$10,00
- Total: R$40,00
- Venda salva no histórico com data/hora
- Venda apareça na conta do funcionário

**Verificações adicionais**:
- [ ] WhatsApp pode ser disparado para o funcionário com resumo
- [ ] Desconto é aplicado apenas se funcionário é do tipo "salao"

---

### Fluxo B: Criar Produto com Foto
**Objetivo**: Verificar se novos produtos podem ser criados com foto e aparecem imediatamente

**Passos**:
1. Acessar `/admin` como Gerente
2. Ir para aba "Cardápio"
3. Clicar em "Novo Produto"
4. Preencher:
   - Nome: "Bolo de Cenoura"
   - Categoria: "Sobremesa"
   - Preço: R$32
   - Custo: R$12
   - Estoque: 8
5. Selecionar uma foto (ou usar foto padrão)
6. Clicar em "Salvar"
7. Voltar para aba "Balcão" e verificar se "Bolo de Cenoura" aparece na categoria "Sobremesas"
8. Adicionar à sacola e simular venda

**Esperado**:
- Produto é criado e salvo no banco
- Foto é armazenada no Supabase Storage
- Produto aparece imediatamente no PDV
- Produto pode ser vendido

**Verificações adicionais**:
- [ ] Foto é carregada para `produtos` bucket do Supabase Storage
- [ ] Foto tem URL válida que carrega

---

### Fluxo C: Editar Preço com Histórico
**Objetivo**: Verificar se mudança de preço não afeta vendas anteriores

**Passos**:
1. Anotar o preço atual de "Risoto Brie com Parma" (R$85)
2. Fazer uma venda deste item por R$85
3. Ir para "Cardápio" e editar o preço para R$90
4. Fazer outra venda deste item
5. Verificar no histórico de vendas

**Esperado**:
- Primeira venda: R$85
- Segunda venda: R$90
- Preço antigo é preservado no histórico
- Novas vendas usam novo preço

**Verificações adicionais**:
- [ ] Relatório de vendas mostra ambos os preços corretamente
- [ ] CMV é calculado com os preços corretos

---

### Fluxo D: Fechamento de Funcionário (Quinzena)
**Objetivo**: Verificar se o sistema calcula corretamente a quinzena

**Passos**:
1. Fazer 3-5 vendas com desconto para "Andreia Moreira" em datas diferentes
2. Ir para aba "Quinzena"
3. Selecionar "Andreia Moreira"
4. Ver período de 15 dias
5. Verificar cálculos:
   - Total de vendas
   - Desconto total (20%)
   - Valor a receber
6. Clicar em "Registrar Pagamento" e adicionar valor
7. Confirmar

**Esperado**:
- Sistema agrupa vendas por período de 15 dias
- Desconto é calculado sobre o total
- Histórico de pagamentos é mantido
- Saldo é atualizado

**Verificações adicionais**:
- [ ] Relatório em PDF pode ser gerado
- [ ] WhatsApp pode ser enviado com resumo
- [ ] Fiados não pagos aparecem em alerta

---

### Fluxo E: Desativar Produto
**Objetivo**: Verificar se produto desativado não aparece para venda mas histórico permanece

**Passos**:
1. Fazer uma venda de "Brigadeiro" (R$6.50)
2. Ir para "Cardápio"
3. Encontrar "Brigadeiro" e clicar para desativar
4. Confirmar desativação
5. Voltar para "Balcão" e procurar "Brigadeiro" em Sobremesas
6. Verificar relatório de vendas

**Esperado**:
- Produto não aparece mais no PDV
- Produto não pode ser adicionado à sacola
- Venda anterior permanece no histórico
- Relatório mostra venda histórica

**Verificações adicionais**:
- [ ] Produto desativado continua no banco de dados (soft delete)
- [ ] Flag `active=false` está correto

---

## Checklist de Testes de Responsividade

Testar em diferentes tamanhos de tela:

- [ ] 375px (iPhone SE)
- [ ] 390px (iPhone 12/13)
- [ ] 430px (iPhone 14 Pro)
- [ ] 768px (iPad Mini)
- [ ] 1024px (iPad)
- [ ] 1440px (Desktop)

Para cada tamanho:
- [ ] Menu lateral colapsed/expandido apropriadamente
- [ ] Botões são clicáveis (tamanho mínimo 44px)
- [ ] Textos são legíveis (fonte mínima 14px)
- [ ] Imagens não extrapolam a largura
- [ ] Formulários cabem na tela

---

## Segurança - Verificar Antes de Deploy

- [ ] Nenhuma chave de API exposta no localStorage
- [ ] PINs e senhas são hashados server-side (função `check_staff_pin` e `check_admin_password`)
- [ ] Supabase RLS está ativado e restringindo acesso (ver `20260702100000_rls_por_papel.sql`)
- [ ] Não há secrets em commits (verificar com `git log --all -p | grep -i "password\|secret\|token\|key"`)
- [ ] CORS está configurado para apenas domínios permitidos
- [ ] CSP headers estão corretos em `vercel.json`

---

## Checklist de Deploy (PASSO 10)

Antes de fazer deploy em produção:

1. **Backend**
   - [ ] Todas as 11 migrações foram aplicadas ao Supabase
   - [ ] RLS está ativado em todas as tabelas
   - [ ] Índices estão criados para performance

2. **Frontend**
   - [ ] `admin.html` está minimizado (opcional mas recomendado)
   - [ ] Console não tem erros ou warnings
   - [ ] Todas as abas carregam dados do banco

3. **Testes**
   - [ ] Fluxo A: Venda com fiado funciona ✓
   - [ ] Fluxo B: Criar produto funciona ✓
   - [ ] Fluxo C: Editar preço preserva histórico ✓
   - [ ] Fluxo D: Fechamento de quinzena calcula corretamente ✓
   - [ ] Fluxo E: Desativar produto preserva histórico ✓

4. **Performance**
   - [ ] Produtos carregam em menos de 2s
   - [ ] Equipe carrega em menos de 1s
   - [ ] Pedidos carregam em menos de 3s

5. **Segurança**
   - [ ] Nenhum secret exposto
   - [ ] Autenticação funciona
   - [ ] RLS está protegendo dados

---

## Como Testar Localmente

### Opção 1: Vercel Local Development
```bash
npm i -g vercel
vercel dev
# Abre em http://localhost:3000
```

### Opção 2: Simple HTTP Server
```bash
cd /home/user/nobre-bistro
python3 -m http.server 8000
# Abre em http://localhost:8000/admin.html
```

### Opção 3: Vercel Staging
```bash
git push origin claude/github-connection-setup-aaoj9k
# Criar PR no GitHub → Vercel cria preview automaticamente
```

---

## Logs e Debug

Para debug no navegador:
1. Abrir DevTools (F12)
2. Ir para Console
3. Verificar se há erros/warnings
4. Testar funções:
   ```javascript
   // Verificar token
   window.NB_TOKEN
   
   // Fazer requisição teste
   fetch('https://zxpnguynjrsixsomaieg.supabase.co/rest/v1/products?limit=1', {
     headers: {
       'apikey': 'eyJ...',
       'Authorization': 'Bearer eyJ...'
     }
   }).then(r => r.json()).then(console.log)
   ```

---

## Próximos Passos

1. **PASSO 6**: Executar os 5 fluxos críticos ✓
2. **PASSO 7**: Rodar lint/typecheck/build
3. **PASSO 8**: Corrigir erros encontrados
4. **PASSO 9**: Repetir testes
5. **PASSO 10**: Deploy final

---

Última atualização: 2026-09-24 (data do ambiente)
