# 📋 Lista Completa de Funções Desenvolvidas - Nobre Café

## 🔐 AUTENTICAÇÃO & SEGURANÇA

### Funções de Login
- `nbToken()` - Retorna token de sessão ou chave anon
- `obterToken(kind, role, valor)` - Obtém token de autenticação do servidor
- `rpcCheckPassword(role, attempt)` - Valida senha admin via RPC
- `rpcCheckPin(pin)` - Valida PIN do funcionário via RPC
- `bfCheck()` - Verifica se login está bloqueado (brute-force)
- `bfFail()` - Registra tentativa falhada de login
- `bfOk()` - Limpa bloqueio após login bem-sucedido

### Funções de Supabase RPC
- `check_admin_password(role_name, password_attempt)` - RPC para validar senha admin
- `check_staff_pin(pin_attempt)` - RPC para validar PIN de funcionário
- `reset_admin_password(new_password)` - RPC para resetar senha do admin

---

## 🛒 PONTO DE VENDA (PDV)

### Gerenciamento de Carrinho
- `addToCart(prodId, qty, descPct)` - Adiciona item ao carrinho
- `rmFromCart(idx)` - Remove item do carrinho
- `updateQty(idx, newQty)` - Atualiza quantidade de item
- `clearCart()` - Limpa todos os itens do carrinho
- `calcCart()` - Calcula subtotal, descontos e total
- `applyDiscount(percent)` - Aplica desconto percentual ao carrinho

### Processamento de Venda
- `finalizarVenda(tipo, clienteId, obs)` - Finaliza venda (à vista ou fiado)
- `salvarVendaDb(order)` - Salva venda no banco de dados
- `registrarDesconto(orderId, descricao, valor)` - Registra desconto aplicado
- `recalcularTotais()` - Recalcula todos os valores

### Interface PDV
- `renderCart()` - Renderiza lista de itens do carrinho
- `renderProdutos()` - Renderiza grade de produtos
- `buscarProduto(termo)` - Busca produto por nome/categoria
- `filtrarPorCategoria(catId)` - Filtra produtos por categoria

---

## 💳 SISTEMA DE FIADO (CRÉDITO)

### Gerenciamento de Fiado
- `criarFiadoCliente(nome, email, telefone)` - Cria novo cliente de fiado
- `adicionarFiadoCliente(clienteId, valor, descricao)` - Adiciona crédito ao cliente
- `pagarFiado(clienteId, valor)` - Registra pagamento de fiado
- `obterSaldoFiado(clienteId)` - Consulta saldo devedor
- `listarFiadoPorPeriodo(dataInicio, dataFim)` - Lista transações de fiado
- `calcularJurosFiado(saldo, dias)` - Calcula juros automáticos

### Liquidação Bi-Semanal (Quinzena)
- `gerarQuinzena(dataInicio, dataFim)` - Cria liquidação da quinzena
- `calcularFiadoPorQuinzena()` - Calcula fiado vencido
- `gerarRelatorioQuinzena()` - Gera relatório de liquidação
- `fecharQuinzena(dataInicio, dataFim)` - Marca quinzena como fechada

### WhatsApp para Fiado
- `abrirWpp(tel, msg)` - Abre WhatsApp com mensagem pré-escrita
- `buildFiadoResumo(nome, ordens, descPct)` - Constrói mensagem de resumo de fiado
- `enviarLembreteWhatsapp(clienteId)` - Envia lembrete de pagamento via WhatsApp

---

## 📋 CARDÁPIO (PRODUTOS)

### Gerenciamento de Produtos
- `loadProdsFromDB()` - Carrega produtos do Supabase
- `salvarProduto(prod)` - Salva novo produto ou atualiza existente
- `deletarProduto(prodId)` - Marca produto como inativo
- `atualizarPrecoProduto(prodId, novoPreco)` - Atualiza preço de produto
- `atualizarEstoqueProduto(prodId, quantidade)` - Atualiza estoque

