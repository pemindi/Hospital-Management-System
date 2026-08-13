const express = require('express');
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All patient routes require login
router.use(protect);

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', authorize('admin', 'receptionist'), createPatient);
router.put('/:id', authorize('admin', 'receptionist', 'doctor', 'nurse'), updatePatient);
router.delete('/:id', authorize('admin'), deletePatient);

module.exports = router;