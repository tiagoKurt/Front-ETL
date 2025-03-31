'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FiHome,
  FiBarChart2,
  FiShoppingBag,
  FiSettings,
  FiDatabase,
  FiFileText,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiTrendingUp,
  FiTag,
} from 'react-icons/fi';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Verificar se é dispositivo móvel e ajustar sidebar
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <FiHome />,
      path: '/produtos/dashboard',
      exact: true
    },
    {
      name: 'Produtos',
      icon: <FiPackage />,
      path: '/produtos/lista',
    },
    {
      name: 'Categorias',
      icon: <FiTag />,
      path: '/produtos/categorias',
    },
    {
      name: 'Vendas',
      icon: <FiTrendingUp />,
      path: '/produtos/vendas',
    },
    {
      name: 'Relatórios',
      icon: <FiBarChart2 />,
      path: '/produtos/relatorios',
    },
    {
      name: 'Exportar',
      icon: <FiFileText />,
      path: '/produtos/exportar',
    },
  ];

  const isActive = (path) => {
    if (path === '/produtos/dashboard' && pathname === '/produtos') {
      return true;
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* Overlay para dispositivos móveis */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black/70 z-10"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`
          bg-gray-900 fixed lg:static h-screen shadow-lg transition-all duration-300 z-20 border-r border-gray-700
          ${collapsed ? 'w-16' : 'w-64'} 
          ${isMobile ? (collapsed ? '-translate-x-full' : 'translate-x-0') : 'translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <h1 className={`text-xl font-bold text-indigo-300 ${collapsed ? 'hidden' : 'block'}`}>
            Análise de Produtos
          </h1>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-800 text-gray-300"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        <nav className="mt-6">
          <ul className="space-y-2 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`
                    flex items-center py-3 px-4 rounded-lg transition-colors
                    ${isActive(item.path)
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                      : 'text-gray-200 hover:bg-gray-800'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${collapsed ? 'hidden' : 'block'}`}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
} 