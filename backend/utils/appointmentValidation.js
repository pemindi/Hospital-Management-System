const Appointment = require('../models/Appointment');

// Convert "HH:MM" to minutes for easy comparison
const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// Check the requested time falls within one of the doctor's weekly schedule slots
const isWithinDoctorSchedule = (doctor, dateObj, startTime, endTime) => {
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const daySlots = doctor.schedule.filter((slot) => slot.day === dayName);

  if (daySlots.length === 0) return false;

  const reqStart = toMinutes(startTime);
  const reqEnd = toMinutes(endTime);

  return daySlots.some((slot) => {
    const slotStart = toMinutes(slot.startTime);
    const slotEnd = toMinutes(slot.endTime);
    return reqStart >= slotStart && reqEnd <= slotEnd;
  });
};

// Check no other active appointment overlaps for this doctor at this date/time
const hasConflict = async (doctorId, dateObj, startTime, endTime, excludeAppointmentId = null) => {
  const startOfDay = new Date(dateObj);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateObj);
  endOfDay.setHours(23, 59, 59, 999);

  const query = {
    doctor: doctorId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled'] }, // cancelled/completed don't block new bookings
  };
  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const existing = await Appointment.find(query);

  const reqStart = toMinutes(startTime);
  const reqEnd = toMinutes(endTime);

  return existing.some((appt) => {
    const apptStart = toMinutes(appt.startTime);
    const apptEnd = toMinutes(appt.endTime);
    // Overlap check: two ranges overlap if one starts before the other ends
    return reqStart < apptEnd && apptStart < reqEnd;
  });
};

module.exports = { isWithinDoctorSchedule, hasConflict, toMinutes };