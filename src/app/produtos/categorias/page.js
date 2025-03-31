'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Header from '../../components/Header';
import { productData } from '../../utils/data/productData';

export default function CategoriasProdutos() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    setProdutos(productData);
  }, []);

  const categorias = useMemo(() => {
    const cats = {};
    
    produtos.forEach(produto => {
      const categoria = produto.categoriaProduto;
      
      if (!cats[categoria]) {
        cats[categoria] = {
          nome: categoria,
          quantidade: 0,
          totalVendas: 0,
          valorTotal: 0
        };
      }
      
      cats[categoria].quantidade += 1;
      cats[categoria].totalVendas += produto.vendasTotais || 0;
      cats[categoria].valorTotal += produto.precoProduto * (produto.vendasTotais || 0);
    });
    
    return Object.values(cats);
  }, [produtos]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header title="Categorias de Produtos" />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-indigo-300">Categorias</h2>
              <p className="text-gray-300 mt-1">Gerencie as categorias de produtos do seu catálogo</p>
            </div>
            
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center font-medium hover:bg-indigo-700 transition-colors">
              <FiPlus className="mr-2" />
              Nova Categoria
            </button>
          </div>
          
          {/* Lista de categorias */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {categorias.map((categoria, index) => (
              <div 
                key={index} 
                className="bg-gray-800 rounded-xl shadow-md border border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-gray-100">{categoria.nome}</h3>
                  <div className="flex space-x-2">
                    <button className="text-indigo-300 hover:text-indigo-100">
                      <FiEdit />
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Produtos</p>
                    <p className="text-xl font-bold text-white">{categoria.quantidade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Vendas</p>
                    <p className="text-xl font-bold text-white">{categoria.totalVendas}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">Receita Total</p>
                    <p className="text-xl font-bold text-green-300">
                      R$ {categoria.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 