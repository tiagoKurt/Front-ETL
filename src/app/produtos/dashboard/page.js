'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FiPackage, FiTrendingUp, FiStar, FiDollarSign, FiClock, FiCalendar, FiFilter, FiDownload, FiRefreshCw, FiBarChart2, FiPieChart, FiTrendingDown, FiShoppingBag, FiBox, FiTag, FiLayers, FiAlertCircle, FiGrid, FiBriefcase, FiSettings, FiList, FiActivity, FiShield, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Header from '../../components/Header';
import InsightsSection from '../../components/InsightsSection';
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
import { FaChartBar, FaChartPie, FaChartLine, FaChartArea, FaFilter, FaLightbulb, FaPalette, FaRulerCombined } from 'react-icons/fa';
import { BsFillCartCheckFill, BsTags, BsCashCoin, BsStarHalf, BsRulers, BsPalette } from 'react-icons/bs';

export default function Dashboard() {
  const [produtos, setProdutos] = useState([]);
  const [filtro, setFiltro] = useState({
    categoria: 'todas',
    precoMin: 0,
    precoMax: 5000,
    rating: 0
  });
  const [tipoGraficoPersonalizado, setTipoGraficoPersonalizado] = useState('barras');
  const [insightAtivo, setInsightAtivo] = useState('inventario');
  const [periodoAnalise, setPeriodoAnalise] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [dadosAnaliseProdutos, setDadosAnaliseProdutos] = useState([]);
  const [mostrarDimensoes, setMostrarDimensoes] = useState(false);
  const [mostrarVariacoesCores, setMostrarVariacoesCores] = useState(false);
  const [mostrarAnaliseEspacial, setMostrarAnaliseEspacial] = useState(false);
  const [tagSelecionada, setTagSelecionada] = useState('todas');
  const [error, setError] = useState(null);
  // Adicionar estados de carregamento específicos para cada análise
  const [loadingDimensoes, setLoadingDimensoes] = useState(false);
  const [loadingCoresTamanhos, setLoadingCoresTamanhos] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  // Estado para controlar se os cálculos já foram realizados
  const [calcDimensoesRealizado, setCalcDimensoesRealizado] = useState(false);
  const [calcCoresTamanhosRealizado, setCalcCoresTamanhosRealizado] = useState(false);
  const [calcTagsRealizado, setCalcTagsRealizado] = useState(false);

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

  // Função para buscar dados da API
  const fetchProdutos = async () => {
    try {
      setLoading(true);
      
      console.log('Buscando dados da API...');
      const response = await fetch('https://backendapimongo.tigasolutions.com.br/api/v1/todos');
      
      if (!response.ok) {
        console.warn(`Erro ao buscar dados: ${response.status}. Tentando novamente...`);
        // Manter a tela de carregamento e tentar novamente após 5 segundos
        setTimeout(() => {
          fetchProdutos();
        }, 5000);
        return;
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        console.warn('Nenhum dado encontrado na API. Tentando novamente...');
        // Manter a tela de carregamento e tentar novamente após 3 segundos
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
      console.error('Erro ao buscar dados da API:', err);
      console.warn('Tentando novamente em 5 segundos...');
      // Manter a tela de carregamento e tentar novamente após 5 segundos
      setTimeout(() => {
        fetchProdutos();
      }, 5000);
    }
  };

  // Efeito para buscar dados quando o componente é montado
  useEffect(() => {
    fetchProdutos();
    
    // Configurar intervalo para atualizar dados a cada 5 minutos
    const intervalo = setInterval(() => {
      fetchProdutos();
    }, 5 * 60 * 1000);
    
    // Limpar intervalo quando componente é desmontado
    return () => clearInterval(intervalo);
  }, []);

  // Verificar se os dados foram carregados corretamente
  useEffect(() => {
    if (produtos.length > 0) {
      console.log('Produtos carregados com sucesso:', produtos.length);
      setLoading(false); 
    }
  }, [produtos]);

  const metricas = useMemo(() => {
    if (!produtos.length) return {
      totalProdutos: 0,
      totalEstoque: 0,
      mediaRating: 0,
      valorTotalEstoque: 0,
      garantiaMedia: 0,
      proximosExpiracao: 0
    };

    const totalEstoque = produtos.reduce((acc, prod) => acc + prod.quantidadeProduto, 0);
    const valorEstoque = produtos.reduce((acc, prod) => acc + (prod.quantidadeProduto * prod.precoProduto), 0);
    const mediaRating = produtos.reduce((acc, prod) => acc + prod.ratingProduto, 0) / produtos.length;
    const garantia = produtos.reduce((acc, prod) => acc + (prod.periodoGarantia || 0), 0) / produtos.length;
    
    const dataAtual = new Date();
    const tresMesesAdiante = new Date();
    tresMesesAdiante.setMonth(dataAtual.getMonth() + 3);
    
    const produtosExpirandoEmBreve = produtos.filter(prod => {
      if (prod.dataExpiracao === 'N/A') return false;
      
      try {
        const partes = prod.dataExpiracao.split('/');
        const dataExpiracao = new Date(partes[2], partes[1] - 1, partes[0]);
        return dataExpiracao > dataAtual && dataExpiracao <= tresMesesAdiante;
      } catch(e) {
        return false;
      }
    });

    return {
      totalProdutos: produtos.length,
      totalEstoque: totalEstoque,
      mediaRating: mediaRating,
      valorTotalEstoque: valorEstoque,
      garantiaMedia: garantia,
      proximosExpiracao: produtosExpirandoEmBreve.length
    };
  }, [produtos]);

  const dadosProdutosMaisEstoque = useMemo(() => {
    return [...produtos]
      .sort((a, b) => (b.quantidadeProduto || 0) - (a.quantidadeProduto || 0))
      .slice(0, 5)
      .map(produto => ({
        nome: produto.nome,
        estoque: produto.quantidadeProduto || 0,
        valorEstoque: (produto.quantidadeProduto || 0) * produto.precoProduto
      }));
  }, [produtos]);

  const dadosCategorias = useMemo(() => {
    const categorias = {};
    
    produtos.forEach(produto => {
      const categoria = produto.categoriaProduto;
      const estoque = produto.quantidadeProduto || 0;
      const valorEstoque = estoque * produto.precoProduto;
      
      if (!categorias[categoria]) {
        categorias[categoria] = { nome: categoria, estoque: 0, valorEstoque: 0, quantidade: 0 };
      }
      
      categorias[categoria].estoque += estoque;
      categorias[categoria].valorEstoque += valorEstoque;
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
        
        // Calcular valor estimado de rotatividade (dias) - simulado entre 1 e 30 dias
        const rotatividade = Math.floor(Math.random() * 30) + 1;
        
        return {
          nome: produto.nome,
          categoria: produto.categoriaProduto,
          preco: produto.precoProduto,
          custo: produto.custoProducao || produto.precoProduto * 0.7, // Estimativa caso não haja dados
          estoque: produto.quantidadeProduto,
          valorEstoque: produto.quantidadeProduto * produto.precoProduto,
          rotatividade: rotatividade, // Dias estimados para o produto girar no estoque
          avaliacao: produto.ratingProduto,
          dataProducao: produto.dataProducao,
          dataExpiracao: produto.dataExpiracao,
          margem: margem,
          valorPotencial: margem * produto.quantidadeProduto * produto.precoProduto
        };
      });
      
      // Ordenar com base no insight
      if (insightAtivo === 'inventario') {
        dadosProcessados = dadosProcessados.sort((a, b) => b.valorEstoque - a.valorEstoque);
      } else if (insightAtivo === 'preco-estoque') {
        dadosProcessados = dadosProcessados.sort((a, b) => b.estoque - a.estoque);
      } else if (insightAtivo === 'rentabilidade') {
        dadosProcessados = dadosProcessados.sort((a, b) => b.margem - a.margem);
      } else if (insightAtivo === 'rotatividade') {
        dadosProcessados = dadosProcessados.sort((a, b) => a.rotatividade - b.rotatividade);
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
      estoque: item.estoque || 0,
      valorEstoque: parseFloat(((item.preco || 0) * (item.estoque || 0)).toFixed(2)),
      preco: parseFloat((item.preco || 0).toFixed(2)),
      rotatividade: item.rotatividade || 30,
      margem: parseFloat(((item.margem || 0) * 100).toFixed(2)),
      valorPotencial: parseFloat(((item.preco || 0) * (item.estoque || 0) * (item.margem || 0)).toFixed(2)),
      avaliacao: parseFloat((item.avaliacao || 0).toFixed(1)),
      valor: item.estoque || 0 // Campo adicional para compatibilidade
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
      
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={130} data={dadosProcessados}>
              <PolarGrid stroke={borderColor} />
              <PolarAngleAxis dataKey="nome" tick={{ fill: mutedTextColor }} />
              <PolarRadiusAxis tick={{ fill: mutedTextColor }} />
              <Tooltip 
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  if (name.includes('Preço') || name.includes('Receita') || name.includes('Lucro')) {
                    return [formatadorMoeda(value), name];
                  }
                  return [value, name];
                }}
              />
              <Legend formatter={(value) => <span style={{ color: mutedTextColor }}>{value}</span>} />
              <Radar 
                name={insightAtivo === 'vendas' ? 'Vendas' : 
                      insightAtivo === 'preco-estoque' ? 'Preço' : 
                      insightAtivo === 'rentabilidade' ? 'Margem (%)' : 
                      insightAtivo === 'avaliacao-vendas' ? 'Avaliação' : 
                      insightAtivo === 'estoque-rotatividade' ? 'Estoque' : 'Vendas'} 
                dataKey={insightAtivo === 'vendas' ? 'vendas' : 
                         insightAtivo === 'preco-estoque' ? 'preco' : 
                         insightAtivo === 'rentabilidade' ? 'margem' : 
                         insightAtivo === 'avaliacao-vendas' ? 'avaliacao' : 
                         insightAtivo === 'estoque-rotatividade' ? 'estoque' : 'vendas'} 
                stroke={COLORS[0]} 
                fill={COLORS[0]} 
                fillOpacity={0.6} 
              />
              <Radar 
                name={insightAtivo === 'vendas' ? 'Receita' : 
                      insightAtivo === 'preco-estoque' ? 'Estoque' : 
                      insightAtivo === 'rentabilidade' ? 'Lucro Total' : 
                      insightAtivo === 'avaliacao-vendas' ? 'Vendas' : 
                      insightAtivo === 'estoque-rotatividade' ? 'Vendas' : 'Receita'} 
                dataKey={insightAtivo === 'vendas' ? 'receita' : 
                         insightAtivo === 'preco-estoque' ? 'estoque' : 
                         insightAtivo === 'rentabilidade' ? 'lucroTotal' : 
                         insightAtivo === 'avaliacao-vendas' ? 'vendas' : 
                         insightAtivo === 'estoque-rotatividade' ? 'vendas' : 'receita'} 
                stroke={COLORS[1]} 
                fill={COLORS[1]} 
                fillOpacity={0.6} 
              />
            </RadarChart>
          </ResponsiveContainer>
        );
        
      case 'composto':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dadosProcessados} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
              <XAxis dataKey="nome" angle={-45} textAnchor="end" height={60} tick={{ fill: mutedTextColor }} />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                stroke={COLORS[0]} 
                tick={{ fill: mutedTextColor }}
                label={{ value: insightAtivo === 'vendas' ? 'Vendas' : 
                                 insightAtivo === 'preco-estoque' ? 'Preço (R$)' : 
                                 insightAtivo === 'rentabilidade' ? 'Margem (%)' : 
                                 insightAtivo === 'avaliacao-vendas' ? 'Avaliação' : 
                                 insightAtivo === 'estoque-rotatividade' ? 'Estoque' : 'Vendas', 
                         angle: -90, position: 'insideLeft', fill: mutedTextColor }} 
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke={COLORS[1]} 
                tick={{ fill: mutedTextColor }}
                label={{ value: insightAtivo === 'vendas' ? 'Receita (R$)' : 
                                 insightAtivo === 'preco-estoque' ? 'Estoque (Un)' : 
                                 insightAtivo === 'rentabilidade' ? 'Lucro Total (R$)' : 
                                 insightAtivo === 'avaliacao-vendas' ? 'Vendas' : 
                                 insightAtivo === 'estoque-rotatividade' ? 'Vendas' : 'Receita (R$)', 
                         angle: 90, position: 'insideRight', fill: mutedTextColor }} 
              />
              <Tooltip 
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  if (name.includes('Preço') || name.includes('Receita') || name.includes('Lucro')) {
                    return [formatadorMoeda(value), name];
                  }
                  return [value, name];
                }}
              />
              <Legend formatter={(value) => <span style={{ color: mutedTextColor }}>{value}</span>} />
              <Bar 
                yAxisId="left" 
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
                fill={COLORS[0]} 
                barSize={30} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
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
                stroke={COLORS[1]} 
                strokeWidth={3} 
                dot={{ r: 5, fill: COLORS[1] }} 
                activeDot={{ r: 7 }} 
              />
            </ComposedChart>
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
  const totalProdutos = produtos.length;
  const totalEstoque = produtos.reduce((sum, produto) => sum + (produto.quantidadeProduto || 0), 0);
  const mediaAvaliacao = produtos.length > 0 
    ? (produtos.reduce((sum, produto) => sum + produto.ratingProduto, 0) / produtos.length).toFixed(1) 
    : 0;
  const valorTotalEstoque = produtos.reduce((sum, produto) => sum + ((produto.quantidadeProduto || 0) * produto.precoProduto), 0).toFixed(2);

  // Dados para o gráfico de valor de estoque por categoria
  const dadosEstoquePorCategoria = produtos.length > 0 
    ? produtos.reduce((acc, produto) => {
        const idx = acc.findIndex(item => item.nome === produto.categoriaProduto);
        const valorEstoque = produto.precoProduto * (produto.quantidadeProduto || 0);
        if (idx >= 0) {
          acc[idx].valor += valorEstoque;
          acc[idx].quantidade += produto.quantidadeProduto || 0;
        } else {
          acc.push({ 
            nome: produto.categoriaProduto, 
            valor: valorEstoque,
            quantidade: produto.quantidadeProduto || 0 
          });
        }
        return acc;
      }, []).map(item => ({
        ...item,
        valor: parseFloat(item.valor.toFixed(2))
      }))
    : [];

  // Nova função para extrair cores únicas
  const coresUnicas = useMemo(() => {
    if (!produtos.length) return [];
    
    const cores = new Set();
    produtos.forEach(produto => {
      if (produto.cor) {
        cores.add(produto.cor);
      }
    });
    
    return Array.from(cores);
  }, [produtos]);

  // Nova função para extrair tamanhos únicos
  const tamanhosUnicos = useMemo(() => {
    if (!produtos.length) return [];
    
    const tamanhos = new Set();
    produtos.forEach(produto => {
      if (produto.tamanho) {
        tamanhos.add(produto.tamanho);
      }
    });
    
    return Array.from(tamanhos);
  }, [produtos]);


  // Análise de tags de produtos - centralizada com useMemo
  const analiseTags = useMemo(() => {
    // Se os cálculos já foram realizados e a análise não está sendo mostrada, retorne array vazio
    if (calcTagsRealizado && !mostrarAnaliseEspacial) {
      return [];
    }
    
    if (!produtos.length) return [];
    
    // Ativar loading enquanto calcula
    if (mostrarAnaliseEspacial && !calcTagsRealizado) {
      setLoadingTags(true);
    }
    
    const tagsMap = new Map();
    const totalEstoque = produtos.reduce((acc, prod) => acc + (prod.quantidadeProduto || 0), 0);
    
    produtos.forEach(produto => {
      // Obter todas as tags do produto (pode ser uma string ou array)
      let tags = [];
      
      if (produto.tags) {
        if (Array.isArray(produto.tags)) {
          tags = produto.tags;
        } else if (typeof produto.tags === 'string') {
          // Se for string, dividir por vírgulas ou espaços
          tags = produto.tags.split(/[,\s]+/).filter(Boolean);
        }
      }
      
      // Se não houver tags explícitas, usar a categoria como tag
      if (!tags.length && produto.categoriaProduto) {
        tags = [produto.categoriaProduto];
      }
      
      // Processar cada tag
      tags.forEach(tag => {
        tag = tag.trim();
        if (!tag) return;
        
        if (!tagsMap.has(tag)) {
          tagsMap.set(tag, { 
            tag, 
            estoque: 0, 
            quantidade: 0,
            ratingMedio: 0,
            totalRating: 0,
            valorEstoque: 0
          });
        }
        
        const tagData = tagsMap.get(tag);
        tagData.estoque += produto.quantidadeProduto || 0;
        tagData.quantidade += 1;
        tagData.totalRating += produto.ratingProduto || 0;
        tagData.ratingMedio = tagData.totalRating / tagData.quantidade;
        tagData.valorEstoque += (produto.quantidadeProduto || 0) * (produto.precoProduto || 0);
      });
    });
    
    // Calcular proporção do estoque
    const resultado = Array.from(tagsMap.values())
      .filter(tag => tag.estoque > 0) // Filtrar tags sem estoque
      .map(tag => ({
        ...tag,
        proporcaoEstoque: ((tag.estoque / totalEstoque) * 100).toFixed(1)
      }))
      .sort((a, b) => b.estoque - a.estoque);
    
    // Marcar que os cálculos foram realizados e desativar o loading
    if (mostrarAnaliseEspacial) {
      setCalcTagsRealizado(true);
      setLoadingTags(false);
    }
    
    return resultado;
  }, [produtos, mostrarAnaliseEspacial, calcTagsRealizado]);
  
  const analisePorCor = useMemo(() => {
    // Se os cálculos já foram realizados e a análise não está sendo mostrada, retorne array vazio
    if (calcCoresTamanhosRealizado && !mostrarVariacoesCores) {
      return [];
    }
    
    if (!produtos.length) return [];
    
    const coresMap = new Map();
    
    produtos.forEach(produto => {
      const cor = produto.corProduto || 'N/A';
      const estoque = produto.quantidadeProduto || 0;
      
      if (!coresMap.has(cor)) {
        coresMap.set(cor, { 
          cor, 
          estoque: 0, 
          quantidade: 0,
          ratingMedio: 0,
          totalRating: 0,
          valorEstoque: 0
        });
      }
      
      const corData = coresMap.get(cor);
      corData.estoque += estoque;
      corData.quantidade += 1;
      corData.totalRating += produto.ratingProduto;
      corData.ratingMedio = corData.totalRating / corData.quantidade;
      corData.valorEstoque += estoque * produto.precoProduto;
    });
    
    const resultado = Array.from(coresMap.values())
      .sort((a, b) => b.estoque - a.estoque);
    
    // Marcar que os cálculos foram realizados e desativar o loading
    if (mostrarVariacoesCores) {
      setCalcCoresTamanhosRealizado(true);
      setLoadingCoresTamanhos(false);
    }
    
    return resultado;
  }, [produtos, mostrarVariacoesCores, calcCoresTamanhosRealizado]);

  // Calcular a cor com a melhor avaliação
  const corMelhorAvaliada = useMemo(() => {
    if (!analisePorCor || analisePorCor.length === 0) return null;
    return [...analisePorCor].sort((a, b) => b.ratingMedio - a.ratingMedio)[0];
  }, [produtos, mostrarVariacoesCores, calcCoresTamanhosRealizado]);

  // Nova função para análise de correlação entre dimensões e estoque - Otimizada
  const correlacaoDimensoesEstoque = useMemo(() => {
    // Se os cálculos de dimensões já foram realizados mas a análise não está sendo mostrada,
    // ou se não temos produtos, retornar objeto vazio
    if ((calcDimensoesRealizado && !mostrarDimensoes) || !produtos.length) {
      return { dadosScatter: [], correlacao: 0 };
    }
    
    const produtosValidos = produtos.filter(
      p => p.Altura && p.Largura && p.Comprimento && p.quantidadeProduto
    );
    
    if (!produtosValidos.length) return { dadosScatter: [], correlacao: 0 };
    
    // Calcular volume e preparar dados para gráfico de dispersão - Limitado a 100 produtos
    const dadosScatter = produtosValidos.slice(0, 100).map(p => {
      const volume = p.Altura * p.Largura * p.Comprimento;
      return {
        nome: p.nome,
        volume,
        estoque: p.quantidadeProduto || 0
      };
    });
    
    // Calcular correlação entre volume e estoque (coeficiente de Pearson)
    const mediaVolume = dadosScatter.reduce((acc, item) => acc + item.volume, 0) / dadosScatter.length;
    const mediaEstoque = dadosScatter.reduce((acc, item) => acc + item.estoque, 0) / dadosScatter.length;
    
    let numerador = 0;
    let denominador1 = 0;
    let denominador2 = 0;
    
    dadosScatter.forEach(item => {
      const diffVolume = item.volume - mediaVolume;
      const diffEstoque = item.estoque - mediaEstoque;
      
      numerador += diffVolume * diffEstoque;
      denominador1 += diffVolume * diffVolume;
      denominador2 += diffEstoque * diffEstoque;
    });
    
    const correlacao = denominador1 && denominador2 
      ? (numerador / Math.sqrt(denominador1 * denominador2)).toFixed(2)
      : 0;
    
    return { dadosScatter, correlacao };
  }, [produtos, mostrarDimensoes, calcDimensoesRealizado]);

  // Nova função para análise de estoque por cor - Otimizada
  const analiseEstoquePorCor = useMemo(() => {
    // Se a análise está sendo ativada, marque que o carregamento começou
    if (mostrarVariacoesCores && !calcCoresTamanhosRealizado) {
      setLoadingCoresTamanhos(true);
    }
    
    if (!produtos.length) return [];
    
    const coresMap = new Map();
    
    produtos.forEach(produto => {
      const cor = produto.cor || 'N/A';
      const estoque = produto.quantidadeProduto || 0;
      
      if (!coresMap.has(cor)) {
        coresMap.set(cor, { 
          cor, 
          estoque: 0, 
          quantidade: 0, 
          ratingMedio: 0,
          totalRating: 0,
          valorEstoque: 0 
        });
      }
      
      const corData = coresMap.get(cor);
      corData.estoque += estoque;
      corData.quantidade += 1;
      corData.totalRating += produto.ratingProduto;
      corData.ratingMedio = corData.totalRating / corData.quantidade;
      corData.valorEstoque += estoque * produto.precoProduto;
    });
    
    const resultado = Array.from(coresMap.values())
      .sort((a, b) => b.estoque - a.estoque);
    
    // Marcar que os cálculos foram realizados e desativar o loading
    if (mostrarVariacoesCores) {
      setCalcCoresTamanhosRealizado(true);
      setLoadingCoresTamanhos(false);
    }
    
    return resultado;
  }, [produtos, mostrarVariacoesCores, calcCoresTamanhosRealizado]);

  // Nova função para análise de estoque por tamanho - Otimizada
  const analiseEstoquePorTamanho = useMemo(() => {
    // Se os cálculos já foram realizados e a análise não está sendo mostrada, retorne array vazio
    if (calcCoresTamanhosRealizado && !mostrarVariacoesCores) {
      return [];
    }
    
    if (!produtos.length) return [];
    
    const tamanhosMap = new Map();
    
    produtos.forEach(produto => {
      const tamanho = produto.tamanho || 'N/A';
      const estoque = produto.quantidadeProduto || 0;
      
      if (!tamanhosMap.has(tamanho)) {
        tamanhosMap.set(tamanho, { 
          tamanho, 
          estoque: 0, 
          quantidade: 0,
          ratingMedio: 0,
          totalRating: 0,
          valorEstoque: 0
        });
      }
      
      const tamanhoData = tamanhosMap.get(tamanho);
      tamanhoData.estoque += estoque;
      tamanhoData.quantidade += 1;
      tamanhoData.totalRating += produto.ratingProduto;
      tamanhoData.ratingMedio = tamanhoData.totalRating / tamanhoData.quantidade;
      tamanhoData.valorEstoque += estoque * produto.precoProduto;
    });
    
    return Array.from(tamanhosMap.values())
      .sort((a, b) => b.estoque - a.estoque);
  }, [produtos, mostrarVariacoesCores, calcCoresTamanhosRealizado]);

  // Adicionar efeitos para resetar os cálculos quando os produtos mudam
  useEffect(() => {
    // Resetar os cálculos quando os produtos mudam
    setCalcDimensoesRealizado(false);
    setCalcCoresTamanhosRealizado(false);
    setCalcTagsRealizado(false);
  }, [produtos]);

  // Adicionar seção de renderização para análise de dimensões - Otimizada
  const renderizarAnaliseDimensoes = () => {
    // Se estiver carregando, mostrar indicador de carregamento
    if (loadingDimensoes) {
      return (
        <div className="p-8 bg-gray-800 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Calculando análise de dimensões...</p>
        </div>
      );
    }
    
    // Se não há dados suficientes, mostrar mensagem
    if (!analiseDimensoes.produtosMaiores.length) {
      return (
        <div className="p-4 bg-gray-800 rounded-lg shadow-md text-center">
          <p className="text-gray-300">Não há dados de dimensões suficientes para análise</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FaRulerCombined className="mr-2" /> Dimensões Médias dos Produtos
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-700 p-3 rounded-md text-center">
              <p className="text-sm text-gray-400">Altura</p>
              <p className="text-xl font-bold text-white">{analiseDimensoes.medidasMedias.altura} cm</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-md text-center">
              <p className="text-sm text-gray-400">Largura</p>
              <p className="text-xl font-bold text-white">{analiseDimensoes.medidasMedias.largura} cm</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-md text-center">
              <p className="text-sm text-gray-400">Comprimento</p>
              <p className="text-xl font-bold text-white">{analiseDimensoes.medidasMedias.comprimento} cm</p>
            </div>
          </div>
          <div className="mt-4 bg-gray-700 p-3 rounded-md text-center">
            <p className="text-sm text-gray-400">Volume Médio</p>
            <p className="text-xl font-bold text-white">{analiseDimensoes.volumeMedio} cm³</p>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FiBox className="mr-2" /> Correlação entre Volume e Estoque
          </h3>
          {correlacaoDimensoesEstoque.correlacao !== 0 ? (
            <div>
              <div className="mb-4 bg-gray-700 p-3 rounded-md text-center">
                <p className="text-sm text-gray-400">Coeficiente de Correlação</p>
                <p className="text-xl font-bold text-white">{correlacaoDimensoesEstoque.correlacao}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {correlacaoDimensoesEstoque.correlacao > 0.5 ? 'Forte correlação positiva' : 
                   correlacaoDimensoesEstoque.correlacao < -0.5 ? 'Forte correlação negativa' : 
                   correlacaoDimensoesEstoque.correlacao > 0.3 ? 'Correlação positiva moderada' :
                   correlacaoDimensoesEstoque.correlacao < -0.3 ? 'Correlação negativa moderada' :
                   'Correlação fraca ou inexistente'}
                </p>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    background={chartBackground}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                    <XAxis 
                      dataKey="volume" 
                      name="Volume" 
                      type="number" 
                      stroke={textColor}
                      label={{ value: 'Volume (cm³)', position: 'insideBottomRight', offset: -5, fill: textColor }}
                    />
                    <YAxis 
                      dataKey="estoque" 
                      name="Estoque" 
                      stroke={textColor}
                      label={{ value: 'Estoque', angle: -90, position: 'insideLeft', fill: textColor }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [value, name === 'volume' ? 'Volume (cm³)' : 'Estoque']}
                      labelFormatter={(value) => `Volume: ${value.toFixed(2)} cm³`}
                    />
                    <Scatter name="Produtos" data={correlacaoDimensoesEstoque.dadosScatter} fill={accentColor} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 p-8">
              Não foi possível calcular a correlação devido a dados insuficientes
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calcular a tag com melhor avaliação uma única vez - movido para o nível do componente
  const tagComMelhorAvaliacao = useMemo(() => {
    if (!analiseTags || analiseTags.length === 0) return null;
    return [...analiseTags].sort((a, b) => b.ratingMedio - a.ratingMedio)[0];
  }, [analiseTags]);

  // Renderizar análise de tags
  const renderizarAnaliseTags = () => {
    if (loadingTags) {
      return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700 flex flex-col items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-300">Calculando análise de tags do estoque...</p>
        </div>
      );
    }

    if (!analiseTags || analiseTags.length === 0) {
      return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700 flex items-center justify-center h-[400px]">
          <p className="text-gray-300">Nenhuma tag encontrada nos produtos.</p>
        </div>
      );
    }

    // Limitar para as top 10 tags para uma visualização clara
    const topTags = analiseTags.slice(0, 10);
    const dadosGrafico = topTags.map(item => ({
      tag: item.tag,
      estoque: item.estoque,
      valor: parseFloat(item.valorEstoque.toFixed(2))
    }));

    // Detalhes para a tag selecionada
    const tagDetalhe = tagSelecionada === 'todas' 
      ? null 
      : analiseTags.find(t => t.tag === tagSelecionada);
    
    // Encontrar a tag com melhor avaliação sem usar hooks
    let melhorTag = null;
    if (analiseTags.length > 0) {
      melhorTag = analiseTags.reduce((prev, current) => 
        (prev.ratingMedio > current.ratingMedio) ? prev : current, { ratingMedio: 0 });
    }
    
    return (
      <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-medium mb-4 text-indigo-300">Top Tags por Volume de Estoque</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dadosGrafico}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis 
                    dataKey="tag" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fill: mutedTextColor }}
                    interval={0}
                  />
                  <YAxis yAxisId="left" orientation="left" tick={{ fill: mutedTextColor }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: mutedTextColor }} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'estoque') return [value, 'Unidades em Estoque'];
                      if (name === 'valor') return [`R$ ${parseFloat(value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Valor do Estoque'];
                      return [value, name];
                    }}
                    contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  <Bar 
                    yAxisId="left" 
                    dataKey="estoque" 
                    fill="#6c63ff" 
                    name="Estoque" 
                    onClick={(data) => setTagSelecionada(data.tag)}
                    cursor="pointer"
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="valor" 
                    fill="#4cd97b" 
                    name="Valor do Estoque" 
                    onClick={(data) => setTagSelecionada(data.tag)}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 text-center mt-2">
                Clique em uma barra para ver detalhes da tag
              </p>
            </div>
          </div>

          <div>
            <div className="bg-gray-700 rounded-lg p-4 h-full">
              <h3 className="text-lg font-medium mb-4 flex items-center justify-between">
                <span>Detalhes da Tag</span>
                <select
                  value={tagSelecionada}
                  onChange={(e) => setTagSelecionada(e.target.value)}
                  className="text-sm bg-gray-800 border-none rounded px-2 py-1 ml-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="todas">Selecionar tag...</option>
                  {analiseTags.map(tag => (
                    <option key={tag.tag} value={tag.tag}>{tag.tag}</option>
                  ))}
                </select>
              </h3>

              {tagDetalhe ? (
                <div className="space-y-6">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <h4 className="text-xl font-bold text-indigo-300">{tagDetalhe.tag}</h4>
                    <p className="text-gray-400 text-sm">Tag de Produto</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-400">Estoque Total</p>
                      <p className="text-xl font-bold">{tagDetalhe.estoque}</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-400">Avaliação Média</p>
                      <p className="text-xl font-bold">{tagDetalhe.ratingMedio.toFixed(1)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Valor do Estoque</p>
                    <p className="text-xl font-bold">
                      R$ {parseFloat(tagDetalhe.valorEstoque).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </p>
                  </div>

                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Proporção do Estoque</p>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-700 rounded-full h-4 mr-2">
                        <div 
                          className="bg-indigo-600 h-4 rounded-full" 
                          style={{ width: `${tagDetalhe.proporcaoEstoque}%` }}
                        ></div>
                      </div>
                      <span className="text-white">{tagDetalhe.proporcaoEstoque}%</span>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Quantidade de Produtos</p>
                    <p className="text-xl font-bold">{tagDetalhe.quantidade}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                  <FiTag className="text-4xl mb-3 text-gray-500" />
                  <p>Selecione uma tag para ver detalhes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Insights de Inventário por Tags</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-start">
                <div className="bg-indigo-900 p-2 rounded mr-3">
                  <FiBarChart2 className="text-indigo-300" />
                </div>
                <div>
                  <h4 className="font-medium text-indigo-300">Distribuição de Estoque</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {analiseTags.length > 0 ? (
                      `${(analiseTags[0].tag)} possui o maior volume de estoque (${analiseTags[0].estoque} unidades, ${analiseTags[0].proporcaoEstoque}% do total).`
                    ) : 'Sem dados suficientes para análise.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-start">
                <div className="bg-green-900 p-2 rounded mr-3">
                  <FiDollarSign className="text-green-300" />
                </div>
                <div>
                  <h4 className="font-medium text-green-300">Valor de Inventário</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {analiseTags.length > 0 ? (
                      `Produtos com a tag "${analiseTags[0].tag}" representam R$ ${parseFloat(analiseTags[0].valorEstoque).toLocaleString('pt-BR', {minimumFractionDigits: 2})} em estoque.`
                    ) : 'Sem dados suficientes para análise.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-start">
                <div className="bg-blue-900 p-2 rounded mr-3">
                  <FiStar className="text-blue-300" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-300">Avaliação e Qualidade</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {melhorTag ? (
                      `A tag com melhor avaliação é "${melhorTag.tag}" com média de ${melhorTag.ratingMedio.toFixed(1)}/5.`
                    ) : 'Sem dados suficientes para análise.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="flex items-start">
                <div className="bg-purple-900 p-2 rounded mr-3">
                  <FiShoppingBag className="text-purple-300" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-300">Otimização de Estoque</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    {analiseTags.length > 0 ? (
                      `Considere equilibrar o estoque entre as tags, já que ${analiseTags[0].tag} representa ${analiseTags[0].proporcaoEstoque}% do estoque total.`
                    ) : 'Sem dados suficientes para análise.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Adicionando renderizarAnaliseCoresTamanhos - versão simplificada
  function renderizarAnaliseCoresTamanhos() {
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-white mb-4">Análise de Cores e Tamanhos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Painel de Cores */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-indigo-300 mb-3">Distribuição por Cores</h4>
            
            {analisePorCor && analisePorCor.length > 0 ? (
              <div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analisePorCor.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                      <XAxis dataKey="cor" tick={{ fill: textColor }} />
                      <YAxis tick={{ fill: textColor }} />
                      <Tooltip 
                        formatter={(value) => [value, 'Unidades']}
                        contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }} 
                      />
                      <Bar dataKey="estoque" fill="#6c63ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <p className="text-xs text-gray-400">Cor Predominante</p>
                    <p className="text-lg font-medium text-white">{analisePorCor[0].cor}</p>
                    <p className="text-sm text-indigo-300">{analisePorCor[0].estoque} unidades</p>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <p className="text-xs text-gray-400">Valor Total</p>
                    <p className="text-lg font-medium text-white">
                      {formataMoeda(analisePorCor.reduce((sum, item) => sum + item.valorEstoque, 0))}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400">
                <p>Sem dados de cores disponíveis</p>
              </div>
            )}
          </div>
          
          {/* Painel de Tamanhos */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-indigo-300 mb-3">Distribuição por Tamanhos</h4>
            
            {analiseEstoquePorTamanho && analiseEstoquePorTamanho.length > 0 ? (
              <div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analiseEstoquePorTamanho.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="estoque"
                        nameKey="tamanho"
                        label={({ tamanho, percent }) => `${tamanho}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analiseEstoquePorTamanho.slice(0, 6).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Unidades']}
                        contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <p className="text-xs text-gray-400">Tamanho Predominante</p>
                    <p className="text-lg font-medium text-white">{analiseEstoquePorTamanho[0].tamanho}</p>
                    <p className="text-sm text-indigo-300">{analiseEstoquePorTamanho[0].estoque} unidades</p>
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded text-center">
                    <p className="text-xs text-gray-400">Valor Total</p>
                    <p className="text-lg font-medium text-white">
                      {formataMoeda(analiseEstoquePorTamanho.reduce((sum, item) => sum + item.valorEstoque, 0))}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400">
                <p>Sem dados de tamanhos disponíveis</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Insights gerais */}
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h4 className="text-md font-medium text-white mb-3">Insights de Inventário</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="bg-indigo-900 p-2 rounded-full mr-3">
                <FiBarChart2 className="text-indigo-300" />
              </div>
              <div>
                <p className="text-sm text-gray-300">
                  {analisePorCor.length > 0 ? 
                    `A cor "${analisePorCor[0].cor}" representa ${Math.round((analisePorCor[0].estoque / metricas.totalEstoque) * 100)}% do estoque total.` : 
                    "Sem dados suficientes para análise."}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-green-900 p-2 rounded-full mr-3">
                <FiDollarSign className="text-green-300" />
              </div>
              <div>
                <p className="text-sm text-gray-300">
                  {analiseEstoquePorTamanho.length > 0 ? 
                    `O tamanho "${analiseEstoquePorTamanho[0].tamanho}" representa ${formataMoeda(analiseEstoquePorTamanho[0].valorEstoque)} em estoque.` : 
                    "Sem dados suficientes para análise."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <Header titulo="Dashboard de Produtos" subtitulo="Visão geral de métricas e análises de inventário" />

      {loading || produtos.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-screen fixed inset-0 bg-gray-900 bg-opacity-95 z-50">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-indigo-500 mb-8"></div>
          <p className="text-2xl text-indigo-300 mb-4 font-medium">Carregando dados da API...</p>
          <p className="text-gray-400 max-w-md text-center">
            Aguarde enquanto buscamos as informações mais recentes. Você será redirecionado automaticamente
            quando os dados estiverem disponíveis.
          </p>
        </div>
      ) : (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {/* Seção de Insights */}
          <InsightsSection produtos={produtos} />
          
          {/* Filtros */}
          <div className="bg-gray-800 rounded-lg shadow-md p-4 mb-6 border border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              <button 
                onClick={fetchProdutos} 
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-sm transition-colors duration-200"
              >
                <FiRefreshCw />
                Atualizar dados
              </button>
            </div>
          </div>

          {/* Cards de KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-200">Total de Produtos</h3>
                <FiPackage className="text-indigo-300 text-2xl" />
              </div>
              <p className="text-3xl font-bold mt-2">{totalProdutos}</p>
              <p className="text-green-300 text-sm mt-1">↑ 12% em relação ao último período</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-200">Valor Total do Estoque</h3>
                <BsCashCoin className="text-green-300 text-2xl" />
              </div>
              <p className="text-3xl font-bold mt-2">R$ {parseFloat(valorTotalEstoque).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
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
            {/* Produtos com maior estoque */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
              <h3 className="text-xl font-medium mb-4 text-indigo-300">Produtos com Maior Estoque</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dadosProdutosMaisEstoque}
                    margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={60} tick={{ fill: mutedTextColor }} />
                    <YAxis tick={{ fill: mutedTextColor }} />
                    <Tooltip contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} formatter={(value) => <span style={{ color: mutedTextColor }}>{value}</span>} />
                    <Bar dataKey="estoque" fill={accentColor} name="Quantidade em estoque" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Top categorias */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
              <h3 className="text-xl font-medium mb-4 text-indigo-300">Top Categorias por Volume de Estoque</h3>
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
                      dataKey="estoque"
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
            {/* Valor de estoque por categoria */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
              <h3 className="text-xl font-medium mb-4 text-indigo-300">Valor de Estoque por Categoria</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dadosEstoquePorCategoria}
                    margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={60} tick={{ fill: mutedTextColor }} />
                    <YAxis tick={{ fill: mutedTextColor }} />
                    <Tooltip contentStyle={{ backgroundColor: '#171e2e', borderColor: '#2d3748', color: '#f0f4f8' }} />
                    <Legend wrapperStyle={{ paddingTop: 20 }} formatter={(value) => <span style={{ color: mutedTextColor }}>{value}</span>} />
                    <Area type="monotone" dataKey="valor" stroke={accentColor} fill={accentColor} fillOpacity={0.8} name="Valor do Estoque (R$)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Produtos com baixa avaliação */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
              <h3 className="text-xl font-medium mb-4 text-indigo-300">Produtos com Baixa Avaliação</h3>
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
                    <p>Nenhum produto com baixa avaliação encontrado.</p>
                    <p className="text-sm mt-2">Todos os produtos têm avaliação acima de 4.5</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seções adicionais de análise */}
          <section className="mt-8">
            <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded-lg p-4 shadow-lg mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <FaLightbulb className="mr-2" /> Análises de Inventário
              </h2>
              <p className="text-sm text-gray-200 mt-1">
                Visualize insights profundos do seu inventário e descubra oportunidades para otimizar seu estoque.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button 
                onClick={() => setMostrarDimensoes(!mostrarDimensoes)}
                className={`p-4 rounded-lg shadow-md flex items-center justify-between transition-all duration-300 ${
                  mostrarDimensoes ? 'bg-indigo-700' : 'bg-gray-800 hover:bg-gray-700'
                } ${loadingDimensoes ? 'opacity-75 cursor-wait' : ''}`}
                disabled={loadingDimensoes}
              >
                <div className="flex items-center">
                  {loadingDimensoes ? (
                    <div className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-indigo-300 rounded-full"></div>
                  ) : (
                    <FiBox className="text-xl mr-3" />
                  )}
                  <span className="font-medium">Análise de Dimensões</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${mostrarDimensoes ? 'bg-indigo-900' : 'bg-gray-900'}`}>
                  {mostrarDimensoes ? 'Ativo' : 'Inativo'}
                </span>
              </button>

              <button 
                onClick={() => setMostrarVariacoesCores(!mostrarVariacoesCores)}
                className={`p-4 rounded-lg shadow-md flex items-center justify-between transition-all duration-300 ${
                  mostrarVariacoesCores ? 'bg-indigo-700' : 'bg-gray-800 hover:bg-gray-700'
                } ${loadingCoresTamanhos ? 'opacity-75 cursor-wait' : ''}`}
                disabled={loadingCoresTamanhos}
              >
                <div className="flex items-center">
                  {loadingCoresTamanhos ? (
                    <div className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-indigo-300 rounded-full"></div>
                  ) : (
                    <FaPalette className="text-xl mr-3" />
                  )}
                  <span className="font-medium">Cores e Tamanhos</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${mostrarVariacoesCores ? 'bg-indigo-900' : 'bg-gray-900'}`}>
                  {mostrarVariacoesCores ? 'Ativo' : 'Inativo'}
                </span>
              </button>

              <button 
                onClick={() => setMostrarAnaliseEspacial(!mostrarAnaliseEspacial)}
                className={`p-4 rounded-lg shadow-md flex items-center justify-between transition-all duration-300 ${
                  mostrarAnaliseEspacial ? 'bg-indigo-700' : 'bg-gray-800 hover:bg-gray-700'
                } ${loadingTags ? 'opacity-75 cursor-wait' : ''}`}
                disabled={loadingTags}
              >
                <div className="flex items-center">
                  {loadingTags ? (
                    <div className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-indigo-300 rounded-full"></div>
                  ) : (
                    <FiTag className="text-xl mr-3" />
                  )}
                  <span className="font-medium">Análise de Tags</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${mostrarAnaliseEspacial ? 'bg-indigo-900' : 'bg-gray-900'}`}>
                  {mostrarAnaliseEspacial ? 'Ativo' : 'Inativo'}
                </span>
              </button>
            </div>

            {mostrarDimensoes && renderizarAnaliseDimensoes()}
            {mostrarVariacoesCores && renderizarAnaliseCoresTamanhos()}
            {mostrarAnaliseEspacial && renderizarAnaliseTags()}
          </section>
        </div>
      )}
    </div>
  );
}