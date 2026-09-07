import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dispenseMedicine } from '../services/dispenseService';
import { getPatients } from '../services/patientService';
import { getMedicines } from '../services/medicineService';

const DispenseForm = () => {
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({ patient: '', medicine: '', quantity: 1 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getPatients({ limit: 100 }).then((data) => setPatients(data.patients));
    getMedicines().then((data) => setMedicines(data.medicines));
  }, []);

  const selectedMedicine = medicines.find((m) => m._id === form.medicine);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await dispenseMedicine({ ...form, quantity: Number(form.quantity) });
      setSuccess(`Dispensed successfully. Remaining stock: ${data.remainingStock}`);
      setForm({ ...form, quantity: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Dispensing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Dispense Medicine</h1>
          <button type="button" onClick={() => navigate('/medicines')} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Back
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">{success}</div>}

        <label className="block text-sm font-medium mb-1">Patient</label>
        <select name="patient" value={form.patient} onChange={handleChange} required className="w-full border rounded px-3 py-2 mb-4">
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">Medicine</label>
        <select name="medicine" value={form.medicine} onChange={handleChange} required className="w-full border rounded px-3 py-2 mb-2">
          <option value="">Select medicine</option>
          {medicines.map((m) => (
            <option key={m._id} value={m._id}>{m.name} (Stock: {m.stockQuantity})</option>
          ))}
        </select>
        {selectedMedicine && (
          <p className="text-xs text-gray-500 mb-4">Available stock: {selectedMedicine.stockQuantity} {selectedMedicine.unit}(s)</p>
        )}

        <label className="block text-sm font-medium mb-1">Quantity</label>
        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          min="1"
          max={selectedMedicine?.stockQuantity}
          required
          className="w-full border rounded px-3 py-2 mb-6"
        />

        <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 disabled:opacity-50">
          {loading ? 'Dispensing...' : 'Dispense'}
        </button>
      </form>
    </div>
  );
};

export default DispenseForm;