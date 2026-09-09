import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createEmployee, updateEmployee, getEmployeeById } from '../services/employeeService';
import { getDepartments } from '../services/departmentService';
import userService from '../services/userService';

const initialState = {
  firstName: '', lastName: '', position: '', department: '',
  phone: '', email: '', joinDate: '',
};

const EmployeeForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialState);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getDepartments().then((data) => setDepartments(data.departments));
    if (isEdit) {
      getEmployeeById(id).then(({ employee }) => {
        setForm({
          ...employee,
          department: employee.department?._id || employee.department,
          joinDate: employee.joinDate?.split('T')[0] || '',
        });
      });
    } else {
      // prefill from query params when creating from an unlinked user
      const params = new URLSearchParams(window.location.search);
      const name = params.get('name');
      const email = params.get('email');
      if (name || email) {
        const parts = (name || '').split(' ');
        setForm((f) => ({
          ...f,
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          email: email || f.email,
        }));
      }
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let created;
      if (isEdit) {
        await updateEmployee(id, form);
      } else {
        const res = await createEmployee(form);
        created = res.employee;
      }

      // If we created from an unlinked user (email param), attempt to link the user account
      if (!isEdit) {
        const params = new URLSearchParams(window.location.search);
        const email = params.get('email');
        if (email && created) {
          try {
            const { users } = await userService.getUsers({ email });
            const user = users && users[0];
            if (user) {
              await userService.linkEmployee(user._id, created._id);
            }
          } catch (linkErr) {
            // non-fatal, log to console
            console.warn('Failed to link created employee to user account', linkErr);
          }
        }
      }

      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">{isEdit ? 'Edit Employee' : 'Add Employee'}</h1>
        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <label className="block text-sm font-medium mb-1">Position</label>
        <input name="position" value={form.position} onChange={handleChange} required placeholder="e.g. Staff Nurse" className="w-full border rounded px-3 py-2 mb-4" />

        <label className="block text-sm font-medium mb-1">Department</label>
        <select name="department" value={form.department} onChange={handleChange} required className="w-full border rounded px-3 py-2 mb-4">
          <option value="">Select department</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <label className="block text-sm font-medium mb-1">Join Date</label>
        <input type="date" name="joinDate" value={form.joinDate} onChange={handleChange} required className="w-full border rounded px-3 py-2 mb-6" />

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Employee'}
          </button>
          <button type="button" onClick={() => navigate('/employees')} className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;