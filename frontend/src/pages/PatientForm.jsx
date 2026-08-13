import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPatient, updatePatient, getPatientById } from '../services/patientService';

const initialState = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'male',
  phone: '',
  email: '',
  address: '',
  bloodGroup: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  allergies: '',
};

const PatientForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      getPatientById(id).then(({ patient }) => {
        setForm({
          ...initialState,
          ...patient,
          dateOfBirth: patient.dateOfBirth?.split('T')[0] || '',
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await updatePatient(id, form);
      } else {
        await createPatient(form);
      }
      navigate('/patients');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl"
      >
        <h1 className="text-2xl font-bold mb-6 text-blue-700">
          {isEdit ? 'Edit Patient' : 'Register New Patient'}
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>
        )}

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
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
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
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Blood Group</label>
            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Unknown</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Emergency Contact Name</label>
            <input
              name="emergencyContactName"
              value={form.emergencyContactName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Emergency Contact Phone</label>
            <input
              name="emergencyContactPhone"
              value={form.emergencyContactPhone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Allergies</label>
            <textarea
              name="allergies"
              value={form.allergies}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Patient' : 'Register Patient'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;