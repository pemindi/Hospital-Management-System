import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMedicines, deleteMedicine } from '../services/medicineService';
import { useAuth } from '../context/AuthContext';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const canManage = ['admin', 'pharmacist'].includes(user?.role);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = { search };
      if (filter === 'lowStock') params.lowStock = true;
      if (filter === 'expiringSoon') params.expiringSoon = true;
      const data = await getMedicines(params);
      setMedicines(data.medicines);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this medicine?')) return;
    await deleteMedicine(id);
    fetchMedicines();
  };

  const isLow = (m) => m.stockQuantity <= m.reorderLevel;
  const isExpiringSoon = (m) => {
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    return new Date(m.expiryDate) <= in30;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Pharmacy Inventory</h1>
        <div className="flex gap-2">
          <Link to="/dashboard" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Back</Link>
          <Link to="/dispense" className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">
            Dispense Medicine
          </Link>
          {canManage && (
            <Link to="/medicines/new" className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">
              + Add Medicine
            </Link>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search medicine..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-3 py-2">
          <option value="">All</option>
          <option value="lowStock">Low Stock</option>
          <option value="expiringSoon">Expiring Soon (30 days)</option>
        </select>
        <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded">Search</button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Unit Price</th>
              <th className="p-3">Expiry</th>
              {canManage && <th className="p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
            ) : medicines.length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500">No medicines found</td></tr>
            ) : (
              medicines.map((m) => (
                <tr key={m._id} className="border-t">
                  <td className="p-3">{m.name}</td>
                  <td className={`p-3 ${isLow(m) ? 'text-red-600 font-bold' : ''}`}>
                    {m.stockQuantity} {m.unit}(s) {isLow(m) && '⚠ Low'}
                  </td>
                  <td className="p-3">Rs. {m.unitPrice}</td>
                  <td className={`p-3 ${isExpiringSoon(m) ? 'text-orange-600 font-bold' : ''}`}>
                    {new Date(m.expiryDate).toLocaleDateString()} {isExpiringSoon(m) && '⚠ Soon'}
                  </td>
                  {canManage && (
                    <td className="p-3 flex gap-2">
                      <Link to={`/medicines/${m._id}/edit`} className="text-green-700 underline text-sm">Edit</Link>
                      <button onClick={() => handleDelete(m._id)} className="text-red-600 underline text-sm">
                        Deactivate
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicineList;