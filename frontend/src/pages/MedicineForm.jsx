import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMedicine, updateMedicine, getMedicines } from '../services/medicineService';

const UNITS = ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'other'];

const initialState = {
  name: '',
  category: '',
  unit: 'tablet',
  batchNumber: '',
  stockQuantity: 0,
  reorderLevel: 20,
  unitPrice: 0,
  expiryDate: '',
  supplier: '',
};

const MedicineForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      // Reuse the list endpoint and find by id (kept simple — a dedicated getMedicineById
      // service call works too if you prefer; both hit the same backend route)
      getMedicines().then((data) => {
        const found = data.medicines.find((m) => m._id === id);
        if (found) {
          setForm({ ...found, expiryDate: found.expiryDate.split('T')[0] });
        }
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await updateMedicine(id, form);
      } else {
        await createMedicine(form);
      }
      navigate('/medicines');
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
          {isEdit ? 'Edit Medicine' : 'Add Medicine'}
        </h1>
        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

        <label className="block text-sm font-medium mb-1">Name</label>
        <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2 mb-4" />

        <label className="block text-sm font-medium mb-1">Category</label>
        <input name="category" value={form.category} onChange={handleChange} className="w-full border rounded px-3 py-2 mb-4" />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select name="unit" value={form.unit} onChange={handleChange} className="w-full border rounded px-3 py-2">
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Batch Number</label>
            <input name="batchNumber" value={form.batchNumber} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Stock Qty</label>
            <input type="number" name="stockQuantity" value={form.stockQuantity} onChange={handleChange} min="0" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reorder Level</label>
            <input type="number" name="reorderLevel" value={form.reorderLevel} onChange={handleChange} min="0" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit Price (Rs.)</label>
            <input type="number" name="unitPrice" value={form.unitPrice} onChange={handleChange} min="0" className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <label className="block text-sm font-medium mb-1">Expiry Date</label>
        <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required className="w-full border rounded px-3 py-2 mb-4" />

        <label className="block text-sm font-medium mb-1">Supplier</label>
        <input name="supplier" value={form.supplier} onChange={handleChange} className="w-full border rounded px-3 py-2 mb-6" />

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Update Medicine' : 'Add Medicine'}
          </button>
          <button type="button" onClick={() => navigate('/medicines')} className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicineForm;