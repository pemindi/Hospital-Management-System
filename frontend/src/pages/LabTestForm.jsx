import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLabTest } from '../services/labTestService';
import { getPatients } from '../services/patientService';
import { getDoctors } from '../services/doctorService';

const LabTestForm = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patient: '', requestedByDoctor: '', testType: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getPatients({ limit: 100 }).then((data) => setPatients(data.patients));
    getDoctors().then((data) => setDoctors(data.doctors));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createLabTest(form);
      navigate('/lab-tests');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">Request Lab Test</h1>
        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

        <label className="block text-sm font-medium mb-1">Patient</label>
        <select
          name="patient"
          value={form.patient}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-4"
        >
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">Requesting Doctor</label>
        <select
          name="requestedByDoctor"
          value={form.requestedByDoctor}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-4"
        >
          <option value="">Select doctor</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName}</option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">Test Type</label>
        <input
          name="testType"
          value={form.testType}
          onChange={handleChange}
          required
          placeholder="e.g. Complete Blood Count, X-Ray Chest"
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          className="w-full border rounded px-3 py-2 mb-6"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Request Test'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/lab-tests')}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default LabTestForm;