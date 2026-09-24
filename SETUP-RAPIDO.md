# ⚡ SETUP RÁPIDO - 5 MINUTOS ATÉ PRODUÇÃO

**Tempo total**: 5 minutos  
**Dificuldade**: Muito fácil  
**Custo**: Grátis (Vercel + Supabase gratuitos)

---

## 📋 CHECKLIST DE SETUP

```
[ ] 1. Criar Supabase (2 min)
[ ] 2. Copiar credenciais (1 min)
[ ] 3. Aplicar migrations (2 min - automático)
[ ] 4. Deploy Vercel (2 min - automático)
[ ] 5. Testar login (1 min)
```

**Total: 8 minutos** ⏱️

---

## PASSO 1: CRIAR SUPABASE (2 MINUTOS)

### 1.1 Ir para Supabase
```
1. Abra: https://app.supabase.com
2. Clique "Sign Up"
3. Use seu email pessoal
```

### 1.2 Criar Projeto
```
Clique "New Project" e preencha:

┌─────────────────────────────────┐
│ Project Name: nobre-cafe        │
│ Database Password: [gere forte] │
│ Region: Brazil (São Paulo)      │
└─────────────────────────────────┘

Clique: "Create new project"
```

### 1.3 Aguardar
```
Supabase cria em 2-3 minutos
Você verá: "Project is being set up"
```

---

## PASSO 2: COPIAR CREDENCIAIS (1 MINUTO)

### 2.1 Ir para Settings
```
No painel Supabase:
1. Clique em "Settings" (engrenagem, canto inferior)
2. Selecione "API"
```

### 2.2 Copiar URL e Chave
```
Você verá:

┌─────────────────────────────────┐
│ Project URL:                    │
│ https://[projeto].supabase.co  │ ← COPIE ISSO
│                                 │
│ Project API Key (anon):         │
│ eyJhbGc... (chave longa)       │ ← COPIE ISSO
└─────────────────────────────────┘

Abra um bloco de notas e cole:
- URL_DO_SEU_PROJETO = https://...
- CHAVE_DO_SEU_PROJETO = eyJhbGc...
```

### 2.3 Copiar JWT Secret
```
Na mesma aba "Settings → API", procure:
"JWT Secret"

Copie: eyJI... (outra chave)
Guarde para depois
```

---

## PASSO 3: APLICAR MIGRATIONS (2 MINUTOS - AUTOMÁTICO)

### 3.1 Abrir SQL Editor
```
1. No Supabase, clique em "SQL Editor"
2. Clique "New query"
```

### 3.2 Copiar SQL
```
1. Abra este arquivo: supabase/migrations/20260630000000_core_management_schema.sql
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique "Run"
```

### 3.3 Repetir para cada migration
```
Execute na ordem:
✅ 20260630000000_core_management_schema.sql
✅ 20260701000000_security_hardening.sql
✅ 20260702000000_fiado_automation.sql
✅ 20260702100000_rls_por_papel.sql
✅ 20260703000000_realtime.sql
✅ 20260704000000_ai_agents_scheduler.sql
✅ 20260705000000_estoque_avancado_e_resumo.sql
✅ 20260706000000_fix_search_path_pgcrypto.sql
✅ 20260707000000_recalculo_automatico_fichas.sql
✅ 20260924000000_nobre_cafe_cardapio.sql (37 produtos)
✅ 20260924100000_nobre_cafe_equipe.sql (21 funcionários)
```

**Cada uma demora 5-10 segundos**

### 3.4 Pronto!
```
Supabase agora tem:
✅ 15 tabelas
✅ 37 produtos Nobre Café
✅ 21 funcionários
✅ RLS ativado
✅ Índices otimizados
```

---

## PASSO 4: DEPLOY VERCEL (2 MINUTOS - AUTOMÁTICO)

### 4.1 Ir para Vercel
```
1. Abra: https://vercel.com
2. Clique "Sign Up" (ou "Log In")
3. Selecione "Continue with GitHub"
4. Autorize Vercel a acessar seu GitHub
```

### 4.2 Importar Projeto
```
1. Clique "Add New..." → "Project"
2. Procure: "nobre-bistro"
3. Clique "Import"
```

### 4.3 Configurar Variáveis
```
Vercel vai pedir para configurar variáveis.

Adicione:

┌─────────────────────────────────────────┐
│ VITE_SUPABASE_URL                       │
│ https://[seu-projeto].supabase.co      │
│                                         │
│ VITE_SUPABASE_ANON_KEY                 │
│ eyJhbGc... (chave que você copiou)     │
└─────────────────────────────────────────┘

Clique: "Deploy"
```

