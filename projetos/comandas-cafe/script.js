// Espera o HTML carregar
document.addEventListener('DOMContentLoaded', () => {

  // --- SELETORES DOS ELEMENTOS ---
  const formCadastroEl = document.getElementById('form-cadastro-item');
  const itemNomeEl = document.getElementById('item-nome');
  const itemPrecoEl = document.getElementById('item-preco');
  
  const listaPedidoEl = document.getElementById('lista-pedido');
  const totalDisplayEl = document.getElementById('total-pedido');
  const botaoLimparEl = document.getElementById('reset-btn');
  const botaoFinalizarEl = document.getElementById('finalizar-btn');
  const formaPagamentoEl = document.getElementById('forma-pagamento');
  
  const faturamentoDiaEl = document.getElementById('faturamento-dia');
  const faturamentoMesEl = document.getElementById('faturamento-mes');
  const historicoPedidosEl = document.getElementById('historico-pedidos');

  const ctxPizza = document.getElementById('grafico-pizza-pagamentos');
  const ctxBarras = document.getElementById('grafico-barras-pagamentos');

  // [NOVO] Seletor do botão de tema
  const themeToggle = document.getElementById('theme-toggle');

  // --- VARIÁVEIS DE ESTADO ---
  
  // [MUDANÇA] A estrutura do pedido agora inclui 'id' e 'quantidade'
  let pedidoAtualItens = []; // Array de objetos: {id, nome, preco, quantidade}
  let pedidoAtualTotal = 0;

  let graficoPizza = null;
  let graficoBarras = null;

  // ==================================
  // 1. LÓGICA DO TEMA ESCURO
  // ==================================

  // Verifica o tema salvo no localStorage
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // Ouve o clique no botão de tema
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Salva a preferência no localStorage
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
    // [NOVO] Redesenha os gráficos ao mudar o tema (para cores)
    atualizarDashboard(); 
  });


  // ==================================
  // 2. LÓGICA PRINCIPAL DA COMANDA
  // ==================================

  // [REESCRITO] Adiciona um item ao pedido
  function adicionarItem(e) {
    e.preventDefault(); 
    
    const nome = itemNomeEl.value;
    const precoEmCentavos = parseInt(itemPrecoEl.value, 10);

    if (!nome || isNaN(precoEmCentavos) || precoEmCentavos <= 0) {
      alert('Por favor, insira um nome e um preço (em centavos) válidos.');
      return;
    }
    
    const precoEmReais = precoEmCentavos / 100.0;

    // [MUDANÇA] Verifica se o item JÁ EXISTE na comanda
    const itemExistente = pedidoAtualItens.find(item => item.nome.toLowerCase() === nome.toLowerCase());

    if (itemExistente) {
      // Se existe, apenas aumenta a quantidade
      itemExistente.quantidade++;
    } else {
      // Se não existe, cria um novo item
      const novoItem = {
        id: Date.now(), // ID único para controle
        nome: nome,
        preco: precoEmReais,
        quantidade: 1
      };
      pedidoAtualItens.push(novoItem);
    }

    // Limpa o formulário
    itemNomeEl.value = '';
    itemPrecoEl.value = '';
    itemNomeEl.focus(); 

    // Atualiza a tela
    renderComanda();
    atualizarTotal();
  }

  // [NOVA FUNÇÃO] Renderiza a lista da comanda na tela
  function renderComanda() {
    listaPedidoEl.innerHTML = ''; // Limpa a lista antes de renderizar

    if (pedidoAtualItens.length === 0) {
      listaPedidoEl.innerHTML = '<li><span class="item-info">Comanda vazia...</span></li>';
      return;
    }

    pedidoAtualItens.forEach(item => {
      const li = document.createElement('li');
      
      const subtotalItem = item.preco * item.quantidade;

      li.innerHTML = `
        <div class="item-info">
          <strong>${item.nome}</strong>
          <br>
          <span>${item.quantidade} x R$ ${item.preco.toFixed(2)} = <strong>R$ ${subtotalItem.toFixed(2)}</strong></span>
        </div>
        
        <div class="item-actions">
          <button class="btn-qty-decrease" data-id="${item.id}">-</button>
          <span class="qty-span">${item.quantidade}</span>
          <button class="btn-qty-increase" data-id="${item.id}">+</button>
          <button class="btn-delete-item" data-id="${item.id}">X</button>
        </div>
      `;
      listaPedidoEl.appendChild(li);
    });
  }

  // [NOVA FUNÇÃO] Ouve cliques nos botões da comanda (+, -, X)
  function handleComandaClick(e) {
    const target = e.target;
    const id = parseInt(target.dataset.id, 10);

    if (target.classList.contains('btn-qty-increase')) {
      atualizarQuantidade(id, 1);
    }
    else if (target.classList.contains('btn-qty-decrease')) {
      atualizarQuantidade(id, -1);
    }
    else if (target.classList.contains('btn-delete-item')) {
      removerItem(id);
    }
  }

  // [NOVA FUNÇÃO] Atualiza a quantidade de um item
  function atualizarQuantidade(id, mudanca) {
    const item = pedidoAtualItens.find(i => i.id === id);
    if (!item) return;

    item.quantidade += mudanca;

    if (item.quantidade <= 0) {
      // Se a quantidade for 0 ou menos, remove o item
      removerItem(id);
    } else {
      renderComanda();
      atualizarTotal();
    }
  }

  // [NOVA FUNÇÃO] Remove um item da comanda
  function removerItem(id) {
    pedidoAtualItens = pedidoAtualItens.filter(i => i.id !== id);
    renderComanda();
    atualizarTotal();
  }

  // [NOVA FUNÇÃO] Calcula e atualiza o total do pedido
  function atualizarTotal() {
    pedidoAtualTotal = pedidoAtualItens.reduce((total, item) => {
      return total + (item.preco * item.quantidade);
    }, 0);

    totalDisplayEl.textContent = `R$ ${pedidoAtualTotal.toFixed(2)}`;
  }

  // [ATUALIZADO] Limpa o pedido atual
  function limparPedido() {
    pedidoAtualItens = [];
    pedidoAtualTotal = 0;
    renderComanda(); // Renderiza a comanda (que mostrará "vazia")
    atualizarTotal(); // Zera o total
  }

  // [ATUALIZADO] Finaliza o pedido e salva no localStorage
  function finalizarPedido() {
    if (pedidoAtualTotal === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    const historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];

    // O novo pedido agora salva os itens com quantidade
    const novoPedido = {
      id: new Date().getTime(),
      data: new Date().toISOString(),
      itens: pedidoAtualItens, // Salva o array de itens completo
      total: pedidoAtualTotal,
      pagamento: formaPagamentoEl.value
    };

    historico.push(novoPedido);
    localStorage.setItem('historicoPedidos', JSON.stringify(historico));

    limparPedido();
    atualizarDashboard(); // Atualiza o dashboard e gráficos
    alert('Pedido finalizado e salvo no histórico!');
  }
  

  // ==================================
  // 3. LÓGICA DO DASHBOARD (GRÁFICOS)
  // ==================================
  
  // [ATUALIZADO] Lê o localStorage e atualiza o painel
  function atualizarDashboard() {
    const historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
    const hoje = new Date();
    
    let faturamentoDia = 0;
    let faturamentoMes = 0;
    const contagemPagamentos = { 'dinheiro': 0, 'pix': 0, 'cartao': 0 };

    historicoPedidosEl.innerHTML = '';
    
    historico.slice().reverse().forEach(pedido => {
      const dataPedido = new Date(pedido.data);

      // 1. Preenche o Histórico Visual
      const itemHistorico = document.createElement('li');
      const dataFormatada = dataPedido.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'});
      
      // [MUDANÇA] Conta o total de itens (somando as quantidades)
      const totalItens = pedido.itens.reduce((total, item) => total + item.quantidade, 0);

      itemHistorico.innerHTML = `
        <span>
          <span class="data">${dataFormatada} - ${dataPedido.toLocaleTimeString('pt-BR')}</span>
          <br>
          ${totalItens} itens (${pedido.pagamento})
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

      // 4. Conta os tipos de pagamento
      if (pedido.pagamento && contagemPagamentos.hasOwnProperty(pedido.pagamento)) {
        contagemPagamentos[pedido.pagamento]++;
      }
    });

    faturamentoDiaEl.textContent = `R$ ${faturamentoDia.toFixed(2)}`;
    faturamentoMesEl.textContent = `R$ ${faturamentoMes.toFixed(2)}`;

    // 5. Chama a função para desenhar os gráficos
    desenharGraficos(contagemPagamentos);
  }

  // [ATUALIZADO] Função para criar/atualizar os gráficos (com cores de tema)
  function desenharGraficos(dados) {
    
    // Detecta o modo escuro para as cores do texto do gráfico
    const isDarkMode = document.body.classList.contains('dark-mode');
    const chartTextColor = isDarkMode ? '#f5f5f5' : '#333';
    
    Chart.defaults.color = chartTextColor; // Define a cor padrão do texto

    const labels = ['Dinheiro', 'Pix', 'Cartão'];
    const dataCounts = [dados.dinheiro, dados.pix, dados.cartao];
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)'
    ];

    // --- GRÁFICO DE PIZZA ---
    if (graficoPizza) graficoPizza.destroy();
    
    graficoPizza = new Chart(ctxPizza, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: dataCounts,
          backgroundColor: backgroundColors,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { 
            position: 'top',
            labels: { color: chartTextColor }
          }
        }
      }
    });

    // --- GRÁFICO DE BARRAS ---
    if (graficoBarras) graficoBarras.destroy();

    graficoBarras = new Chart(ctxBarras, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Qtd. de Pedidos',
          data: dataCounts,
          backgroundColor: backgroundColors,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { 
              stepSize: 1, 
              color: chartTextColor 
            },
            grid: { color: isDarkMode ? '#333' : '#eee' }
          },
          x: {
            ticks: { color: chartTextColor },
            grid: { display: false }
          }
        }
      }
    });
  }

  // ==================================
  // 4. INICIALIZAÇÃO
  // ==================================

  // "Ouvidores" de eventos
  formCadastroEl.addEventListener('submit', adicionarItem);
  botaoLimparEl.addEventListener('click', limparPedido);
  botaoFinalizarEl.addEventListener('click', finalizarPedido);
  
  // [NOVO] Ouvidor delegado para os botões da comanda
  listaPedidoEl.addEventListener('click', handleComandaClick);

  // Carrega o dashboard, gráficos e comanda vazia
  renderComanda();
  atualizarDashboard();

});
