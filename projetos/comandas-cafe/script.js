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

  // [NOVO] Seletores dos Canvas (quadros) dos gráficos
  const ctxPizza = document.getElementById('grafico-pizza-pagamentos');
  const ctxBarras = document.getElementById('grafico-barras-pagamentos');

  // --- VARIÁVEIS DE ESTADO ---
  let pedidoAtualItens = []; 
  let pedidoAtualTotal = 0;

  // [NOVO] Variáveis para guardar as instâncias dos gráficos
  let graficoPizza = null;
  let graficoBarras = null;

  // --- FUNÇÕES PRINCIPAIS ---

  function adicionarItem(e) {
    e.preventDefault(); 
    const nome = itemNomeEl.value;
    const precoEmCentavos = parseInt(itemPrecoEl.value, 10);

    if (!nome || isNaN(precoEmCentavos) || precoEmCentavos <= 0) {
      alert('Por favor, insira um nome e um preço (em centavos) válidos.\n\nExemplo: 800 (para R$ 8,00)');
      return;
    }
    
    const precoEmReais = precoEmCentavos / 100.0;
    
    pedidoAtualItens.push({ nome: nome, preco: precoEmReais });
    
    const novoItemLista = document.createElement('li');
    novoItemLista.textContent = `${nome} - R$ ${precoEmReais.toFixed(2)}`;
    listaPedidoEl.appendChild(novoItemLista);

    pedidoAtualTotal += precoEmReais;
    totalDisplayEl.textContent = `R$ ${pedidoAtualTotal.toFixed(2)}`;

    itemNomeEl.value = '';
    itemPrecoEl.value = '';
    itemNomeEl.focus(); 
  }

  function limparPedido() {
    pedidoAtualItens = [];
    pedidoAtualTotal = 0;
    listaPedidoEl.innerHTML = '';
    totalDisplayEl.textContent = 'R$ 0,00';
  }

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
    atualizarDashboard(); // Esta função agora vai atualizar os gráficos
    alert('Pedido finalizado e salvo no histórico!');
  }
  
  // --- FUNÇÕES DO DASHBOARD (COM GRÁFICOS) ---
  
  function atualizarDashboard() {
    const historico = JSON.parse(localStorage.getItem('historicoPedidos')) || [];
    const hoje = new Date();
    
    let faturamentoDia = 0;
    let faturamentoMes = 0;
    
    // [NOVO] Objeto para contar os pagamentos
    const contagemPagamentos = {
      'dinheiro': 0,
      'pix': 0,
      'cartao': 0
    };

    historicoPedidosEl.innerHTML = '';
    
    historico.slice().reverse().forEach(pedido => {
      const dataPedido = new Date(pedido.data);

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

      // 4. [NOVO] Conta os tipos de pagamento
      if (pedido.pagamento && contagemPagamentos.hasOwnProperty(pedido.pagamento)) {
        contagemPagamentos[pedido.pagamento]++;
      }
    });

    faturamentoDiaEl.textContent = `R$ ${faturamentoDia.toFixed(2)}`;
    faturamentoMesEl.textContent = `R$ ${faturamentoMes.toFixed(2)}`;

    // 5. [NOVO] Chama a função para desenhar os gráficos
    desenharGraficos(contagemPagamentos);
  }

  // [NOVA FUNÇÃO] Para criar/atualizar os gráficos
  function desenharGraficos(dados) {
    
    // Dados e cores para os gráficos
    const labels = ['Dinheiro', 'Pix', 'Cartão'];
    const dataCounts = [dados.dinheiro, dados.pix, dados.cartao];
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)'
    ];

    // --- GRÁFICO DE PIZZA ---

    // Destrói o gráfico antigo se ele existir (para não sobrepor)
    if (graficoPizza) {
      graficoPizza.destroy();
    }
    
    graficoPizza = new Chart(ctxPizza, {
      type: 'pie', // Tipo de gráfico
      data: {
        labels: labels,
        datasets: [{
          label: 'Formas de Pagamento',
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
          }
        }
      }
    });

    // --- GRÁFICO DE BARRAS ---

    // Destrói o gráfico antigo se ele existir
    if (graficoBarras) {
      graficoBarras.destroy();
    }

    graficoBarras = new Chart(ctxBarras, {
      type: 'bar', // Tipo de gráfico
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
          legend: {
            display: false // Não precisa de legenda, o eixo X já diz
          }
        },
        scales: {
          y: {
            beginAtZero: true, // Começa o eixo Y do zero
            ticks: {
              stepSize: 1 // Mostra apenas números inteiros (1, 2, 3...)
            }
          }
        }
      }
    });
  }

  // --- INICIALIZAÇÃO ---

  // Ouve o "submit" do formulário
  formCadastroEl.addEventListener('submit', adicionarItem);
  
  // Ouve os cliques nos botões de limpar e finalizar
  botaoLimparEl.addEventListener('click', limparPedido);
  botaoFinalizarEl.addEventListener('click', finalizarPedido);

  // Carrega o dashboard e os gráficos assim que a página abre
  atualizarDashboard();

});
