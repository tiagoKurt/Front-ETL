import { productData } from './data/productData';

// Função para formatar valores monetários em reais com duas casas decimais
export const formataMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Função para formatar números com duas casas decimais
export const formataNumero = (valor) => {
  return valor.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Insights sobre produtos mais vendidos
export const produtosMaisVendidos = () => {
  return [...productData]
    .sort((a, b) => (b.vendasTotais || 0) - (a.vendasTotais || 0))
    .slice(0, 5)
    .map(produto => ({
      nome: produto.nome,
      vendasTotais: produto.vendasTotais || 0,
      receita: parseFloat(((produto.vendasTotais || 0) * produto.precoProduto).toFixed(2)),
      categoria: produto.categoriaProduto
    }));
};

// Insights sobre categorias mais rentáveis
export const categoriasMaisRentaveis = () => {
  const categorias = {};
  
  productData.forEach(produto => {
    const categoria = produto.categoriaProduto;
    const vendas = produto.vendasTotais || 0;
    const receita = vendas * produto.precoProduto;
    
    if (!categorias[categoria]) {
      categorias[categoria] = { 
        nome: categoria, 
        vendas: 0, 
        receita: 0, 
        quantidade: 0,
        ticketMedio: 0
      };
    }
    
    categorias[categoria].vendas += vendas;
    categorias[categoria].receita += receita;
    categorias[categoria].quantidade += 1;
  });

  // Cálculo do ticket médio por categoria
  Object.values(categorias).forEach(cat => {
    cat.ticketMedio = cat.vendas > 0 ? parseFloat((cat.receita / cat.vendas).toFixed(2)) : 0;
    cat.receita = parseFloat(cat.receita.toFixed(2));
  });
  
  return Object.values(categorias)
    .sort((a, b) => b.receita - a.receita);
};

// Insights sobre produtos com baixo estoque
export const produtosBaixoEstoque = () => {
  const estoqueMinimo = 20; // Definição do que é considerado estoque baixo
  
  return [...productData]
    .filter(produto => produto.quantidadeProduto < estoqueMinimo)
    .sort((a, b) => a.quantidadeProduto - b.quantidadeProduto)
    .map(produto => ({
      nome: produto.nome,
      estoque: produto.quantidadeProduto,
      categoria: produto.categoriaProduto,
      precoUnitario: parseFloat(produto.precoProduto.toFixed(2)),
      vendasTotais: produto.vendasTotais || 0
    }));
};

// Insights sobre produtos com alto potencial de crescimento (boa avaliação mas vendas moderadas)
export const produtosComPotencialCrescimento = () => {
  const vendasModeras = 400; // Limite para considerar vendas moderadas
  const bomRating = 4.5; // Limite para considerar uma boa avaliação
  
  return [...productData]
    .filter(produto => 
      (produto.vendasTotais || 0) < vendasModeras && 
      produto.ratingProduto >= bomRating
    )
    .sort((a, b) => b.ratingProduto - a.ratingProduto)
    .map(produto => ({
      nome: produto.nome,
      rating: parseFloat(produto.ratingProduto.toFixed(1)),
      vendas: produto.vendasTotais || 0,
      categoria: produto.categoriaProduto,
      receita: parseFloat(((produto.vendasTotais || 0) * produto.precoProduto).toFixed(2)),
      estoque: produto.quantidadeProduto
    }));
};

// Insights sobre produtos próximos da data de expiração
export const produtosComExpiracaoProxima = () => {
  const dataAtual = new Date();
  const tresMesesAdiante = new Date();
  tresMesesAdiante.setMonth(dataAtual.getMonth() + 3);
  
  return [...productData]
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

// Insights sobre relação entre rating e vendas
export const relacaoRatingVendas = () => {
  const result = {
    ratingAltoVendasAltas: 0,
    ratingBaixoVendasAltas: 0,
    ratingAltoVendasBaixas: 0,
    ratingBaixoVendasBaixas: 0,
    mediaVendasPorRating: {}
  };
  
  // Definição de limites
  const limiteRatingAlto = 4.5;
  const limiteVendasAltas = 400;
  
  // Agregação de dados por rating
  const vendasPorRating = {};
  const contagemPorRating = {};
  
  productData.forEach(produto => {
    const rating = produto.ratingProduto.toFixed(1);
    const vendas = produto.vendasTotais || 0;
    
    // Contagem para quadrantes
    if (produto.ratingProduto >= limiteRatingAlto && vendas >= limiteVendasAltas) {
      result.ratingAltoVendasAltas++;
    } else if (produto.ratingProduto < limiteRatingAlto && vendas >= limiteVendasAltas) {
      result.ratingBaixoVendasAltas++;
    } else if (produto.ratingProduto >= limiteRatingAlto && vendas < limiteVendasAltas) {
      result.ratingAltoVendasBaixas++;
    } else {
      result.ratingBaixoVendasBaixas++;
    }
    
    // Agregação para média de vendas por rating
    if (!vendasPorRating[rating]) {
      vendasPorRating[rating] = 0;
      contagemPorRating[rating] = 0;
    }
    
    vendasPorRating[rating] += vendas;
    contagemPorRating[rating]++;
  });
  
  // Cálculo das médias
  Object.keys(vendasPorRating).forEach(rating => {
    result.mediaVendasPorRating[rating] = vendasPorRating[rating] / contagemPorRating[rating];
  });
  
  return result;
};

// Dados consolidados para dashboard
export const dadosConsolidados = () => {
  // Totais gerais
  const totalProdutos = productData.length;
  const totalVendas = productData.reduce((acc, prod) => acc + (prod.vendasTotais || 0), 0);
  const receitaTotal = productData.reduce((acc, prod) => acc + ((prod.vendasTotais || 0) * prod.precoProduto), 0);
  const estoqueTotal = productData.reduce((acc, prod) => acc + prod.quantidadeProduto, 0);
  
  // Média de rating
  const mediaRating = productData.reduce((acc, prod) => acc + prod.ratingProduto, 0) / totalProdutos;
  
  // Produto mais caro e mais barato
  const produtoMaisCaro = [...productData].sort((a, b) => b.precoProduto - a.precoProduto)[0];
  const produtoMaisBarato = [...productData].sort((a, b) => a.precoProduto - b.precoProduto)[0];
  
  // Distribuição de produtos por categoria
  const distribuicaoCategorias = {};
  productData.forEach(produto => {
    const categoria = produto.categoriaProduto;
    if (!distribuicaoCategorias[categoria]) {
      distribuicaoCategorias[categoria] = 0;
    }
    distribuicaoCategorias[categoria]++;
  });
  
  return {
    totalProdutos,
    totalVendas,
    receitaTotal: parseFloat(receitaTotal.toFixed(2)),
    estoqueTotal,
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
    ratioEstoqueVendas: parseFloat((estoqueTotal / totalVendas).toFixed(2))
  };
}; 