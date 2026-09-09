import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { loginUser, googleLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import RegisterForm from '../components/RegisterForm';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-blue-900 text-white p-12">
        <div>
          <p className="font-heading font-bold text-2xl">HMS</p>
          <p className="text-white/50 text-sm mt-1">Hospital Management System</p>
        </div>
        <div>
          <p className="font-heading text-3xl font-semibold leading-snug max-w-md">
            One system, every part of the patient journey.
          </p>
          <p className="text-white/60 mt-4 max-w-sm text-sm">
            Registration, appointments, records, pharmacy, billing — all in one place.
          </p>
        </div>
        <p className="text-white/30 text-xs">Internal use only</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-paper p-8">
        {!showRegister ? (
          <form onSubmit={handleSubmit} className="w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="font-heading text-2xl font-semibold text-ink mb-1">Sign in</h1>
                <p className="text-ink/60 text-sm">Enter your credentials to continue.</p>
              </div>
              <div>
                <button type="button" onClick={() => setShowRegister(true)} className="text-sm text-blue-700">Create account</button>
              </div>
            </div>

            {error && (
              <div className="badge-danger w-full justify-start mb-4 px-3 py-2">{error}</div>
            )}

            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="field-input mb-4"
            />

            <label className="field-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="field-input mb-6"
            />

            <div className="mb-4 text-right">
              <Link to="/forgot-password" className="text-sm text-blue-700 underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-3 text-sm text-gray-400">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                text="signin_with"
                shape="rectangular"
                width="100%"
              />
            </div>

            <p className="text-sm text-center mt-6 text-ink/60">
              No account? <button type="button" onClick={() => setShowRegister(true)} className="text-blue-700 font-medium hover:underline">Register</button>
            </p>
          </form>
        ) : (
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h1 className="font-heading text-2xl font-semibold text-ink mb-1">Create account</h1>
              <button type="button" onClick={() => setShowRegister(false)} className="text-sm text-blue-700">Sign in</button>
            </div>
            <RegisterForm embedded={true} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;