const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const { initTransaction, confirmTransaction } = require('../controllers/webpay.controller');

const router = Router();

router.post('/init', requireAuth, initTransaction);
router.post('/confirm', confirmTransaction); // Sin auth: viene de redirect de Transbank
module.exports = router;
