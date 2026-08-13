import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDoctor, updateDoctor, getDoctorById } from '../services/doctorService';
import { getDepartments } from '../services/departmentService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const emptySlot = { day: 'Monday', startTime: '09:00', endTime: '13:00' };

const initialState = {
  firstName: '',
  lastName: '',
  specialization: '',
  department: '',
  phone: '',
  email: '',
  consultationFee: 0,
  schedule: [],
};

const DoctorForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialState);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getDepartments().then((data) => setDepartments(data.departments));
    if (isEdit) {
      getDoctorById(id).then(({ doctor }) => {
        setForm({
          ...doctor,
          department: doctor.department?._id || doctor.department,
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSlot = () => {
    setForm({ ...form, schedule: [...form.schedule, { ...emptySlot }] });
  };

  const updateSlot = (index, field, value) => {
    const updated = [...form.schedule];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, schedule: updated });
  };

  const removeSlot = (index) => {
    setForm({ ...form, schedule: form.schedule.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await updateDoctor(id, form);
      } else {
        await createDoctor(form);
      }
      navigate('/doctors');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">
          {isEdit ? 'Edit Doctor' : 'Add Doctor'}
        </h1>

        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Specialization</label>
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Consultation Fee (Rs.)</label>
            <input
              type="number"
              name="consultationFee"
              value={form.consultationFee}
              onChange={handleChange}
              min="0"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Weekly Schedule</label>
            <button
              type="button"
              onClick={addSlot}
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              + Add Slot
            </button>
          </div>
          {form.schedule.length === 0 && (
            <p className="text-sm text-gray-500">No schedule slots added yet.</p>
          )}
          {form.schedule.map((slot, index) => (
            <div key={index} className="flex gap-2 items-center mb-2">
              <select
                value={slot.day}
                onChange={(e) => updateSlot(index, 'day', e.target.value)}
                className="border rounded px-2 py-1"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                className="border rounded px-2 py-1"
              />
              <span>to</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                className="border rounded px-2 py-1"
              />
              <button
                type="button"
                onClick={() => removeSlot(index)}
                className="text-red-600 text-sm underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Doctor' : 'Add Doctor'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorForm;