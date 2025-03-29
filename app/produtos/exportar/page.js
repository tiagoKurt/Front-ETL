'use client';

import { useState } from 'react';
import { FiDownload, FiFilter, FiCheckSquare, FiUpload, FiCopy } from 'react-icons/fi';
import Header from '../../components/Header';
import { productData } from '../../utils/data/productData';

export default function ExportarDados() {
  const [formatoExportacao, setFormatoExportacao] = useState('csv');
  const [camposSelecionados, setCamposSelecionados] = useState({
    id: true,
    nome: true,
    categoriaProduto: true,
    descricaoProduto: true,
    precoProduto: true,
    quantidadeProduto: true,
    periodoGarantia: false,
    dataProducao: false,
    dataExpiracao: false,
    ratingProduto: true,
    vendasTotais: true
  });

  const campos = [
    { id: 'id', nome: 'ID do Produto' },
    { id: 'nome', nome: 'Nome do Produto' },
    { id: 'categoriaProduto', nome: 'Categoria' },
    { id: 'descricaoProduto', nome: 'Descrição' },
    { id: 'precoProduto', nome: 'Preço' },
    { id: 'quantidadeProduto', nome: 'Quantidade em Estoque' },
    { id: 'periodoGarantia', nome: 'Período de Garantia' },
    { id: 'dataProducao', nome: 'Data de Produção' },
    { id: 'dataExpiracao', nome: 'Data de Expiração' },
    { id: 'ratingProduto', nome: 'Rating' },
    { id: 'vendasTotais', nome: 'Total de Vendas' }
  ];

  const handleChangeCampo = (id) => {
    setCamposSelecionados({
      ...camposSelecionados,
      [id]: !camposSelecionados[id]
    });
  };

  const selecionarTodosCampos = (valor) => {
    const novosCampos = {};
    Object.keys(camposSelecionados).forEach(campo => {
      novosCampos[campo] = valor;
    });
    setCamposSelecionados(novosCampos);
  };

  const gerarDadosExemplo = () => {
    const produtos = productData.slice(0, 3);
    const dadosFiltrados = produtos.map(produto => {
      const dadoProduto = {};
      Object.keys(camposSelecionados).forEach(campo => {
        if (camposSelecionados[campo]) {
          dadoProduto[campo] = produto[campo];
        }
      });
      return dadoProduto;
    });

    switch (formatoExportacao) {
      case 'json':
        return JSON.stringify(dadosFiltrados, null, 2);
      case 'csv':
        const headers = Object.keys(dadosFiltrados[0]).join(',');
        const rows = dadosFiltrados.map(p => Object.values(p).join(','));
        return [headers, ...rows].join('\n');
      case 'excel':
        return 'Dados serão exportados em formato Excel...';
      default:
        return 'Formato não suportado para visualização';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header title="Exportar Dados" />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-300 mb-2">Exportação de Dados</h2>
            <p className="text-gray-300">
              Selecione os campos, o formato e filtre os dados que deseja exportar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Painel de configuração */}
            <div className="md:col-span-1 space-y-6">
              {/* Formato de exportação */}
              <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
                <h3 className="font-semibold text-gray-100 mb-4">Formato de Exportação</h3>
                <div className="space-y-2">
                  <div>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        className="form-radio text-indigo-600"
                        checked={formatoExportacao === 'csv'}
                        onChange={() => setFormatoExportacao('csv')}
                      />
                      <span className="ml-2 text-gray-200">CSV</span>
                    </label>
                  </div>
                  <div>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        className="form-radio text-indigo-600"
                        checked={formatoExportacao === 'excel'}
                        onChange={() => setFormatoExportacao('excel')}
                      />
                      <span className="ml-2 text-gray-200">Excel (.xlsx)</span>
                    </label>
                  </div>
                  <div>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        className="form-radio text-indigo-600"
                        checked={formatoExportacao === 'json'}
                        onChange={() => setFormatoExportacao('json')}
                      />
                      <span className="ml-2 text-gray-200">JSON</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Filtros */}
              <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
                <h3 className="font-semibold text-gray-100 mb-4">Filtros (opcional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Categoria
                    </label>
                    <select
                      className="w-full py-2 px-4 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Todas as categorias</option>
                      <option value="Eletrônicos">Eletrônicos</option>
                      <option value="Moda">Moda</option>
                      <option value="Móveis">Móveis</option>
                      <option value="Eletrodomésticos">Eletrodomésticos</option>
                      <option value="Acessórios">Acessórios</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Rating Mínimo
                    </label>
                    <select
                      className="w-full py-2 px-4 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="0">Qualquer rating</option>
                      <option value="3">3+ estrelas</option>
                      <option value="4">4+ estrelas</option>
                      <option value="4.5">4.5+ estrelas</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Estoque Mínimo
                    </label>
                    <input
                      type="number"
                      className="w-full py-2 px-4 border border-gray-600 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seleção de campos e preview */}
            <div className="md:col-span-2 space-y-6">
              {/* Seleção de campos */}
              <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-100">Campos para Exportação</h3>
                  <div className="flex space-x-2">
                    <button 
                      className="text-sm text-indigo-300 hover:text-indigo-100"
                      onClick={() => selecionarTodosCampos(true)}
                    >
                      Selecionar todos
                    </button>
                    <button 
                      className="text-sm text-indigo-300 hover:text-indigo-100"
                      onClick={() => selecionarTodosCampos(false)}
                    >
                      Desmarcar todos
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {campos.map((campo) => (
                    <div key={campo.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={campo.id} 
                        checked={camposSelecionados[campo.id]} 
                        onChange={() => handleChangeCampo(campo.id)}
                        className="h-4 w-4 text-indigo-600 rounded border-gray-600"
                      />
                      <label htmlFor={campo.id} className="text-gray-200">{campo.nome}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="bg-gray-800 rounded-xl shadow-md p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-100">Preview dos Dados</h3>
                  <button 
                    className="text-sm text-indigo-300 hover:text-indigo-100 flex items-center"
                    onClick={() => {/* Função para copiar */}}
                  >
                    <FiCopy className="mr-1" /> Copiar
                  </button>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 mt-4 overflow-auto max-h-64 text-gray-200 font-mono text-sm">
                  <pre>{gerarDadosExemplo()}</pre>
                </div>
                <div className="text-gray-400 text-xs mt-2">
                  Total: 20 produtos
                </div>
              </div>
              
              {/* Botões */}
              <div className="flex justify-between items-center">
                <button className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg font-medium hover:bg-gray-600 flex items-center">
                  <FiUpload className="mr-2" />
                  Importar
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center">
                  <FiDownload className="mr-2" />
                  Exportar Dados
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 