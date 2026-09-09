const User = require('../models/User');
const Employee = require('../models/Employee');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin)
exports.getUsers = async (req, res) => {
  try {
    const { email, role } = req.query;
    const query = {};
    if (email) query.email = email.toLowerCase();
    if (role) query.role = role;

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user (role / isActive)
// @route   PUT /api/users/:id
// @access  Private (admin)
exports.updateUser = async (req, res) => {
  try {
    const { role, isActive, name } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (name) updates.name = name;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Link a user account to an employee record
// @route   PATCH /api/users/:id/link-employee
// @access  Private (admin)
exports.linkEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const userId = req.params.id;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (employee.userAccount && employee.userAccount.toString() !== userId) {
      return res.status(400).json({ message: 'This employee is already linked to another user account' });
    }

    employee.userAccount = userId;
    await employee.save();

    res.json({ employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
