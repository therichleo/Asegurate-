require('dotenv').config();
const express = require('express');
const cors = require('cors');

const servicesRoutes = require('./routes/services.routes');
const webpayRoutes = require('./routes/webpay.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'api-node' }));

app.use('/api/services', servicesRoutes);
app.use('/api/webpay', webpayRoutes);

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`API Asegúrate! corriendo en http://localhost:${PORT}`);
});
