'use client';

import React, { useMemo } from 'react';
import { 
  FiPackage, FiAlertCircle, FiDollarSign, FiBarChart2, 
  FiTag, FiStar, FiTrendingUp, FiActivity, FiGift, FiClock, 
  FiCalendar, FiTrendingDown, FiShield
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
        produtosExpirando: [],
        estoqueTotal: 0,
        valorTotalEstoque: 0,
        mediaRatingPorCategoria: [],
        produtosRecomendados: [],
        diasMediaGarantia: 0,
        produtosDestaqueCategoria: []
      };
    }

    // Agrupar produtos por categoria para análise
    const categorias = {};
    let estoqueTotal = 0;
    let valorTotalEstoque = 0;
    let somaGarantiaDias = 0;

    produtos.forEach(produto => {
      estoqueTotal += produto.quantidadeProduto;
      valorTotalEstoque += produto.quantidadeProduto * produto.precoProduto;
      
      // Calcular soma de garantias (se disponível)
      if (produto.periodoGarantia) {
        somaGarantiaDias += produto.periodoGarantia;
      }

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
      
    // Verificar produtos próximos à expiração (se tiver data de expiração)
    const hoje = new Date();
    const tresMesesAdiante = new Date();
    tresMesesAdiante.setMonth(hoje.getMonth() + 3);
    
    const produtosExpirando = [...produtos]
      .filter(p => {
        if (p.dataExpiracao && p.dataExpiracao !== 'N/A') {
          try {
            const [dia, mes, ano] = p.dataExpiracao.split('/');
            const dataExpiracao = new Date(ano, mes - 1, dia);
            return dataExpiracao > hoje && dataExpiracao < tresMesesAdiante;
          } catch (e) {
            return false;
          }
        }
        return false;
      })
      .sort((a, b) => {
        const [diaA, mesA, anoA] = a.dataExpiracao.split('/');
        const [diaB, mesB, anoB] = b.dataExpiracao.split('/');
        return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
      })
      .slice(0, 5);

    // Média de rating por categoria
    const mediaRatingPorCategoria = categoriaArray.map(cat => ({
      categoria: cat.nome,
      rating: cat.mediaRating,
      totalProdutos: cat.produtos.length
    })).sort((a, b) => b.rating - a.rating);
    
    // Destaque de produtos por categoria
    const produtosDestaqueCategoria = categoriaArray.map(cat => {
      // Encontrar o produto mais bem avaliado de cada categoria
      const produtoDestaque = [...cat.produtos]
        .sort((a, b) => b.ratingProduto - a.ratingProduto)[0];
      
      return {
        categoria: cat.nome,
        produtoNome: produtoDestaque.nome,
        rating: produtoDestaque.ratingProduto,
        estoque: produtoDestaque.quantidadeProduto,
        id: produtoDestaque.id
      };
    }).sort((a, b) => b.rating - a.rating).slice(0, 5);

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
    
    // Se temos produtos expirando em breve
    if (produtosExpirando.length > 0) {
      produtosExpirando.forEach(produto => {
        produtosRecomendados.push({
          id: produto.id,
          nome: produto.nome,
          tipo: 'expiracao',
          mensagem: `Atenção à validade: expira em ${produto.dataExpiracao}`
        });
      });
    }

    return {
      categoriasMaisEstoque,
      produtosBaixoEstoque,
      produtosExcessoEstoque,
      produtosMaiorValor,
      produtosExpirando,
      estoqueTotal,
      valorTotalEstoque,
      mediaRatingPorCategoria,
      produtosRecomendados,
      diasMediaGarantia: produtos.length > 0 ? Math.round(somaGarantiaDias / produtos.length) : 0,
      produtosDestaqueCategoria
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
              `Crítico: ${insights.produtosBaixoEstoque[0].nome}` : 
              'Nenhum produto com estoque crítico'}
          </p>
        </div>

        {/* Média de Avaliações */}
        <div className="bg-gradient-to-br from-yellow-900 to-yellow-700 rounded-lg p-4 shadow-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-yellow-200 text-sm">Produtos Expirando</p>
              <p className="text-white text-2xl font-bold">{insights.produtosExpirando.length}</p>
            </div>
            <div className="bg-yellow-600/30 p-3 rounded-lg">
              <FiCalendar className="text-yellow-200 text-xl" />
            </div>
          </div>
          <p className="text-yellow-200 text-xs mt-2">
            {insights.produtosExpirando.length > 0 ? 
              `Próximo: ${insights.produtosExpirando[0].nome}` : 
              'Nenhum produto próximo ao vencimento'}
          </p>
        </div>
      </div>

      {/* Gráficos de análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Categorias com mais estoque */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-medium text-indigo-300 mb-4">Estoque por Categoria</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={insights.categoriasMaisEstoque}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis 
                  dataKey="nome" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={{ fill: '#cbd5e0' }}
                />
                <YAxis tick={{ fill: '#cbd5e0' }} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'estoque') return [value, 'Unidades em Estoque'];
                    if (name === 'valor') return [formataMoeda(value), 'Valor do Estoque'];
                    return [value, name];
                  }}
                  contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }}
                />
                <Legend />
                <Bar dataKey="estoque" fill="#8a85f7" name="Estoque" />
                <Bar dataKey="valor" fill="#82e9c1" name="Valor (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Média de avaliação por categoria */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-medium text-indigo-300 mb-4">Qualidade por Categoria</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={insights.mediaRatingPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalProdutos"
                  nameKey="categoria"
                  label={({ categoria, rating }) => `${categoria}: ${rating.toFixed(1)}`}
                >
                  {insights.mediaRatingPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (name === 'totalProdutos') return [value, 'Quantidade de Produtos'];
                    return [value, name];
                  }}
                  contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alertas e Recomendações */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
        <h3 className="text-lg font-medium text-indigo-300 mb-4 flex items-center">
          <FiAlertCircle className="mr-2" /> Alertas e Recomendações
        </h3>

        {insights.produtosRecomendados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.produtosRecomendados.slice(0, 6).map((recomendacao, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg flex items-start ${
                  recomendacao.tipo === 'reposicao' ? 'bg-red-900/30 border border-red-700' : 
                  recomendacao.tipo === 'excesso' ? 'bg-blue-900/30 border border-blue-700' :
                  'bg-yellow-900/30 border border-yellow-700'
                }`}
              >
                <div className={`p-2 rounded mr-3 ${
                  recomendacao.tipo === 'reposicao' ? 'bg-red-800' : 
                  recomendacao.tipo === 'excesso' ? 'bg-blue-800' :
                  'bg-yellow-800'
                }`}>
                  {recomendacao.tipo === 'reposicao' ? (
                    <FiTrendingDown className="text-red-300" />
                  ) : recomendacao.tipo === 'excesso' ? (
                    <FiTrendingUp className="text-blue-300" />
                  ) : (
                    <FiClock className="text-yellow-300" />
                  )}
                </div>
                <div>
                  <p className={`font-medium ${
                    recomendacao.tipo === 'reposicao' ? 'text-red-300' : 
                    recomendacao.tipo === 'excesso' ? 'text-blue-300' :
                    'text-yellow-300'
                  }`}>
                    {recomendacao.nome}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">{recomendacao.mensagem}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Nenhuma recomendação disponível no momento.</p>
        )}
      </div>

      {/* Destaque de produtos por categoria */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-medium text-indigo-300 mb-4 flex items-center">
          <FiStar className="mr-2" /> Produtos em Destaque por Categoria
        </h3>
        
        {insights.produtosDestaqueCategoria.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avaliação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {insights.produtosDestaqueCategoria.map((destaque, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{destaque.categoria}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{destaque.produtoNome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-300">{destaque.rating.toFixed(1)}/5</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-300">{destaque.estoque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">Nenhum produto em destaque disponível.</p>
        )}
      </div>
    </div>
  );
};

export default InsightsSection; 