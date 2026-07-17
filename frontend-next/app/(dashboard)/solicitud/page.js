'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase';
import { apiClient } from '../../../lib/api';
import { validateRut, formatRut } from '../../../lib/rut';

export default function SolicitudPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    service_type: '',
    company_name: '',
    rut: '',
    start_date: '',
    end_date: '',
    total_hours: '',
  });
  const [rutError, setRutError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      setSession(session);
    };
    init();
  }, [router]);

  const handleRutChange = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, rut: val }));
    if (val.length > 3) {
      setRutError(validateRut(val) ? '' : 'RUT inválido');
    } else {
      setRutError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateRut(form.rut)) { setRutError('RUT inválido'); return; }
    if (!form.service_type) { setError('Selecciona un tipo de servicio.'); return; }

    setLoading(true);
    const result = await apiClient.createServiceRequest(session.access_token, {
      ...form,
      rut: formatRut(form.rut),
      total_hours: parseInt(form.total_hours),
    });

    if (result.success) {
      router.push('/dashboard?success=1');
    } else {
      setError(result.error || 'Error al enviar la solicitud. Intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-brand-800 text-white px-8 py-4 flex items-center gap-4 shadow-lg">
        <Link href="/dashboard" className="text-white/70 hover:text-white text-sm">← Volver</Link>
        <span className="font-bold text-xl tracking-widest">ASEGÚRATE!</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Nueva solicitud de servicio</h1>
        <p className="text-slate-500 text-sm mb-8">Completa los datos para solicitar tu servicio. Un administrador lo revisará y habilitará el pago.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-5">
          {/* Tipo de servicio */}
          <div>
            <label className="label">Tipo de servicio *</label>
            <div className="grid grid-cols-2 gap-3">
              {['seguridad', 'aseo'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, service_type: type }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.service_type === type
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-slate-200 hover:border-brand-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type === 'seguridad' ? '🛡️' : '🧹'}</div>
                  <div className="font-semibold text-sm text-slate-700 capitalize">
                    {type === 'seguridad' ? 'Personal de Seguridad' : 'Auxiliares de Aseo'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {type === 'seguridad' ? '$5.000/hora' : '$3.500/hora'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Empresa y RUT */}
          <div>
            <label className="label">Nombre de empresa / Razón social *</label>
            <input
              className="input-field"
              value={form.company_name}
              onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
              placeholder="Empresa S.A."
              required
            />
          </div>

          <div>
            <label className="label">RUT de la empresa *</label>
            <input
              className={`input-field ${rutError ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.rut}
              onChange={handleRutChange}
              placeholder="12.345.678-9"
              required
            />
            {rutError && <p className="text-red-500 text-xs mt-1">{rutError}</p>}
          </div>

          {/* Fechas y horas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha de inicio *</label>
              <input
                type="date"
                className="input-field"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="label">Fecha de término *</label>
              <input
                type="date"
                className="input-field"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                min={form.start_date || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Total de horas *</label>
            <input
              type="number"
              className="input-field"
              value={form.total_hours}
              onChange={(e) => setForm((f) => ({ ...f, total_hours: e.target.value }))}
              placeholder="Ej: 160"
              min="1"
              required
            />
          </div>

          {/* Resumen de monto */}
          {form.total_hours && form.service_type && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
              <p className="text-xs text-brand-600 font-semibold uppercase tracking-wide mb-1">Monto estimado</p>
              <p className="text-2xl font-bold text-brand-700">
                ${(parseInt(form.total_hours) * (form.service_type === 'seguridad' ? 5000 : 3500)).toLocaleString('es-CL')} CLP
              </p>
              <p className="text-xs text-slate-500 mt-1">Sujeto a aprobación del administrador</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Enviando solicitud...' : 'Enviar solicitud'}
          </button>
        </form>
      </main>
    </div>
  );
}
