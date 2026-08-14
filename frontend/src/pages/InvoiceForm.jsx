import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInvoice } from '../services/invoiceService';
import { getPatients } from '../services/patientService';

const emptyItem = { description: '', category: 'consultation', amount: '' };
const CATEGORIES = ['consultation', 'laboratory', 'pharmacy', 'admission', 'other'];

const InvoiceForm = () => {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getPatients({ limit: 100 }).then((data) => setPatients(data.patients));
  }, []);

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const total = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createInvoice({
        patient: patientId,
        items: items.map((i) => ({ ...i, amount: Number(i.amount) })),
      });
      navigate('/invoices');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">Generate Invoice</h1>

        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

        <label className="block text-sm font-medium mb-1">Patient</label>
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 mb-4"
        >
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>
              {p.firstName} {p.lastName} — {p.phone}
            </option>
          ))}
        </select>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Charges</label>
            <button
              type="button"
              onClick={addItem}
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              + Add Charge
            </button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mb-2 items-center">
              <input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                required
                className="border rounded px-2 py-1 col-span-2"
              />
              <select
                value={item.category}
                onChange={(e) => updateItem(index, 'category', e.target.value)}
                className="border rounded px-2 py-1"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="flex gap-1 items-center">
                <input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => updateItem(index, 'amount', e.target.value)}
                  required
                  min="0"
                  className="border rounded px-2 py-1 w-full"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-right font-bold text-lg mb-6">Total: Rs. {total.toFixed(2)}</p>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Invoice'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;