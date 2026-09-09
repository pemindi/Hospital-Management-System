const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs with filters
// @route   GET /api/audit
// @access  Private (admin)
exports.getLogs = async (req, res) => {
  try {
    const { user, module: moduleName, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};
    if (user) query.user = user;
    if (moduleName) query.module = moduleName;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      AuditLog.find(query).populate('user', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments(query),
    ]);

    res.json({ items, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
