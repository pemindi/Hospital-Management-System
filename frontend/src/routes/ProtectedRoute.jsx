import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Usage: <ProtectedRoute allowedRoles={['admin', 'doctor']}><Page /></ProtectedRoute>
// Omit allowedRoles to just require "logged in", regardless of role.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;