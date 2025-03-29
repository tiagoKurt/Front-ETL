'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/produtos/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400 mx-auto mb-4"></div>
        <h1 className="text-2xl text-gray-200 font-medium">Redirecionando para o Dashboard de Produtos...</h1>
      </div>
    </div>
  );
} 