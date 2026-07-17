'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase';
import { apiClient } from '../../lib/api';

const STATUS_LABELS = {
  pending:  { label: 'Pendiente',           cls: 'status-pending' },
  approved: { label: 'Habilitado para pago', cls: 'status-approved' },
  paid:     { label: 'Pagado',              cls: 'status-paid' },
};

export default function AdminPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [session, setSession] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const { data: profile } = await supabase.from('users').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') { router.push('/dashboard'); return; }

      setSession(session);
      const data = await apiClient.getAllRequests(session.access_token);
      setRequests(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleApprove = async (id) => {
    setApprovingId(id);
    const result = await apiClient.approveRequest(session.access_token, id);
    if (result.success) {
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'approved' } : r));
      setToast('Solicitud aprobada. Se notificó al cliente.');
      setTimeout(() => setToast(''), 4000);
    } else {
      alert(result.error || 'Error al aprobar la solicitud.');
    }
    setApprovingId(null);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const pending  = requests.filter((r) => r.status === 'pending');
  const approved = requests.filter((r) => r.status === 'approved');
  const paid     = requests.filter((r) => r.status === 'paid');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-brand-600 font-medium">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-brand-900 text-white px-8 py-4 flex items-center justify-between shadow-lg">
        <div>
          <span className="font-bold text-xl tracking-widest">ASEGÚRATE!</span>
          <span className="ml-3 text-xs bg-brand-600 px-2 py-0.5 rounded-full font-semibold tracking-wide">ADMIN</span>
        </div>
        <button onClick={handleLogout} className="text-white/70 hover:text-white text-sm transition-colors">
          Cerrar sesión
        </button>
      </header>

      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50">
          {toast}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Panel de administración</h1>
        <p className="text-slate-500 text-sm mb-8">Revisa y aprueba las solicitudes de servicio entrantes.</p>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Pendientes', count: pending.length,  color: 'bg-amber-50 border-amber-200 text-amber-700' },
            { label: 'Aprobadas',  count: approved.length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: 'Pagadas',    count: paid.length,     color: 'bg-green-50 border-green-200 text-green-700' },
          ].map((m) => (
            <div key={m.label} className={`border rounded-xl p-5 ${m.color}`}>
              <p className="text-sm font-semibold uppercase tracking-wide opacity-70">{m.label}</p>
              <p className="text-4xl font-bold mt-1">{m.count}</p>
            </div>
          ))}
        </div>

        {/* Tabla de solicitudes */}
        <div className="card overflow-x-auto">
          <h2 className="text-base font-bold text-slate-700 mb-4">Todas las solicitudes</h2>
          {requests.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No hay solicitudes aún.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                  <th className="pb-3 pr-4">Cliente</th>
                  <th className="pb-3 pr-4">Empresa</th>
                  <th className="pb-3 pr-4">Servicio</th>
                  <th className="pb-3 pr-4">Fechas</th>
                  <th className="pb-3 pr-4">Horas</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {requests.map((req) => {
                  const st = STATUS_LABELS[req.status];
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4 text-slate-600">{req.users?.email || '—'}</td>
                      <td className="py-3 pr-4 font-medium text-slate-800">{req.company_name}</td>
                      <td className="py-3 pr-4 capitalize">
                        {req.service_type === 'seguridad' ? '🛡️ Seguridad' : '🧹 Aseo'}
                      </td>
                      <td className="py-3 pr-4 text-slate-500">
                        {req.start_date} → {req.end_date}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{req.total_hours}h</td>
                      <td className="py-3 pr-4">
                        <span className={st?.cls}>{st?.label}</span>
                      </td>
                      <td className="py-3">
                        {req.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={approvingId === req.id}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            {approvingId === req.id ? 'Aprobando...' : 'Aprobar'}
                          </button>
                        )}
                        {req.status !== 'pending' && (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
