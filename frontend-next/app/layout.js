import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Asegúrate! — Servicios Profesionales de Seguridad y Aseo',
  description: 'Plataforma digital para la contratación de personal de seguridad y auxiliares de aseo.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
