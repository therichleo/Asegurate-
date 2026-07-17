'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '../../../../lib/api';

export default function ResultadoPagoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token_ws = searchParams.get('token_ws');
    if (!token_ws) {
      setStatus('error');
      setMessage('No se recibió confirmación de pago.');
      return;
    }

    apiClient.confirmWebpay(token_ws).then((result) => {
      if (result.success) {
        setStatus('success');
        setMessage('¡Tu pago fue confirmado! Tu contrato está disponible en el panel.');
      } else {
        setStatus('error');
        setMessage(result.error || 'Estamos validando su pago, por favor intente nuevamente en unos minutos.');
      }
    }).catch(() => {
      setStatus('error');
      setMessage('Estamos validando su pago, por favor intente nuevamente en unos minutos.');
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full card text-center">
        {status === 'loading' && (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Confirmando pago</h2>
            <p className="text-slate-500 text-sm">Estamos procesando su transacción...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-700 mb-2">Pago confirmado</h2>
            <p className="text-slate-600 text-sm mb-6">{message}</p>
            <Link href="/dashboard" className="btn-primary inline-block">
              Ir a mis solicitudes
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Procesando pago</h2>
            <p className="text-slate-600 text-sm mb-6">{message}</p>
            <Link href="/dashboard" className="btn-secondary inline-block">
              Volver al panel
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
