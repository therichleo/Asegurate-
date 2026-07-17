const supabase = require('../utils/supabase');
const { encrypt, decrypt } = require('../utils/crypto');
const { validateRut, formatRut } = require('../utils/rut');
const { Resend } = require('resend');
const axios = require('axios');

const resend = new Resend(process.env.RESEND_API_KEY);

// Crear solicitud de servicio
const createRequest = async (req, res) => {
  try {
    const { service_type, start_date, end_date, total_hours, rut, company_name } = req.body;

    if (!validateRut(rut)) {
      return res.status(400).json({ error: 'RUT inválido' });
    }
    if (!['seguridad', 'aseo'].includes(service_type)) {
      return res.status(400).json({ error: 'Tipo de servicio no válido' });
    }

    const encrypted_rut = encrypt(formatRut(rut));

    const { data, error } = await supabase
      .from('service_requests')
      .insert({
        user_id: req.user.id,
        service_type,
        start_date,
        end_date,
        total_hours: parseInt(total_hours),
        status: 'pending',
        encrypted_rut,
        company_name,
      })
      .select()
      .single();

    if (error) throw error;

    // Email de confirmación al cliente
    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: req.user.email,
      subject: 'Asegúrate! — Solicitud recibida',
      html: `<p>Hola,</p><p>Tu solicitud de servicio de <strong>${service_type}</strong> ha sido recibida y está pendiente de aprobación. Te notificaremos cuando esté habilitada para pago.</p>`,
    }).catch(() => {}); // No bloquear si el email falla

    res.status(201).json({ success: true, request: data });
  } catch (err) {
    console.error('[createRequest]', err);
    res.status(500).json({ error: 'Error al crear la solicitud' });
  }
};

// Listar solicitudes del cliente autenticado
const getMyRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select('id, service_type, start_date, end_date, total_hours, status, company_name, created_at, pdf_storage_path')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[getMyRequests]', err);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
};

// Admin: listar todas las solicitudes
const getAllRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*, users(email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[getAllRequests]', err);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
};

// Admin: aprobar solicitud (habilitar pago)
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchError } = await supabase
      .from('service_requests')
      .select('*, users(email)')
      .eq('id', id)
      .single();

    if (fetchError || !existing) return res.status(404).json({ error: 'Solicitud no encontrada' });
    if (existing.status !== 'pending') return res.status(400).json({ error: 'La solicitud ya fue procesada' });

    const { data, error } = await supabase
      .from('service_requests')
      .update({ status: 'approved' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Notificar al cliente
    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: existing.users.email,
      subject: 'Asegúrate! — Pago habilitado',
      html: `<p>Tu solicitud de servicio de <strong>${existing.service_type}</strong> ha sido aprobada. Ya puedes proceder al pago desde tu panel.</p>`,
    }).catch(() => {});

    res.json({ success: true, request: data });
  } catch (err) {
    console.error('[approveRequest]', err);
    res.status(500).json({ error: 'Error al aprobar la solicitud' });
  }
};

// Obtener URL de descarga del PDF
const downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: request, error } = await supabase
      .from('service_requests')
      .select('pdf_storage_path, user_id, status')
      .eq('id', id)
      .single();

    if (error || !request) return res.status(404).json({ error: 'Solicitud no encontrada' });
    if (request.user_id !== req.user.id) return res.status(403).json({ error: 'Sin acceso' });
    if (!request.pdf_storage_path) return res.status(404).json({ error: 'PDF no disponible aún' });

    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('contracts')
      .createSignedUrl(request.pdf_storage_path, 300); // válido 5 min

    if (urlError) throw urlError;
    res.json({ url: signedUrl.signedUrl });
  } catch (err) {
    console.error('[downloadPdf]', err);
    res.status(500).json({ error: 'Error al generar el enlace de descarga' });
  }
};

module.exports = { createRequest, getMyRequests, getAllRequests, approveRequest, downloadPdf };
