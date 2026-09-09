import RegisterForm from '../components/RegisterForm';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Create Account</h1>
        <RegisterForm />
        <p className="text-sm text-center mt-4">
          Already have an account? <Link to="/login" className="text-blue-700 underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;