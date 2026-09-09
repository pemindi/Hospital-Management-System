const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', authorize('admin'), getLogs);

module.exports = router;
