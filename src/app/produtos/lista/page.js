'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiFilter, FiSearch, FiEdit, FiTrash2, FiPlus, FiRefreshCw, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import Header from '../../components/Header';

export default function ListaProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [filtros, setFiltros] = useState({
    nome: '',
    id: '',
    categoria: '',
    descricao: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10; // Exibir 10 itens por página
  const [totalPaginas, setTotalPaginas] = useState(1);
  
  // Estado para controlar filtros expandidos
  const [filtrosExpandidos, setFiltrosExpandidos] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Efeito para calcular o total de páginas quando o filtro ou produtos mudam
  useEffect(() => {
    if (produtosFiltrados.length) {
      setTotalPaginas(Math.ceil(produtosFiltrados.length / itensPorPagina));
      
      // Se a página atual for maior que o total de páginas após um filtro,
      // volta para a primeira página
      if (paginaAtual > Math.ceil(produtosFiltrados.length / itensPorPagina)) {
        setPaginaAtual(1);
      }
    } else {
      setTotalPaginas(1);
    }
  }, [filtros, produtos]);

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

  // Limpar todos os filtros
  const limparFiltros = () => {
    setFiltros({
      nome: '',
      id: '',
      categoria: '',
      descricao: ''
    });
    setPaginaAtual(1);
  };

  // Aplicar filtros
  const produtosFiltrados = useMemo(() => {
    return produtos.filter(produto => {
      const nomeMatch = produto.nome.toLowerCase().includes(filtros.nome.toLowerCase());
      const idMatch = produto.id.toLowerCase().includes(filtros.id.toLowerCase());
      const categoriaMatch = produto.categoriaProduto.toLowerCase().includes(filtros.categoria.toLowerCase());
      const descricaoMatch = produto.descricaoProduto.toLowerCase().includes(filtros.descricao.toLowerCase());
      
      return nomeMatch && idMatch && categoriaMatch && descricaoMatch;
    });
  }, [produtos, filtros]);

  // Obter produtos da página atual
  const produtosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return produtosFiltrados.slice(inicio, fim);
  }, [produtosFiltrados, paginaAtual, itensPorPagina]);

  const irParaPagina = (pagina) => {
    if (pagina < 1 || pagina > totalPaginas) return;
    setPaginaAtual(pagina);
  };

  // Gerar números de páginas para navegação
  const gerarPaginacao = () => {
    const paginas = [];
    const maxPagesShown = 5; // Máximo de botões de página mostrados
    
    let startPage = Math.max(1, paginaAtual - Math.floor(maxPagesShown / 2));
    let endPage = Math.min(totalPaginas, startPage + maxPagesShown - 1);
    
    // Ajustar startPage se endPage estiver no limite
    if (endPage === totalPaginas) {
      startPage = Math.max(1, endPage - maxPagesShown + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      paginas.push(i);
    }
    
    return paginas;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header title="Lista de Produtos" />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Barra de ferramentas */}
          <div className="bg-gray-800 rounded-xl shadow-md p-4 mb-6 border border-gray-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Botão para expandir/recolher filtros */}
              <button 
                onClick={() => setFiltrosExpandidos(!filtrosExpandidos)}
                className="flex items-center text-gray-300 hover:text-white"
              >
                <FiFilter className="mr-2" />
                <span className="font-medium">Filtros</span>
                <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">
                  {Object.values(filtros).filter(v => v).length}
                </span>
              </button>
              
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
                  Novo Produto
                </button>
              </div>
            </div>
            
            {/* Filtros expandidos */}
            {filtrosExpandidos && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nome do Produto</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Filtrar por nome"
                      value={filtros.nome}
                      onChange={(e) => setFiltros({...filtros, nome: e.target.value})}
                    />
                    {filtros.nome && (
                      <button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                        onClick={() => setFiltros({...filtros, nome: ''})}
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ID do Produto</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Filtrar por ID"
                      value={filtros.id}
                      onChange={(e) => setFiltros({...filtros, id: e.target.value})}
                    />
                    {filtros.id && (
                      <button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                        onClick={() => setFiltros({...filtros, id: ''})}
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Filtrar por categoria"
                      value={filtros.categoria}
                      onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
                    />
                    {filtros.categoria && (
                      <button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                        onClick={() => setFiltros({...filtros, categoria: ''})}
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Filtrar por descrição"
                      value={filtros.descricao}
                      onChange={(e) => setFiltros({...filtros, descricao: e.target.value})}
                    />
                    {filtros.descricao && (
                      <button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                        onClick={() => setFiltros({...filtros, descricao: ''})}
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                  <button 
                    onClick={limparFiltros}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            )}
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
              <p className="ml-3 text-gray-300">Carregando produtos...</p>
            </div>
          ) : (
            /* Tabela de produtos */
            <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-200">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categoria</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Preço</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estoque</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rating</th>
                      <th className="py-3 px-6 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {produtosPaginados.map((produto) => (
                      <tr key={produto.id} className="hover:bg-gray-750">
                        <td className="py-4 px-6 whitespace-nowrap">{produto.id}</td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-medium text-indigo-300">{produto.nome}</div>
                          <div className="text-gray-400 text-xs truncate max-w-xs">{produto.descricaoProduto}</div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">{produto.categoriaProduto}</td>
                        <td className="py-4 px-6 whitespace-nowrap font-medium">R$ {produto.precoProduto.toLocaleString('pt-BR')}</td>
                        <td className="py-4 px-6 whitespace-nowrap">{produto.quantidadeProduto}</td>
                        <td className="py-4 px-6 whitespace-nowrap">{produto.ratingProduto.toFixed(1)}</td>
                        <td className="py-4 px-6 whitespace-nowrap text-sm text-center">
                          <button className="text-indigo-300 hover:text-indigo-100 mr-3" title="Editar">
                            <FiEdit />
                          </button>
                          <button className="text-red-400 hover:text-red-300" title="Excluir">
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Informações de paginação e controles */}
              <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-700">
                <div className="text-sm text-gray-300 mb-4 sm:mb-0">
                  Mostrando <span className="font-medium">{produtosPaginados.length}</span> de <span className="font-medium">{produtosFiltrados.length}</span> produtos
                  {produtosFiltrados.length !== produtos.length && (
                    <span> (filtrado de <span className="font-medium">{produtos.length}</span> total)</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => irParaPagina(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className={`px-3 py-1 rounded-md text-sm font-medium flex items-center 
                      ${paginaAtual === 1 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    <FiChevronLeft className="mr-1" /> Anterior
                  </button>
                  
                  {gerarPaginacao().map((pagina) => (
                    <button
                      key={pagina}
                      onClick={() => irParaPagina(pagina)}
                      className={`px-3 py-1 rounded-md text-sm font-medium 
                        ${paginaAtual === pagina 
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600' 
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'}`}
                    >
                      {pagina}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => irParaPagina(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    className={`px-3 py-1 rounded-md text-sm font-medium flex items-center 
                      ${paginaAtual === totalPaginas 
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    Próximo <FiChevronRight className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 