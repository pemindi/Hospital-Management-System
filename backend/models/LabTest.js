const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    requestedByDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    testType: {
      type: String,
      required: [true, 'Test type is required'],
      trim: true, // e.g. "Complete Blood Count", "ECG", "X-Ray Chest"
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['requested', 'sample_collected', 'in_progress', 'completed', 'cancelled'],
      default: 'requested',
    },
    sampleCollectedAt: {
      type: Date,
      default: null,
    },
    resultText: {
      type: String,
      trim: true,
      default: '',
    },
    resultEnteredAt: {
      type: Date,
      default: null,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabTest', labTestSchema);