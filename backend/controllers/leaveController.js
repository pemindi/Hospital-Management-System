const Leave = require('../models/Leave');

exports.applyLeave = async (req, res) => {
  try {
    const leave = await Leave.create(req.body);
    const populated = await leave.populate('employee', 'firstName lastName position');
    res.status(201).json({ leave: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getLeaves = async (req, res) => {
  try {
    const { employee, status } = req.query;
    const query = {};
    if (employee) query.employee = employee;
    if (status) query.status = status;

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName position')
      .sort({ createdAt: -1 });
    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.user.id },
      { new: true }
    ).populate('employee', 'firstName lastName position');

    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    res.json({ leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};