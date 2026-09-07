const LabTest = require('../models/LabTest');

// @desc    Request a new lab test
// @route   POST /api/lab-tests
exports.createLabTest = async (req, res) => {
  try {
    const { patient, requestedByDoctor, testType, notes } = req.body;

    const labTest = await LabTest.create({
      patient,
      requestedByDoctor,
      testType,
      notes,
      requestedBy: req.user.id,
    });

    const populated = await labTest.populate([
      { path: 'patient', select: 'firstName lastName' },
      { path: 'requestedByDoctor', select: 'firstName lastName specialization' },
    ]);

    res.status(201).json({ labTest: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get lab tests (filterable by patient, status)
// @route   GET /api/lab-tests?patient=&status=
exports.getLabTests = async (req, res) => {
  try {
    const { patient, status } = req.query;
    const query = {};
    if (patient) query.patient = patient;
    if (status) query.status = status;

    const labTests = await LabTest.find(query)
      .populate('patient', 'firstName lastName')
      .populate('requestedByDoctor', 'firstName lastName specialization')
      .sort({ createdAt: -1 });

    res.json({ labTests });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single lab test
// @route   GET /api/lab-tests/:id
exports.getLabTestById = async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id)
      .populate('patient', 'firstName lastName dateOfBirth')
      .populate('requestedByDoctor', 'firstName lastName specialization');

    if (!labTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }
    res.json({ labTest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark sample as collected
// @route   PUT /api/lab-tests/:id/collect-sample
exports.collectSample = async (req, res) => {
  try {
    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      { status: 'sample_collected', sampleCollectedAt: new Date() },
      { new: true }
    );
    if (!labTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }
    res.json({ labTest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Enter test result (marks as completed)
// @route   PUT /api/lab-tests/:id/result
exports.enterResult = async (req, res) => {
  try {
    const { resultText } = req.body;

    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      {
        resultText,
        status: 'completed',
        resultEnteredAt: new Date(),
        completedBy: req.user.id,
      },
      { new: true }
    )
      .populate('patient', 'firstName lastName')
      .populate('requestedByDoctor', 'firstName lastName specialization');

    if (!labTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }
    res.json({ labTest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update status generically (e.g. in_progress, cancelled)
// @route   PUT /api/lab-tests/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const labTest = await LabTest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!labTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }
    res.json({ labTest });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};