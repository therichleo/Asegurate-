require('dotenv').config({ path: './api-node/.env' });
const { generateContractPdf } = require('./api-node/src/utils/pdf');
generateContractPdf({
  request_id: 'test-1234-5678-abcd',
  company_name: 'Empresa Test S.A.',
  rut: '12.345.678-9',
  service_type: 'seguridad',
  start_date: '2026-08-01',
  end_date: '2026-08-31',
  total_hours: 160,
  amount: 800000,
  buy_order: 'ASG-TEST1234',
  transaction_date: '2026-07-17'
}).then(buf => {
  require('fs').writeFileSync('test-contrato.pdf', buf);
  console.log('PDF OK - tamaño:', buf.length, 'bytes');
}).catch(err => console.error('PDF ERROR:', err.message));
