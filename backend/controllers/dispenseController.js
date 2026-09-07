const Medicine = require('../models/Medicine');
const DispenseRecord = require('../models/DispenseRecord');

// @desc    Dispense medicine to a patient — deducts stock, logs the transaction
// @route   POST /api/dispense
exports.dispenseMedicine = async (req, res) => {
  try {
    const { patient, medicine, quantity } = req.body;

    const medicineDoc = await Medicine.findById(medicine);
    if (!medicineDoc) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    if (medicineDoc.stockQuantity < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Only ${medicineDoc.stockQuantity} units available.`,
      });
    }

    medicineDoc.stockQuantity -= quantity;
    await medicineDoc.save();

    const record = await DispenseRecord.create({
      patient,
      medicine,
      quantity,
      dispensedBy: req.user.id,
    });

    const populated = await record.populate([
      { path: 'patient', select: 'firstName lastName' },
      { path: 'medicine', select: 'name unit' },
    ]);

    res.status(201).json({ dispenseRecord: populated, remainingStock: medicineDoc.stockQuantity });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get dispense history (filterable by patient)
// @route   GET /api/dispense?patient=
exports.getDispenseHistory = async (req, res) => {
  try {
    const { patient } = req.query;
    const query = {};
    if (patient) query.patient = patient;

    const records = await DispenseRecord.find(query)
      .populate('patient', 'firstName lastName')
      .populate('medicine', 'name unit unitPrice')
      .sort({ createdAt: -1 });

    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};