'use client';

import React, { useMemo } from 'react';
import { 
  FiPackage, FiAlertCircle, FiDollarSign, FiBarChart2, 
  FiTag, FiStar, FiTrendingUp, FiActivity, FiGift, FiClock 
} from 'react-icons/fi';
import { formataMoeda } from '../utils/insightData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, 
  ResponsiveContainer
} from 'recharts';

const InsightsSection = ({ produtos }) => {
  // Calcular insights com base nos dados
  const insights = useMemo(() => {
    if (!produtos || produtos.length === 0) {
      return {
        categoriasMaisEstoque: [],
        produtosBaixoEstoque: [],
        produtosExcessoEstoque: [],
        produtosMaiorValor: [],
        estoqueTotal: 0,
        valorTotalEstoque: 0,
        mediaRatingPorCategoria: [],
        produtosRecomendados: []
      };
    }

    // Agrupar produtos por categoria para análise
    const categorias = {};
    let estoqueTotal = 0;
    let valorTotalEstoque = 0;

    produtos.forEach(produto => {
      estoqueTotal += produto.quantidadeProduto;
      valorTotalEstoque += produto.quantidadeProduto * produto.precoProduto;

      // Agrupar por categoria
      if (!categorias[produto.categoriaProduto]) {
        categorias[produto.categoriaProduto] = {
          nome: produto.categoriaProduto,
          estoque: 0,
          valor: 0,
          produtos: [],
          somaRating: 0,
          countRating: 0
        };
      }

      categorias[produto.categoriaProduto].estoque += produto.quantidadeProduto;
      categorias[produto.categoriaProduto].valor += produto.quantidadeProduto * produto.precoProduto;
      categorias[produto.categoriaProduto].produtos.push(produto);
      categorias[produto.categoriaProduto].somaRating += produto.ratingProduto;
      categorias[produto.categoriaProduto].countRating += 1;
    });

    // Converter categorias para array e calcular médias
    const categoriaArray = Object.values(categorias).map(cat => ({
      ...cat,
      mediaRating: cat.somaRating / cat.countRating,
      mediaEstoque: cat.estoque / cat.produtos.length,
      mediaPreco: cat.produtos.reduce((sum, p) => sum + p.precoProduto, 0) / cat.produtos.length
    }));

    // Top 5 categorias com mais estoque
    const categoriasMaisEstoque = [...categoriaArray]
      .sort((a, b) => b.estoque - a.estoque)
      .slice(0, 5);

    // Produtos com estoque baixo (abaixo de 10 unidades)
    const produtosBaixoEstoque = [...produtos]
      .filter(p => p.quantidadeProduto < 10)
      .sort((a, b) => a.quantidadeProduto - b.quantidadeProduto)
      .slice(0, 5);

    // Produtos com excesso de estoque (considerando produtos com mais de 100 unidades)
    const produtosExcessoEstoque = [...produtos]
      .filter(p => p.quantidadeProduto > 100)
      .sort((a, b) => b.quantidadeProduto - a.quantidadeProduto)
      .slice(0, 5);

    // Produtos de maior valor em estoque (preço * quantidade)
    const produtosMaiorValor = [...produtos]
      .map(p => ({
        ...p,
        valorEstoque: p.precoProduto * p.quantidadeProduto
      }))
      .sort((a, b) => b.valorEstoque - a.valorEstoque)
      .slice(0, 5);

    // Média de rating por categoria
    const mediaRatingPorCategoria = categoriaArray.map(cat => ({
      categoria: cat.nome,
      rating: cat.mediaRating,
      totalProdutos: cat.produtos.length
    })).sort((a, b) => b.rating - a.rating);

    // Gerar recomendações baseadas nos insights
    const produtosRecomendados = [];
    
    // Se temos produtos com estoque baixo
    if (produtosBaixoEstoque.length > 0) {
      produtosBaixoEstoque.forEach(produto => {
        produtosRecomendados.push({
          id: produto.id,
          nome: produto.nome,
          tipo: 'reposicao',
          mensagem: `Reabastecer urgente: apenas ${produto.quantidadeProduto} unidades em estoque`
        });
      });
    }
    
    // Se temos produtos com excesso de estoque
    if (produtosExcessoEstoque.length > 0) {
      produtosExcessoEstoque.forEach(produto => {
        produtosRecomendados.push({
          id: produto.id,
          nome: produto.nome,
          tipo: 'excesso',
          mensagem: `Considerar promoção: ${produto.quantidadeProduto} unidades em estoque`
        });
      });
    }

    return {
      categoriasMaisEstoque,
      produtosBaixoEstoque,
      produtosExcessoEstoque,
      produtosMaiorValor,
      estoqueTotal,
      valorTotalEstoque,
      mediaRatingPorCategoria,
      produtosRecomendados
    };
  }, [produtos]);

  // Cores para os gráficos
  const COLORS = ['#8a85f7', '#82e9c1', '#ffdd63', '#ff8c40', '#4299ff', '#00ddb2'];

  return (
    <div className="mb-8">
      {/* Título da seção */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Insights de Inventário</h2>
        <span className="bg-indigo-600/20 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full">
          Baseado em {produtos.length} produtos
        </span>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Estoque Total */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-lg p-4 shadow-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-indigo-200 text-sm">Estoque Total</p>
              <p className="text-white text-2xl font-bold">{insights.estoqueTotal.toLocaleString()}</p>
            </div>
            <div className="bg-indigo-600/30 p-3 rounded-lg">
              <FiPackage className="text-indigo-200 text-xl" />
            </div>
          </div>
          <p className="text-indigo-200 text-xs mt-2">
            {insights.categoriasMaisEstoque.length > 0 ? 
              `Maior estoque: ${insights.categoriasMaisEstoque[0].nome}` : 
              'Nenhum dado de estoque disponível'}
          </p>
        </div>

        {/* Valor Total do Estoque */}
        <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-lg p-4 shadow-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-green-200 text-sm">Valor do Estoque</p>
              <p className="text-white text-2xl font-bold">{formataMoeda(insights.valorTotalEstoque)}</p>
            </div>
            <div className="bg-green-600/30 p-3 rounded-lg">
              <FiDollarSign className="text-green-200 text-xl" />
            </div>
          </div>
          <p className="text-green-200 text-xs mt-2">
            {insights.produtosMaiorValor.length > 0 ? 
              `Produto de maior valor: ${insights.produtosMaiorValor[0].nome}` : 
              'Nenhum dado de valor disponível'}
          </p>
        </div>

        {/* Produtos em Estoque Baixo */}
        <div className="bg-gradient-to-br from-red-900 to-red-700 rounded-lg p-4 shadow-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-red-200 text-sm">Estoque Baixo</p>
              <p className="text-white text-2xl font-bold">{produtos.filter(p => p.quantidadeProduto < 10).length}</p>
            </div>
            <div className="bg-red-600/30 p-3 rounded-lg">
              <FiAlertCircle className="text-red-200 text-xl" />
            </div>
          </div>
          <p className="text-red-200 text-xs mt-2">
            {insights.produtosBaixoEstoque.length > 0 ? 
              `Crítico: ${insights.produtosBaixoEstoque[0].nome} (${insights.produtosBaixoEstoque[0].quantidadeProduto} unidades)` : 
              'Todos produtos com estoque adequado'}
          </p>
        </div>

        {/* Avaliação Média */}
        <div className="bg-gradient-to-br from-amber-900 to-amber-700 rounded-lg p-4 shadow-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-amber-200 text-sm">Avaliação Média</p>
              <p className="text-white text-2xl font-bold">
                {(produtos.reduce((sum, p) => sum + p.ratingProduto, 0) / produtos.length).toFixed(1)}
              </p>
            </div>
            <div className="bg-amber-600/30 p-3 rounded-lg">
              <FiStar className="text-amber-200 text-xl" />
            </div>
          </div>
          <p className="text-amber-200 text-xs mt-2">
            {insights.mediaRatingPorCategoria.length > 0 ? 
              `Melhor categoria: ${insights.mediaRatingPorCategoria[0].categoria} (${insights.mediaRatingPorCategoria[0].rating.toFixed(1)})` : 
              'Sem dados de avaliação'}
          </p>
        </div>
      </div>

      {/* Gráficos de Inventário */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Estoque por Categoria */}
        <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
          <h3 className="text-white text-lg font-semibold mb-4">Estoque por Categoria</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={insights.categoriasMaisEstoque}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis type="number" tick={{fill: "#cbd5e0"}} />
                <YAxis dataKey="nome" type="category" width={80} tick={{fill: "#cbd5e0"}} />
                <Tooltip 
                  formatter={(value) => [value.toLocaleString(), 'Quantidade']} 
                  contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }}
                />
                <Legend formatter={(value) => <span style={{ color: '#cbd5e0' }}>{value}</span>} />
                <Bar dataKey="estoque" fill="#6c63ff" name="Estoque" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Valor por Categoria */}
        <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
          <h3 className="text-white text-lg font-semibold mb-4">Valor do Estoque por Categoria</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={insights.categoriasMaisEstoque}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="valor"
                  nameKey="nome"
                  label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                >
                  {insights.categoriasMaisEstoque.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formataMoeda(value), 'Valor do Estoque']} 
                  contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }}
                />
                <Legend formatter={(value) => <span style={{ color: '#cbd5e0' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Seção de recomendações */}
      <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
        <div className="flex items-center mb-4">
          <FiBarChart2 className="text-indigo-400 mr-2 text-xl" />
          <h3 className="text-white text-lg font-semibold">Recomendações e Alertas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reposição de Estoque */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-md bg-red-500/20 text-red-400 mr-3">
                <FiAlertCircle />
              </div>
              <h4 className="text-white font-medium">Reposição de Estoque Urgente</h4>
            </div>
            
            {insights.produtosBaixoEstoque.length > 0 ? (
              <ul className="space-y-2">
                {insights.produtosBaixoEstoque.map(produto => (
                  <li key={produto.id} className="bg-gray-800/50 rounded p-2 text-sm">
                    <span className="text-indigo-300 font-medium">{produto.nome}</span>
                    <div className="flex justify-between mt-1 text-xs">
                      <span className="text-gray-400">Estoque: <span className="text-red-400 font-medium">{produto.quantidadeProduto}</span></span>
                      <span className="text-gray-400">Preço: <span className="text-green-400 font-medium">{formataMoeda(produto.precoProduto)}</span></span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">Não há produtos que precisem de reposição urgente.</p>
            )}
          </div>

          {/* Produtos com excesso de estoque */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-md bg-amber-500/20 text-amber-400 mr-3">
                <FiTag />
              </div>
              <h4 className="text-white font-medium">Excesso de Estoque</h4>
            </div>
            
            {insights.produtosExcessoEstoque.length > 0 ? (
              <ul className="space-y-2">
                {insights.produtosExcessoEstoque.map(produto => (
                  <li key={produto.id} className="bg-gray-800/50 rounded p-2 text-sm">
                    <span className="text-indigo-300 font-medium">{produto.nome}</span>
                    <div className="flex justify-between mt-1 text-xs">
                      <span className="text-gray-400">Estoque: <span className="text-amber-400 font-medium">{produto.quantidadeProduto}</span></span>
                      <span className="text-gray-400">Valor: <span className="text-green-400 font-medium">{formataMoeda(produto.quantidadeProduto * produto.precoProduto)}</span></span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">Não há produtos com excesso de estoque.</p>
            )}
          </div>
        </div>

        {/* Produtos com maior valor em estoque */}
        <div className="mt-4 bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-md bg-green-500/20 text-green-400 mr-3">
              <FiDollarSign />
            </div>
            <h4 className="text-white font-medium">Produtos com Maior Valor em Estoque</h4>
          </div>
          
          {insights.produtosMaiorValor.length > 0 ? (
            <ul className="space-y-2">
              {insights.produtosMaiorValor.map(produto => (
                <li key={produto.id} className="bg-gray-800/50 rounded p-2 text-sm">
                  <span className="text-indigo-300 font-medium">{produto.nome}</span>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-gray-400">Estoque: <span className="text-blue-400 font-medium">{produto.quantidadeProduto}</span></span>
                    <span className="text-gray-400">Valor Total: <span className="text-green-400 font-medium">{formataMoeda(produto.valorEstoque)}</span></span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">Não foi possível calcular o valor do estoque.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsSection; 