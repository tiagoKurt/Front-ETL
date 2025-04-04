'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiCalendar, FiDownload, FiFilter, FiRefreshCw, FiPackage, FiDollarSign, FiStar } from 'react-icons/fi';
import Header from '../../components/Header';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export default function AnaliseInventario() {
  const [produtos, setProdutos] = useState([]);
  const [periodoAnalise, setPeriodoAnalise] = useState('mensal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simular evolução do estoque por mês com base nos dados atuais
  const evolucaoEstoquePorMes = useMemo(() => {
    if (!produtos.length) return [];
    
    const totalEstoque = produtos.reduce((sum, p) => sum + p.quantidadeProduto, 0);
    const valorTotalEstoque = produtos.reduce((sum, p) => sum + (p.quantidadeProduto * p.precoProduto), 0);
    
    // Distribuição por meses com um padrão de consumo realista (decrescente)
    const distribuicaoPorMes = [
      { mes: 'Jan', fator: 1.0 },
      { mes: 'Fev', fator: 0.95 },
      { mes: 'Mar', fator: 0.90 },
      { mes: 'Abr', fator: 0.85 },
      { mes: 'Mai', fator: 0.80 },
      { mes: 'Jun', fator: 0.75 },
      { mes: 'Jul', fator: 0.70 },
      { mes: 'Ago', fator: 0.65 },
      { mes: 'Set', fator: 0.60 },
      { mes: 'Out', fator: 0.55 },
      { mes: 'Nov', fator: 0.50 },
      { mes: 'Dez', fator: 0.45 }
    ];
    
    return distribuicaoPorMes.map(item => ({
      mes: item.mes,
      estoque: Math.round(totalEstoque * item.fator),
      valor: Math.round(valorTotalEstoque * item.fator)
    }));
  }, [produtos]);

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Função para buscar produtos da API
  const fetchProdutos = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('https://backendapimongo.tigasolutions.com.br/api/v1/todos');
      
      if (!response.ok) {
        setError(`Erro ao buscar dados: ${response.status}`);
        console.error(`Erro ao buscar dados: ${response.status}`);
        
        // Tentar novamente após 5 segundos
        setTimeout(() => {
          fetchProdutos();
        }, 5000);
        return;
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        setError('Nenhum dado encontrado na API');
        console.warn('Nenhum dado encontrado na API');
        
        // Tentar novamente após 3 segundos
        setTimeout(() => {
          fetchProdutos();
        }, 3000);
        return;
      }
      
      // Dados carregados com sucesso, atualizar estado e desativar loading
      console.log('Dados carregados da API:', data.length);
      setProdutos(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError(`Erro: ${err.message}`);
      console.error('Erro ao buscar dados da API:', err);
      
      // Tentar novamente após 5 segundos
      setTimeout(() => {
        fetchProdutos();
      }, 5000);
    }
  };

  // Dados para gráfico de inventário por categoria
  const inventarioPorCategoria = useMemo(() => {
    if (!produtos.length) return [];
    
    const categorias = {};
    
    produtos.forEach(produto => {
      const categoria = produto.categoriaProduto;
      const quantidade = produto.quantidadeProduto;
      
      if (!categorias[categoria]) {
        categorias[categoria] = { nome: categoria, estoque: 0, valor: 0 };
      }
      
      categorias[categoria].estoque += quantidade;
      categorias[categoria].valor += quantidade * produto.precoProduto;
    });
    
    return Object.values(categorias);
  }, [produtos]);

  // Top 5 produtos com maior valor em estoque
  const topProdutosValor = useMemo(() => {
    if (!produtos.length) return [];
    
    return [...produtos]
      .map(p => ({
        ...p,
        valorEstoque: p.quantidadeProduto * p.precoProduto
      }))
      .sort((a, b) => b.valorEstoque - a.valorEstoque)
      .slice(0, 5);
  }, [produtos]);

  // Calcular métricas de inventário
  const totalEstoque = useMemo(() => {
    return produtos.reduce((acc, p) => acc + p.quantidadeProduto, 0);
  }, [produtos]);
  
  const valorTotalEstoque = useMemo(() => {
    return produtos.reduce((acc, p) => acc + (p.quantidadeProduto * p.precoProduto), 0);
  }, [produtos]);
  
  const valorMedioProduto = useMemo(() => {
    return produtos.length > 0 ? valorTotalEstoque / totalEstoque : 0;
  }, [totalEstoque, valorTotalEstoque]);

  // Cores para gráficos
  const COLORS = ['#8a85f7', '#82e9c1', '#ffdd63', '#ff8c40', '#4299ff', '#00ddb2'];

  return (
    <div className="min-h-screen bg-gray-900">
      <Header title="Análise de Inventário" />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Filtros e controles */}
          <div className="bg-gray-800 rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-center justify-between gap-4 border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <FiFilter className="mr-2 text-gray-300" />
                <span className="font-medium text-gray-300">Período:</span>
              </div>
              
              <div className="flex border border-gray-600 rounded-lg overflow-hidden">
                <button 
                  className={`px-4 py-2 text-sm font-medium ${periodoAnalise === 'semanal' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  onClick={() => setPeriodoAnalise('semanal')}
                >
                  Semanal
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${periodoAnalise === 'mensal' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  onClick={() => setPeriodoAnalise('mensal')}
                >
                  Mensal
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${periodoAnalise === 'anual' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  onClick={() => setPeriodoAnalise('anual')}
                >
                  Anual
                </button>
              </div>
              
              <div className="flex items-center">
                <FiCalendar className="mr-2 text-gray-300" />
                <select className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-gray-200">
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={fetchProdutos}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center font-medium hover:bg-indigo-700 transition-colors"
                disabled={loading}
              >
                <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar Dados
              </button>
              
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center font-medium hover:bg-green-700 transition-colors">
                <FiDownload className="mr-2" />
                Exportar Relatório
              </button>
            </div>
          </div>
          
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
              <p>{error}</p>
              <p className="text-sm mt-1">Tentando reconectar automaticamente...</p>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
              <p className="ml-3 text-gray-300">Carregando dados do inventário...</p>
            </div>
          ) : (
            <>
              {/* Cartões de resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Total em Estoque</h3>
                  <p className="text-3xl font-bold text-white">
                    {totalEstoque.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <FiPackage className="text-indigo-400 mr-1" />
                    <p className="text-sm text-indigo-300 font-medium">Unidades de produtos</p>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Valor do Estoque</h3>
                  <p className="text-3xl font-bold text-white">
                    R$ {valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center mt-2">
                    <FiDollarSign className="text-green-400 mr-1" />
                    <p className="text-sm text-green-300 font-medium">Capital em inventário</p>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Valor Médio por Item</h3>
                  <p className="text-3xl font-bold text-white">
                    R$ {valorMedioProduto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center mt-2">
                    <FiStar className="text-amber-400 mr-1" />
                    <p className="text-sm text-amber-300 font-medium">Por unidade em estoque</p>
                  </div>
                </div>
              </div>
              
              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
                  <h3 className="font-semibold text-gray-100 mb-4">Projeção de Inventário</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={evolucaoEstoquePorMes}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                        <XAxis dataKey="mes" tick={{fill: "#cbd5e0"}} />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{fill: "#cbd5e0"}} />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{fill: "#cbd5e0"}} />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'valor') return [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor'];
                            return [value.toLocaleString(), 'Estoque'];
                          }}
                          contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }}
                        />
                        <Legend formatter={(value) => <span style={{ color: '#cbd5e0' }}>{value}</span>} />
                        <Line yAxisId="left" type="monotone" dataKey="estoque" stroke="#8a85f7" name="Estoque" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#82e9c1" name="Valor" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
                  <h3 className="font-semibold text-gray-100 mb-4">Estoque por Categoria</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={inventarioPorCategoria}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                        <XAxis type="number" tick={{fill: "#cbd5e0"}} />
                        <YAxis dataKey="nome" type="category" width={100} tick={{fill: "#cbd5e0"}} />
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
              </div>
              
              {/* Gráfico de distribuição de valor do estoque por categoria */}
              <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700 mb-8">
                <h3 className="font-semibold text-gray-100 mb-4">Distribuição do Valor do Estoque por Categoria</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventarioPorCategoria}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="valor"
                        nameKey="nome"
                        label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                      >
                        {inventarioPorCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor em Estoque']} 
                        contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }}
                      />
                      <Legend formatter={(value) => <span style={{ color: '#cbd5e0' }}>{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Tabela de top produtos */}
              <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="font-semibold text-gray-100">Top Produtos por Valor em Estoque</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-gray-200">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Produto</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categoria</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estoque</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor em Estoque</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Preço Unitário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {topProdutosValor.map((produto) => (
                        <tr key={produto.id} className="hover:bg-gray-750">
                          <td className="py-4 px-6 whitespace-nowrap font-medium text-indigo-300">{produto.nome}</td>
                          <td className="py-4 px-6 whitespace-nowrap">{produto.categoriaProduto}</td>
                          <td className="py-4 px-6 whitespace-nowrap">{produto.quantidadeProduto.toLocaleString()}</td>
                          <td className="py-4 px-6 whitespace-nowrap font-medium">
                            R$ {(produto.quantidadeProduto * produto.precoProduto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            R$ {produto.precoProduto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 