import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDoctors, deleteDoctor } from '../services/doctorService';
import { getDepartments } from '../services/departmentService';
import { useAuth } from '../context/AuthContext';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await getDoctors({ search, department: departmentFilter });
      setDoctors(data.doctors);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDepartments().then((data) => setDepartments(data.departments));
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this doctor?')) return;
    await deleteDoctor(id);
    fetchDoctors();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Doctors</h1>
        <div className="flex gap-2">
          <Link to="/dashboard" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Back
          </Link>
          {isAdmin && (
            <Link
              to="/doctors/new"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              + Add Doctor
            </Link>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by name or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <p>Loading...</p>
        ) : doctors.length === 0 ? (
          <p className="text-gray-500">No doctors found</p>
        ) : (
          doctors.map((doc) => (
            <div key={doc._id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg">
                Dr. {doc.firstName} {doc.lastName}
              </h3>
              <p className="text-sm text-gray-600">{doc.specialization}</p>
              <p className="text-sm text-gray-600">{doc.department?.name}</p>
              <p className="text-sm text-gray-600">Fee: Rs. {doc.consultationFee}</p>
              <div className="flex gap-3 mt-3">
                <Link to={`/doctors/${doc._id}`} className="text-blue-700 underline text-sm">
                  View
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to={`/doctors/${doc._id}/edit`}
                      className="text-green-700 underline text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="text-red-600 underline text-sm"
                    >
                      Deactivate
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorList;