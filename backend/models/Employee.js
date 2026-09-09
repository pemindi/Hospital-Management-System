const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    position: {
      type: String,
      required: [true, 'Position/job title is required'],
      trim: true, // e.g. "Staff Nurse", "Lab Technician", "Front Desk Officer"
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    joinDate: { type: Date, required: true },
    userAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // linked if this employee also has a login account
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
employeeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);