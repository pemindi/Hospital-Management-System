const express = require('express');
const router = express.Router();
const {
  createLabTest,
  getLabTests,
  getLabTestById,
  collectSample,
  enterResult,
  updateStatus,
} = require('../controllers/labTestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getLabTests);
router.get('/:id', getLabTestById);
router.post('/', authorize('admin', 'doctor'), createLabTest);
router.put('/:id/collect-sample', authorize('admin', 'lab_staff'), collectSample);
router.put('/:id/result', authorize('admin', 'lab_staff'), enterResult);
router.put('/:id/status', authorize('admin', 'lab_staff'), updateStatus);

module.exports = router;