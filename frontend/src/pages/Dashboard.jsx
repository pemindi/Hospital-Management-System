import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../services/reportService';

const StatCard = ({ label, value, tone = 'default' }) => (
  <div className={`card-pad ${tone === 'alert' ? 'border-danger-500' : ''}`}>
    <p className={`text-2xl font-heading font-bold ${tone === 'alert' ? 'text-danger-500' : 'text-ink'}`}>
      {value}
    </p>
    <p className="text-sm text-ink/60 mt-1">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let mounted = true;
    getDashboardSummary()
      .then((data) => { if (mounted) setSummary(data); })
      .catch(() => { if (mounted) setSummary(null); });
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <p className="text-ink/60 mb-6">Here's what's happening today.</p>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Patients" value={summary.totalPatients} />
          <StatCard label="Today's Appointments" value={summary.todaysAppointments} />
          <StatCard label="Today's Revenue" value={`Rs. ${Number(summary.todaysRevenue || 0).toFixed(2)}`} />
          <StatCard label="Pending Lab Requests" value={summary.pendingLabRequests} />
          <StatCard
            label="Pharmacy Alerts"
            value={summary.lowStockAlerts}
            tone={summary.lowStockAlerts > 0 ? 'alert' : 'default'}
          />
        </div>
      )}

      {/* Navigation grid (preserve previous dashboard tiles) */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
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