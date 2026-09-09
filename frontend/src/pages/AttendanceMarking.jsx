import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEmployees } from '../services/employeeService';
import { markAttendance, getAttendanceByDate } from '../services/attendanceService';

const STATUSES = ['present', 'absent', 'half-day', 'on-leave'];

const AttendanceMarking = () => {
  const [employees, setEmployees] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [marks, setMarks] = useState({}); // { employeeId: status }

  const fetchData = async () => {
    const { employees } = await getEmployees();
    setEmployees(employees);

    const { records } = await getAttendanceByDate(date);
    const existing = {};
    records.forEach((r) => {
      existing[r.employee._id || r.employee] = r.status;
    });
    setMarks(existing);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleMark = async (employeeId, status) => {
    setMarks({ ...marks, [employeeId]: status });
    await markAttendance({ employee: employeeId, date, status });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Mark Attendance</h1>
        <Link to="/employees" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Back</Link>
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border rounded px-3 py-2 mb-4"
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Position</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} className="border-t">
                <td className="p-3">{emp.firstName} {emp.lastName}</td>
                <td className="p-3">{emp.position}</td>
                <td className="p-3 flex gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleMark(emp._id, s)}
                      className={`px-2 py-1 rounded text-xs ${
                        marks[emp._id] === s ? 'bg-blue-700 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceMarking;