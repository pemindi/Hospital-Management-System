import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatients, deletePatient } from '../services/patientService';
import { useAuth } from '../context/AuthContext';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatients({ search, page, limit: 10 });
      setPatients(data.patients);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this patient record?')) return;
    await deletePatient(id);
    fetchPatients();
  };

  const canManage = ['admin', 'receptionist'].includes(user?.role);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Patients</h1>
        <div className="flex gap-2">
          <Link to="/dashboard" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Back
          </Link>
          {canManage && (
            <Link
              to="/patients/new"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              + Add Patient
            </Link>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Gender</th>
              <th className="p-3">Blood Group</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No patients found
                </td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="p-3">{p.phone}</td>
                  <td className="p-3 capitalize">{p.gender}</td>
                  <td className="p-3">{p.bloodGroup || '-'}</td>
                  <td className="p-3 flex gap-3">
                    <Link to={`/patients/${p._id}`} className="text-blue-700 underline">
                      View
                    </Link>
                    {canManage && (
                      <>
                        <Link to={`/patients/${p._id}/edit`} className="text-green-700 underline">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-red-600 underline"
                        >
                          Deactivate
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

      <div className="flex justify-center gap-2 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">
          Page {page} of {totalPages || 1}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PatientList;