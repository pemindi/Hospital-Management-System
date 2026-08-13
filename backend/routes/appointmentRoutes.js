const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  rescheduleAppointment,
  updateStatus,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', authorize('admin', 'receptionist'), createAppointment);
router.put('/:id/reschedule', authorize('admin', 'receptionist'), rescheduleAppointment);
router.put('/:id/status', authorize('admin', 'receptionist', 'doctor'), updateStatus);

module.exports = router;