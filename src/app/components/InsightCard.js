'use client';

import { FiTrendingUp, FiTrendingDown, FiAlertCircle, FiInfo } from 'react-icons/fi';

// Componente para exibir insights em formato de card
export default function InsightCard({ 
  titulo, 
  valor, 
  descricao, 
  variacao = null, 
  tipoVariacao = 'moeda', // 'moeda', 'percentual' ou 'numero'
  icone = null,
  corCard = 'indigo' // 'indigo', 'teal', 'amber', 'rose'
}) {

  const renderIcone = () => {
    if (icone) return icone;

    if (variacao) {
      if (variacao > 0) {
        return <FiTrendingUp className="text-green-400" size={24} />;
      } else if (variacao < 0) {
        return <FiTrendingDown className="text-red-400" size={24} />;
      }
    }

    return <FiInfo className="text-blue-400" size={24} />;
  };

  const formatarVariacao = () => {
    if (variacao === null) return null;

    const absVariacao = Math.abs(variacao);
    
    if (tipoVariacao === 'moeda') {
      return `${variacao > 0 ? '+' : '-'} R$ ${absVariacao.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    } else if (tipoVariacao === 'percentual') {
      return `${variacao > 0 ? '+' : '-'} ${absVariacao.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}%`;
    } else {
      return `${variacao > 0 ? '+' : '-'} ${absVariacao.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
  };

  const corBorda = {
    indigo: 'border-indigo-500/30',
    teal: 'border-teal-500/30',
    amber: 'border-amber-500/30',
    rose: 'border-rose-500/30'
  };

  const corFundo = {
    indigo: 'from-indigo-900/20 to-transparent',
    teal: 'from-teal-900/20 to-transparent',
    amber: 'from-amber-900/20 to-transparent',
    rose: 'from-rose-900/20 to-transparent'
  };

  const corTexto = {
    indigo: 'text-indigo-300',
    teal: 'text-teal-300',
    amber: 'text-amber-300',
    rose: 'text-rose-300'
  };

  return (
    <div className={`bg-gray-800 rounded-xl shadow-md p-6 border ${corBorda[corCard]} bg-gradient-to-br ${corFundo[corCard]}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-300">{titulo}</h3>
        <span>
          {renderIcone()}
        </span>
      </div>
      
      <p className={`text-3xl font-bold ${corTexto[corCard]} mb-1`}>
        {valor}
      </p>
      
      {variacao !== null && (
        <p className={`text-sm ${variacao >= 0 ? 'text-green-400' : 'text-red-400'} font-medium`}>
          {formatarVariacao()} vs. período anterior
        </p>
      )}
      
      {descricao && (
        <p className="text-gray-400 text-xs mt-3">
          {descricao}
        </p>
      )}
    </div>
  );
} 