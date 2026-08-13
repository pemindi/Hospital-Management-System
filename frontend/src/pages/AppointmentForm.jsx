import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  createAppointment,
  rescheduleAppointment,
  getAppointmentById,
} from '../services/appointmentService';
import { getPatients } from '../services/patientService';
import { getDoctors } from '../services/doctorService';

const AppointmentForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const isReschedule = location.pathname.includes('reschedule');

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getPatients({ limit: 100 }).then((data) => setPatients(data.patients));
    getDoctors().then((data) => setDoctors(data.doctors));

    if (isReschedule && id) {
      getAppointmentById(id).then(({ appointment }) => {
        setForm({
          patient: appointment.patient._id,
          doctor: appointment.doctor._id,
          date: appointment.date.split('T')[0],
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          reason: appointment.reason,
        });
      });
    }
  }, [id, isReschedule]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectedDoctor = doctors.find((d) => d._id === form.doctor);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isReschedule) {
        await rescheduleAppointment(id, {
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
        });
      } else {
        await createAppointment(form);
      }
      navigate('/appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">
          {isReschedule ? 'Reschedule Appointment' : 'Book Appointment'}
        </h1>

        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

        <label className="block text-sm font-medium mb-1">Patient</label>
        <select
          name="patient"
          value={form.patient}
          onChange={handleChange}
          required
          disabled={isReschedule}
          className="w-full border rounded px-3 py-2 mb-4 disabled:bg-gray-100"
        >
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>
              {p.firstName} {p.lastName} — {p.phone}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">Doctor</label>
        <select
          name="doctor"
          value={form.doctor}
          onChange={handleChange}
          required
          disabled={isReschedule}
          className="w-full border rounded px-3 py-2 mb-2 disabled:bg-gray-100"
        >
          <option value="">Select doctor</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              Dr. {d.firstName} {d.lastName} — {d.specialization}
            </option>
          ))}
        </select>

        {selectedDoctor && (
          <p className="text-xs text-gray-500 mb-4">
            Available:{' '}
            {selectedDoctor.schedule.map((s) => `${s.day} ${s.startTime}-${s.endTime}`).join(', ') ||
              'No schedule set'}
          </p>
        )}

        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {!isReschedule && (
          <>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={2}
              className="w-full border rounded px-3 py-2 mb-4"
            />
          </>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isReschedule ? 'Confirm Reschedule' : 'Book Appointment'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/appointments')}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;