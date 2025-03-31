'use client';

import { useState } from 'react';
import { FiPackage, FiDollarSign, FiBarChart2, FiStar, FiTrendingUp, FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';
import InsightCard from './InsightCard';
import { 
  formataMoeda, 
  formataNumero, 
  produtosMaisVendidos, 
  categoriasMaisRentaveis, 
  produtosBaixoEstoque,
  produtosComPotencialCrescimento,
  produtosComExpiracaoProxima,
  relacaoRatingVendas,
  dadosConsolidados
} from '../utils/insightData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, 
  ResponsiveContainer
} from 'recharts';

export default function InsightsSection() {
  const [activeTab, setActiveTab] = useState('visaoGeral');
  
  // Obter dados
  const consolidados = dadosConsolidados();
  const topProdutos = produtosMaisVendidos();
  const topCategorias = categoriasMaisRentaveis();
  const baixoEstoque = produtosBaixoEstoque();
  const potencialCrescimento = produtosComPotencialCrescimento();
  const expiracaoProxima = produtosComExpiracaoProxima();
  
  // Cores para gráficos
  const COLORS = ['#8a85f7', '#82e9c1', '#ffdd63', '#ff8c40', '#4299ff', '#00ddb2', '#ffcd3c', '#ff9455'];
  
  const renderVisaoGeral = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <InsightCard 
        titulo="Total de Produtos" 
        valor={consolidados.totalProdutos.toString()}
        icone={<FiPackage className="text-indigo-400" size={24} />}
        corCard="indigo"
      />
      <InsightCard 
        titulo="Total de Vendas" 
        valor={consolidados.totalVendas.toLocaleString('pt-BR')}
        icone={<FiTrendingUp className="text-teal-400" size={24} />} 
        corCard="teal"
      />
      <InsightCard 
        titulo="Receita Total" 
        valor={formataMoeda(consolidados.receitaTotal)}
        icone={<FiDollarSign className="text-amber-400" size={24} />}
        corCard="amber"
      />
      <InsightCard 
        titulo="Avaliação Média" 
        valor={consolidados.mediaRating}
        icone={<FiStar className="text-rose-400" size={24} />}
        corCard="rose"
      />
      
      <div className="md:col-span-2 lg:col-span-4 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-gray-100 mb-4">Produtos Mais Vendidos</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topProdutos.map(p => ({
                nome: p.nome,
                vendas: p.vendasTotais,
                receita: p.receita
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis 
                dataKey="nome" 
                tick={{fill: "#cbd5e0"}} 
                angle={-45} 
                textAnchor="end"
                height={70}
              />
              <YAxis yAxisId="left" orientation="left" stroke="#8a85f7" tick={{fill: "#cbd5e0"}} />
              <YAxis yAxisId="right" orientation="right" stroke="#82e9c1" tick={{fill: "#cbd5e0"}} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'receita') return [formataMoeda(value), 'Receita'];
                  return [value.toLocaleString(), 'Vendas'];
                }}
                contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }}
              />
              <Legend formatter={(value) => <span style={{ color: '#cbd5e0' }}>{value}</span>} />
              <Bar yAxisId="left" dataKey="vendas" fill="#8a85f7" name="Vendas" />
              <Bar yAxisId="right" dataKey="receita" fill="#82e9c1" name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="md:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-gray-100 mb-4">Distribuição por Categorias</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={Object.entries(consolidados.distribuicaoCategorias).map(([categoria, quantidade], index) => ({
                  nome: categoria,
                  valor: quantidade
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="valor"
              >
                {Object.entries(consolidados.distribuicaoCategorias).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [value, props.payload.nome]}
                contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="md:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold text-gray-100 mb-4">Categorias Mais Rentáveis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vendas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Receita</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ticket Médio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {topCategorias.slice(0, 5).map((categoria, index) => (
                <tr key={index} className="hover:bg-gray-750">
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-indigo-300">{categoria.nome}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">{categoria.vendas.toLocaleString()}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">{formataMoeda(categoria.receita)}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">{formataMoeda(categoria.ticketMedio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  const renderAlertas = () => (
    <div className="space-y-6">
      {baixoEstoque.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-amber-500/30">
          <div className="flex items-center mb-4">
            <FiAlertTriangle className="text-amber-400 mr-2" size={20} />
            <h3 className="font-semibold text-gray-100">Produtos com Estoque Baixo</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estoque</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vendas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Preço</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {baixoEstoque.map((produto, index) => (
                  <tr key={index} className="hover:bg-gray-750">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-amber-300">{produto.nome}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">{produto.categoria}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-red-400 font-medium">{produto.estoque}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">{produto.vendasTotais.toLocaleString()}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">{formataMoeda(produto.precoUnitario)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {expiracaoProxima.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-rose-500/30">
          <div className="flex items-center mb-4">
            <FiAlertCircle className="text-rose-400 mr-2" size={20} />
            <h3 className="font-semibold text-gray-100">Produtos com Expiração Próxima</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data Expiração</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {expiracaoProxima.map((produto, index) => (
                  <tr key={index} className="hover:bg-gray-750">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-rose-300">{produto.nome}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">{produto.categoria}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-red-400 font-medium">{produto.dataExpiracao}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">{produto.estoque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
  
  const renderOportunidades = () => (
    <div className="space-y-6">
      {potencialCrescimento.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-teal-500/30">
          <div className="flex items-center mb-4">
            <FiStar className="text-teal-400 mr-2" size={20} />
            <h3 className="font-semibold text-gray-100">Produtos com Potencial de Crescimento</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Produtos com boa avaliação mas que ainda não atingiram seu potencial máximo de vendas.
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avaliação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vendas Atuais</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {potencialCrescimento.map((produto, index) => (
                  <tr key={index} className="hover:bg-gray-750">
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-teal-300">{produto.nome}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">{produto.categoria}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-green-400 font-medium">{produto.rating.toFixed(1)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">{produto.vendas.toLocaleString()}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-300">{produto.estoque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-gray-100 mb-6">Insights de Análise</h2>
      
      <div className="flex border-b border-gray-700 mb-6">
        <button 
          className={`py-3 px-4 font-medium text-sm border-b-2 ${activeTab === 'visaoGeral' ? 'border-indigo-500 text-indigo-300' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('visaoGeral')}
        >
          Visão Geral
        </button>
        <button 
          className={`py-3 px-4 font-medium text-sm border-b-2 ${activeTab === 'alertas' ? 'border-amber-500 text-amber-300' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('alertas')}
        >
          Alertas
        </button>
        <button 
          className={`py-3 px-4 font-medium text-sm border-b-2 ${activeTab === 'oportunidades' ? 'border-teal-500 text-teal-300' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('oportunidades')}
        >
          Oportunidades
        </button>
      </div>
      
      {activeTab === 'visaoGeral' && renderVisaoGeral()}
      {activeTab === 'alertas' && renderAlertas()}
      {activeTab === 'oportunidades' && renderOportunidades()}
    </div>
  );
} 