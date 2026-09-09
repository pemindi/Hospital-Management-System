const Attendance = require('../models/Attendance');

// @desc    Mark or update attendance for one employee on one date
// @route   POST /api/attendance
exports.markAttendance = async (req, res) => {
  try {
    const { employee, date, status } = req.body;
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    // "Upsert": update if a record already exists for this employee+date, else create
    const record = await Attendance.findOneAndUpdate(
      { employee, date: dateOnly },
      { status, markedBy: req.user.id },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ attendance: record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get attendance for all staff on a specific date
// @route   GET /api/attendance?date=
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const records = await Attendance.find({ date: dateOnly }).populate('employee', 'firstName lastName position');
    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get attendance history for one employee
// @route   GET /api/attendance/employee/:employeeId
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.params.employeeId }).sort({ date: -1 }).limit(60);
    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};