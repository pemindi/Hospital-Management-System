const express = require('express');
const router = express.Router();
const { dispenseMedicine, getDispenseHistory } = require('../controllers/dispenseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getDispenseHistory);
router.post('/', authorize('admin', 'pharmacist'), dispenseMedicine);

module.exports = router;