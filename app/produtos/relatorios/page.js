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
    <div className="min-h-screen bg-gray-50">
      <Header title="Relatórios" />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Geração de Relatórios</h2>
            <p className="text-gray-600">
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
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => setTipoRelatorio(relatorio.id)}
              >
                <div className="flex items-start">
                  <div className="p-3 rounded-lg bg-gray-100 mr-4">
                    {relatorio.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{relatorio.nome}</h3>
                    <p className="text-gray-600 text-sm mt-1">{relatorio.descricao}</p>
                    <div className="flex mt-3 space-x-2">
                      {relatorio.formatos.map((formato) => (
                        <span 
                          key={formato} 
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurar Relatório</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Período
                </label>
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <span className="mx-2">a</span>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formato do Relatório
                </label>
                <select
                  className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detalhamento
                </label>
                <select
                  className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="resumido">Resumido</option>
                  <option value="detalhado">Detalhado</option>
                  <option value="completo">Completo com gráficos</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center">
                <FiDownload className="mr-2" />
                Gerar Relatório
              </button>
            </div>
          </div>
          
          {/* Relatórios recentes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Relatórios Recentes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formato</th>
                    <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 whitespace-nowrap font-medium">Vendas Mensais - Março 2024</td>
                    <td className="py-4 px-6 whitespace-nowrap">Vendas</td>
                    <td className="py-4 px-6 whitespace-nowrap">15/04/2024</td>
                    <td className="py-4 px-6 whitespace-nowrap">PDF</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <button className="px-3 py-1 text-blue-600 hover:text-blue-800">Download</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 whitespace-nowrap font-medium">Estoque Atualizado - Q1 2024</td>
                    <td className="py-4 px-6 whitespace-nowrap">Estoque</td>
                    <td className="py-4 px-6 whitespace-nowrap">05/04/2024</td>
                    <td className="py-4 px-6 whitespace-nowrap">Excel</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <button className="px-3 py-1 text-blue-600 hover:text-blue-800">Download</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 whitespace-nowrap font-medium">Performance de Categorias</td>
                    <td className="py-4 px-6 whitespace-nowrap">Categorias</td>
                    <td className="py-4 px-6 whitespace-nowrap">01/04/2024</td>
                    <td className="py-4 px-6 whitespace-nowrap">PDF</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <button className="px-3 py-1 text-blue-600 hover:text-blue-800">Download</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 whitespace-nowrap font-medium">Catálogo Completo</td>
                    <td className="py-4 px-6 whitespace-nowrap">Produtos</td>
                    <td className="py-4 px-6 whitespace-nowrap">25/03/2024</td>
                    <td className="py-4 px-6 whitespace-nowrap">Excel</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <button className="px-3 py-1 text-blue-600 hover:text-blue-800">Download</button>
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