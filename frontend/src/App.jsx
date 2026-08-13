import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import PatientList from './pages/PatientList';
import PatientForm from './pages/PatientForm';
import PatientDetail from './pages/PatientDetail';
import DoctorList from './pages/DoctorList';
import DoctorForm from './pages/DoctorForm';
import DoctorDetail from './pages/DoctorDetail';
import DepartmentList from './pages/DepartmentList';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
           <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <PatientList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/new"
            element={
              <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                <PatientForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor', 'nurse']}>
                <PatientForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients/:id"
            element={
              <ProtectedRoute>
                <PatientDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <DepartmentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <ProtectedRoute>
                <DoctorList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors/new"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DoctorForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DoctorForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors/:id"
            element={
              <ProtectedRoute>
                <DoctorDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;