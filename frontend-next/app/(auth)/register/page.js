'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setError(authError.message || 'Error al crear la cuenta.');
      setLoading(false);
      return;
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-white font-bold text-2xl tracking-widest">ASEGÚRATE!</Link>
          <p className="text-white/60 text-sm mt-2">Crea tu cuenta empresarial</p>
        </div>

        <form onSubmit={handleRegister} className="card">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Crear cuenta</h2>

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

          <div className="mb-4">
            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>

          <div className="mb-6">
            <label className="label">Confirmar contraseña</label>
            <input
              type="password"
              className="input-field"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite tu contraseña"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-slate-500 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
