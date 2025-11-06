// Espera o HTML carregar
document.addEventListener('DOMContentLoaded', () => {

  // --- SELETORES DOS ELEMENTOS ---
  
  // Seletores do formulário de cadastro
  const formCadastroEl = document.getElementById('form-cadastro-item');
  const itemNomeEl = document.getElementById('item-nome');
  const itemPrecoEl = document.getElementById('item-preco');
  
  // Seletores da Comanda
  const listaPedidoEl = document.getElementById('lista-pedido');
  const totalDisplayEl = document.getElementById('total-pedido');
  const botaoLimparEl = document.getElementById('reset-btn');
  const botaoFinalizarEl = document.getElementById('finalizar-btn');
  const formaPagamentoEl = document.getElementById('forma-pagamento');
  
  // Seletores do Dashboard
  const faturamentoDiaEl = document.getElementById('faturamento-dia');
  const faturamentoMesEl = document.getElementById('faturamento-mes');
  const historicoPedidosEl = document.getElementById('historico-pedidos');

  // --- VARIÁVEIS DO ESTADO ---
  let pedidoAtualItens = []; // Guarda os itens do pedido {nome, preco}
  let pedidoAtualTotal = 0;

  // --- FUNÇÕES PRINCIPAIS ---

  // Adiciona um item ao pedido atual (lendo centavos)
  function adicionarItem(e) {
    e.preventDefault(); // Impede o formulário de recarregar a página

    // Pega os valores dos campos do formulário
    const nome = itemNomeEl.value;
    
    // 1. Pega o valor em centavos como um número inteiro
    const precoEmCentavos = parseInt(itemPrecoEl.value, 10);

    // 2. Validação (checa se é um número e se é maior que zero)
    if (!nome || isNaN(precoEmCentavos) || precoEmCentavos <= 0) {
      alert('Por favor, insira um nome e um preço (em centavos) válidos.\n\nExemplo: 800 (para R$ 8,00)');
      return;
    }
    
    // 3. Converte centavos para reais (ex: 800 -> 8.00)
    const precoEmReais = precoEmCentavos / 100.0;
    
    // --- FIM DA LÓGICA DE CENTAVOS ---

    // Adiciona ao array do pedido atual
    pedidoAtualItens.push({ nome: nome, preco: precoEmReais });
    
    // Adiciona à lista visual
    const novoItemLista = document.createElement('li');
    novoItemLista.textContent = `${nome} - R$ ${precoEmReais.toFixed(2)}`;
    listaPedidoEl.appendChild(novoItemLista);

    // Atualiza o total
    pedidoAtualTotal += precoEmReais;
    totalDisplayEl.textContent = `R$ ${pedidoAtualTotal.toFixed(2)}`;

    // Limpa o formulário e foca no primeiro campo
    itemNomeEl.value = '';
    itemPrecoEl.value = '';
    itemNomeEl.focus(); 
  }

  // Limpa o pedido atual (visual e dados)
  function limparPedido() {
    pedidoAtualItens = [];
    pedidoAtualTotal = 0;
    listaPedidoEl.innerHTML = '';
    totalDisplayEl.textContent = 'R$ 0,00';
  }

  // Finaliza o pedido e salva no localStorage
  function finalizarPedido() {
    if (pedidoAtualTotal === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    // 1. Pega o histórico antigo do localStorage
    const historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];

    // 2. Cria o novo objeto de pedido
    const novoPedido = {
      id: new Date().getTime(), // ID único baseado no tempo
      data: new Date().toISOString(), // Data em formato universal (string)
      itens: pedidoAtualItens,
      total: pedidoAtualTotal,
      pagamento: formaPagamentoEl.value // Pega o valor (dinheiro, pix, cartao)
    };

    // 3. Adiciona o novo pedido ao histórico
    historico.push(novoPedido);

    // 4. Salva o histórico ATUALIZADO de volta no localStorage
    localStorage.setItem('historicoPedidos', JSON.stringify(historico));

    // 5. Limpa o pedido atual
    limparPedido();

    // 6. Atualiza o dashboard
    atualizarDashboard();

    alert('Pedido finalizado e salvo no histórico!');
  }
  
  // --- FUNÇÕES DO DASHBOARD ---
  
  // Lê o localStorage e atualiza o painel
  function atualizarDashboard() {
    const historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
    const hoje = new Date();
    
    let faturamentoDia = 0;
    let faturamentoMes = 0;

    // Limpa o histórico visual antigo
    historicoPedidosEl.innerHTML = '';
    
    // Itera por todos os pedidos salvos (do mais novo para o mais velho)
    historico.slice().reverse().forEach(pedido => {
      const dataPedido = new Date(pedido.data); // Converte a string de data de volta para Data

      // 1. Preenche o Histórico Visual
      const itemHistorico = document.createElement('li');
      const dataFormatada = dataPedido.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
      itemHistorico.innerHTML = `
        <span>
          <span class="data">${dataFormatada} - ${dataPedido.toLocaleTimeString('pt-BR')}</span>
          <br>
          ${pedido.itens.length} itens (${pedido.pagamento})
        </span>
        <span class="total">R$ ${pedido.total.toFixed(2)}</span>
      `;
      historicoPedidosEl.appendChild(itemHistorico);

      // 2. Calcula Faturamento do Mês
      if (dataPedido.getMonth() === hoje.getMonth() && dataPedido.getFullYear() === hoje.getFullYear()) {
        faturamentoMes += pedido.total;
      }
      
      // 3. Calcula Faturamento do Dia
      if (dataPedido.toDateString() === hoje.toDateString()) {
        faturamentoDia += pedido.total;
      }
    });

    // 4. Exibe os totais de faturamento
    faturamentoDiaEl.textContent = `R$ ${faturamentoDia.toFixed(2)}`;
    faturamentoMesEl.textContent = `R$ ${faturamentoMes.toFixed(2)}`;
  }

  // --- INICIALIZAÇÃO E "OUVIDORES" DE EVENTOS ---

  // Ouve o "submit" do formulário
  formCadastroEl.addEventListener('submit', adicionarItem);
  
  // Ouve os cliques nos botões de limpar e finalizar
  botaoLimparEl.addEventListener('click', limparPedido);
  botaoFinalizarEl.addEventListener('click', finalizarPedido);

  // Carrega o dashboard assim que a página abre
  atualizarDashboard();

});
