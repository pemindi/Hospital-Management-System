const express = require('express');
const router = express.Router();
const {
  getPatientReport,
  getAppointmentReport,
  getRevenueReport,
  getPharmacyReport,
  getLaboratoryReport,
  getStaffReport,
  getDashboardSummary,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Available to any logged-in role — not gated behind authorize('admin') below
router.get('/dashboard-summary', protect, getDashboardSummary);

// Everything after this line requires admin specifically
router.use(protect, authorize('admin'));

router.get('/patients', getPatientReport);
router.get('/appointments', getAppointmentReport);
router.get('/revenue', getRevenueReport);
router.get('/pharmacy', getPharmacyReport);
router.get('/laboratory', getLaboratoryReport);
router.get('/staff', getStaffReport);

module.exports = router;