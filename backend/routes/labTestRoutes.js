const express = require('express');
const router = express.Router();
const {
  createLabTest,
  getLabTests,
  getLabTestById,
  getLabTestsByPatient,
  collectSample,
  enterResult,
  updateStatus,
  removeAttachment,
} = require('../controllers/labTestController');
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getLabTests);
router.get('/patient/:patientId', getLabTestsByPatient);
router.get('/:id', getLabTestById);
router.post('/', authorize('admin', 'doctor'), createLabTest);
router.put('/:id/collect-sample', authorize('admin', 'lab_staff'), collectSample);
router.put('/:id/result', authorize('admin', 'lab_staff'), upload.array('attachments'), enterResult);
router.put('/:id/status', authorize('admin', 'lab_staff'), updateStatus);
router.delete('/:id/attachments/:attachmentIndex', authorize('admin', 'lab_staff'), removeAttachment);

module.exports = router;