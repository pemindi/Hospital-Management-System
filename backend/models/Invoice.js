const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true }, // e.g. "Consultation - Dr. Silva"
    category: {
      type: String,
      enum: ['consultation', 'laboratory', 'pharmacy', 'admission', 'other'],
      default: 'consultation',
    },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    items: {
      type: [invoiceItemSchema],
      validate: [(arr) => arr.length > 0, 'Invoice must have at least one item'],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'insurance', ''],
      default: '',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-calculate totalAmount from items before saving, and keep paymentStatus in sync
invoiceSchema.pre('save', function () {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);

  if (this.paidAmount <= 0) {
    this.paymentStatus = 'unpaid';
  } else if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partial';
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);