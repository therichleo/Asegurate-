'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase';

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/actualizar-password',
    });
    setLoading(false);
    if (authError) {
      setError('No pudimos procesar tu solicitud. Verifica el correo e intenta de nuevo.');
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-white font-bold text-2xl tracking-widest">
            ASEGÚRATE!
          </Link>
          <p className="text-white/60 text-sm mt-2">Recuperación de contraseña</p>
        </div>

        {sent ? (
          <div className="card text-center">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Correo enviado</h2>
            <p className="text-slate-500 text-sm mb-6">
              Te enviamos un enlace a <strong className="text-slate-700">{email}</strong> para
              restablecer tu contraseña. Revisa también tu carpeta de spam.
            </p>
            <Link href="/login" className="text-sm text-brand-600 font-semibold hover:underline">
              ← Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Olvidé mi contraseña</h2>
            <p className="text-slate-500 text-sm mb-6">
              Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
                {error}
              </div>
            )}

            <div className="mb-6">
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

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>

            <p className="text-center text-sm text-slate-500 mt-4">
              <Link href="/login" className="text-brand-600 font-semibold hover:underline">
                ← Volver al inicio de sesión
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
