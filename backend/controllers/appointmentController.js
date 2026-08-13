const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { isWithinDoctorSchedule, hasConflict } = require('../utils/appointmentValidation');

// @desc    Book a new appointment
// @route   POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, startTime, endTime, reason } = req.body;

    const doctorDoc = await Doctor.findById(doctor);
    if (!doctorDoc) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const dateObj = new Date(date);

    if (!isWithinDoctorSchedule(doctorDoc, dateObj, startTime, endTime)) {
      return res.status(400).json({
        message: 'Requested time is outside this doctor\'s working schedule',
      });
    }

    const conflict = await hasConflict(doctor, dateObj, startTime, endTime);
    if (conflict) {
      return res.status(409).json({
        message: 'This doctor already has an appointment at that time',
      });
    }

    const appointment = await Appointment.create({
      patient,
      doctor,
      date: dateObj,
      startTime,
      endTime,
      reason,
      bookedBy: req.user.id,
    });

    const populated = await appointment.populate([
      { path: 'patient', select: 'firstName lastName phone' },
      { path: 'doctor', select: 'firstName lastName specialization' },
    ]);

    res.status(201).json({ appointment: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get appointments (filterable by date, doctor, patient, status)
// @route   GET /api/appointments?date=&doctor=&patient=&status=
exports.getAppointments = async (req, res) => {
  try {
    const { date, doctor, patient, status } = req.query;
    const query = {};

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    if (doctor) query.doctor = doctor;
    if (patient) query.patient = patient;
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName specialization')
      .sort({ date: 1, startTime: 1 });

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName phone email')
      .populate('doctor', 'firstName lastName specialization');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reschedule an appointment (change date/time)
// @route   PUT /api/appointments/:id/reschedule
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const doctorDoc = await Doctor.findById(appointment.doctor);
    const dateObj = new Date(date);

    if (!isWithinDoctorSchedule(doctorDoc, dateObj, startTime, endTime)) {
      return res.status(400).json({
        message: 'Requested time is outside this doctor\'s working schedule',
      });
    }

    const conflict = await hasConflict(
      appointment.doctor,
      dateObj,
      startTime,
      endTime,
      appointment._id
    );
    if (conflict) {
      return res.status(409).json({
        message: 'This doctor already has an appointment at that time',
      });
    }

    appointment.date = dateObj;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.status = 'scheduled'; // un-cancel if it was cancelled, reset to active
    await appointment.save();

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update appointment status (cancel, complete, no-show)
// @route   PUT /api/appointments/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('patient', 'firstName lastName phone')
      .populate('doctor', 'firstName lastName specialization');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};