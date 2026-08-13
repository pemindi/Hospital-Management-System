import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDepartments, createDepartment } from '../services/departmentService';
import { useAuth } from '../context/AuthContext';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data.departments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createDepartment({ name, description });
      setName('');
      setDescription('');
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add department');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Departments</h1>
        <Link to="/dashboard" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
          Back
        </Link>
      </div>

      {isAdmin && (
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-lg shadow mb-6 flex gap-3 items-end">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Department Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. Cardiology"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Optional"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
          >
            Add
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="2" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan="2" className="p-4 text-center text-gray-500">
                  No departments yet
                </td>
              </tr>
            ) : (
              departments.map((d) => (
                <tr key={d._id} className="border-t">
                  <td className="p-3 font-medium">{d.name}</td>
                  <td className="p-3 text-gray-600">{d.description || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepartmentList;