'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      setLoading(false);
      return;
    }

    // Verificar si es admin
    const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single();
    if (profile?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-white font-bold text-2xl tracking-widest">ASEGÚRATE!</Link>
          <p className="text-white/60 text-sm mt-2">Accede a tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="card">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="label">Correo electrónico</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="empresa@ejemplo.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-center text-sm text-slate-500 mt-4">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-brand-600 font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
