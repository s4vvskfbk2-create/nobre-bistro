# 🔐 COMO ACESSAR O SISTEMA - NOBRE CAFÉ

## 🌐 URL de Acesso

**Após fazer deploy em Vercel, você terá uma URL assim:**
```
https://seu-dominio.vercel.app/admin.html
```

Ou localmente (para testes):
```
http://localhost:8000/admin.html
```

---

## 👤 ACESSO GERENTE (VOCÊ)

### Passo 1: Acessar
1. Abra em navegador: `https://seu-dominio.vercel.app/admin.html`
2. Verá tela de login com um campo "Senha ou PIN"

### Passo 2: Login com Senha
```
Campo: Senha ou PIN
Digite: [sua-senha-gerente]
Botão: Entrar
```

**Qual é sua senha?**
- Você define isso na **primeira vez** pelo **Supabase Dashboard**
- Ou usa a que o sistema gerou por padrão

### Passo 3: Você Entra Como Gerente
Acesso completo:
- ✅ PDV (balcão)
- ✅ Cozinha
- ✅ Caixa e fechamento
- ✅ Fiado
- ✅ Cardápio (editar produtos)
- ✅ Equipe (editar funcionários)
- ✅ Relatórios
- ✅ Ajustes (senhas, metas, WhatsApp)

---

## 👩‍💼 ACESSO FUNCIONÁRIA (EQUIPE)

### Opção 1: Via PIN (Recomendado para Equipe)
Cada funcionária tem um **PIN de 4-6 dígitos**

#### Passo 1: Acessar
```
URL: https://seu-dominio.vercel.app/admin.html
```

#### Passo 2: Login com PIN
```
Campo: Senha ou PIN
Digite: [PIN-da-funcionária]
Botão: Entrar
```

#### Passo 3: Ela Acessa Como Atendente
Acesso limitado (apenas operação):
- ✅ PDV (balcão) — **Vende produtos**
- ✅ Pedidos — Ver e confirmar
- ✅ Ver própria conta no fiado
- ❌ Não edita cardápio
- ❌ Não vê outras funcionárias
- ❌ Não mexe em senhas

---

## 📱 EXEMPLO PRÁTICO

### Você (Gerente)
```
1. Abre https://nobre-cafe.vercel.app/admin.html
2. Digita: senha123 (sua senha de gerente)
3. Clica: Entrar
4. ✅ Acessa tudo - PDV, Cardápio, Equipe, Caixa, etc
```

### Alessandra (Atendente)
```
1. Abre https://nobre-cafe.vercel.app/admin.html
2. Digita: 1234 (PIN dela)
3. Clica: Entrar
4. ✅ Acessa só PDV (vender)
5. Ver quanto tem de fiado acumulado
6. Receber WhatsApp do resumo na quinzena
```

---

## 🔑 COMO CONFIGURAR SENHAS E PINs

### Primeira Vez (Supabase Dashboard)

#### Sua Senha de Gerente
1. Ir para: https://app.supabase.com/project/[seu-projeto]/sql/new
2. Executar:
```sql
-- Definir sua senha de gerente
update public.roles 
set password_hash = pgp_sym_encrypt('sua-senha-aqui', 'NB_JWT_SECRET')
where role = 'gerente';
```

#### PIN de Cada Funcionária
1. Executar:
```sql
-- Definir PIN da Alessandra
update public.staff 
set pin_hash = pgp_sym_encrypt('1234', 'NB_JWT_SECRET')
where name = 'Alessandra Martins';

-- Definir PIN da Andreia
update public.staff 
set pin_hash = pgp_sym_encrypt('5678', 'NB_JWT_SECRET')
where name = 'Andreia Moreira';

-- ... repetir para todas
```

**Ou via Painel de Ajustes** (mais fácil):
1. Login como Gerente
2. Ir para aba "Ajustes"
3. Seção "Senhas de acesso"
4. Alterar PIN de cada funcionária

---

## 🔒 SENHAS PADRÃO (Primeiro Acesso)

Se nenhuma senha foi definida, use as padrões:

| Papel | Login | Senha/PIN |
|-------|-------|-----------|
| **Gerente** | Senha | `admin123` |
| **Atendente** | Senha | `atendente123` |
| **Equipe** (Salão) | PIN | `1234` |

**IMPORTANTE**: Trocar assim que acessar pela primeira vez!

---

## 📱 EM TABLET OU CELULAR

### Para Você (Gerente)
Abra num **iPad ou tablet** para ter mais espaço:
```
1. Abra Safari/Chrome
2. Digite: https://seu-dominio.vercel.app/admin.html
3. Login com sua senha
4. Coloque em "Modo Landscape" para ver melhor
```

