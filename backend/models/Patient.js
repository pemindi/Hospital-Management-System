const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    emergencyContactName: {
      type: String,
      trim: true,
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
    },
    allergies: {
      type: String,
      trim: true,
      default: '',
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual field: full name (not stored, computed on the fly)
patientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
patientSchema.set('toJSON', { virtuals: true });

// Text index to support search by name/phone/email
patientSchema.index({ firstName: 'text', lastName: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Patient', patientSchema);