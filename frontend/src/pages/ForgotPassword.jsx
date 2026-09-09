import { useState } from 'react';
import { forgotPassword } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setResetUrl('');
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      setMessage(res.message || 'Reset link generated');
      if (res.resetUrl) setResetUrl(res.resetUrl);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to generate reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Forgot Password</h1>
        {message && <div className="bg-gray-100 text-gray-800 p-2 rounded mb-4">{message}</div>}
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border rounded px-3 py-2 mb-4" />
        <button type="submit" disabled={loading} className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        {resetUrl && (
          <div className="mt-4 p-3 bg-yellow-50 border rounded">
            <div className="text-sm">Test reset URL (copy and open in browser):</div>
            <a className="text-blue-700 break-all" href={resetUrl}>{resetUrl}</a>
          </div>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
