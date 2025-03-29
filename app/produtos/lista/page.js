'use client';

import { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import Header from '../../components/Header';
import { productData } from '../../utils/data/productData';

export default function ListaProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    setProdutos(productData);
  }, []);

  const produtosFiltrados = produtos.filter(produto => 
    produto.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.categoriaProduto.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.id.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Lista de Produtos" />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Barra de ferramentas */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 w-full md:w-80 py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Buscar produto por nome, ID ou categoria"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
            </div>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center font-medium hover:bg-blue-700 transition-colors">
              <FiPlus className="mr-2" />
              Novo Produto
            </button>
          </div>
          
          {/* Tabela de produtos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas</th>
                    <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {produtosFiltrados.map((produto) => (
                    <tr key={produto.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 whitespace-nowrap">{produto.id}</td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{produto.nome}</div>
                        <div className="text-gray-500 text-xs truncate max-w-xs">{produto.descricaoProduto}</div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">{produto.categoriaProduto}</td>
                      <td className="py-4 px-6 whitespace-nowrap font-medium">R$ {produto.precoProduto.toLocaleString('pt-BR')}</td>
                      <td className="py-4 px-6 whitespace-nowrap">{produto.quantidadeProduto}</td>
                      <td className="py-4 px-6 whitespace-nowrap">{produto.ratingProduto.toFixed(1)}</td>
                      <td className="py-4 px-6 whitespace-nowrap">{produto.vendasTotais || 0}</td>
                      <td className="py-4 px-6 whitespace-nowrap text-sm text-center">
                        <button className="text-blue-600 hover:text-blue-800 mr-3">
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{produtosFiltrados.length}</span> de <span className="font-medium">{produtos.length}</span> produtos
              </div>
              
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50">
                  Anterior
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium bg-blue-50 text-blue-600 border-blue-600">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50">
                  Próximo
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 