'use client';

import { useEffect, useRef } from 'react';

export default function Chart({ type = 'bar' }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    // Limpa o canvas
    ctx.clearRect(0, 0, width, height);
    
    // Define cores - paleta de cores para tema escuro
    const colors = ['#8a85f7', '#82e9c1', '#ffdd63', '#ff8c40', '#4299ff'];
    
    // Dados fictícios
    const data = [65, 40, 75, 30, 55];
    const labels = ['A', 'B', 'C', 'D', 'E'];
    const maxData = Math.max(...data);
    
    // Configurações de texto para tema escuro
    const textColor = '#cbd5e0';
    const backgroundColor = '#1a202c';
    
    // Renderiza o gráfico baseado no tipo
    if (type === 'bar') {
      const barWidth = width / (data.length * 2);
      const spacing = barWidth;
      
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      
      data.forEach((value, index) => {
        const x = spacing + index * (barWidth + spacing);
        const barHeight = (value / maxData) * (height - 40);
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(x, height - barHeight - 20, barWidth, barHeight);
        
        ctx.fillStyle = textColor;
        ctx.fillText(labels[index], x + barWidth / 2, height - 5);
        ctx.fillText(value.toString(), x + barWidth / 2, height - barHeight - 25);
      });
    } 
    else if (type === 'line') {
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      data.forEach((value, index) => {
        const x = (width / (data.length - 1)) * index;
        const y = height - ((value / maxData) * (height - 40)) - 20;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        // Pontos de dados
        ctx.fillStyle = colors[0];
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Rótulos
        ctx.fillStyle = textColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x, height - 5);
        ctx.fillText(value.toString(), x, y - 15);
      });
      
      ctx.stroke();
    }
    else if (type === 'pie') {
      const radius = Math.min(width, height) / 2 - 10;
      const centerX = width / 2;
      const centerY = height / 2;
      
      let startAngle = 0;
      const total = data.reduce((sum, value) => sum + value, 0);
      
      data.forEach((value, index) => {
        const sliceAngle = (2 * Math.PI * value) / total;
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        // Rótulos
        const labelAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[index], labelX, labelY);
        
        startAngle += sliceAngle;
      });
    }
  }, [type]);
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={200} 
        className="max-w-full"
      ></canvas>
    </div>
  );
} 