### Para Funcionária (Atendente)
Abra num **tablet pequeno** ou **celular**:
```
1. Abra Safari/Chrome
2. Digite: https://seu-dominio.vercel.app/admin.html
3. Login com PIN dela
4. Tela otimizada para celular/tablet
5. Toca botões grandes para vender
```

---

## ⏱️ TIMEOUT DE SEGURANÇA

**Importante**: Por segurança, a sessão expira após **1 hora inativa**.

Se isso acontecer:
1. Tela volta para login
2. Digite PIN/senha novamente
3. Volta de onde estava (dados salvos localmente)

---

## 🆘 PROBLEMAS COMUNS

### "Senha ou PIN incorreto"
- [ ] Verificar se CAPS LOCK está ON
- [ ] Contar espaços extras
- [ ] Executar comando SQL acima se ainda não configurou
- [ ] Tentar novamente após 5 tentativas (espera 30 min)

### "Página não carrega"
- [ ] Verificar internet (ícone WiFi)
- [ ] Atualizar página (F5 ou Cmd+R)
- [ ] Limpar cache: Settings → Clear Browser Data
- [ ] Tentar outro navegador

### "Produtos não aparecem"
- [ ] Aguardar 2-3 segundos (carregando do banco)
- [ ] Atualizar página (F5)
- [ ] Verificar se migrations foram aplicadas

### "Fiado não salva"
- [ ] Verificar internet
- [ ] Ver se funcionária foi selecionada
- [ ] Tentar novamente

---

## 🆔 QUEM ACESSA O QUÊ

### Gerente (Você)
```
✅ Tudo
  - PDV (balcão)
  - Pedidos
  - Cozinha
  - Caixa/Fechamento
  - Fiado
  - Equipe
  - Cardápio
  - Relatórios
  - Ajustes
```

### Atendente
```
✅ Operação básica
  - PDV (balcão) → Vender
  - Pedidos → Ver status
  - Ver próprio fiado

❌ Não pode
  - Editar cardápio
  - Ver outras funcionárias
  - Acessar caixa/financeiro
  - Editar senhas
```

### Equipe do Salão (Alessandra, Andreia, etc)
```
✅ Mesmos que Atendente
  - PDV para vender
  - Ver próprio fiado
  - Receber notificações

❌ Sem acesso
  - Admin
  - Relatórios
  - Senhas
```

---

## 📲 NOTIFICAÇÕES WHATSAPP (Opcional)

Se configurado, funcionária recebe:
1. **Resumo na quinzena** com:
   - Total de vendas
   - Desconto de 20%
   - Valor a receber

2. **Alerta de pagamento** quando:
   - Gerente registra pagamento
   - Saldo é atualizado

Precisa de:
- [ ] Número de telefone cadastrado (com DDD)
- [ ] Twilio token configurado
- [ ] WhatsApp Business Account

---

## 🔄 FLUXO TÍPICO DO DIA

### Manhã (Gerente)
```
1. Acessar: https://seu-dominio.vercel.app/admin.html
2. Login com senha
3. Ir a "Dashboard" ver vendas do dia anterior
4. Ir a "Ajustes" se precisar alterar algo
```

### Durante o Dia (Equipe)
```
1. Atendente 1 acessa com PIN 1234
2. Vende Torta de Frango + Coca-Cola
3. Seleciona seu nome (aplica desconto 20%)
4. Confirma venda
5. Sai do sistema (segurança)

[Repete 100 vezes ao dia]
```

### Fechamento (Gerente)
```
1. Final do dia, acessa como gerente
2. Vai a "Caixa" e ve resumo
3. Vai a "Fiado" e ve quem deve
4. Se precisar, faz fechamento de funcionário
5. Gera relatório do dia
```

---

## 💡 DICAS IMPORTANTES

1. **Cada funcionária usa seu PIN** — não compartilha
2. **Smartphone ou tablet?** — Melhor em tablet para vender
3. **Internet cai?** — Continua funcionando (offline mode)
4. **Esqueceu PIN?** — Gerente reseta pelo "Ajustes"
5. **Muitas tentativas?** — Bloqueia 30 min por segurança (anti-hacking)

---

## 🚀 VOCÊ ESTÁ PRONTO!

Depois de fazer deploy seguindo `DEPLOYMENT.md`:

1. ✅ Você acessa com **sua senha**
2. ✅ Equipe acessa com **PIN delas**
3. ✅ Tudo sincroniza no banco de dados
4. ✅ Funciona offline se internet cair

**Bora vender!** 💪

---

Para dúvidas de deploy: ver `DEPLOYMENT.md`  
Para dúvidas de testes: ver `TESTING.md`  
Para dúvidas técnicas: ver `README.md`