### Exibição de Cardápio
- `renderCardapio(produtos)` - Renderiza cardápio visual
- `renderCardapioPublico()` - Renderiza versão pública do cardápio
- `filtrarProdutosPorCategoria(catId)` - Filtra por categoria
- `buscarProdutos(termo)` - Busca textual de produtos
- `aplicarFiltrosCardapio()` - Aplica múltiplos filtros

### Importação de Dados
- `importarProdutosCSV(file)` - Importa produtos de arquivo CSV
- `validarDadosProduto(prod)` - Valida dados do produto antes de salvar

---

## 👥 GERENCIAMENTO DE EQUIPE

### Cadastro de Funcionários
- `loadProfsFromDB()` - Carrega funcionários do Supabase
- `adicionarFuncionario(nome, cargo, telefone, pinHash)` - Adiciona novo funcionário
- `atualizarFuncionario(profId, dados)` - Atualiza dados do funcionário
- `deletarFuncionario(profId)` - Marca funcionário como inativo
- `alterarPinFuncionario(profId, novoPinHash)` - Muda PIN de funcionário

### Controle de Cargo e Permissões
- `obterPermissoesCargo(cargo)` - Retorna permissões do cargo
- `atribuirCargo(profId, cargo)` - Altera cargo do funcionário
- `obterDescontoAutomatico(cargo)` - Retorna desconto por cargo (ex: 20% para salão)

### Controle de Presença
- `registrarPresenca(profId, timestamp)` - Registra entrada/saída
- `gerarRelatorioPresenca(mes)` - Gera relatório de presença

---

## 💰 GESTÃO FINANCEIRA

### Cálculos Monetários
- `fmt(valor)` - Formata valor em R$ brasileiro
- `calcularSubtotal(items)` - Calcula subtotal do carrinho
- `calcularDesconto(subtotal, percentual)` - Calcula valor de desconto
- `calcularTotal(subtotal, desconto)` - Calcula total final
- `calcularTroco(total, pagamento)` - Calcula troco

### Pagamentos de Funcionários
- `gerarFolhaPagamento(profId, periodo)` - Gera folha de pagamento
- `calcularDescontoAutomatico(vendaId, profId)` - Aplica desconto do cargo
- `salvarPagamento(profId, valor, tipo)` - Registra pagamento

### Relatórios Financeiros
- `relatorioVendasPorDia()` - Vendas do dia
- `relatorioVendasPorPeriodo(dataInicio, dataFim)` - Vendas do período
- `relatorioLucroLiquido()` - Calcula lucro descontando custos
- `relatorioFluxoCaixa()` - Relatório de fluxo de caixa

---

## 📊 RELATÓRIOS & ANALYTICS

### Relatórios Vendas
- `gerarRelatorioVendas(periodo)` - Relatório completo de vendas
- `relatorioVendasPorProduto()` - Vendas agrupadas por produto
- `relatorioVendasPorFuncionario()` - Vendas por vendedor
- `relatorioVendasPorCategoria()` - Vendas por categoria
- `relatorioTendenciasVendas()` - Análise de tendências

### Relatórios Fiado
- `relatorioFiadoAberto()` - Lista fiados não pagos
- `relatorioFiadoVencido()` - Fiados vencidos
- `relatorioClientesFrequentes()` - Top clientes em fiado

### Exportação de Dados
- `exportarCSV(dados, nomeArquivo)` - Exporta dados para CSV
- `exportarPDF(dados, titulo)` - Exporta relatório em PDF
- `copiarParaClipboard(texto)` - Copia dados para clipboard

### Dashboard
- `atualizarDashboard()` - Atualiza todos os widgets
- `calcularMetricas()` - Calcula KPIs principais
- `atualizarGraficos()` - Renderiza gráficos em tempo real

---

## ⚙️ CONFIGURAÇÕES & SISTEMA

### Configurações Gerais
- `sbGet(chave)` - Obtém configuração do banco
- `sbSet(chave, valor)` - Salva configuração no banco
- `carregarConfigurações()` - Carrega todas as configs na inicialização
- `salvarPreferenciasUsuario(prefs)` - Salva preferências do usuário

