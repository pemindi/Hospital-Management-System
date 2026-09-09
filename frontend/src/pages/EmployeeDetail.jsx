import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEmployeeById } from '../services/employeeService';
import { getAttendanceByEmployee } from '../services/attendanceService';
import { getLeaves, applyLeave, updateLeaveStatus } from '../services/leaveService';
import { useAuth } from '../context/AuthContext';

const EmployeeDetail = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const fetchAll = async () => {
    const { employee } = await getEmployeeById(id);
    setEmployee(employee);
    const { records } = await getAttendanceByEmployee(id);
    setAttendance(records);
    const { leaves } = await getLeaves({ employee: id });
    setLeaves(leaves);
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    await applyLeave({ ...leaveForm, employee: id });
    setLeaveForm({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
    fetchAll();
  };

  const handleLeaveDecision = async (leaveId, status) => {
    await updateLeaveStatus(leaveId, status);
    fetchAll();
  };

  if (!employee) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">{employee.firstName} {employee.lastName}</h1>
          <Link to="/employees" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Back</Link>
        </div>

        <p><strong>Position:</strong> {employee.position}</p>
        <p><strong>Department:</strong> {employee.department?.name}</p>
        <p><strong>Phone:</strong> {employee.phone}</p>
        <p><strong>Joined:</strong> {new Date(employee.joinDate).toLocaleDateString()}</p>

        <h2 className="font-bold mt-6 mb-2">Recent Attendance (last 60 records)</h2>
        {attendance.length === 0 ? (
          <p className="text-sm text-gray-500">No attendance marked yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1 mb-4">
            {attendance.map((a) => (
              <span
                key={a._id}
                title={new Date(a.date).toLocaleDateString()}
                className={`text-xs px-2 py-1 rounded ${
                  a.status === 'present' ? 'bg-green-100 text-green-700' :
                  a.status === 'absent' ? 'bg-red-100 text-red-700' :
                  a.status === 'half-day' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}
              >
                {new Date(a.date).toLocaleDateString()}: {a.status}
              </span>
            ))}
          </div>
        )}

        <h2 className="font-bold mt-6 mb-2">Leave Requests</h2>
        {leaves.map((l) => (
          <div key={l._id} className="border p-3 rounded mb-2 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium capitalize">{l.leaveType} leave</p>
              <p className="text-xs text-gray-600">
                {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
              </p>
              {l.reason && <p className="text-xs text-gray-500">{l.reason}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded ${
                l.status === 'approved' ? 'bg-green-100 text-green-700' :
                l.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {l.status}
              </span>
              {isAdmin && l.status === 'pending' && (
                <>
                  <button onClick={() => handleLeaveDecision(l._id, 'approved')} className="text-green-700 underline text-xs">
                    Approve
                  </button>
                  <button onClick={() => handleLeaveDecision(l._id, 'rejected')} className="text-red-600 underline text-xs">
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        <form onSubmit={handleApplyLeave} className="mt-4 border-t pt-4">
          <h3 className="font-medium mb-2">Apply for Leave</h3>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <select
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              className="border rounded px-2 py-1"
            >
              <option value="sick">Sick</option>
              <option value="casual">Casual</option>
              <option value="annual">Annual</option>
              <option value="other">Other</option>
            </select>
            <input
              placeholder="Reason"
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              className="border rounded px-2 py-1"
            />
            <input
              type="date"
              value={leaveForm.startDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
              required
              className="border rounded px-2 py-1"
            />
            <input
              type="date"
              value={leaveForm.endDate}
              onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
              required
              className="border rounded px-2 py-1"
            />
          </div>
          <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 text-sm">
            Submit Leave Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeDetail;