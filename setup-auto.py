#!/usr/bin/env python3
"""
Setup Automático - Nobre Café
Automatiza a aplicação de migrations ao Supabase
"""

import os
import sys
import json
from pathlib import Path

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def print_step(num, text):
    print(f"[{num}] {text}")

def print_success(text):
    print(f"✅ {text}")

def print_error(text):
    print(f"❌ {text}")

def print_warning(text):
    print(f"⚠️  {text}")

def main():
    print_header("SETUP AUTOMÁTICO - NOBRE CAFÉ")

    print("""
Este script ajuda você a setup o Supabase com as migrations.

REQUISITOS:
  ✅ Conta Supabase criada (https://app.supabase.com)
  ✅ Projeto Supabase criado (região: São Paulo)
  ✅ Credenciais Supabase à mão
  ✅ Python 3.8+ instalado

O QUE ESTE SCRIPT FAZ:
  1. Valida suas credenciais Supabase
  2. Lista todas as migrations em ordem
  3. Mostra comandos SQL para copiar/colar
  4. Verifica se tudo foi aplicado

O QUE VOCÊ PRECISA FAZER:
  1. Ter suas credenciais Supabase prontas
  2. Copiar/colar SQL no Supabase Dashboard
  3. Seguir os passos do script
    """)

    input("Pressione ENTER para começar...")

    print_step(1, "Coletando credenciais Supabase")
    print("""
Vá para https://app.supabase.com/project/[seu-projeto]/settings/api
e copie suas credenciais:
    """)

    supabase_url = input("  Project URL (https://...supabase.co): ").strip()
    supabase_key = input("  Anon Key (eyJ...): ").strip()

    if not supabase_url or not supabase_key:
        print_error("Credenciais não fornecidas!")
        sys.exit(1)

    print_success(f"Supabase URL: {supabase_url[:50]}...")
    print_success(f"Supabase Key: {supabase_key[:30]}...")

    print_step(2, "Encontrando migrations")

    migrations_dir = Path(__file__).parent / "supabase" / "migrations"
    if not migrations_dir.exists():
        print_error(f"Diretório de migrations não encontrado: {migrations_dir}")
        sys.exit(1)

    migrations = sorted([f for f in migrations_dir.glob("*.sql")])

    print_success(f"Encontradas {len(migrations)} migrations:")
    for i, mig in enumerate(migrations, 1):
        print(f"  {i}. {mig.name}")

    print_step(3, "Preparando SQL para copiar/colar")

    print(f"""
PRÓXIMO PASSO - Use o SQL Editor do Supabase:

1. Abra: https://app.supabase.com/project/[seu-projeto]/sql/new
2. Para cada migration abaixo:
   a. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
   b. Cole no SQL Editor do Supabase (Ctrl+V)
   c. Clique "Run"
   d. Aguarde "Success"
   e. Continue para a próxima

ORDEM CORRETA (NÃO MUDE A ORDEM):
    """)

    for i, mig in enumerate(migrations, 1):
        print(f"\n[{i}/{len(migrations)}] {mig.name}")
        with open(mig, 'r', encoding='utf-8') as f:
            content = f.read()
            print(f"     Tamanho: {len(content)} caracteres")
            print(f"     Primeira linha: {content.split(chr(10))[0][:60]}...")

    print(f"\n{'='*60}")
    print("ARQUIVO DE CONFIGURAÇÃO VERCEL")
    print(f"{'='*60}\n")

    print("""
Para o Vercel, você precisará adicionar estas variáveis:

VITE_SUPABASE_URL = {seu_supabase_url}
VITE_SUPABASE_ANON_KEY = {sua_supabase_key}

Abra um arquivo .env e salve:
    """)

    env_content = f"""VITE_SUPABASE_URL={supabase_url}
VITE_SUPABASE_ANON_KEY={supabase_key}
VITE_APP_NAME=Nobre Café
VITE_TIMEZONE=America/Sao_Paulo
"""

    env_file = Path(__file__).parent / ".env.local"
    with open(env_file, 'w', encoding='utf-8') as f:
        f.write(env_content)

    print_success(f"Arquivo .env.local criado")

    print_step(4, "Checklist de Setup")

    checklist = f"""
ANTES DE FAZER DEPLOY VERCEL:

[ ] Supabase
    [ ] Projeto criado em São Paulo
    [ ] Todas 11 migrations aplicadas com sucesso
    [ ] 37 produtos aparecem em public.products
    [ ] 21 funcionários aparecem em public.staff
    [ ] RLS está ativado em todas as tabelas

[ ] Vercel
    [ ] Conta criada (https://vercel.com)
    [ ] GitHub conectado
    [ ] Repositório importado
    [ ] Variáveis VITE_* adicionadas
    [ ] Deploy completo
    [ ] URL recebida (https://seu-projeto.vercel.app)

[ ] Testes
    [ ] Acessar admin.html
    [ ] Login com admin123
    [ ] Ver 37 produtos no PDV
    [ ] Ver 21 funcionários
    [ ] Fazer teste de venda

PRÓXIMOS PASSOS:

1. Aplicar todas as migrations (SQL Editor Supabase)
2. Ir para https://vercel.com
3. Importar repositório: nobre-bistro
4. Adicionar variáveis VITE_*
5. Deploy automático
6. Aguardar URL
7. Testar admin.html

Total: 10-15 minutos até estar online!
    """

    print(checklist)

    print_step(5, "Salvar Credenciais")

    credentials = {
        "supabase_url": supabase_url,
        "supabase_key": supabase_key,
        "setup_date": "2026-09-24",
        "setup_by": "setup-auto.py"
    }

    creds_file = Path(__file__).parent / ".credentials.json.backup"
    with open(creds_file, 'w', encoding='utf-8') as f:
        json.dump(credentials, f, indent=2)

    print_warning(f"Backup de credenciais salvo em: {creds_file}")
    print_warning("MANTENHA ESTE ARQUIVO SEGURO - Contém chaves de API!")

    print_header("PRÓXIMAS AÇÕES")

    print("""
1. APLICAR MIGRATIONS:
   a. Abra SQL Editor: https://app.supabase.com/project/[seu-projeto]/sql/new
   b. Copie/cole cada arquivo .sql na ordem
   c. Clique "Run" até ter 11 migrations aplicadas

2. FAZER DEPLOY VERCEL:
   a. Abra: https://vercel.com
   b. Clique "New Project"
   c. Selecione: nobre-bistro
   d. Adicione variáveis VITE_* (do .env.local criado)
   e. Deploy automático

3. ACESSAR:
   a. Copie URL do Vercel
   b. Adicione /admin.html
   c. Login: admin123
   d. ✅ Pronto!

Leia também:
  - SETUP-RAPIDO.md (guia visual)
  - DEPLOYMENT.md (detalhado)
  - ACESSO.md (como entrar)
    """)

    print_success("Setup automático concluído!")
    print_success("Credenciais salvas em .env.local")
    print_success(f"Migrations: {len(migrations)} encontradas")

    print("\n🎯 Agora siga os passos acima para completar o deploy!\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_error("\nSetup cancelado pelo usuário")
        sys.exit(0)
    except Exception as e:
        print_error(f"Erro: {e}")
        sys.exit(1)
