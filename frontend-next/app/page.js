'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../lib/supabase';

const SERVICES = [
  {
    id: 'seguridad',
    label: 'Servicios de Seguridad',
    image: '/images/seguridad.jpg',
    tarifa: '$5.000 / hora',
    features: [
      { icon: '🛡️', title: 'Patrullaje 24/7', desc: 'Cobertura continua del perímetro y áreas críticas de tu instalación.' },
      { icon: '📹', title: 'Monitoreo de Video', desc: 'Supervisión activa de cámaras y sistemas de vigilancia en tiempo real.' },
      { icon: '🪪', title: 'Control de Acceso', desc: 'Gestión y registro de ingreso y salida de personas y vehículos.' },
    ],
  },
  {
    id: 'aseo',
    label: 'Servicios de Limpieza',
    image: '/images/aseo.jpg',
    tarifa: '$3.500 / hora',
    features: [
      { icon: '🧹', title: 'Limpieza Profunda', desc: 'Limpieza exhaustiva de instalaciones, oficinas y áreas comunes.' },
      { icon: '✨', title: 'Mantenimiento Diario', desc: 'Servicio regular para mantener tus espacios siempre impecables.' },
      { icon: '🌿', title: 'Productos Certificados', desc: 'Uso de productos de limpieza profesionales y ecológicos.' },
    ],
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [activeService, setActiveService] = useState(null);
  const [contracting, setContracting] = useState(false);

  const closeModal = () => setActiveService(null);

  const handleContratar = async () => {
    setContracting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/solicitud');
      } else {
        router.push('/login?redirect=/solicitud');
      }
    } finally {
      setContracting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar superpuesto sobre los paneles */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5">
        <div className="text-white font-bold text-2xl tracking-widest drop-shadow-lg select-none">
          ASEGÚRATE!
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="text-white/90 hover:text-white text-sm font-medium border border-white/30 hover:border-white/70 px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="bg-white text-brand-700 hover:bg-brand-50 text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-md"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Paneles split-screen */}
      <main className="flex-1 flex flex-col md:flex-row">
        {SERVICES.map((service) => (
          <div
            key={service.id}
            onClick={() => setActiveService(service)}
            className="group relative flex-1 overflow-hidden cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActiveService(service)}
            aria-label={`Ver detalles de ${service.label}`}
          >
            {/* Imagen de fondo con zoom en hover */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url(${service.image})` }}
            />

            {/* Gradiente estático para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/35" />

            {/* Overlay en hover */}
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center px-8">
              <p className="text-white text-center text-base font-medium leading-relaxed max-w-xs">
                Presiona para contratar o ver detalles del servicio
              </p>
            </div>

            {/* Etiqueta inferior */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <h2 className="text-white text-3xl md:text-4xl font-bold drop-shadow-xl tracking-tight">
                {service.label}
              </h2>
              <p className="text-white/75 text-sm mt-1.5 font-medium">
                Desde {service.tarifa}
              </p>
            </div>
          </div>
        ))}
      </main>

      {/* Footer flotante */}
      <footer className="absolute bottom-0 left-0 right-0 text-center text-white/35 text-xs pb-3 pointer-events-none z-10 select-none">
        © {new Date().getFullYear()} Asegúrate! SpA — Todos los derechos reservados
      </footer>

      {/* Modal de detalle de servicio */}
      {activeService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-brand-800 px-8 py-6 flex items-center justify-between">
              <h3 className="text-white text-xl font-bold">{activeService.label}</h3>
              <button
                onClick={closeModal}
                className="text-white/60 hover:text-white transition-colors text-3xl leading-none pb-0.5"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* Características */}
            <div className="px-8 py-6 space-y-5">
              {activeService.features.map((feat) => (
                <div key={feat.title} className="flex gap-4 items-start">
                  <span className="text-2xl mt-0.5 select-none">{feat.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{feat.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Precio y CTA */}
            <div className="px-8 pb-8">
              <div className="bg-brand-50 border border-brand-100 rounded-xl px-5 py-3 mb-5 flex items-center justify-between">
                <span className="text-brand-700 text-sm font-medium">Tarifa base</span>
                <span className="text-brand-800 font-bold text-base">{activeService.tarifa}</span>
              </div>
              <button
                onClick={handleContratar}
                disabled={contracting}
                className="btn-primary w-full text-center tracking-wide"
              >
                {contracting ? 'Verificando sesión...' : 'CONTRATAR SERVICIO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
