'use client';

import { FiMenu } from 'react-icons/fi';

export default function Header({ titulo, subtitulo }) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-indigo-300">{titulo}</h1>
        <p className="text-gray-300">{subtitulo}</p>
      </div>
      <div className="flex space-x-4">
        {/* Aqui podem ser adicionados botões de ação global ou notificações */}
      </div>
    </header>
  );
} 