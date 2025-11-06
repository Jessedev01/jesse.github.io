// Espera o HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

  // Seleciona todos os botões de "adicionar"
  const botoesAdicionar = document.querySelectorAll('.add-btn');
  
  // Seleciona a lista onde os itens do pedido vão entrar
  const listaPedido = document.getElementById('lista-pedido');
  
  // Seleciona o elemento que mostra o valor total
  const totalDisplay = document.getElementById('total-pedido');

  // Seleciona o botão de limpar
  const botaoLimpar = document.getElementById('reset-btn');

  // Variável para guardar o valor total do pedido
  let totalPedido = 0;

  // Adiciona um "ouvidor de clique" para cada botão de adicionar
  botoesAdicionar.forEach(botao => {
    botao.addEventListener('click', () => {
      // Pega o elemento <li> pai do botão que foi clicado
      const itemMenu = botao.closest('.menu-item');
      
      // Pega o nome e o preço do item a partir dos atributos 'data-'
      const nomeItem = itemMenu.dataset.nome;
      const precoItem = parseFloat(itemMenu.dataset.preco); // Converte o preço de texto para número

      // 1. Adiciona o item na lista da comanda
      const novoItemLista = document.createElement('li'); // Cria um novo <li>
      novoItemLista.textContent = `${nomeItem} - R$ ${precoItem.toFixed(2)}`; // Define o texto
      listaPedido.appendChild(novoItemLista); // Adiciona o <li> na lista

      // 2. Atualiza o valor total
      totalPedido += precoItem; // Soma o preço do item ao total
      
      // 3. Mostra o novo total na tela, formatado
      totalDisplay.textContent = `R$ ${totalPedido.toFixed(2)}`;
    });
  });

  // Adiciona a funcionalidade de limpar o pedido
  botaoLimpar.addEventListener('click', () => {
    // 1. Zera o total
    totalPedido = 0;
    
    // 2. Atualiza o display do total
    totalDisplay.textContent = 'R$ 0,00';
    
    // 3. Remove todos os itens da lista
    listaPedido.innerHTML = ''; // Apaga todo o HTML de dentro da lista
  });

});
