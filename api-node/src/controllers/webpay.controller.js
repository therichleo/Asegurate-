const { WebpayPlus, Options, Environment, IntegrationCommerceCodes, IntegrationApiKeys } = require('transbank-sdk');
const supabase = require('../utils/supabase');
const { decrypt } = require('../utils/crypto');
const { generateContractPdf } = require('../utils/pdf');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// SDK v6: usa buildForIntegration / buildForProduction (getDefaultOptions() ya no existe)
const getWebpay = () => {
  if (process.env.NODE_ENV === 'production') {
    return new WebpayPlus.Transaction(
      new Options(process.env.TRANSBANK_COMMERCE_CODE, process.env.TRANSBANK_API_KEY, Environment.Production)
    );
  }
  return WebpayPlus.Transaction.buildForIntegration(
    IntegrationCommerceCodes.WEBPAY_PLUS,
    IntegrationApiKeys.WEBPAY
  );
};

// Iniciar transacción Webpay
const initTransaction = async (req, res) => {
  try {
    const { request_id } = req.body;

    const { data: request, error } = await supabase
      .from('service_requests')
      .select('*, users(email)')
      .eq('id', request_id)
      .single();

    if (error || !request) return res.status(404).json({ error: 'Solicitud no encontrada' });
    if (request.user_id !== req.user.id) return res.status(403).json({ error: 'Sin acceso' });
    if (request.status !== 'approved') return res.status(400).json({ error: 'La solicitud no está habilitada para pago' });

    // Calcular monto: tarifa base por hora según tipo de servicio
    const hourlyRate = request.service_type === 'seguridad' ? 5000 : 3500;
    const amount = request.total_hours * hourlyRate;
    const buyOrder = `ASG-${request_id.slice(0, 8).toUpperCase()}`;
    const sessionId = `SESSION-${req.user.id.slice(0, 8)}`;
    const returnUrl = `${process.env.FRONTEND_URL}/pago/resultado`;

    const tx = getWebpay();
    const response = await tx.create(buyOrder, sessionId, amount, returnUrl);

    // Guardar token de transacción para verificación posterior
    await supabase.from('service_requests').update({
      transbank_token: response.token,
      amount,
    }).eq('id', request_id);

    res.json({ url: response.url, token: response.token });
  } catch (err) {
    console.error('[initTransaction]', err);
    res.status(500).json({ error: 'Estamos procesando su solicitud. Por favor intente nuevamente en unos minutos.' });
  }
};

// Confirmar pago tras redirección de Webpay
const confirmTransaction = async (req, res) => {
  try {
    const { token_ws } = req.body;
    if (!token_ws) return res.status(400).json({ error: 'Token no proporcionado' });

    const tx = getWebpay();
    const result = await tx.commit(token_ws);

    if (result.response_code !== 0) {
      return res.status(400).json({ error: 'Pago rechazado por Transbank', detail: result });
    }

    // Obtener la solicitud por token
    const { data: request, error } = await supabase
      .from('service_requests')
      .select('*, users(email)')
      .eq('transbank_token', token_ws)
      .single();

    if (error || !request) return res.status(404).json({ error: 'Solicitud no encontrada' });

    // Generar PDF con Puppeteer (local, sin servicio Python)
    let pdfPath = null;
    try {
      const rut = decrypt(request.encrypted_rut);
      const pdfBuffer = await generateContractPdf({
        request_id: request.id,
        company_name: request.company_name,
        rut,
        service_type: request.service_type,
        start_date: request.start_date,
        end_date: request.end_date,
        total_hours: request.total_hours,
        amount: request.amount,
        buy_order: result.buy_order,
        transaction_date: result.transaction_date,
      });

      const fileName = `contratos/${request.id}.pdf`;
      await supabase.storage.from('contracts').upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });
      pdfPath = fileName;
    } catch (pdfErr) {
      console.error('[confirmTransaction] PDF generation failed:', pdfErr.message);
      // No bloquear el flujo si el PDF falla
    }

    // Actualizar estado a paid
    await supabase.from('service_requests').update({
      status: 'paid',
      pdf_storage_path: pdfPath,
    }).eq('id', request.id);

    // Email de confirmación de pago
    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: request.users.email,
      subject: 'Asegúrate! — Pago confirmado',
      html: `<p>¡Gracias! Tu pago por el servicio de <strong>${request.service_type}</strong> ha sido confirmado. Tu contrato ya está disponible para descarga en tu panel.</p>`,
    }).catch(() => {});

    res.json({ success: true, request_id: request.id, pdf_available: !!pdfPath });
  } catch (err) {
    console.error('[confirmTransaction]', err);
    res.status(500).json({ error: 'Estamos validando su pago, por favor intente nuevamente en unos minutos.' });
  }
};

module.exports = { initTransaction, confirmTransaction };
