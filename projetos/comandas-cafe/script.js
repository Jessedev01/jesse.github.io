// Espera o HTML carregar
document.addEventListener('DOMContentLoaded', () => {

  // Seletores dos Elementos
  const botoesAdicionar = document.querySelectorAll('.add-btn');
  const listaPedidoEl = document.getElementById('lista-pedido');
  const totalDisplayEl = document.getElementById('total-pedido');
  const botaoLimparEl = document.getElementById('reset-btn');
  const botaoFinalizarEl = document.getElementById('finalizar-btn');
  const formaPagamentoEl = document.getElementById('forma-pagamento');
  
  // Seletores do Dashboard
  const faturamentoDiaEl = document.getElementById('faturamento-dia');
  const faturamentoMesEl = document.getElementById('faturamento-mes');
  const historicoPedidosEl = document.getElementById('historico-pedidos');

  // Variáveis do Pedido Atual
  let pedidoAtualItens = []; // Guarda os itens do pedido {nome, preco}
  let pedidoAtualTotal = 0;

  // --- FUNÇÕES PRINCIPAIS ---

  // Adiciona um item ao pedido atual
  function adicionarItem(e) {
    const itemMenu = e.target.closest('.menu-item');
    const nome = itemMenu.dataset.nome;
    const preco = parseFloat(itemMenu.dataset.preco);

    // Adiciona ao array do pedido atual
    pedidoAtualItens.push({ nome: nome, preco: preco });
    
    // Adiciona à lista visual
    const novoItemLista = document.createElement('li');
    novoItemLista.textContent = `${nome} - R$ ${preco.toFixed(2)}`;
    listaPedidoEl.appendChild(novoItemLista);

    // Atualiza o total
    pedidoAtualTotal += preco;
    totalDisplayEl.textContent = `R$ ${pedidoAtualTotal.toFixed(2)}`;
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
    // '|| []' significa: se não houver nada, comece com um array vazio
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
    // JSON.stringify transforma o array de objetos em texto
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

  // --- INICIALIZAÇÃO ---

  // "Ouvidores" de eventos
  botoesAdicionar.forEach(botao => botao.addEventListener('click', adicionarItem));
  botaoLimparEl.addEventListener('click', limparPedido);
  botaoFinalizarEl.addEventListener('click', finalizarPedido);

  // Carrega o dashboard assim que a página abre
  atualizarDashboard();

});
