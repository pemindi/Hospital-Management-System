import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) return setError('New passwords do not match');
    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Change Password</h1>
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4">{success}</div>}

        <label className="block text-sm font-medium mb-1">Current Password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full border rounded px-3 py-2 mb-4" />

        <label className="block text-sm font-medium mb-1">New Password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full border rounded px-3 py-2 mb-4" />

        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full border rounded px-3 py-2 mb-6" />

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50">
            {loading ? 'Saving...' : 'Change Password'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
