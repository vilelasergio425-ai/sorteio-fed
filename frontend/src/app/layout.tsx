import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MetaPixel from '@/components/MetaPixel';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sorteio iPhone 17 Pro Max - Participe Grátis!',
  description:
    'Participe gratuitamente do nosso sorteio e concorra a um iPhone 17 Pro Max novinho!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
