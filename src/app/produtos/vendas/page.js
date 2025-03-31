'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiCalendar, FiDownload, FiFilter } from 'react-icons/fi';
import Header from '../../components/Header';
import { productData } from '../../utils/data/productData';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

export default function Vendas() {
  const [produtos, setProdutos] = useState([]);
  const [periodo, setPeriodo] = useState('mensal');

  useEffect(() => {
    setProdutos(productData);
  }, []);

  // Dados para gráfico de vendas por categoria
  const vendasPorCategoria = useMemo(() => {
    const categorias = {};
    
    produtos.forEach(produto => {
      const categoria = produto.categoriaProduto;
      const vendas = produto.vendasTotais || 0;
      
      if (!categorias[categoria]) {
        categorias[categoria] = { nome: categoria, vendas: 0, receita: 0 };
      }
      
      categorias[categoria].vendas += vendas;
      categorias[categoria].receita += vendas * produto.precoProduto;
    });
    
    return Object.values(categorias);
  }, [produtos]);

  // Dados fictícios para gráfico de evolução de vendas no tempo
  const evolucaoVendas = [
    { mes: 'Jan', vendas: 1200, receita: 420000 },
    { mes: 'Fev', vendas: 1300, receita: 470000 },
    { mes: 'Mar', vendas: 1400, receita: 510000 },
    { mes: 'Abr', vendas: 1800, receita: 650000 },
    { mes: 'Mai', vendas: 2000, receita: 720000 },
    { mes: 'Jun', vendas: 2200, receita: 810000 },
    { mes: 'Jul', vendas: 1900, receita: 680000 },
    { mes: 'Ago', vendas: 2100, receita: 760000 },
    { mes: 'Set', vendas: 2500, receita: 920000 },
    { mes: 'Out', vendas: 2300, receita: 850000 },
    { mes: 'Nov', vendas: 2700, receita: 980000 },
    { mes: 'Dez', vendas: 3100, receita: 1100000 },
  ];

  // Top 5 produtos mais vendidos
  const topProdutos = useMemo(() => {
    return [...produtos]
      .sort((a, b) => (b.vendasTotais || 0) - (a.vendasTotais || 0))
      .slice(0, 5);
  }, [produtos]);

  // Cores para gráficos
  const COLORS = ['#8a85f7', '#82e9c1', '#ffdd63', '#ff8c40', '#4299ff', '#00ddb2'];

  return (
    <div className="min-h-screen bg-gray-900">
      <Header title="Análise de Vendas" />
      
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
                  className={`px-4 py-2 text-sm font-medium ${periodo === 'semanal' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  onClick={() => setPeriodo('semanal')}
                >
                  Semanal
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${periodo === 'mensal' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  onClick={() => setPeriodo('mensal')}
                >
                  Mensal
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${periodo === 'anual' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  onClick={() => setPeriodo('anual')}
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
            
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center font-medium hover:bg-indigo-700 transition-colors">
              <FiDownload className="mr-2" />
              Exportar Relatório
            </button>
          </div>
          
          {/* Cartões de resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Total de Vendas</h3>
              <p className="text-3xl font-bold text-white">
                {topProdutos.reduce((acc, p) => acc + (p.vendasTotais || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-green-300 mt-2 font-medium">+12.5% vs. período anterior</p>
            </div>
            
            <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Receita Total</h3>
              <p className="text-3xl font-bold text-white">
                R$ {(topProdutos.reduce((acc, p) => acc + ((p.vendasTotais || 0) * p.precoProduto), 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-green-300 mt-2 font-medium">+8.3% vs. período anterior</p>
            </div>
            
            <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Ticket Médio</h3>
              <p className="text-3xl font-bold text-white">
                R$ {(topProdutos.reduce((acc, p) => acc + ((p.vendasTotais || 0) * p.precoProduto), 0) / 
                topProdutos.reduce((acc, p) => acc + (p.vendasTotais || 0), 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-red-400 mt-2 font-medium">-2.1% vs. período anterior</p>
            </div>
          </div>
          
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
              <h3 className="font-semibold text-gray-100 mb-4">Evolução de Vendas</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={evolucaoVendas}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="mes" tick={{fill: "#cbd5e0"}} />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{fill: "#cbd5e0"}} />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{fill: "#cbd5e0"}} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'receita') return [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita'];
                        return [value.toLocaleString(), 'Vendas'];
                      }}
                      contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }}
                    />
                    <Legend formatter={(value) => <span style={{ color: '#cbd5e0' }}>{value}</span>} />
                    <Line yAxisId="left" type="monotone" dataKey="vendas" stroke="#8a85f7" name="Vendas" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="receita" stroke="#82e9c1" name="Receita" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
              <h3 className="font-semibold text-gray-100 mb-4">Vendas por Categoria</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={vendasPorCategoria}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis type="number" tick={{fill: "#cbd5e0"}} />
                    <YAxis dataKey="nome" type="category" width={100} tick={{fill: "#cbd5e0"}} />
                    <Tooltip 
                      formatter={(value) => [value.toLocaleString(), 'Vendas']} 
                      contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }}
                    />
                    <Legend formatter={(value) => <span style={{ color: '#cbd5e0' }}>{value}</span>} />
                    <Bar dataKey="vendas" fill="#6c63ff" name="Vendas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Tabela de top produtos */}
          <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="font-semibold text-gray-100">Top Produtos em Vendas</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-200">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Produto</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categoria</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vendas</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Receita</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Preço Unitário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {topProdutos.map((produto) => (
                    <tr key={produto.id} className="hover:bg-gray-750">
                      <td className="py-4 px-6 whitespace-nowrap font-medium text-indigo-300">{produto.nome}</td>
                      <td className="py-4 px-6 whitespace-nowrap">{produto.categoriaProduto}</td>
                      <td className="py-4 px-6 whitespace-nowrap">{(produto.vendasTotais || 0).toLocaleString()}</td>
                      <td className="py-4 px-6 whitespace-nowrap font-medium">
                        R$ {((produto.vendasTotais || 0) * produto.precoProduto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
        </div>
      </main>
    </div>
  );
} 