'use client';

import { useState } from 'react';
import { FiDownload, FiFileText, FiCalendar, FiBarChart2, FiTrendingUp, FiPackage, FiTag } from 'react-icons/fi';
import Header from '../../components/Header';

export default function Relatorios() {
  const [tipoRelatorio, setTipoRelatorio] = useState('vendas');

  const relatorios = [
    {
      id: 'vendas',
      nome: 'Relatório de Vendas',
      descricao: 'Análise detalhada de vendas por período, produto e categoria',
      icon: <FiTrendingUp className="text-blue-600" />,
      formatos: ['PDF', 'Excel', 'CSV']
    },
    {
      id: 'estoque',
      nome: 'Relatório de Estoque',
      descricao: 'Status atual do estoque, produtos com baixo estoque e necessidade de reposição',
      icon: <FiPackage className="text-green-600" />,
      formatos: ['PDF', 'Excel']
    },
    {
      id: 'produtos',
      nome: 'Catálogo de Produtos',
      descricao: 'Lista completa dos produtos com especificações detalhadas',
      icon: <FiFileText className="text-purple-600" />,
      formatos: ['PDF', 'Excel', 'JSON']
    },
    {
      id: 'categorias',
      nome: 'Análise por Categoria',
      descricao: 'Desempenho de vendas e estoque agrupados por categoria',
      icon: <FiTag className="text-orange-600" />,
      formatos: ['PDF', 'Excel']
    },
    {
      id: 'performance',
      nome: 'Performance de Produtos',
      descricao: 'Análise de desempenho comparativa entre produtos',
      icon: <FiBarChart2 className="text-red-600" />,
      formatos: ['PDF', 'Excel', 'PowerPoint']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <Header title="Relatórios" />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-300 mb-2">Geração de Relatórios</h2>
            <p className="text-gray-300">
              Selecione o tipo de relatório que deseja gerar, o período e o formato desejado.
            </p>
          </div>
          
          {/* Lista de relatórios disponíveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {relatorios.map((relatorio) => (
              <button
                key={relatorio.id}
                className={`text-left p-6 border rounded-xl transition-all ${
                  tipoRelatorio === relatorio.id 
                    ? 'border-indigo-500 bg-indigo-600/20 shadow-md' 
                    : 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                }`}
                onClick={() => setTipoRelatorio(relatorio.id)}
              >
                <div className="flex items-start">
                  <div className="p-3 rounded-lg bg-gray-700 mr-4">
                    {relatorio.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-100">{relatorio.nome}</h3>
                    <p className="text-gray-300 text-sm mt-1">{relatorio.descricao}</p>
                    <div className="flex mt-3 space-x-2">
                      {relatorio.formatos.map((formato) => (
                        <span 
                          key={formato} 
                          className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                        >
                          {formato}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Configuração do relatório */}
          <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Configurar Relatório</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Período
                </label>
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      className="pl-10 w-full py-2 px-4 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <span className="mx-2 text-gray-300">a</span>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      className="pl-10 w-full py-2 px-4 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Formato do Relatório
                </label>
                <select
                  className="w-full py-2 px-4 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Detalhamento
                </label>
                <select
                  className="w-full py-2 px-4 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="resumido">Resumido</option>
                  <option value="detalhado">Detalhado</option>
                  <option value="completo">Completo com gráficos</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center">
                <FiDownload className="mr-2" />
                Gerar Relatório
              </button>
            </div>
          </div>
          
          {/* Relatórios recentes */}
          <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="font-semibold text-gray-100">Relatórios Recentes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-200">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Formato</th>
                    <th className="py-3 px-6 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  <tr className="hover:bg-gray-750">
                    <td className="py-4 px-6 whitespace-nowrap font-medium text-indigo-300">Vendas Mensais - Março 2024</td>
                    <td className="py-4 px-6 whitespace-nowrap">Vendas</td>
                    <td className="py-4 px-6 whitespace-nowrap">15/04/2024</td>
                    <td className="py-4 px-6 whitespace-nowrap">PDF</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <button className="px-3 py-1 text-indigo-300 hover:text-indigo-100">Download</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-750">
                    <td className="py-4 px-6 whitespace-nowrap font-medium text-indigo-300">Estoque Atualizado - Q1 2024</td>
                    <td className="py-4 px-6 whitespace-nowrap">Estoque</td>
                    <td className="py-4 px-6 whitespace-nowrap">05/04/2024</td>
                    <td className="py-4 px-6 whitespace-nowrap">Excel</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <button className="px-3 py-1 text-indigo-300 hover:text-indigo-100">Download</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-750">
                    <td className="py-4 px-6 whitespace-nowrap font-medium text-indigo-300">Catálogo de Produtos - Atualizado</td>
                    <td className="py-4 px-6 whitespace-nowrap">Produtos</td>
                    <td className="py-4 px-6 whitespace-nowrap">01/04/2024</td>
                    <td className="py-4 px-6 whitespace-nowrap">JSON</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <button className="px-3 py-1 text-indigo-300 hover:text-indigo-100">Download</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 