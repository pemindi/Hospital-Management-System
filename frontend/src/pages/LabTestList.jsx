import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLabTests, collectSample } from '../services/labTestService';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  requested: 'bg-yellow-100 text-yellow-700',
  sample_collected: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-200 text-gray-700',
};

const LabTestList = () => {
  const [tests, setTests] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const canRequest = ['admin', 'doctor'].includes(user?.role);
  const canProcess = ['admin', 'lab_staff'].includes(user?.role);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      const data = await getLabTests(params);
      setTests(data.labTests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleCollectSample = async (id) => {
    await collectSample(id);
    fetchTests();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Laboratory Tests</h1>
        <div className="flex gap-2">
          <Link to="/dashboard" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Back
          </Link>
          {canRequest && (
            <Link
              to="/lab-tests/new"
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              + Request Test
            </Link>
          )}
        </div>
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border rounded px-3 py-2 mb-4"
      >
        <option value="">All Statuses</option>
        <option value="requested">Requested</option>
        <option value="sample_collected">Sample Collected</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Test</th>
              <th className="p-3">Requested By</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">Loading...</td>
              </tr>
            ) : tests.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">No lab tests found</td>
              </tr>
            ) : (
              tests.map((t) => (
                <tr key={t._id} className="border-t">
                  <td className="p-3">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{t.patient?.firstName} {t.patient?.lastName}</td>
                  <td className="p-3">{t.testType}</td>
                  <td className="p-3">Dr. {t.requestedByDoctor?.lastName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[t.status]}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <Link to={`/lab-tests/${t._id}`} className="text-blue-700 underline text-sm">
                      View
                    </Link>
                    {canProcess && t.status === 'requested' && (
                      <button
                        onClick={() => handleCollectSample(t._id)}
                        className="text-green-700 underline text-sm"
                      >
                        Mark Sample Collected
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabTestList;