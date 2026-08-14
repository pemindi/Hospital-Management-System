const express = require('express');
const router = express.Router();
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  recordPayment,
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', authorize('admin', 'receptionist', 'accountant'), createInvoice);
router.put('/:id/payment', authorize('admin', 'receptionist', 'accountant'), recordPayment);

module.exports = router;