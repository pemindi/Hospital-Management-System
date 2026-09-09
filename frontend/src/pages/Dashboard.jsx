import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../services/reportService';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let mounted = true;
    getDashboardSummary()
      .then((data) => {
        if (mounted) setSummary(data);
      })
      .catch(() => {
        if (mounted) setSummary(null);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">HMS Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-4">
        <p>
          Welcome, <strong>{user?.name}</strong>
        </p>
        <p>
          Role: <strong>{user?.role}</strong>
        </p>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Total Patients</div>
            <div className="text-2xl font-bold text-blue-700">
              {summary ? summary.totalPatients : '—'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Today's Appointments</div>
            <div className="text-2xl font-bold text-blue-700">
              {summary ? summary.todaysAppointments : '—'}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Today's Revenue</div>
            <div className="text-2xl font-bold text-blue-700">
              {summary ? `Rs. ${Number(summary.todaysRevenue || 0).toFixed(2)}` : '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
         <Link to="/patients" className="bg-white p-6 rounded-lg shadow hover:shadow-md text-center font-medium text-blue-700">Patients</Link>
         <Link to="/doctors" className="bg-white p-6 rounded-lg shadow hover:shadow-md text-center font-medium text-blue-700">Doctors</Link>
         <Link to="/departments" className="bg-white p-6 rounded-lg shadow hover:shadow-md text-center font-medium text-blue-700">Departments</Link>
         <Link to="/appointments" className="bg-white p-6 rounded-lg shadow hover:shadow-md text-center font-medium text-blue-700">Appointments</Link>
         <Link to="/invoices" className="bg-white p-6 rounded-lg shadow hover:shadow-md text-center font-medium text-blue-700">Billing</Link>
         <Link to="/lab-tests" className="bg-white p-6 rounded-lg shadow hover:shadow-md text-center font-medium text-blue-700">Lab Tests</Link>
         <Link to="/medicines" className="bg-white p-6 rounded-lg shadow hover:shadow-md text-center font-medium text-blue-700">Medicines</Link>
         <Link to="/dispense" className="bg-white p-6 rounded-lg shadow hover:shadow-md text-center font-medium text-blue-700">Dispense</Link>
         <Link to="/employees" className="bg-white p-6 rounded-lg shadow hover:shadow-md text-center font-medium text-blue-700">Staff</Link>
         <Link to="/reports" className="bg-white p-6 rounded-lg shadow hover:shadow-md text-center font-medium text-blue-700">Reports</Link>

         {user?.role === 'admin' && (
           <Link to="/audit" className="bg-white p-6 rounded-lg shadow hover:shadow-md text-center font-medium text-blue-700">Audit Log</Link>
         )}

      </div>
    </div>
  );
};

export default Dashboard;