const Invoice = require('../models/Invoice');

// @desc    Generate a new invoice
// @route   POST /api/invoices
exports.createInvoice = async (req, res) => {
  try {
    const { patient, appointment, items } = req.body;

    const invoice = await Invoice.create({
      patient,
      appointment: appointment || null,
      items,
      totalAmount: items.reduce((sum, item) => sum + Number(item.amount), 0),
      generatedBy: req.user.id,
    });

    const populated = await invoice.populate('patient', 'firstName lastName phone');
    res.status(201).json({ invoice: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get invoices (filterable by patient, status)
// @route   GET /api/invoices?patient=&status=
exports.getInvoices = async (req, res) => {
  try {
    const { patient, status } = req.query;
    const query = {};
    if (patient) query.patient = patient;
    if (status) query.paymentStatus = status;

    const invoices = await Invoice.find(query)
      .populate('patient', 'firstName lastName phone')
      .sort({ createdAt: -1 });

    res.json({ invoices });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient', 'firstName lastName phone email address')
      .populate('appointment');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json({ invoice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Record a payment against an invoice
// @route   PUT /api/invoices/:id/payment
exports.recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.paidAmount += Number(amount);
    invoice.paymentMethod = paymentMethod;
    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.paidAt = new Date();
    }

    await invoice.save(); // triggers the pre-save hook to recalculate paymentStatus

    const populated = await invoice.populate('patient', 'firstName lastName phone');
    res.json({ invoice: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};