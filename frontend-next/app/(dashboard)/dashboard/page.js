'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase';
import { apiClient } from '../../../lib/api';

const STATUS_LABELS = {
  pending:  { label: 'Pendiente de aprobación', cls: 'status-pending' },
  approved: { label: 'Habilitado para pago',    cls: 'status-approved' },
  paid:     { label: 'Pagado',                  cls: 'status-paid' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setUser(session.user);
      const data = await apiClient.getMyRequests(session.access_token);
      setRequests(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const handlePay = async (requestId) => {
    setPayingId(requestId);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const result = await apiClient.initWebpay(session.access_token, requestId);
    if (result.url && result.token) {
      // Redirigir a Webpay
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = result.url;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'token_ws';
      input.value = result.token;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    } else {
      alert(result.error || 'Estamos procesando su solicitud. Por favor intente nuevamente en unos minutos.');
      setPayingId(null);
    }
  };

  const handleDownloadPdf = async (requestId) => {
    setDownloadingId(requestId);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const result = await apiClient.getPdfUrl(session.access_token, requestId);
    if (result.url) {
      window.open(result.url, '_blank');
    } else {
      alert('El contrato aún no está disponible.');
    }
    setDownloadingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-brand-600 font-medium">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-brand-800 text-white px-8 py-4 flex items-center justify-between shadow-lg">
        <span className="font-bold text-xl tracking-widest">ASEGÚRATE!</span>
        <div className="flex items-center gap-6">
          <span className="text-white/70 text-sm">{user?.email}</span>
          <button onClick={handleLogout} className="text-white/70 hover:text-white text-sm transition-colors">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Bienvenida + CTA */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mis solicitudes</h1>
            <p className="text-slate-500 text-sm mt-1">Gestiona tus contratos de servicio</p>
          </div>
          <Link href="/solicitud" className="btn-primary">
            + Nueva solicitud
          </Link>
        </div>

        {/* Lista de solicitudes */}
        {requests.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-600 font-medium">Aún no tienes solicitudes</p>
            <p className="text-slate-400 text-sm mt-1">Crea tu primera solicitud de servicio</p>
            <Link href="/solicitud" className="btn-primary inline-block mt-6">
              Solicitar servicio
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const st = STATUS_LABELS[req.status] || { label: req.status, cls: 'status-pending' };
              return (
                <div key={req.id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-slate-800 capitalize">
                        {req.service_type === 'seguridad' ? '🛡️ Personal de Seguridad' : '🧹 Auxiliares de Aseo'}
                      </span>
                      <span className={st.cls}>{st.label}</span>
                    </div>
                    <div className="text-sm text-slate-500 space-x-4">
                      <span>{req.start_date} → {req.end_date}</span>
                      <span>·</span>
                      <span>{req.total_hours} horas</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {req.status === 'approved' && (
                      <button
                        onClick={() => handlePay(req.id)}
                        disabled={payingId === req.id}
                        className="btn-primary text-sm"
                      >
                        {payingId === req.id ? 'Redirigiendo...' : 'Pagar con Webpay'}
                      </button>
                    )}
                    {req.status === 'paid' && (
                      <button
                        onClick={() => handleDownloadPdf(req.id)}
                        disabled={downloadingId === req.id}
                        className="btn-secondary text-sm"
                      >
                        {downloadingId === req.id ? 'Generando...' : '⬇ Descargar contrato'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
