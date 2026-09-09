import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await resetPassword(token, { newPassword });
      // If API returns token and user, auto-login
      if (res.token && res.user) {
        login(res.token, res.user);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Reset Password</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

        <label className="block text-sm font-medium mb-1">New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full border rounded px-3 py-2 mb-4" />

        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full border rounded px-3 py-2 mb-6" />

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50">Reset Password</button>
          <button type="button" onClick={() => navigate('/login')} className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
