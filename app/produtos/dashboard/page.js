'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiPackage, FiTrendingUp, FiStar, FiDollarSign, FiClock, FiCalendar, FiFilter, FiDownload, FiRefreshCw, FiBarChart2, FiPieChart, FiTrendingDown, FiShoppingBag } from 'react-icons/fi';
import Header from '../../components/Header';
import { productData } from '../../utils/data/productData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  ResponsiveContainer,
  AreaChart, Area,
  ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart,
  Treemap
} from 'recharts';
import { FaChartBar, FaChartPie, FaChartLine, FaChartArea, FaFilter, FaLightbulb } from 'react-icons/fa';
import { BsFillCartCheckFill, BsTags, BsCashCoin, BsStarHalf } from 'react-icons/bs';

export default function Dashboard() {
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState({
    categoria: 'todas',
    precoMin: 0,
    precoMax: 5000,
    rating: 0
  });
  const [tipoGraficoPersonalizado, setTipoGraficoPersonalizado] = useState('barras');
  const [insightAtivo, setInsightAtivo] = useState('vendas');
  const [periodoAnalise, setPeriodoAnalise] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [dadosAnaliseProdutos, setDadosAnaliseProdutos] = useState([]);

  // Paleta de cores para o tema escuro - cores melhoradas para visualização
  const COLORS = ['#8a85f7', '#82e9c1', '#ffdd63', '#ff8c40', '#4299ff', '#00ddb2', '#ffcd3c', '#ff9455'];
  const chartBackground = '#1a202c'; // Cor de fundo dos gráficos mais escura
  const cardBackground = '#171e2e'; // Cor de fundo dos cards mais escura
  const textColor = '#f0f4f8'; // Cor principal do texto mais clara
  const mutedTextColor = '#cbd5e0'; // Cor do texto secundário mais clara
  const accentColor = '#6c63ff'; // Cor de destaque mais vibrante
  const borderColor = '#2d3748'; // Cor das bordas mais definida

  useEffect(() => {
    // Garantir que os dados sejam carregados
    if (productData) {
      console.log('Carregando dados de produtos:', productData.length);
      setProdutos(productData);
      setLoading(false); // Desativa o loading após carregar os dados
    }
  }, []);

  // Verificar se os dados foram carregados corretamente
  useEffect(() => {
    if (produtos.length > 0) {
      console.log('Produtos carregados com sucesso:', produtos.length);
      setLoading(false); // Garantir que o loading seja desativado mesmo se os dados forem carregados em outro momento
    }
  }, [produtos]);

  const metricas = useMemo(() => {
    if (!produtos.length) return {
      totalProdutos: 0,
      totalVendas: 0,
      mediaRating: 0,
      receitaTotal: 0,
      garantiaMedia: 0,
      proximosExpiracao: 0
    };

    const vendas = produtos.reduce((acc, prod) => acc + (prod.vendasTotais || 0), 0);
    const receita = produtos.reduce((acc, prod) => acc + ((prod.vendasTotais || 0) * prod.precoProduto), 0);
    const garantia = produtos.reduce((acc, prod) => acc + prod.periodoGarantia, 0) / produtos.length;
    
    const dataAtual = new Date();
    const tresMesesAdiante = new Date();
    tresMesesAdiante.setMonth(dataAtual.getMonth() + 3);
    
    const produtosExpirandoEmBreve = produtos.filter(prod => {
      if (prod.dataExpiracao === 'N/A') return false;
      
      const partes = prod.dataExpiracao.split('/');
      const dataExpiracao = new Date(partes[2], partes[1] - 1, partes[0]);
      
      return dataExpiracao > dataAtual && dataExpiracao < tresMesesAdiante;
    });

    return {
      totalProdutos: produtos.length,
      totalVendas: vendas,
      mediaRating: (produtos.reduce((acc, prod) => acc + prod.ratingProduto, 0) / produtos.length).toFixed(1),
      receitaTotal: receita.toFixed(2),
      garantiaMedia: garantia.toFixed(1),
      proximosExpiracao: produtosExpirandoEmBreve.length
    };
  }, [produtos]);

  const dadosProdutosMaisVendidos = useMemo(() => {
    return [...produtos]
      .sort((a, b) => (b.vendasTotais || 0) - (a.vendasTotais || 0))
      .slice(0, 5)
      .map(produto => ({
        nome: produto.nome,
        vendasTotais: produto.vendasTotais || 0
      }));
  }, [produtos]);

  const dadosCategorias = useMemo(() => {
    const categorias = {};
    
    produtos.forEach(produto => {
      const categoria = produto.categoriaProduto;
      const vendas = produto.vendasTotais || 0;
      const receita = vendas * produto.precoProduto;
      
      if (!categorias[categoria]) {
        categorias[categoria] = { nome: categoria, vendas: 0, receita: 0, quantidade: 0 };
      }
      
      categorias[categoria].vendas += vendas;
      categorias[categoria].receita += receita;
      categorias[categoria].quantidade += 1;
    });
    
    return Object.values(categorias);
  }, [produtos]);

  const produtosBaixaPopularidade = useMemo(() => {
    // Se não há produtos, retorna um array vazio
    if (!produtos.length) return [];
    
    // Ajustando os critérios para garantir que tenhamos alguns produtos
    // Pegamos produtos com rating abaixo de 4.5 (ao invés de 4) para ter maior chance de encontrar dados
    const dadosFiltrados = [...produtos]
      .filter(produto => produto.ratingProduto < 4.5)
      .sort((a, b) => a.ratingProduto - b.ratingProduto) // Ordena do menor para o maior rating
      .slice(0, 5)
      .map(produto => ({
        nome: produto.nome,
        rating: produto.ratingProduto,
        estoque: produto.quantidadeProduto
      }));
      
    // Se ainda não encontramos dados, retornamos pelo menos alguns produtos
    if (dadosFiltrados.length === 0) {
      return produtos.slice(0, 5).map(produto => ({
        nome: produto.nome,
        rating: produto.ratingProduto,
        estoque: produto.quantidadeProduto
      }));
    }
    
    return dadosFiltrados;
  }, [produtos]);

  // Monitorar produtos de baixa popularidade
  useEffect(() => {
    if (produtosBaixaPopularidade.length > 0) {
      console.log('Produtos de baixa popularidade:', produtosBaixaPopularidade.length);
    }
  }, [produtosBaixaPopularidade]);

  // Efeito para atualizar dados quando o insight ou período mudar
  useEffect(() => {
    if (produtos.length > 0) {
      // Análise por período (simulação de dados para diferentes períodos)
      const dadosFiltrados = periodoAnalise === 'ultimos3meses' 
        ? produtos.filter((_, index) => index % 3 === 0) 
        : periodoAnalise === 'ultimos6meses' 
          ? produtos.filter((_, index) => index % 2 === 0)
          : produtos;
      
      if (!dadosFiltrados.length) {
        setDadosAnaliseProdutos([]);
        return;
      }
      
      // Retornos diferentes baseados no insight ativo selecionado
      let dados = [];
      
      switch (insightAtivo) {
        case 'vendas':
          dados = dadosFiltrados
            .sort((a, b) => (b.vendasTotais || 0) - (a.vendasTotais || 0))
            .slice(0, 8)
            .map(produto => ({
              nome: produto.nome,
              vendas: produto.vendasTotais || 0,
              receita: Math.round((produto.vendasTotais || 0) * produto.precoProduto),
              categoria: produto.categoriaProduto
            }));
          break;
        
        case 'preco-estoque':
          dados = dadosFiltrados
            .slice(0, 15)
            .map(produto => ({
              nome: produto.nome,
              preco: produto.precoProduto,
              estoque: produto.quantidadeProduto,
              tamanho: produto.quantidadeProduto * produto.precoProduto / 1000,
              categoria: produto.categoriaProduto
            }));
          break;
          
        case 'rentabilidade':
          // Simulando dados de margem de lucro (30-60% do preço)
          dados = dadosFiltrados
            .filter(produto => produto.vendasTotais > 0)
            .slice(0, 8)
            .map(produto => {
              const custoProduto = produto.precoProduto * (0.4 + Math.random() * 0.3);
              const lucro = produto.precoProduto - custoProduto;
              const margemLucro = (lucro / produto.precoProduto) * 100;
              
              return {
                nome: produto.nome,
                preco: produto.precoProduto,
                custo: Math.round(custoProduto * 100) / 100,
                margem: Math.round(margemLucro * 10) / 10,
                lucroTotal: Math.round((lucro * (produto.vendasTotais || 0)) * 100) / 100,
                vendas: produto.vendasTotais || 0
              };
            });
          break;
          
        default:
          dados = dadosFiltrados.slice(0, 8).map(produto => ({
            nome: produto.nome,
            vendas: produto.vendasTotais || 0,
            receita: Math.round((produto.vendasTotais || 0) * produto.precoProduto),
            preco: produto.precoProduto,
            estoque: produto.quantidadeProduto
          }));
      }
      
      setDadosAnaliseProdutos(dados);
    }
  }, [produtos, insightAtivo, periodoAnalise]);

  // Função para renderizar o gráfico de acordo com o tipo selecionado
  const renderizarGraficoInterativo = () => {
    // Garantir que temos dados para renderizar
    if (!dadosAnaliseProdutos || dadosAnaliseProdutos.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-300">
          Nenhum dado disponível para visualização
        </div>
      );
    }
    
    const tooltipStyle = { backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' };
    
    switch (tipoGraficoPersonalizado) {
      case 'barras':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosAnaliseProdutos}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} tick={{ fill: '#a0aec0' }} />
              <YAxis tick={{ fill: '#a0aec0' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={(value) => <span style={{ color: '#a0aec0' }}>{value}</span>} />
              {insightAtivo === 'vendas' && (
                <>
                  <Bar dataKey="vendas" fill="#8884d8" name="Vendas" />
                  <Bar dataKey="receita" fill="#82ca9d" name="Receita (R$)" />
                </>
              )}
              {insightAtivo === 'preco-estoque' && (
                <>
                  <Bar dataKey="preco" fill="#ffc658" name="Preço (R$)" />
                  <Bar dataKey="estoque" fill="#ff7300" name="Estoque (Un)" />
                </>
              )}
              {insightAtivo === 'rentabilidade' && (
                <>
                  <Bar dataKey="preco" fill="#8884d8" name="Preço (R$)" />
                  <Bar dataKey="custo" fill="#82ca9d" name="Custo (R$)" />
                  <Bar dataKey="margem" fill="#ffc658" name="Margem (%)" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pizza':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosAnaliseProdutos}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={130}
                fill="#8884d8"
                dataKey={insightAtivo === 'vendas' ? 'vendas' : 
                         insightAtivo === 'preco-estoque' ? 'preco' :
                         insightAtivo === 'rentabilidade' ? 'lucroTotal' : 'vendas'}
                nameKey="nome"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dadosAnaliseProdutos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={(value) => <span style={{ color: '#a0aec0' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'linha':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dadosAnaliseProdutos}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} tick={{ fill: '#a0aec0' }} />
              <YAxis tick={{ fill: '#a0aec0' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={(value) => <span style={{ color: '#a0aec0' }}>{value}</span>} />
              {insightAtivo === 'vendas' && (
                <>
                  <Line type="monotone" dataKey="vendas" stroke="#8884d8" name="Vendas" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="receita" stroke="#82ca9d" name="Receita (R$)" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                </>
              )}
              {insightAtivo === 'preco-estoque' && (
                <>
                  <Line type="monotone" dataKey="preco" stroke="#ffc658" name="Preço (R$)" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="estoque" stroke="#ff7300" name="Estoque (Un)" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                </>
              )}
              {insightAtivo === 'rentabilidade' && (
                <>
                  <Line type="monotone" dataKey="margem" stroke="#ffc658" name="Margem (%)" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="lucroTotal" stroke="#8884d8" name="Lucro Total (R$)" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              cx="50%" 
              cy="50%" 
              outerRadius="80%" 
              data={dadosAnaliseProdutos.slice(0, 6)}
              style={{ background: 'transparent' }}
            >
              <PolarGrid stroke="#2d3748" />
              <PolarAngleAxis dataKey="nome" tick={{ fill: '#a0aec0' }} />
              <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fill: '#a0aec0' }} />
              {insightAtivo === 'vendas' && (
                <>
                  <Radar 
                    name="Vendas" 
                    dataKey="vendas" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6} 
                  />
                  {dadosAnaliseProdutos[0]?.receita && (
                    <Radar 
                      name="Receita" 
                      dataKey="receita" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.6} 
                    />
                  )}
                </>
              )}
              {insightAtivo === 'preco-estoque' && (
                <>
                  <Radar 
                    name="Preço" 
                    dataKey="preco" 
                    stroke="#ffc658" 
                    fill="#ffc658" 
                    fillOpacity={0.6} 
                  />
                  <Radar 
                    name="Estoque" 
                    dataKey="estoque" 
                    stroke="#ff7300" 
                    fill="#ff7300" 
                    fillOpacity={0.6} 
                  />
                </>
              )}
              {insightAtivo === 'rentabilidade' && (
                <>
                  <Radar 
                    name="Margem" 
                    dataKey="margem" 
                    stroke="#ffc658" 
                    fill="#ffc658" 
                    fillOpacity={0.6} 
                  />
                  <Radar 
                    name="Lucro" 
                    dataKey="lucroTotal" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6} 
                  />
                </>
              )}
              <Legend formatter={(value) => <span style={{ color: '#a0aec0' }}>{value}</span>} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dadosAnaliseProdutos}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} tick={{ fill: '#a0aec0' }} />
              <YAxis tick={{ fill: '#a0aec0' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={(value) => <span style={{ color: '#a0aec0' }}>{value}</span>} />
              {insightAtivo === 'vendas' && (
                <>
                  <Area type="monotone" dataKey="vendas" stackId="1" stroke="#8884d8" fill="#8884d8" name="Vendas" />
                  <Area type="monotone" dataKey="receita" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Receita (R$)" />
                </>
              )}
              {insightAtivo === 'preco-estoque' && (
                <>
                  <Area type="monotone" dataKey="preco" stackId="1" stroke="#ffc658" fill="#ffc658" name="Preço (R$)" />
                  <Area type="monotone" dataKey="estoque" stackId="2" stroke="#ff7300" fill="#ff7300" name="Estoque (Un)" />
                </>
              )}
              {insightAtivo === 'rentabilidade' && (
                <>
                  <Area type="monotone" dataKey="preco" stackId="1" stroke="#8884d8" fill="#8884d8" name="Preço (R$)" />
                  <Area type="monotone" dataKey="custo" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Custo (R$)" />
                  <Area type="monotone" dataKey="margem" stackId="3" stroke="#ffc658" fill="#ffc658" name="Margem (%)" />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'dispersao':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis 
                type="number" 
                dataKey={insightAtivo === 'preco-estoque' ? 'preco' : 
                         insightAtivo === 'rentabilidade' ? 'custo' : 'vendas'}
                name={insightAtivo === 'preco-estoque' ? 'Preço (R$)' : 
                      insightAtivo === 'rentabilidade' ? 'Custo (R$)' : 'Vendas'}
                tick={{ fill: '#a0aec0' }}
              />
              <YAxis 
                type="number" 
                dataKey={insightAtivo === 'preco-estoque' ? 'estoque' : 
                         insightAtivo === 'rentabilidade' ? 'margem' : 'receita'}
                name={insightAtivo === 'preco-estoque' ? 'Estoque' : 
                      insightAtivo === 'rentabilidade' ? 'Margem (%)' : 'Receita (R$)'}
                tick={{ fill: '#a0aec0' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                formatter={(value, name, props) => [value, props.payload.nome]} 
                contentStyle={tooltipStyle}
              />
              <Legend formatter={(value) => <span style={{ color: '#a0aec0' }}>{value}</span>} />
              <Scatter 
                name={insightAtivo === 'preco-estoque' 
                  ? 'Relação Preço x Estoque' 
                  : insightAtivo === 'rentabilidade' 
                    ? 'Relação Custo x Margem' 
                    : 'Relação Vendas x Receita'
                } 
                data={dadosAnaliseProdutos} 
                fill="#8884d8"
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            Selecione um tipo de gráfico
          </div>
        );
    }
  };

  // Cálculos de KPIs
  const totalVendas = produtos.reduce((sum, produto) => sum + produto.vendasTotais, 0);
  const totalReceita = produtos.reduce((sum, produto) => sum + (produto.vendasTotais * produto.precoProduto), 0);
  const mediaAvaliacao = produtos.length > 0 
    ? (produtos.reduce((sum, produto) => sum + produto.ratingProduto, 0) / produtos.length).toFixed(1) 
    : 0;
  const totalEstoque = produtos.reduce((sum, produto) => sum + produto.quantidadeProduto, 0);

  // Dados para o gráfico de receita por categoria
  const dadosReceitaCategoria = produtos.length > 0 
    ? produtos.reduce((acc, produto) => {
        const idx = acc.findIndex(item => item.nome === produto.categoriaProduto);
        const receita = produto.precoProduto * produto.vendasTotais;
        if (idx >= 0) {
          acc[idx].valor += receita;
        } else {
          acc.push({ nome: produto.categoriaProduto, valor: receita });
        }
        return acc;
      }, [])
    : [];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      {/* Cabeçalho */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-300">Dashboard de Produtos</h1>
          <p className="text-gray-300">Visão geral de desempenho e métricas-chave</p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
          <span className="text-gray-300">Período:</span>
          <select 
            value={periodoAnalise}
            onChange={(e) => setPeriodoAnalise(e.target.value)}
            className="bg-gray-700 text-white border-none rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="todos">Todos</option>
            <option value="ultimos3meses">Últimos 3 meses</option>
            <option value="ultimos6meses">Últimos 6 meses</option>
          </select>
          <FiFilter className="text-indigo-300" />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
          <p className="ml-4 text-indigo-300">Carregando dados...</p>
        </div>
      ) : (
        <>
          {/* Cards de KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-200">Total de Vendas</h3>
                <BsFillCartCheckFill className="text-indigo-300 text-2xl" />
              </div>
              <p className="text-3xl font-bold mt-2">{totalVendas}</p>
              <p className="text-green-300 text-sm mt-1">↑ 12% em relação ao último período</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-200">Receita Total</h3>
                <BsCashCoin className="text-green-300 text-2xl" />
              </div>
              <p className="text-3xl font-bold mt-2">R$ {totalReceita.toLocaleString('pt-BR')}</p>
              <p className="text-green-300 text-sm mt-1">↑ 8% em relação ao último período</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-200">Avaliação Média</h3>
                <BsStarHalf className="text-yellow-300 text-2xl" />
              </div>
              <p className="text-3xl font-bold mt-2">{mediaAvaliacao}/5</p>
              <p className="text-gray-300 text-sm mt-1">Baseado em 230 avaliações</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-200">Total em Estoque</h3>
                <BsTags className="text-blue-300 text-2xl" />
              </div>
              <p className="text-3xl font-bold mt-2">{totalEstoque}</p>
              <p className="text-yellow-300 text-sm mt-1">↓ 3% em relação ao último período</p>
            </div>
          </div>

          {/* Gráficos principais - primeira linha */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Produtos mais vendidos */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
              <h3 className="text-xl font-medium mb-4 text-indigo-300">Produtos Mais Vendidos</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosProdutosMaisVendidos}
                    margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={60} tick={{ fill: mutedTextColor }} />
                    <YAxis tick={{ fill: mutedTextColor }} />
                    <Tooltip contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} formatter={(value) => <span style={{ color: mutedTextColor }}>{value}</span>} />
                    <Bar dataKey="vendasTotais" fill={accentColor} name="Quantidade vendida" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Top categorias */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
              <h3 className="text-xl font-medium mb-4 text-indigo-300">Top Categorias por Volume de Vendas</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosCategorias}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="vendas"
                      nameKey="nome"
                      label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dadosCategorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value} contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }} />
                    <Legend formatter={(value) => <span style={{ color: mutedTextColor }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Gráficos principais - segunda linha */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Receita por categoria */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
              <h3 className="text-xl font-medium mb-4 text-indigo-300">Receita Total por Categoria</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dadosReceitaCategoria}
                    margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={60} tick={{ fill: mutedTextColor }} />
                    <YAxis tick={{ fill: mutedTextColor }} />
                    <Tooltip contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} formatter={(value) => <span style={{ color: mutedTextColor }}>{value}</span>} />
                    <Area type="monotone" dataKey="valor" stroke={accentColor} fill={accentColor} fillOpacity={0.8} name="Receita (R$)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Produtos com baixa popularidade */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
              <h3 className="text-xl font-medium mb-4 text-indigo-300">Produtos com Baixa Popularidade</h3>
              <div className="h-[350px] flex items-center justify-center">
                {produtosBaixaPopularidade.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={produtosBaixaPopularidade}
                      margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                      <XAxis dataKey="nome" angle={-45} textAnchor="end" height={60} tick={{ fill: mutedTextColor }} />
                      <YAxis domain={[0, 5]} tick={{ fill: mutedTextColor }} />
                      <YAxis yAxisId={1} orientation="right" tick={{ fill: mutedTextColor }} />
                      <Tooltip contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }} />
                      <Legend wrapperStyle={{ paddingTop: 20 }} formatter={(value) => <span style={{ color: mutedTextColor }}>{value}</span>} />
                      <Line type="monotone" dataKey="rating" stroke="#f86a6a" strokeWidth={2} name="Avaliação" dot={{ r: 5 }} activeDot={{ r: 7 }} />
                      <Line type="monotone" dataKey="estoque" stroke="#63db87" strokeWidth={2} name="Estoque" yAxisId={1} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-gray-300 text-center">
                    <p>Nenhum produto com baixa popularidade encontrado.</p>
                    <p className="text-sm mt-2">Todos os produtos têm avaliação acima de 4.5</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Análise personalizada */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h3 className="text-xl font-medium text-indigo-300">Análise Personalizada</h3>
                <p className="text-gray-300 text-sm">Escolha o tipo de gráfico e insight para explorar os dados</p>
              </div>
              <div className="flex mt-4 sm:mt-0 gap-2">
                <button 
                  onClick={() => setTipoGraficoPersonalizado('barras')}
                  className={`p-2 rounded-md ${tipoGraficoPersonalizado === 'barras' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                  title="Gráfico de barras"
                >
                  <FaChartBar size={18} />
                </button>
                <button 
                  onClick={() => setTipoGraficoPersonalizado('pizza')}
                  className={`p-2 rounded-md ${tipoGraficoPersonalizado === 'pizza' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                  title="Gráfico de pizza"
                >
                  <FaChartPie size={18} />
                </button>
                <button 
                  onClick={() => setTipoGraficoPersonalizado('linha')}
                  className={`p-2 rounded-md ${tipoGraficoPersonalizado === 'linha' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                  title="Gráfico de linha"
                >
                  <FaChartLine size={18} />
                </button>
                <button 
                  onClick={() => setTipoGraficoPersonalizado('area')}
                  className={`p-2 rounded-md ${tipoGraficoPersonalizado === 'area' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                  title="Gráfico de área"
                >
                  <FaChartArea size={18} />
                </button>
                <button 
                  onClick={() => setTipoGraficoPersonalizado('radar')}
                  className={`p-2 rounded-md ${tipoGraficoPersonalizado === 'radar' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                  title="Gráfico de radar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                    <path d="M12 12l-4-4 4-4 4 4-4 4zm0 0l4 4-4 4-4-4 4-4z"/>
                  </svg>
                </button>
                <button 
                  onClick={() => setTipoGraficoPersonalizado('dispersao')}
                  className={`p-2 rounded-md ${tipoGraficoPersonalizado === 'dispersao' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                  title="Gráfico de dispersão"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18" fill="currentColor">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M7 19h10V4H7v15zm-5-2h4V6H2v11zm16-11v11h4V6h-4z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Opções de insights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <button
                onClick={() => setInsightAtivo('vendas')}
                className={`flex items-center justify-center p-3 rounded-lg ${
                  insightAtivo === 'vendas' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'
                }`}
              >
                <FaLightbulb className="mr-2" /> Vendas e Receita
              </button>
              <button
                onClick={() => setInsightAtivo('preco-estoque')}
                className={`flex items-center justify-center p-3 rounded-lg ${
                  insightAtivo === 'preco-estoque' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'
                }`}
              >
                <FaLightbulb className="mr-2" /> Preço vs Estoque
              </button>
              <button
                onClick={() => setInsightAtivo('rentabilidade')}
                className={`flex items-center justify-center p-3 rounded-lg ${
                  insightAtivo === 'rentabilidade' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'
                }`}
              >
                <FaLightbulb className="mr-2" /> Rentabilidade
              </button>
            </div>

            {/* Área do gráfico */}
            <div className="h-[450px] w-full mt-4 flex items-center justify-center bg-gray-900 rounded-lg p-4 border border-gray-700">
              {renderizarGraficoInterativo()}
            </div>
            
            {/* Insights e interpretações */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg text-sm text-gray-200">
              <h4 className="font-medium mb-2 text-indigo-300">Insights:</h4>
              {insightAtivo === 'vendas' && (
                <p>Análise de vendas e receita dos produtos. Você pode identificar quais produtos têm alto volume de vendas mas receita proporcionalmente menor, indicando possível ajuste de preços.</p>
              )}
              {insightAtivo === 'preco-estoque' && (
                <p>Relação entre preço e quantidade em estoque. Produtos com alto preço e alto estoque podem representar capital parado, enquanto produtos com baixo estoque e alto preço podem precisar de reposição prioritária.</p>
              )}
              {insightAtivo === 'rentabilidade' && (
                <p>Análise da margem de lucro e rentabilidade. Produtos com alta margem mas baixo volume de vendas podem se beneficiar de promoções, enquanto produtos com baixa margem e alto volume podem ter preços ajustados.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}