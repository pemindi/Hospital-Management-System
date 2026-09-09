import { useState, useEffect } from 'react';
import { getAuditLogs } from '../services/auditService';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ user: '', module: '', startDate: '', endDate: '' });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 50 };
      const res = await getAuditLogs(params);
      setLogs(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Audit Log</h1>
      </div>

      <form onSubmit={handleFilter} className="mb-4 flex gap-2">
        <input placeholder="User ID" value={filters.user} onChange={(e) => setFilters({ ...filters, user: e.target.value })} className="border rounded px-3 py-2" />
        <input placeholder="Module" value={filters.module} onChange={(e) => setFilters({ ...filters, module: e.target.value })} className="border rounded px-3 py-2" />
        <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} className="border rounded px-3 py-2" />
        <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} className="border rounded px-3 py-2" />
        <button className="bg-gray-700 text-white px-3 py-2 rounded">Apply</button>
      </form>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">User</th>
              <th className="p-3">Module</th>
              <th className="p-3">Action</th>
              <th className="p-3">Target</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">No audit entries</td></tr>
            ) : (
              logs.map((l) => (
                <tr key={l._id} className="border-t">
                  <td className="p-3">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="p-3">{l.user?.name || l.user?.email || l.user?._id}</td>
                  <td className="p-3">{l.module}</td>
                  <td className="p-3">{l.action}</td>
                  <td className="p-3">{l.targetId}</td>
                  <td className="p-3"><pre className="text-xs">{JSON.stringify(l.details)}</pre></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog;
