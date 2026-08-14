const express = require('express');
const router = express.Router();
const {
  createRecord,
  getRecordsByPatient,
  getRecordById,
  updateRecord,
} = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/patient/:patientId', getRecordsByPatient);
router.get('/:id', getRecordById);
router.post('/', authorize('admin', 'doctor'), createRecord);
router.put('/:id', authorize('admin', 'doctor'), updateRecord);

module.exports = router;