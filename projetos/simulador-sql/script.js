// Espera o DOM carregar
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. O "BANCO DE DADOS" FALSO ---
  // Guardamos nossas tabelas como arrays de objetos
  const db = {
    
    clientes: [
      { id: 1, nome: "Jessé Almeida", email: "jesse@email.com", cidade: "São Paulo" },
      { id: 2, nome: "Maria Silva", email: "maria@email.com", cidade: "Rio de Janeiro" },
      { id: 3, nome: "Carlos Souza", email: "carlos@email.com", cidade: "Belo Horizonte" },
      { id: 4, nome: "Ana Pereira", email: "ana@email.com", cidade: "São Paulo" }
    ],
    
    produtos: [
      { id_produto: 101, nome: "Café Espresso", preco: 5.00, estoque: 50 },
      { id_produto: 102, nome: "Cappuccino", preco: 8.50, estoque: 30 },
      { id_produto: 103, nome: "Pão de Queijo", preco: 4.00, estoque: 100 }
    ]
    
  }; // Fim do 'db'

  // --- 2. SELETORES DO DOM ---
  const form = document.getElementById('sql-form');
  const input = document.getElementById('sql-input');
  const historico = document.getElementById('historico');
  const resultadoContainer = document.getElementById('resultado-container');

  // --- 3. OUVIR O "SUBMIT" DO FORMULÁRIO ---
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    
    const query = input.value; // Pega o comando
    if (!query) return; // Não faz nada se estiver vazio

    // Limpa o input e o resultado anterior
    input.value = '';
    resultadoContainer.innerHTML = '';
    
    // Adiciona o comando ao histórico
    adicionarAoHistorico(query, 'comando-usuario');

    try {
      // Tenta executar o "motor" do SQL
      const resultado = executarSQL(query);
      
      // Se deu certo, renderiza a tabela
      renderTabela(resultado);
      
    } catch (erro) {
      // Se deu errado, mostra a mensagem de erro
      adicionarAoHistorico(erro.message, 'mensagem-erro');
    }
  });

  // --- 4. O "MOTOR" DO SQL (VERSÃO 1.0) ---
  function executarSQL(query) {
    // Converte a query para minúsculas e remove espaços extras
    const queryLimpa = query.toLowerCase().trim();

    // Regex para "SELECT * FROM [tabela]"
    // \s+ significa "um ou mais espaços"
    // (\w+) captura uma "palavra" (o nome da tabela)
    const regexSelect = /select\s+\*\s+from\s+(\w+)/;
    
    const match = queryLimpa.match(regexSelect);

    // Se a query NÃO BATER com o nosso Regex simples
    if (!match) {
      throw new Error(`ERRO: Sintaxe não suportada. Tente "SELECT * FROM [tabela]"`);
    }

    // O Regex captura a palavra no índice 1 (índice 0 é a string inteira)
    const tabelaNome = match[1];

    // Verifica se a tabela existe no nosso 'db'
    if (db.hasOwnProperty(tabelaNome)) {
      // SUCESSO! Retorna os dados da tabela
      return db[tabelaNome];
    } else {
      // ERRO! Tabela não encontrada
      throw new Error(`ERRO: Tabela "${tabelaNome}" não encontrada.`);
    }
  }

  // --- 5. FUNÇÕES "AJUDANTES" (HELPERS) ---

  // Função para adicionar texto no histórico
  function adicionarAoHistorico(texto, classeCss) {
    const div = document.createElement('div');
    if (classeCss) {
      div.className = classeCss;
    }
    
    // Se for um comando, adiciona o prompt ">"
    if (classeCss === 'comando-usuario') {
      div.textContent = `> ${texto}`;
    } else {
      div.textContent = texto;
    }
    
    historico.appendChild(div);
    // Rola o histórico para o final
    historico.scrollTop = historico.scrollHeight;
  }

  // Função para renderizar os dados em uma tabela HTML
  function renderTabela(dados) {
    if (!dados || dados.length === 0) {
      adicionarAoHistorico("Consulta executada, 0 linhas retornadas.", "mensagem-info");
      return;
    }

    const tabela = document.createElement('table');
    
    // 1. Cria o Cabeçalho (<th>)
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    // Pega as chaves (colunas) do PRIMEIRO objeto
    const colunas = Object.keys(dados[0]); 
    colunas.forEach(coluna => {
      const th = document.createElement('th');
      th.textContent = coluna;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    tabela.appendChild(thead);

    // 2. Cria o Corpo (<tbody>)
    const tbody = document.createElement('tbody');
    dados.forEach(linha => { // Para cada objeto no array...
      const trBody = document.createElement('tr');
      colunas.forEach(coluna => { // Para cada coluna...
        const td = document.createElement('td');
        td.textContent = linha[coluna]; // Pega o valor
        trBody.appendChild(td);
      });
      tbody.appendChild(trBody);
    });
    tabela.appendChild(tbody);

    // Adiciona a tabela ao container
    resultadoContainer.appendChild(tabela);
    
    // Mensagem de sucesso no histórico
    adicionarAoHistorico(`${dados.length} linhas retornadas.`);
  }

}); // Fim do 'DOMContentLoaded'
