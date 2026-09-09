import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../services/employeeService';
import { useAuth } from '../context/AuthContext';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [unlinkedUsers, setUnlinkedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees({ search });
      setEmployees(data.employees);
      setUnlinkedUsers(data.unlinkedUsers || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this employee?')) return;
    await deleteEmployee(id);
    fetchEmployees();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Staff Directory</h1>
        <div className="flex gap-2">
          <Link to="/dashboard" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Back</Link>
          <Link to="/attendance" className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800">
            Mark Attendance
          </Link>
          {isAdmin && (
            <Link to="/employees/new" className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">
              + Add Employee
            </Link>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by name or position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="bg-gray-700 text-white px-4 py-2 rounded">Search</button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Position</th>
              <th className="p-3">Department</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500">No employees found</td></tr>
            ) : (
              employees.map((e) => (
                <tr key={e._id} className="border-t">
                  <td className="p-3">{e.firstName} {e.lastName}</td>
                  <td className="p-3">{e.position}</td>
                  <td className="p-3">{e.department?.name}</td>
                  <td className="p-3">{e.phone}</td>
                  <td className="p-3 flex gap-2">
                    <Link to={`/employees/${e._id}`} className="text-blue-700 underline text-sm">View</Link>
                    {isAdmin && (
                      <>
                        <Link to={`/employees/${e._id}/edit`} className="text-green-700 underline text-sm">Edit</Link>
                        <button onClick={() => handleDelete(e._id)} className="text-red-600 underline text-sm">
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

      {unlinkedUsers.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Unlinked Staff Accounts</h2>
          <div className="grid gap-2">
            {unlinkedUsers.map((u) => (
              <div key={u._id} className="bg-white p-3 rounded shadow flex justify-between items-center">
                <div>
                  <div className="font-medium">{u.name} <span className="text-sm text-gray-500">({u.role})</span></div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/employees/new?name=${encodeURIComponent(u.name)}&email=${encodeURIComponent(u.email)}`} className="text-green-700 underline text-sm">Create Employee</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;