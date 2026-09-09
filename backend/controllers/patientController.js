const Patient = require('../models/Patient');
const { createAudit } = require('../utils/audit');

// @desc    Register a new patient
// @route   POST /api/patients
// @access  Private (admin, receptionist)
exports.createPatient = async (req, res) => {
  try {
    const patient = await Patient.create({
      ...req.body,
      registeredBy: req.user.id,
    });
    // audit
    createAudit(req.user.id, 'create', 'patient', patient._id.toString(), { patient: { firstName: patient.firstName, lastName: patient.lastName } });
    res.status(201).json({ patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all patients (with optional search + pagination)
// @route   GET /api/patients?search=&page=&limit=
// @access  Private (all authenticated staff)
exports.getPatients = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;

    const query = { isActive: true };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [patients, total] = await Promise.all([
      Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Patient.countDocuments(query),
    ]);

    res.json({
      patients,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Private
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (admin, receptionist)
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    createAudit(req.user.id, 'update', 'patient', patient._id.toString(), { updates: req.body });
    res.json({ patient });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Soft-delete (deactivate) a patient
// @route   DELETE /api/patients/:id
// @access  Private (admin only)
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    createAudit(req.user.id, 'deactivate', 'patient', patient._id.toString(), {});
    res.json({ message: 'Patient deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};