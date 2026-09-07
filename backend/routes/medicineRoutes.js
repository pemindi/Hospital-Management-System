const express = require('express');
const router = express.Router();
const {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/', authorize('admin', 'pharmacist'), createMedicine);
router.put('/:id', authorize('admin', 'pharmacist'), updateMedicine);
router.delete('/:id', authorize('admin', 'pharmacist'), deleteMedicine);

module.exports = router;