import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { registerUser, googleLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  'admin', 'doctor', 'nurse', 'receptionist', 'lab_staff', 'pharmacist', 'accountant',
];

const RegisterForm = ({ embedded = false }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'receptionist' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const data = await googleLogin(credentialResponse.credential);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => setError('Google sign-in was cancelled or failed. Please try again.');

  return (
    <form onSubmit={handleSubmit} className={embedded ? 'w-full' : ''}>
      {error && <div className="badge-danger w-full justify-start mb-4 px-3 py-2">{error}</div>}

      <div className="flex justify-center mb-4">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap={false} text="signup_with" shape="rectangular" width="100%" />
      </div>

      <div className="flex items-center mb-4">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-3 text-sm text-gray-400">or register manually</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <label className="field-label">Name</label>
      <input name="name" value={form.name} onChange={handleChange} required className="field-input mb-4" />

      <label className="field-label">Email</label>
      <input type="email" name="email" value={form.email} onChange={handleChange} required className="field-input mb-4" />

      <label className="field-label">Password</label>
      <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} className="field-input mb-4" />

      <label className="field-label">Role</label>
      <select name="role" value={form.role} onChange={handleChange} className="field-input mb-6">
        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>

      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : 'Register'}</button>
    </form>
  );
};

export default RegisterForm;
