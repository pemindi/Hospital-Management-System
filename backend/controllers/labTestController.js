const LabTest = require('../models/LabTest');
const { uploadFile, getSignedUrl, deleteFile } = require('../utils/supabaseStorage');

// Attaches a temporary signedUrl to each attachment without permanently storing it
// Signed URLs expire, so we generate a fresh one on every read instead of caching it
const attachSignedUrls = async (labTestDoc) => {
  const labTest = labTestDoc.toObject ? labTestDoc.toObject() : labTestDoc;

  labTest.attachments = await Promise.all(
    (labTest.attachments || []).map(async (att) => ({
      ...att,
      signedUrl: await getSignedUrl(att.path),
    }))
  );

  return labTest;
};

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
      {
        path: 'requestedByDoctor',
        select: 'firstName lastName specialization',
      },
    ]);

    res.status(201).json({ labTest: populated });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
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

    const withSignedUrls = await Promise.all(
      labTests.map((test) => attachSignedUrls(test))
    );

    res.json({ labTests: withSignedUrls });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
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
      return res.status(404).json({
        message: 'Lab test not found',
      });
    }

    res.json({
      labTest: await attachSignedUrls(labTest),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get lab tests by patient
// @route   GET /api/lab-tests/patient/:patientId
exports.getLabTestsByPatient = async (req, res) => {
  try {
    const labTests = await LabTest.find({
      patient: req.params.patientId,
    })
      .populate('requestedByDoctor', 'firstName lastName specialization')
      .sort({ createdAt: -1 });

    const withSignedUrls = await Promise.all(
      labTests.map((test) => attachSignedUrls(test))
    );

    res.json({
      labTests: withSignedUrls,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Mark sample as collected
// @route   PUT /api/lab-tests/:id/collect-sample
exports.collectSample = async (req, res) => {
  try {
    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'sample_collected',
        sampleCollectedAt: new Date(),
      },
      { new: true }
    );

    if (!labTest) {
      return res.status(404).json({
        message: 'Lab test not found',
      });
    }

    res.json({ labTest });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Enter test result and upload attachments
// @route   PUT /api/lab-tests/:id/result
exports.enterResult = async (req, res) => {
  try {
    const { resultText } = req.body;

    const labTest = await LabTest.findById(req.params.id);

    if (!labTest) {
      return res.status(404).json({
        message: 'Lab test not found',
      });
    }

    if (labTest.status === 'cancelled') {
      return res.status(400).json({
        message: 'Cannot enter results on a cancelled test',
      });
    }

    labTest.resultText = resultText;
    labTest.status = 'completed';
    labTest.resultEnteredAt = new Date();
    labTest.completedBy = req.user.id;

    if (req.files && req.files.length > 0) {
      const uploadedPaths = await Promise.all(
        req.files.map(async (file) => ({
          path: await uploadFile(file),
          originalName: file.originalname,
        }))
      );

      labTest.attachments.push(...uploadedPaths);
    }

    await labTest.save();

    const populated = await labTest.populate([
      {
        path: 'patient',
        select: 'firstName lastName',
      },
      {
        path: 'requestedByDoctor',
        select: 'firstName lastName specialization',
      },
    ]);

    res.json({
      labTest: await attachSignedUrls(populated),
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Remove an attachment
// @route   DELETE /api/lab-tests/:id/attachments/:attachmentIndex
exports.removeAttachment = async (req, res) => {
  try {
    const labTest = await LabTest.findById(req.params.id);

    if (!labTest) {
      return res.status(404).json({
        message: 'Lab test not found',
      });
    }

    const index = Number(req.params.attachmentIndex);

    if (
      index < 0 ||
      index >= labTest.attachments.length
    ) {
      return res.status(400).json({
        message: 'Invalid attachment index',
      });
    }

    const [removed] = labTest.attachments.splice(index, 1);

    await labTest.save();

    await deleteFile(removed.path);

    res.json({
      labTest,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update status generically
// @route   PUT /api/lab-tests/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const labTest = await LabTest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!labTest) {
      return res.status(404).json({
        message: 'Lab test not found',
      });
    }

    res.json({ labTest });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};