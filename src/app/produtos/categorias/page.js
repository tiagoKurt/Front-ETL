'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import Header from '../../components/Header';


export default function CategoriasProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const categorias = useMemo(() => {
    const cats = {};
    
    produtos.forEach(produto => {
      const categoria = produto.categoriaProduto;
      
      if (!cats[categoria]) {
        cats[categoria] = {
          nome: categoria,
          quantidade: 0,
          totalEstoque: 0,
          valorTotalEstoque: 0,
          mediaRating: { soma: 0, contador: 0 }
        };
      }
      
      cats[categoria].quantidade += 1;
      cats[categoria].totalEstoque += produto.quantidadeProduto || 0;
      cats[categoria].valorTotalEstoque += produto.precoProduto * (produto.quantidadeProduto || 0);
      cats[categoria].mediaRating.soma += produto.ratingProduto || 0;
      cats[categoria].mediaRating.contador += 1;
    });
    
    // Calcular a média de rating para cada categoria
    Object.values(cats).forEach(cat => {
      cat.ratingMedio = cat.mediaRating.contador > 0 
        ? cat.mediaRating.soma / cat.mediaRating.contador 
        : 0;
      delete cat.mediaRating; // Remover o objeto auxiliar
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
                <FiPlus className="mr-2" />
                Nova Categoria
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
              <p className="ml-3 text-gray-300">Carregando categorias...</p>
            </div>
          ) : (
            /* Lista de categorias */
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
                      <p className="text-sm text-gray-400">Em Estoque</p>
                      <p className="text-xl font-bold text-white">{categoria.totalEstoque}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Valor do Estoque</p>
                      <p className="text-xl font-bold text-green-300">
                        R$ {categoria.valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Rating Médio</p>
                      <p className="text-xl font-bold text-amber-300">
                        {categoria.ratingMedio.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 