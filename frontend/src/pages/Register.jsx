import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  'admin',
  'doctor',
  'nurse',
  'receptionist',
  'lab_staff',
  'pharmacist',
  'accountant',
];

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerUser(form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
          Create Account
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-6"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-700 underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;