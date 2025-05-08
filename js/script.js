document.addEventListener('DOMContentLoaded', () => {
  const produtosIniciais = [
    { id: 1, nome: 'Mel Caseiro', preco: 10.0 },
    { id: 2, nome: 'Cesta de Vegetais', preco: 25.0 },
    { id: 3, nome: 'Geleia de Frutas', preco: 12.0 }
  ];

  let produtos = JSON.parse(localStorage.getItem('produtos')) || produtosIniciais;
  let carrinho = [];
  const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

  function salvarProdutos() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
  }

  function renderProdutos() {
    const container = document.getElementById('produtos');
    container.innerHTML = '';
    produtos.forEach((p, index) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `<h3>${p.nome}</h3><p>R$ ${p.preco.toFixed(2)}</p>`;

      const btnAdd = document.createElement('button');
      btnAdd.textContent = 'Adicionar';
      btnAdd.onclick = () => {
        carrinho.push(p);
        renderCarrinho();
      };

      const btnRemover = document.createElement('button');
      btnRemover.textContent = 'Remover';
      btnRemover.style.background = '#e53935';
      btnRemover.onclick = () => {
        produtos.splice(index, 1);
        salvarProdutos();
        renderProdutos();
      };

      card.appendChild(btnAdd);
      card.appendChild(btnRemover);
      container.appendChild(card);
    });
  }

  function renderCarrinho() {
    const container = document.getElementById('itens-carrinho');
    container.innerHTML = '';
    carrinho.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `${item.nome} - R$ ${item.preco.toFixed(2)} `;

      const btnRemover = document.createElement('button');
      btnRemover.textContent = 'Remover';
      btnRemover.onclick = () => {
        carrinho.splice(index, 1);
        renderCarrinho();
      };

      div.appendChild(btnRemover);
      container.appendChild(div);
    });
    document.getElementById('checkout').disabled = carrinho.length === 0;
  }

  document.getElementById('checkout').onclick = () => {
    if (clientes.length === 0) {
      alert('Cadastre pelo menos um cliente antes de finalizar.');
      return;
    }
    const contato = clientes[0].contato.replace(/\D/g, '');
    const message = encodeURIComponent(
      'Olá, gostaria de pedir: ' + carrinho.map(i => i.nome).join(', ')
    );
    window.open(`https://wa.me/${contato}?text=${message}`, '_blank');
  };

  function renderClientes() {
    const list = document.getElementById('lista-clientes');
    list.innerHTML = '';
    clientes.forEach((c, index) => {
      const li = document.createElement('li');
      li.className = 'cliente-item';
      li.innerHTML = `${c.nome} - ${c.contato} `;

      const btnRemover = document.createElement('button');
      btnRemover.textContent = 'Remover';
      btnRemover.onclick = () => {
        clientes.splice(index, 1);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        renderClientes();
      };

      li.appendChild(btnRemover);
      list.appendChild(li);
    });
  }

  document.getElementById('cliente-form').addEventListener('submit', e => {
    e.preventDefault();
    const nome = document.getElementById('nome-cliente').value;
    const contato = document.getElementById('contato-cliente').value;
    clientes.push({ nome, contato });
    localStorage.setItem('clientes', JSON.stringify(clientes));
    renderClientes();
    e.target.reset();
  });

  document.getElementById('produto-form').addEventListener('submit', e => {
    e.preventDefault();
    const nome = document.getElementById('nome-produto').value;
    const preco = parseFloat(document.getElementById('preco-produto').value);
    if (!nome || isNaN(preco)) return;
    produtos.push({ id: Date.now(), nome, preco });
    salvarProdutos();
    renderProdutos();
    e.target.reset();
  });

  renderProdutos();
  renderCarrinho();
  renderClientes();
});
