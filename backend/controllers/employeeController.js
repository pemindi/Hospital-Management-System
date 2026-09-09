const Employee = require('../models/Employee');

exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    const populated = await employee.populate('department', 'name');
    res.status(201).json({ employee: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const { search = '', department = '' } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) query.department = department;

    const employees = await Employee.find(query).populate('department', 'name').sort({ createdAt: -1 });

    // Also return any registered users who have staff roles but are not linked to an Employee record
    const User = require('../models/User');
    const staffRoles = ['admin', 'doctor', 'nurse', 'receptionist', 'lab_staff', 'pharmacist', 'accountant'];

    // Collect user ids already linked
    const linkedUserIds = employees.map((e) => (e.userAccount ? e.userAccount.toString() : null)).filter(Boolean);

    const userQuery = { role: { $in: staffRoles }, isActive: true };
    if (search) userQuery.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (linkedUserIds.length > 0) userQuery._id = { $nin: linkedUserIds };

    let unlinkedUsers = await User.find(userQuery).select('name email role createdAt').sort({ createdAt: -1 });

    // If there are employees with the same email (but not linked via userAccount),
    // treat that as already represented and remove matching users from unlinked list.
    const employeeEmails = employees.map((e) => (e.email || '').toLowerCase()).filter(Boolean);
    if (employeeEmails.length > 0) {
      unlinkedUsers = unlinkedUsers.filter((u) => !employeeEmails.includes((u.email || '').toLowerCase()));
    }

    res.json({ employees, unlinkedUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('department', 'name');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('department', 'name');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};