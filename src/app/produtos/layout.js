'use client';

import Sidebar from '../components/Sidebar';
import { useState } from 'react';

export default function ProdutosLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 