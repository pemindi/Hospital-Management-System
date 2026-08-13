const express = require('express');
const router = express.Router();
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', authorize('admin'), createDoctor);
router.put('/:id', authorize('admin'), updateDoctor);
router.delete('/:id', authorize('admin'), deleteDoctor);

module.exports = router;