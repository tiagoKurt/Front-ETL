'use client';

import { useState } from 'react';
import { FiSearch, FiBell, FiUser, FiHelpCircle, FiSettings } from 'react-icons/fi';

export default function Header({ title }) {
  const [notificationCount, setNotificationCount] = useState(3);
  
  return (
    <header className="w-full bg-gray-800 shadow-md border-b border-gray-700 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Título da página */}
      <h1 className="text-xl font-semibold text-indigo-300">{title}</h1>
      
      {/* Área de busca e ações */}
      <div className="flex items-center space-x-3">
        {/* Barra de busca */}
        <div className="hidden md:flex items-center bg-gray-700 rounded-lg px-3 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-opacity-50">
          <FiSearch className="text-gray-300" />
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            className="py-1.5 px-2 bg-transparent border-none focus:outline-none w-48 lg:w-64 text-gray-200 placeholder-gray-400"
          />
        </div>
        
        {/* Botões de ação */}
        <div className="flex items-center space-x-2">
          {/* Notificações */}
          <button className="p-2 rounded-full hover:bg-gray-700 relative text-gray-300">
            <FiBell />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
          
          {/* Ajuda */}
          <button className="p-2 rounded-full hover:bg-gray-700 text-gray-300">
            <FiHelpCircle />
          </button>
          
          {/* Configurações */}
          <button className="p-2 rounded-full hover:bg-gray-700 text-gray-300">
            <FiSettings />
          </button>
          
          {/* Perfil */}
          <button className="ml-2 flex items-center">
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
              <FiUser />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
} 