### 4.4 Aguardar Deploy
```
Vercel faz tudo automático:
- Download código
- Build
- Deploy
- Gera URL

Demora 2-3 minutos

Você verá:
"Congratulations! Your project has been deployed"
```

---

## PASSO 5: OBTER URL (1 MINUTO)

### 5.1 Copiar Link
```
No painel Vercel, você verá:

┌──────────────────────────────────────────┐
│ Deployment successful!                   │
│                                          │
│ Visit: https://seu-projeto.vercel.app   │
│ ← CLIQUE AQUI ou COPIE ESTE LINK        │
└──────────────────────────────────────────┘
```

### 5.2 Sua URL é:
```
https://seu-projeto.vercel.app/admin.html
                     ↑
            (gerada automaticamente)
```

---

## PASSO 6: TESTAR LOGIN (1 MINUTO)

### 6.1 Acessar
```
1. Copie a URL: https://seu-projeto.vercel.app/admin.html
2. Abra num navegador
3. Aguarde carregar
```

### 6.2 Fazer Login
```
Tela de login aparece:

┌──────────────────────────┐
│ Senha ou PIN             │
│ ┌──────────────────────┐ │
│ │ admin123           │ │ ← Digite senha padrão
│ └──────────────────────┘ │
│                          │
│ [ ENTRAR ]              │
└──────────────────────────┘
```

### 6.3 Sucesso!
```
✅ Você entra no dashboard
✅ 37 produtos aparecem
✅ 21 funcionários aparecem
✅ Sistema está VIVO!
```

---

## 🎊 PRONTO!

Seu site agora está em:
```
https://seu-projeto.vercel.app/admin.html
```

**Compartilhe com sua equipe**:
```
Alessandra: acessa com PIN 1234
Andreia:   acessa com PIN 5678
Você:      acessa com senha admin123
```

---

## 📱 PRÓXIMAS AÇÕES

### Mude sua senha (logo)
```
1. Clique em "Ajustes"
2. "Senhas de acesso"
3. Troque admin123 para sua senha real
4. Confirme com a senha atual
```

### Configure PINs da equipe
```
1. Ajustes → Senhas de acesso
2. Para cada funcionária, mude PIN
3. Compartilhe os PINs com elas
```

### Teste um fluxo
```
1. Venda um produto
2. Escolha vendedor (desconto 20%)
3. Veja no fiado
4. Confirme que funcionou
```

---

## 🆘 PROBLEMAS?

### "Supabase não cria projeto"
- [ ] Verificar email (pode ter confirmação)
- [ ] Aguardar 5 minutos
- [ ] Tentar com outro email

### "Vercel não encontra repositório"
- [ ] Autorizar Vercel no GitHub settings
- [ ] Fazer fork do repo se precisar
- [ ] Reconectar GitHub account

### "Página não carrega"
- [ ] Aguardar 2 minutos (build rodando)
- [ ] Atualizar página (F5)
- [ ] Verificar variáveis de ambiente

### "Login não funciona"
- [ ] Verificar Supabase está online
- [ ] Verificar migrations foram aplicadas
- [ ] Tentar senha: admin123
- [ ] Limpar cache do navegador

---

## ✨ RESUMO

| Etapa | Tempo | Ação |
|-------|-------|------|
| Criar Supabase | 2 min | Criar conta + projeto |
| Copiar credenciais | 1 min | Copiar URL + Chave |
| Aplicar migrations | 2 min | Colar SQL + executar |
| Deploy Vercel | 2 min | Importar + deploy |
| Testar | 1 min | Acessar + login |
| **TOTAL** | **8 minutos** | **Pronto!** |

---

## 🎯 VOCÊ TEM AGORA

```
✅ Sistema online em produção
✅ URL funcionando
✅ Banco de dados estruturado
✅ 37 produtos cadastrados
✅ 21 funcionários prontos
✅ Segurança ativada (RLS)
✅ Pronto para vender
```

---

## 🚀 BORA COMEÇAR!

1. Abra: https://app.supabase.com
2. Crie projeto
3. Siga os passos acima
4. Em 8 minutos, seu site está VIVO!

Qualquer dúvida, volte a este documento.

**Boa sorte!** 💪

---

Próximas leituras:
- `ACESSO.md` — Como entrar (você + equipe)
- `DEPLOYMENT.md` — Detalhado (se tiver dúvidas)
- `TESTING.md` — Como testar tudo
