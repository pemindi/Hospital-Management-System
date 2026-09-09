const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry.
 * @param {String} userId
 * @param {String} action
 * @param {String} moduleName
 * @param {String} targetId
 * @param {Object} details
 */
async function createAudit(userId, action, moduleName, targetId = null, details = {}) {
  try {
    await AuditLog.create({ user: userId, action, module: moduleName, targetId, details });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

module.exports = { createAudit };
