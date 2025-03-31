'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiPackage, FiTrendingUp, FiStar, FiDollarSign, FiClock, FiCalendar, FiFilter, FiDownload, FiRefreshCw, FiBarChart2, FiPieChart, FiTrendingDown, FiShoppingBag } from 'react-icons/fi';
import Header from '../../components/Header';
import InsightsSection from '../../components/InsightsSection';
import { productData } from '../../utils/data/productData';
import { formataMoeda } from '../../utils/insightData';
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

  // Após a definição das cores do tema, adicionar um conjunto de ícones melhorado
  const chartIcons = {
    barras: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M3 6h4v12H3V6zm6 0h4v12H9V6zm6 0h4v12h-4V6z" />
      </svg>
    ),
    pizza: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
        <path d="M12 12l8 0C20 7.58 16.42 4 12 4v8z" />
      </svg>
    ),
    linha: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
      </svg>
    ),
    area: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
      </svg>
    ),
    treemap: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M3 3h8v10H3V3zm0 12h8v6H3v-6zm10 0h8v6h-8v-6zm0-12h8v10h-8V3z" />
      </svg>
    ),
    dispersao: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M7 19h10V4H7v15zm-5-2h4V6H2v11zm16-11v11h4V6h-4z" />
      </svg>
    )
  };

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
      let dadosFiltrados = [...produtos];
      
      // Filtragem por período
      if (periodoAnalise !== 'todos') {
        const dataAtual = new Date();
        const dataInicial = new Date();
        
        switch (periodoAnalise) {
          case 'mes':
            dataInicial.setMonth(dataAtual.getMonth() - 1);
            break;
          case 'trimestre':
            dataInicial.setMonth(dataAtual.getMonth() - 3);
            break;
          case 'semestre':
            dataInicial.setMonth(dataAtual.getMonth() - 6);
            break;
          case 'ano':
            dataInicial.setFullYear(dataAtual.getFullYear() - 1);
            break;
        }
        
        dadosFiltrados = dadosFiltrados.filter(produto => {
          const partes = produto.dataProducao.split('/');
          const dataProduto = new Date(partes[2], partes[1] - 1, partes[0]);
          return dataProduto >= dataInicial;
        });
      }
      
      // Processar dados de acordo com o insight ativo
      let dadosProcessados = dadosFiltrados.map(produto => {
        const margem = produto.custoProducao && produto.precoProduto 
          ? (produto.precoProduto - produto.custoProducao) / produto.precoProduto 
          : 0.3; // Valor padrão caso não haja dados
        
        return {
          nome: produto.nome,
          categoria: produto.categoriaProduto,
          preco: produto.precoProduto,
          custo: produto.custoProducao || produto.precoProduto * 0.7, // Estimativa caso não haja dados
          estoque: produto.quantidadeProduto,
          vendas: produto.vendasTotais || 0,
          receita: (produto.vendasTotais || 0) * produto.precoProduto,
          avaliacao: produto.ratingProduto,
          dataProducao: produto.dataProducao,
          dataExpiracao: produto.dataExpiracao,
          margem: margem,
          lucroTotal: margem * (produto.vendasTotais || 0) * produto.precoProduto
        };
      });
      
      // Ordenar com base no insight
      if (insightAtivo === 'vendas') {
        dadosProcessados = dadosProcessados.sort((a, b) => b.vendas - a.vendas);
      } else if (insightAtivo === 'preco-estoque') {
        dadosProcessados = dadosProcessados.sort((a, b) => b.estoque - a.estoque);
      } else if (insightAtivo === 'rentabilidade') {
        dadosProcessados = dadosProcessados.sort((a, b) => b.margem - a.margem);
      }
      
      // Limitar a 10 itens para melhor visualização
      dadosProcessados = dadosProcessados.slice(0, 10);
      
      setDadosAnaliseProdutos(dadosProcessados);
      console.log('Dados processados para análise:', dadosProcessados.length);
    }
  }, [produtos, insightAtivo, periodoAnalise]);

  // Função para preparar dados para gráficos
  const prepararDadosParaGraficos = () => {
    if (!dadosAnaliseProdutos || dadosAnaliseProdutos.length === 0) {
      console.log('Nenhum dado disponível para análise');
      return [];
    }
    
    // Garantir que temos dados para todos os campos necessários
    const dadosProcessados = dadosAnaliseProdutos.slice(0, 8).map(item => ({
      nome: item.nome.length > 20 ? `${item.nome.substring(0, 20)}...` : item.nome,
      vendas: item.vendas || 0,
      receita: parseFloat(((item.preco || 0) * (item.vendas || 0)).toFixed(2)),
      preco: parseFloat((item.preco || 0).toFixed(2)),
      estoque: item.estoque || 0,
      margem: parseFloat(((item.margem || 0) * 100).toFixed(2)),
      lucroTotal: parseFloat(((item.preco || 0) * (item.vendas || 0) * (item.margem || 0)).toFixed(2)),
      avaliacao: parseFloat((item.avaliacao || 0).toFixed(1)),
      valor: item.vendas || 0 // Campo adicional para compatibilidade
    }));
    
    console.log('Dados processados para gráfico:', dadosProcessados.length > 0 ? 'OK' : 'Vazio');
    return dadosProcessados;
  };
  
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
    
    const dadosProcessados = prepararDadosParaGraficos();
    if (dadosProcessados.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-300">
          Nenhum dado disponível para o tipo de análise selecionado
        </div>
      );
    }
    
    const tooltipStyle = { backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' };
    
    // Formatador para garantir que valores monetários tenham 2 casas decimais
    const formatadorMoeda = (valor) => {
      if (valor === undefined || valor === null) return 'R$ 0,00';
      return `R$ ${valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    };
    
    switch (tipoGraficoPersonalizado) {
      case 'pizza':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosProcessados}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={130}
                fill="#8884d8"
                dataKey={insightAtivo === 'vendas' ? 'vendas' : 
                         insightAtivo === 'preco-estoque' ? 'preco' :
                         insightAtivo === 'rentabilidade' ? 'lucroTotal' : 
                         insightAtivo === 'avaliacao-vendas' ? 'avaliacao' :
                         insightAtivo === 'estoque-rotatividade' ? 'estoque' : 'vendas'}
                nameKey="nome"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dadosProcessados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => {
                  if (name.includes('Receita') || name.includes('Preço') || name.includes('Lucro')) {
                    return [formatadorMoeda(value), name];
                  }
                  return [value, name];
                }}
                contentStyle={tooltipStyle} 
              />
              <Legend formatter={(value) => <span style={{ color: mutedTextColor }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'treemap':
        const getTreemapData = () => {
          let dataKey = '';
          if (insightAtivo === 'vendas') {
            dataKey = 'vendas';
          } else if (insightAtivo === 'preco-estoque') {
            dataKey = 'preco';
          } else if (insightAtivo === 'rentabilidade') {
            dataKey = 'margem';
          } else if (insightAtivo === 'avaliacao-vendas') {
            dataKey = 'avaliacao';
          } else if (insightAtivo === 'estoque-rotatividade') {
            dataKey = 'estoque';
          }
          
          return dadosProcessados.map(item => ({
            name: item.nome,
            size: item[dataKey] || 0,
            value: item[dataKey] || 0,
            color: COLORS[dadosProcessados.indexOf(item) % COLORS.length]
          }));
        };
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={getTreemapData()}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#2d3748"
              fill="#8884d8"
              content={<CustomizedContent colors={COLORS} />}
            >
              <Tooltip 
                formatter={(value, name) => [`${value}`, name]} 
                contentStyle={tooltipStyle}
              />
            </Treemap>
          </ResponsiveContainer>
        );
      
      case 'dispersao':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
              <XAxis 
                type="number" 
                dataKey={insightAtivo === 'vendas' ? 'vendas' : 
                         insightAtivo === 'preco-estoque' ? 'preco' : 
                         insightAtivo === 'rentabilidade' ? 'margem' : 
                         insightAtivo === 'avaliacao-vendas' ? 'avaliacao' : 
                         insightAtivo === 'estoque-rotatividade' ? 'estoque' : 'vendas'} 
                name={insightAtivo === 'vendas' ? 'Vendas' : 
                      insightAtivo === 'preco-estoque' ? 'Preço (R$)' : 
                      insightAtivo === 'rentabilidade' ? 'Margem (%)' : 
                      insightAtivo === 'avaliacao-vendas' ? 'Avaliação' : 
                      insightAtivo === 'estoque-rotatividade' ? 'Estoque' : 'Vendas'}
                tick={{ fill: mutedTextColor }}
              />
              <YAxis 
                type="number" 
                dataKey={insightAtivo === 'vendas' ? 'receita' : 
                         insightAtivo === 'preco-estoque' ? 'estoque' : 
                         insightAtivo === 'rentabilidade' ? 'lucroTotal' : 
                         insightAtivo === 'avaliacao-vendas' ? 'vendas' : 
                         insightAtivo === 'estoque-rotatividade' ? 'vendas' : 'receita'} 
                name={insightAtivo === 'vendas' ? 'Receita (R$)' : 
                      insightAtivo === 'preco-estoque' ? 'Estoque (Un)' : 
                      insightAtivo === 'rentabilidade' ? 'Lucro Total (R$)' : 
                      insightAtivo === 'avaliacao-vendas' ? 'Vendas' : 
                      insightAtivo === 'estoque-rotatividade' ? 'Vendas' : 'Receita (R$)'}
                tick={{ fill: mutedTextColor }}
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  if (name.includes('Receita') || name.includes('Preço') || name.includes('Lucro')) {
                    return [formatadorMoeda(value), name];
                  }
                  return [value, name];
                }}
                labelFormatter={(_, data) => data[0].payload.nome}
              />
              <Legend formatter={(value) => <span style={{ color: mutedTextColor }}>{value}</span>} />
              <Scatter 
                name={insightAtivo === 'vendas' 
                  ? 'Vendas x Receita' 
                  : insightAtivo === 'preco-estoque' 
                    ? 'Preço x Estoque' 
                    : insightAtivo === 'rentabilidade' 
                      ? 'Margem x Lucro Total' 
                      : insightAtivo === 'avaliacao-vendas'
                        ? 'Avaliação x Vendas'
                        : insightAtivo === 'estoque-rotatividade'
                          ? 'Estoque x Vendas' 
                          : 'Vendas x Receita'} 
                data={dadosProcessados} 
                fill={accentColor}
                shape={(props) => {
                  const size = Math.max(20, props.payload.avaliacao * 8); // Tamanho baseado na avaliação
                  return (
                    <circle 
                      cx={props.cx} 
                      cy={props.cy} 
                      r={size / 3}
                      fill={COLORS[dadosProcessados.indexOf(props.payload) % COLORS.length]}
                      opacity={0.8}
                    />
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-300">
            Selecione um tipo de gráfico compatível
          </div>
        );
    }
  };

  // Componente personalizado para renderizar cada célula do Treemap
  const CustomizedContent = (props) => {
    const { root, depth, x, y, width, height, index, colors, name, value } = props;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? colors[index % colors.length] : 'none',
            stroke: '#2d3748',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {depth === 1 && width > 40 && height > 40 ? (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={width > 100 ? 14 : 10}
          >
            {props.name}
          </text>
        ) : null}
        {depth === 1 && width > 40 && height > 40 ? (
          <text
            x={x + width / 2}
            y={y + height / 2 + 15}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize={width > 100 ? 12 : 8}
          >
            {props.value}
          </text>
        ) : null}
      </g>
    );
  };

  // Cálculos de KPIs
  const totalVendas = produtos.reduce((sum, produto) => sum + produto.vendasTotais, 0);
  const totalReceita = produtos.reduce((sum, produto) => sum + (produto.vendasTotais * produto.precoProduto), 0).toFixed(2);
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
      }, []).map(item => ({
        ...item,
        valor: parseFloat(item.valor.toFixed(2))
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <Header titulo="Dashboard de Produtos" subtitulo="Visão geral de desempenho e métricas-chave" />
      
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Seção de Insights */}
        <InsightsSection />
        
        {/* Filtros */}
        <div className="bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-700">
          <div className="flex items-center space-x-2">
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
        </div>

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
                <p className="text-3xl font-bold mt-2">R$ {parseFloat(totalReceita).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
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
                    onClick={() => setTipoGraficoPersonalizado('pizza')}
                    className={`p-2 rounded-md ${tipoGraficoPersonalizado === 'pizza' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                    title="Gráfico de pizza"
                  >
                    {chartIcons.pizza}
                  </button>
                  <button 
                    onClick={() => setTipoGraficoPersonalizado('treemap')}
                    className={`p-2 rounded-md ${tipoGraficoPersonalizado === 'treemap' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                    title="Gráfico de árvore"
                  >
                    {chartIcons.treemap}
                  </button>
                  <button 
                    onClick={() => setTipoGraficoPersonalizado('dispersao')}
                    className={`p-2 rounded-md ${tipoGraficoPersonalizado === 'dispersao' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                    title="Gráfico de dispersão"
                  >
                    {chartIcons.dispersao}
                  </button>
                </div>
              </div>
              
              {/* Opções de insights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
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
                <button
                  onClick={() => setInsightAtivo('avaliacao-vendas')}
                  className={`flex items-center justify-center p-3 rounded-lg ${
                    insightAtivo === 'avaliacao-vendas' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <FaLightbulb className="mr-2" /> Avaliação vs Vendas
                </button>
                <button
                  onClick={() => setInsightAtivo('estoque-rotatividade')}
                  className={`flex items-center justify-center p-3 rounded-lg ${
                    insightAtivo === 'estoque-rotatividade' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <FaLightbulb className="mr-2" /> Estoque x Rotatividade
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
                {insightAtivo === 'avaliacao-vendas' && (
                  <p>Correlação entre a avaliação dos clientes e o volume de vendas. Identifique produtos bem avaliados com vendas abaixo do esperado (oportunidades de marketing) ou produtos com vendas altas mas avaliações baixas (riscos de reputação).</p>
                )}
                {insightAtivo === 'estoque-rotatividade' && (
                  <p>Análise da relação entre níveis de estoque e rotatividade de vendas. Produtos com alto estoque e baixa rotatividade podem indicar problemas de planejamento, enquanto produtos com estoque baixo e alta rotatividade podem precisar de reposição mais frequente.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}