### Horários de Funcionamento
- `definirHorarioFuncionamento(dia, abre, fecha, aberto)` - Define horário do dia
- `verificarRestauranteAberto()` - Checa se está aberto agora
- `gerarProximoFuncionamento()` - Retorna próximo horário de abertura

### Backup e Sincronização
- `sincronizarComSupabase()` - Sincroniza dados locais com servidor
- `salvarCacheLocal()` - Salva dados em localStorage
- `carregarCacheLocal()` - Carrega dados do localStorage
- `limparCacheLocal()` - Limpa cache local

---

## 📅 UTILITÁRIOS DE DATA/HORA

### Funções de Formatação
- `nowStr()` - Retorna data/hora formatada (DD/MM/YYYY HH:MM)
- `todayKey()` - Retorna chave do dia em formato DD/MM/YYYY
- `formatarData(date)` - Formata data para exibição
- `formatarHora(date)` - Formata hora para exibição

### Cálculos com Datas
- `obterDiaAntigo(dias)` - Retorna data X dias atrás
- `obterInicioDia()` - Retorna início do dia atual
- `obterFimDia()` - Retorna fim do dia atual
- `obterMesAnterior()` - Retorna período do mês anterior

---

## 📸 MÍDIA & UPLOADS

### Gerenciamento de Fotos
- `uploadFoto(file)` - Faz upload de foto de produto
- `deletarFoto(fotoUrl)` - Deleta foto do servidor
- `comprimirImagem(file)` - Comprime imagem antes do upload
- `gerarThumbail(fotoUrl)` - Cria thumbnail da foto

---

## 🔄 COMPONENTES REACT

### App Principal
- `App()` - Componente raiz da aplicação
- `renderizarPagina()` - Renderiza página ativa
- `navegarPara(nomePagina)` - Muda de página

### Componentes PDV
- `<TelaPdv />` - Interface completa do PDV
- `<ListaCarrinho />` - Exibe carrinho
- `<ResumoVenda />` - Resumo antes de finalizar

### Componentes Fiado
- `<TelaFiado />` - Interface de gerenciamento de fiado
- `<ListaClientes />` - Lista de clientes com fiado
- `<DetalhesFiado />` - Detalhes de um cliente

### Componentes Cardápio
- `<TelaCardapio />` - Exibe cardápio completo
- `<FiltrosCardapio />` - Componente de filtros
- `<CartaoProduto />` - Card individual de produto

### Componentes Equipe
- `<TelaEquipe />` - Gerenciamento de equipe
- `<ListaFuncionarios />` - Lista de funcionários
- `<DetalhesFunc />` - Detalhes de funcionário

### Componentes Relatórios
- `<TelaRelatorios />` - Painel de relatórios
- `<GraficoVendas />` - Gráfico de vendas
- `<TabelaVendas />` - Tabela com dados de vendas

### Componentes Ajustes
- `<TelaAjustes />` - Configurações do sistema
- `<FormHorarios />` - Formulário de horários
- `<FormEmpresas />` - Configuração de dados da empresa

---

## 🎨 FUNÇÕES DE UI/UX

### Feedback Visual
- `mostrarMensagem(texto, tipo)` - Exibe mensagem ao usuário
- `mostrarToast(mensagem, duracao)` - Exibe notificação flutuante
- `abrirModal(conteudo, titulo)` - Abre modal
- `fecharModal()` - Fecha modal
- `mostrarConfirmacao(pergunta, callback)` - Dialogo de confirmação

### Validação de Formulários
- `validarFormulario(form)` - Valida todos os campos
- `validarEmail(email)` - Valida formato de email
- `validarTelefone(tel)` - Valida formato de telefone
- `validarValorMonetario(valor)` - Valida entrada monetária

### Carregamento
- `mostrarCarregando()` - Exibe spinner de carregamento
- `ocultarCarregando()` - Remove spinner
- `atualizarProgresso(percentual)` - Atualiza barra de progresso

