// Espera o HTML carregar
document.addEventListener('DOMContentLoaded', () => {

  // --- SELETORES DOS ELEMENTOS ---
  
  // Seletores do NOVO formulário de cadastro
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

  // (NOVA FUNÇÃO) Adiciona um item ao pedido atual (vinda do formulário)
  function adicionarItem(e) {
    e.preventDefault(); // Impede o formulário de recarregar a página

    // Pega os valores dos campos do formulário
    const nome = itemNomeEl.value;
    const preco = parseFloat(itemPrecoEl.value);

    // Validação simples
    if (!nome || isNaN(preco) || preco <= 0) {
      alert('Por favor, insira um nome e um preço válidos.');
      return;
    }

    // Adiciona ao array do pedido atual
    pedidoAtualItens.push({ nome: nome, preco: preco });
    
    // Adiciona à lista visual
    const novoItemLista = document.createElement('li');
    novoItemLista.textContent = `${nome} - R$ ${preco.toFixed(2)}`;
    listaPedidoEl.appendChild(novoItemLista);

    // Atualiza o total
    pedidoAtualTotal += preco;
    totalDisplayEl.textContent = `R$ ${pedidoAtualTotal.toFixed(2)}`;

    // Limpa o formulário e foca no primeiro campo
    itemNomeEl.value = '';
    itemPrecoEl.value = '';
    itemNomeEl.focus(); // Facilita adicionar o próximo item
  }

  // (Função antiga - sem mudanças) Limpa o pedido atual
  function limparPedido() {
    pedidoAtualItens = [];
    pedidoAtualTotal = 0;
    listaPedidoEl.innerHTML = '';
    totalDisplayEl.textContent = 'R$ 0,00';
  }

  // (Função antiga - sem mudanças) Finaliza o pedido e salva
  function finalizarPedido() {
    if (pedidoAtualTotal === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    const historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];

    const novoPedido = {
      id: new Date().getTime(),
      data: new Date().toISOString(),
      itens: pedidoAtualItens,
      total: pedidoAtualTotal,
      pagamento: formaPagamentoEl.value
    };

    historico.push(novoPedido);
    localStorage.setItem('historicoPedidos', JSON.stringify(historico));

    limparPedido();
    atualizarDashboard();
    alert('Pedido finalizado e salvo no histórico!');
  }
  
  // --- FUNÇÕES DO DASHBOARD (sem mudanças) ---
  
  function atualizarDashboard() {
    const historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
    const hoje = new Date();
    
    let faturamentoDia = 0;
    let faturamentoMes = 0;

    historicoPedidosEl.innerHTML = '';
    
    historico.slice().reverse().forEach(pedido => {
      const dataPedido = new Date(pedido.data);

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

      if (dataPedido.getMonth() === hoje.getMonth() && dataPedido.getFullYear() === hoje.getFullYear()) {
        faturamentoMes += pedido.total;
      }
      
      if (dataPedido.toDateString() === hoje.toDateString()) {
        faturamentoDia += pedido.total;
      }
    });

    faturamentoDiaEl.textContent = `R$ ${faturamentoDia.toFixed(2)}`;
    faturamentoMesEl.textContent = `R$ ${faturamentoMes.toFixed(2)}`;
  }

  // --- INICIALIZAÇÃO E "OUVIDORES" DE EVENTOS ---

  // (MUDANÇA AQUI) Ouve o "submit" do formulário
  formCadastroEl.addEventListener('submit', adicionarItem);
  
  // (Antigo) Ouve os cliques nos botões de limpar e finalizar
  botaoLimparEl.addEventListener('click', limparPedido);
  botaoFinalizarEl.addEventListener('click', finalizarPedido);

  // (Antigo) Carrega o dashboard assim que a página abre
  atualizarDashboard();

});
