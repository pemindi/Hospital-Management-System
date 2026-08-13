import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAppointments, updateAppointmentStatus } from '../services/appointmentService';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-gray-200 text-gray-700',
};

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const canManage = ['admin', 'receptionist'].includes(user?.role);
  const canUpdateStatus = ['admin', 'receptionist', 'doctor'].includes(user?.role);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (date) params.date = date;
      if (status) params.status = status;
      const data = await getAppointments(params);
      setAppointments(data.appointments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, status]);

  const handleStatusChange = async (id, newStatus) => {
    await updateAppointmentStatus(id, newStatus);
    fetchAppointments();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Appointments</h1>
        <div className="flex gap-2">
          <Link to="/dashboard" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Back
          </Link>
          {canManage && (
            <Link
              to="/appointments/new"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              + Book Appointment
            </Link>
          )}
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No-show</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Time</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Doctor</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No appointments found
                </td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a._id} className="border-t">
                  <td className="p-3">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="p-3">
                    {a.startTime} – {a.endTime}
                  </td>
                  <td className="p-3">
                    {a.patient?.firstName} {a.patient?.lastName}
                  </td>
                  <td className="p-3">
                    Dr. {a.doctor?.firstName} {a.doctor?.lastName}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2 flex-wrap">
                    {canManage && a.status === 'scheduled' && (
                      <Link
                        to={`/appointments/${a._id}/reschedule`}
                        className="text-green-700 underline text-sm"
                      >
                        Reschedule
                      </Link>
                    )}
                    {canUpdateStatus && a.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(a._id, 'completed')}
                          className="text-blue-700 underline text-sm"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleStatusChange(a._id, 'cancelled')}
                          className="text-red-600 underline text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleStatusChange(a._id, 'no-show')}
                          className="text-gray-600 underline text-sm"
                        >
                          No-show
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentList;