const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getLeaves);
router.post('/', authorize('admin'), applyLeave);
router.put('/:id/status', authorize('admin'), updateLeaveStatus);

module.exports = router;