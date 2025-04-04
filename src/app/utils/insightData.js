/**
 * Formata um valor numérico para o formato de moeda brasileira (R$)
 * @param {number} valor - O valor a ser formatado
 * @returns {string} O valor formatado como moeda
 */
export const formataMoeda = (valor) => {
  if (valor === undefined || valor === null) return 'R$ 0,00';

  return `R$ ${valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Formata uma data no formato DD/MM/AAAA 
 * @param {string} data - String de data no formato DD/MM/AAAA
 * @returns {string} A data formatada ou 'N/A' se inválida
 */
export const formataData = (data) => {
  if (!data || data === 'N/A') return 'N/A';
  
  try {
    const [dia, mes, ano] = data.split('/');
    return `${dia}/${mes}/${ano}`;
  } catch (err) {
    return 'N/A';
  }
};

/**
 * Calcula quantos dias restam para uma data
 * @param {string} dataFinal - Data no formato DD/MM/AAAA
 * @returns {number} Quantidade de dias ou -1 se data inválida
 */
export const diasRestantes = (dataFinal) => {
  if (!dataFinal || dataFinal === 'N/A') return -1;
  
  try {
    const [dia, mes, ano] = dataFinal.split('/');
    const dataAlvo = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    
    // Zerar horas, minutos e segundos para comparação apenas de dias
    hoje.setHours(0, 0, 0, 0);
    dataAlvo.setHours(0, 0, 0, 0);
    
    const diferencaEmMs = dataAlvo - hoje;
    return Math.floor(diferencaEmMs / (1000 * 60 * 60 * 24));
  } catch (err) {
    return -1;
  }
};

// Função para formatar números com duas casas decimais
export const formataNumero = (valor) => {
  return valor.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Insights sobre produtos mais valiosos
export const produtosMaisValiosos = (produtos = []) => {
  return [...produtos]
    .map(produto => ({
      ...produto,
      valorEstoque: produto.quantidadeProduto * produto.precoProduto
    }))
    .sort((a, b) => b.valorEstoque - a.valorEstoque)
    .slice(0, 5)
    .map(produto => ({
      nome: produto.nome,
      estoque: produto.quantidadeProduto,
      valorUnitario: produto.precoProduto,
      valorTotal: parseFloat((produto.quantidadeProduto * produto.precoProduto).toFixed(2)),
      categoria: produto.categoriaProduto
    }));
};

// Insights sobre categorias com maior estoque
export const categoriasComMaiorEstoque = (produtos = []) => {
  const categorias = {};
  
  produtos.forEach(produto => {
    const categoria = produto.categoriaProduto;
    const quantidade = produto.quantidadeProduto;
    const valor = quantidade * produto.precoProduto;
    
    if (!categorias[categoria]) {
      categorias[categoria] = { 
        nome: categoria, 
        estoque: 0, 
        valor: 0, 
        quantidade: 0,
        valorMedio: 0
      };
    }
    
    categorias[categoria].estoque += quantidade;
    categorias[categoria].valor += valor;
    categorias[categoria].quantidade += 1;
  });

  // Cálculo do valor médio por categoria
  Object.values(categorias).forEach(cat => {
    cat.valorMedio = cat.quantidade > 0 ? parseFloat((cat.valor / cat.quantidade).toFixed(2)) : 0;
    cat.valor = parseFloat(cat.valor.toFixed(2));
  });
  
  return Object.values(categorias)
    .sort((a, b) => b.estoque - a.estoque);
};

// Insights sobre produtos com baixo estoque
export const produtosBaixoEstoque = (produtos = []) => {
  const estoqueMinimo = 20; // Definição do que é considerado estoque baixo
  
  return [...produtos]
    .filter(produto => produto.quantidadeProduto < estoqueMinimo)
    .sort((a, b) => a.quantidadeProduto - b.quantidadeProduto)
    .map(produto => ({
      nome: produto.nome,
      estoque: produto.quantidadeProduto,
      categoria: produto.categoriaProduto,
      precoUnitario: parseFloat(produto.precoProduto.toFixed(2)),
      valorEstoque: parseFloat((produto.quantidadeProduto * produto.precoProduto).toFixed(2))
    }));
};

// Insights sobre produtos com excesso de estoque
export const produtosExcessoEstoque = (produtos = []) => {
  const estoqueAlto = 100; // Limite para considerar estoque alto
  
  return [...produtos]
    .filter(produto => produto.quantidadeProduto > estoqueAlto)
    .sort((a, b) => b.quantidadeProduto - a.quantidadeProduto)
    .map(produto => ({
      nome: produto.nome,
      estoque: produto.quantidadeProduto,
      categoria: produto.categoriaProduto,
      valor: parseFloat((produto.quantidadeProduto * produto.precoProduto).toFixed(2)),
      rating: parseFloat(produto.ratingProduto.toFixed(1))
    }));
};

// Insights sobre produtos com boa avaliação (potencial para promoção)
export const produtosComBomRating = (produtos = []) => {
  const bomRating = 4.5; // Limite para considerar uma boa avaliação
  
  return [...produtos]
    .filter(produto => produto.ratingProduto >= bomRating)
    .sort((a, b) => b.ratingProduto - a.ratingProduto)
    .map(produto => ({
      nome: produto.nome,
      rating: parseFloat(produto.ratingProduto.toFixed(1)),
      estoque: produto.quantidadeProduto,
      categoria: produto.categoriaProduto,
      valor: parseFloat((produto.quantidadeProduto * produto.precoProduto).toFixed(2))
    }));
};

// Insights sobre produtos próximos da data de expiração
export const produtosComExpiracaoProxima = (produtos = []) => {
  const dataAtual = new Date();
  const tresMesesAdiante = new Date();
  tresMesesAdiante.setMonth(dataAtual.getMonth() + 3);
  
  return [...produtos]
    .filter(prod => {
      if (prod.dataExpiracao === 'N/A') return false;
      
      const partes = prod.dataExpiracao.split('/');
      const dataExpiracao = new Date(partes[2], partes[1] - 1, partes[0]);
      
      return dataExpiracao > dataAtual && dataExpiracao <= tresMesesAdiante;
    })
    .map(produto => ({
      nome: produto.nome,
      dataExpiracao: produto.dataExpiracao,
      categoria: produto.categoriaProduto,
      estoque: produto.quantidadeProduto
    }));
};

// Insights sobre relação entre rating e estoque
export const relacaoRatingEstoque = (produtos = []) => {
  const result = {
    ratingAltoEstoqueAlto: 0,
    ratingBaixoEstoqueAlto: 0,
    ratingAltoEstoqueBaixo: 0,
    ratingBaixoEstoqueBaixo: 0,
    mediaEstoquePorRating: {}
  };
  
  // Definição de limites
  const limiteRatingAlto = 4.5;
  const limiteEstoqueAlto = 50;
  
  // Agregação de dados por rating
  const estoquePorRating = {};
  const contagemPorRating = {};
  
  produtos.forEach(produto => {
    const rating = produto.ratingProduto.toFixed(1);
    const estoque = produto.quantidadeProduto;
    
    // Contagem para quadrantes
    if (produto.ratingProduto >= limiteRatingAlto && estoque >= limiteEstoqueAlto) {
      result.ratingAltoEstoqueAlto++;
    } else if (produto.ratingProduto < limiteRatingAlto && estoque >= limiteEstoqueAlto) {
      result.ratingBaixoEstoqueAlto++;
    } else if (produto.ratingProduto >= limiteRatingAlto && estoque < limiteEstoqueAlto) {
      result.ratingAltoEstoqueBaixo++;
    } else {
      result.ratingBaixoEstoqueBaixo++;
    }
    
    // Agregação para média de estoque por rating
    if (!estoquePorRating[rating]) {
      estoquePorRating[rating] = 0;
      contagemPorRating[rating] = 0;
    }
    
    estoquePorRating[rating] += estoque;
    contagemPorRating[rating]++;
  });
  
  // Cálculo das médias
  Object.keys(estoquePorRating).forEach(rating => {
    result.mediaEstoquePorRating[rating] = estoquePorRating[rating] / contagemPorRating[rating];
  });
  
  return result;
};

// Dados consolidados para dashboard
export const dadosConsolidados = (produtos = []) => {
  if (produtos.length === 0) {
    return {
      totalProdutos: 0,
      estoqueTotal: 0,
      valorTotalEstoque: 0,
      estoqueProximoExpiracao: 0,
      mediaRating: "0.00",
      distribuicaoCategorias: {},
      topProdutoMaisCaro: { nome: "", preco: 0 },
      topProdutoMaisBarato: { nome: "", preco: 0 },
      totalProdutosBaixoEstoque: 0
    };
  }

  // Totais gerais
  const totalProdutos = produtos.length;
  const estoqueTotal = produtos.reduce((acc, prod) => acc + prod.quantidadeProduto, 0);
  const valorTotalEstoque = produtos.reduce((acc, prod) => acc + (prod.quantidadeProduto * prod.precoProduto), 0);
  
  // Calcular produtos próximo à expiração
  const dataAtual = new Date();
  const tresMesesAdiante = new Date();
  tresMesesAdiante.setMonth(dataAtual.getMonth() + 3);
  
  const produtosExpirandoEmBreve = produtos.filter(prod => {
    if (prod.dataExpiracao === 'N/A') return false;
    
    try {
      const partes = prod.dataExpiracao.split('/');
      const dataExpiracao = new Date(partes[2], partes[1] - 1, partes[0]);
      return dataExpiracao > dataAtual && dataExpiracao <= tresMesesAdiante;
    } catch(e) {
      return false;
    }
  });
  
  // Média de rating
  const mediaRating = totalProdutos > 0 
    ? produtos.reduce((acc, prod) => acc + prod.ratingProduto, 0) / totalProdutos
    : 0;
  
  // Produto mais caro e mais barato
  const produtoMaisCaro = produtos.length > 0 
    ? [...produtos].sort((a, b) => b.precoProduto - a.precoProduto)[0]
    : { nome: "", precoProduto: 0 };
    
  const produtoMaisBarato = produtos.length > 0 
    ? [...produtos].sort((a, b) => a.precoProduto - b.precoProduto)[0]
    : { nome: "", precoProduto: 0 };
  
  // Distribuição de produtos por categoria
  const distribuicaoCategorias = {};
  produtos.forEach(produto => {
    const categoria = produto.categoriaProduto;
    if (!distribuicaoCategorias[categoria]) {
      distribuicaoCategorias[categoria] = 0;
    }
    distribuicaoCategorias[categoria]++;
  });
  
  // Produtos com estoque baixo
  const produtosBaixoEstoque = produtos.filter(p => p.quantidadeProduto < 20);
  
  return {
    totalProdutos,
    estoqueTotal,
    valorTotalEstoque: parseFloat(valorTotalEstoque.toFixed(2)),
    estoqueProximoExpiracao: produtosExpirandoEmBreve.length,
    mediaRating: mediaRating.toFixed(2),
    distribuicaoCategorias,
    topProdutoMaisCaro: {
      nome: produtoMaisCaro.nome,
      preco: parseFloat(produtoMaisCaro.precoProduto.toFixed(2))
    },
    topProdutoMaisBarato: {
      nome: produtoMaisBarato.nome,
      preco: parseFloat(produtoMaisBarato.precoProduto.toFixed(2))
    },
    totalProdutosBaixoEstoque: produtosBaixoEstoque.length
  };
}; 