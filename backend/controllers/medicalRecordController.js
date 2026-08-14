const MedicalRecord = require('../models/MedicalRecord');

// @desc    Create a medical record for a patient
// @route   POST /api/medical-records
exports.createRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.create({
      ...req.body,
      createdBy: req.user.id,
    });

    const populated = await record.populate([
      { path: 'patient', select: 'firstName lastName' },
      { path: 'doctor', select: 'firstName lastName specialization' },
    ]);

    res.status(201).json({ record: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all medical records for a specific patient (their history)
// @route   GET /api/medical-records/patient/:patientId
exports.getRecordsByPatient = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate('doctor', 'firstName lastName specialization')
      .sort({ visitDate: -1 });

    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single medical record
// @route   GET /api/medical-records/:id
exports.getRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth allergies')
      .populate('doctor', 'firstName lastName specialization');

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    res.json({ record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a medical record
// @route   PUT /api/medical-records/:id
exports.updateRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'firstName lastName specialization');

    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }
    res.json({ record });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};