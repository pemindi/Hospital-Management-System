const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },     // e.g. "500mg"
    frequency: { type: String, required: true, trim: true },  // e.g. "Twice daily"
    duration: { type: String, required: true, trim: true },   // e.g. "5 days"
  },
  { _id: false }
);

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null, // optional — a record can exist without a linked appointment
    },
    visitDate: {
      type: Date,
      default: Date.now,
    },
    symptoms: {
      type: String,
      trim: true,
      default: '',
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    prescriptions: [prescriptionItemSchema],
    treatmentNotes: {
      type: String,
      trim: true,
      default: '',
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);