---

## 🔔 NOTIFICAÇÕES & ALERTAS

### Alertas do Sistema
- `alertaSucesso(mensagem)` - Mostra alerta de sucesso
- `alertaErro(mensagem)` - Mostra alerta de erro
- `alertaAviso(mensagem)` - Mostra alerta de aviso
- `alertaInfo(mensagem)` - Mostra alerta informativo

### Notificações em Tempo Real
- `inscreverAtualizacoes()` - Se inscreve em mudanças do banco
- `aoAtualizacaoProduto()` - Callback quando produto muda
- `aoAtualizacaoFuncionario()` - Callback quando funcionário muda
- `aoNovaVenda()` - Callback para nova venda

---

## 📞 INTEGRAÇÃO WHATSAPP

### Mensagens WhatsApp
- `abrirWpp(tel, msg)` - Abre WhatsApp com mensagem
- `enviarMensagemWpp(telefone, mensagem)` - Envia mensagem via API
- `criarMensagemVenda(cliente, itens, total)` - Cria msg de venda
- `criarMensagemFiado(cliente, saldo)` - Cria msg de fiado
- `criarMensagemPagamento(cliente)` - Cria msg de pagamento

### Notificações Automáticas
- `notificarNovaVenda(venda)` - Notifica sobre nova venda
- `notificarFiadoVencido(cliente)` - Lembra cliente de pagamento
- `notificarFuncionarioDesconto()` - Avisa sobre desconto aplicado

---

## 🗄️ FUNÇÕES DO BANCO DE DADOS

### Supabase RPC Functions
- `reset_admin_password(new_password)` - RPC para resetar senha
- `check_admin_password(role_name, password_attempt)` - RPC para validar senha
- `check_staff_pin(pin_attempt)` - RPC para validar PIN

### Triggers Automáticos
- `recalcular_fiado_balance` - Recalcula saldo quando há mudança
- `audit_log_trigger` - Registra todas as mudanças
- `atualizar_timestamp` - Atualiza updated_at automaticamente

### Views (Consultas)
- `v_vendas_por_dia` - Vendas agregadas por dia
- `v_fiado_pendente` - Fiados não pagos
- `v_funcionarios_ativos` - Só funcionários ainda em atividade

---

## 📱 PÁGINAS HTML

### Páginas Principais
1. **admin.html** - Dashboard principal (396 KB, React completo)
2. **demo.html** - Página de demonstração para investidores
3. **unlock-admin.html** - Página para desbloquear login
4. **reset-password.html** - Página para resetar senha
5. **setup-automatico.html** - Setup automático para celular
6. **sql-executor.html** - Executor de SQL para Supabase

---

## 📊 TOTAIS

✅ **Funções JavaScript:** 150+  
✅ **Componentes React:** 12+  
✅ **RPC Supabase:** 3  
✅ **Triggers BD:** 3  
✅ **Views BD:** 3+  
✅ **Páginas HTML:** 6  
✅ **Linhas de Código:** 5000+  
✅ **Produtos Cadastrados:** 37  
✅ **Funcionários Cadastrados:** 21  
✅ **Categorias:** 10  

---

## 🎯 RECURSOS IMPLEMENTADOS

✅ Autenticação Admin + Funcionário  
✅ PDV Completo com Carrinho  
✅ Sistema de Fiado Bi-Semanal  
✅ Cardápio Digital com 37 Produtos  
✅ Gestão de 21 Funcionários  
✅ Relatórios e Análises  
✅ Integração WhatsApp  
✅ Upload de Fotos  
✅ Export CSV/PDF  
✅ Interface Mobile-First  
✅ Caching com localStorage  
✅ Sincronização em Tempo Real  
✅ Proteção Contra Brute-Force  
✅ Backup Automático (Supabase)  

---

**Desenvolvido com:** React 18 + Supabase + Vercel + PostgreSQL  
**Linguagem:** JavaScript ES6+  
**Banco de Dados:** PostgreSQL 14+  
**Hospedagem:** Vercel + Supabase
