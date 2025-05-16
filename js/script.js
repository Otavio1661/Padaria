document.addEventListener('DOMContentLoaded', () => {
  const produtosIniciais = [
    { id: 1, nome: 'Pão Francês', preco: 0.50 },
    { id: 2, nome: 'Croissant de Chocolate', preco: 4.50 },
    { id: 3, nome: 'Bolo de Cenoura com Cobertura', preco: 15.00 },
    { id: 4, nome: 'Pão de Queijo', preco: 2.00 },
    { id: 5, nome: 'Sonho com Doce de Leite', preco: 5.00 },
    { id: 6, nome: 'Torta de Frango', preco: 18.00 }
  ];

  let produtos = JSON.parse(localStorage.getItem('produtos')) || produtosIniciais;
  let carrinho = [];
  const clientes = JSON.parse(localStorage.getItem('clientes')) || [];

  function salvarProdutos() {
    localStorage.setItem('produtos', JSON.stringify(produtos));
  }

  function renderProdutos(filtro = '') {
    const container = document.getElementById('produtos');
    container.innerHTML = '';
  
    const filtroMin = filtro.toLowerCase();
  
    const produtosOrdenados = [...produtos].sort((a, b) => {
      const aInclui = a.nome && a.nome.toLowerCase().includes(filtroMin);
      const bInclui = b.nome && b.nome.toLowerCase().includes(filtroMin);
      return (bInclui ? 1 : 0) - (aInclui ? 1 : 0);
    });
  
    produtosOrdenados.forEach((p) => {
      if (!p.nome || typeof p.preco !== 'number') return;
  
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `<h3>${p.nome}</h3><p>R$ ${p.preco.toFixed(2)}</p>`;
  
      const botoes = document.createElement('div');
      botoes.style.display = 'flex';
      botoes.style.justifyContent = 'space-around';
  
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
        const idx = produtos.findIndex(prod => prod.id === p.id);
        if (idx > -1) {
          produtos.splice(idx, 1);
          salvarProdutos();
          renderProdutos(filtro);
        }
      };
  
      botoes.appendChild(btnAdd);
      botoes.appendChild(btnRemover);
      card.appendChild(botoes);
      container.appendChild(card);
    });
  }
  
  let itemCount = {};

  function renderCarrinho() {
    const container = document.getElementById('itens-carrinho');
    const totalElement = document.getElementById('total');
    container.innerHTML = '';
    let total = 0;
    itemCount = {};

    carrinho.forEach((item, index) => {
      itemCount[item.nome] = (itemCount[item.nome] || 0) + 1;

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

      total += item.preco;
    });

    totalElement.textContent = total.toFixed(2);
    document.getElementById('checkout').disabled = carrinho.length === 0;
  }

  document.getElementById('checkout').onclick = () => {
    if (clientes.length === 0) {
      alert('Cadastre pelo menos um cliente antes de finalizar.');
      return;
    }
  
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-cliente';
  
    const modal = document.createElement('div');
    modal.className = 'modal-content';
  
    const titulo = document.createElement('h3');
    titulo.textContent = 'Selecione o Cliente';
  
    const select = document.createElement('select');
    select.id = 'cliente-select';
  
    clientes.forEach((cliente, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${cliente.nome} - ${cliente.contato}`;
      select.appendChild(option);
    });
  
    const btnConfirmar = document.createElement('button');
    btnConfirmar.textContent = 'Confirmar Pedido';
    btnConfirmar.onclick = () => {
      const selectedIndex = select.value;
      const cliente = clientes[selectedIndex];
      const contato = cliente.contato.replace(/\D/g, '');
  
      const itemList = Object.keys(itemCount)
        .map(nome => `${itemCount[nome]} x ${nome}`)
        .join('\n');
  
      const total = carrinho.reduce((sum, item) => sum + item.preco, 0);
  
      const message = encodeURIComponent(
        `Olá ${cliente.nome},\n\nPadaria Pão Quente informa seu pedido:\n\n${itemList}\n\nTotal: R$ ${total.toFixed(2)}`
      );
  
      window.open(`https://wa.me/${contato}?text=${message}`, '_blank');
      document.body.removeChild(overlay);
    };
  
    modal.appendChild(titulo);
    modal.appendChild(select);
    modal.appendChild(btnConfirmar);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.style.marginLeft = '10px';
    btnCancelar.onclick = () => {
      document.body.removeChild(overlay);
    };

    modal.appendChild(titulo);
    modal.appendChild(select);
    modal.appendChild(btnConfirmar);
    modal.appendChild(btnCancelar);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
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

  document.getElementById('busca-produto').addEventListener('input', (e) => {
    const termo = e.target.value;
    renderProdutos(termo);
  });

  renderProdutos();
  renderCarrinho();
  renderClientes();
});