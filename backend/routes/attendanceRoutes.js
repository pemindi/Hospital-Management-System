const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceByDate,
  getAttendanceByEmployee,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAttendanceByDate);
router.get('/employee/:employeeId', getAttendanceByEmployee);
router.post('/', authorize('admin'), markAttendance);

module.exports = router;