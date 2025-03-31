import './globals.css';

export const metadata = {
  title: 'ETL Big Data',
  description: 'Aplicação ETL para Big Data com Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased dark-theme bg-gray-900 text-gray-100">
        {children}
      </body>
    </html>
  );
} 