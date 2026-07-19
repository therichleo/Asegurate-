'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase';

function ActualizarForm() {
  const router = useRouter();

  // status: 'loading' → verifica el token | 'ready' → muestra form | 'done' | 'invalid'
  const [status, setStatus] = useState('loading');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const supabase = createClient();

    // Supabase PKCE flow: el link llega con ?code=...
    // createBrowserClient lo detecta; escuchamos el evento para confirmarlo.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setStatus('ready');
      }
    });

    // Implicit flow: si la sesión ya existe antes del primer render
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setStatus('ready');
    });

    // Timeout de seguridad: si en 8s no llega ningún evento, el link es inválido
    const timer = setTimeout(() => {
      setStatus((prev) => (prev === 'loading' ? 'invalid' : prev));
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError('No se pudo actualizar la contraseña. El enlace puede haber expirado.');
      return;
    }
    setStatus('done');
    setTimeout(() => router.push('/login'), 3000);
  };

  // — Verificando token —
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600 px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  // — Link inválido o expirado —
  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-white font-bold text-2xl tracking-widest">ASEGÚRATE!</Link>
          </div>
          <div className="card text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Enlace inválido o expirado</h2>
            <p className="text-slate-500 text-sm mb-6">
              El enlace de recuperación ya no es válido. Puedes solicitar uno nuevo.
            </p>
            <Link href="/recuperar-password" className="btn-primary inline-block text-center">
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // — Contraseña actualizada con éxito —
  if (status === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-white font-bold text-2xl tracking-widest">ASEGÚRATE!</Link>
          </div>
          <div className="card text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Contraseña actualizada</h2>
            <p className="text-slate-500 text-sm">
              Tu contraseña fue cambiada con éxito. Te redirigiremos al inicio de sesión en unos segundos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // — Formulario de nueva contraseña —
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-600 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-white font-bold text-2xl tracking-widest">
            ASEGÚRATE!
          </Link>
          <p className="text-white/60 text-sm mt-2">Crear nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Nueva contraseña</h2>
          <p className="text-slate-500 text-sm mb-6">
            Elige una contraseña segura de al menos 8 caracteres.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="label">Nueva contraseña</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
            />
          </div>

          <div className="mb-6">
            <label className="label">Confirmar contraseña</label>
            <input
              type="password"
              className="input-field"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ActualizarPasswordPage() {
  return (
    <Suspense>
      <ActualizarForm />
    </Suspense>
  );
}
