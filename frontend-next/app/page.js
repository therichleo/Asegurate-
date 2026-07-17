import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="text-white font-bold text-2xl tracking-widest">ASEGÚRATE!</div>
        <div className="flex gap-4">
          <Link href="/login" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
            Iniciar sesión
          </Link>
          <Link href="/register" className="bg-white text-brand-700 hover:bg-brand-50 text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-24">
        <p className="text-brand-100 text-sm font-semibold tracking-widest uppercase mb-4">
          Plataforma Profesional de Servicios
        </p>
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight max-w-3xl mb-6">
          Contrata personal de seguridad y aseo,{' '}
          <span className="text-blue-200">sin intermediarios</span>
        </h1>
        <p className="text-white/70 text-lg max-w-xl mb-10">
          Define fechas, horas y tipo de servicio desde nuestra plataforma. Contrato formal y pago 100% digital.
        </p>
        <Link href="/register" className="bg-white text-brand-700 hover:bg-brand-50 font-bold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all">
          Comenzar ahora →
        </Link>
      </main>

      {/* Servicios */}
      <section className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-white">
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold mb-2">Personal de Seguridad</h3>
          <p className="text-white/70 text-sm">Guardias certificados para instalaciones, eventos y condominios. Tarifas desde $5.000/hora.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-white">
          <div className="text-4xl mb-4">🧹</div>
          <h3 className="text-xl font-bold mb-2">Auxiliares de Aseo</h3>
          <p className="text-white/70 text-sm">Personal de limpieza profesional para oficinas y espacios corporativos. Tarifas desde $3.500/hora.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-white/40 text-xs pb-8">
        © {new Date().getFullYear()} Asegúrate! SpA — Todos los derechos reservados
      </footer>
    </div>
  );
}
