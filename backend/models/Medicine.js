const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    unit: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'other'],
      default: 'tablet',
    },
    batchNumber: {
      type: String,
      trim: true,
      default: '',
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 20, // triggers "low stock" warning when stock falls at/below this
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    supplier: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);