const { Router } = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  approveRequest,
  downloadPdf,
} = require('../controllers/services.controller');

const router = Router();

// Rutas del cliente
router.post('/', requireAuth, createRequest);
router.get('/mis-solicitudes', requireAuth, getMyRequests);
router.get('/:id/pdf', requireAuth, downloadPdf);

// Rutas del administrador
router.get('/admin/todas', requireAdmin, getAllRequests);
router.patch('/admin/:id/aprobar', requireAdmin, approveRequest);

module.exports = router;
