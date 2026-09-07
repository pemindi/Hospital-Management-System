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
import AppointmentList from './pages/AppointmentList';
import AppointmentForm from './pages/AppointmentForm';
import MedicalRecordForm from './pages/MedicalRecordForm';
import PatientHistory from './pages/PatientHistory';
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetail from './pages/InvoiceDetail';
import LabTestList from './pages/LabTestList';
import LabTestForm from './pages/LabTestForm';
import LabTestDetail from './pages/LabTestDetail';
import MedicineList from './pages/MedicineList';
import MedicineForm from './pages/MedicineForm';
import DispenseForm from './pages/DispenseForm';
import PatientLabTests from './pages/PatientLabTests';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/dashboard"element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
          <Route path="/patients"element={<ProtectedRoute><PatientList /></ProtectedRoute>}/>
          <Route path="/patients/new"element={<ProtectedRoute allowedRoles={['admin', 'receptionist']}><PatientForm /></ProtectedRoute>}/>
          <Route path="/patients/:id/edit"element={<ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor', 'nurse']}><PatientForm /></ProtectedRoute>}/>
          <Route path="/patients/:id"element={<ProtectedRoute><PatientDetail /></ProtectedRoute>}/>
          <Route path="/departments"element={<ProtectedRoute><DepartmentList /></ProtectedRoute>}/>
          <Route path="/doctors"element={<ProtectedRoute><DoctorList /></ProtectedRoute>}/>
          <Route path="/doctors/new"element={<ProtectedRoute allowedRoles={['admin']}><DoctorForm /></ProtectedRoute>}/>
          <Route path="/doctors/:id/edit"element={<ProtectedRoute allowedRoles={['admin']}><DoctorForm /></ProtectedRoute>}/>
          <Route path="/doctors/:id"element={<ProtectedRoute><DoctorDetail /></ProtectedRoute>}/>
          <Route path="/appointments"element={<ProtectedRoute><AppointmentList /></ProtectedRoute>}/>
          <Route path="/appointments/new"element={<ProtectedRoute allowedRoles={['admin', 'receptionist']}><AppointmentForm /></ProtectedRoute>}/>
          <Route path="/appointments/:id/reschedule"element={<ProtectedRoute allowedRoles={['admin', 'receptionist']}><AppointmentForm /></ProtectedRoute>}/>
          <Route path="/patients/:patientId/history" element={<ProtectedRoute><PatientHistory /></ProtectedRoute>} />
          <Route path="/patients/:patientId/history/new" element={<ProtectedRoute allowedRoles={['admin', 'doctor']}><MedicalRecordForm /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
          <Route path="/invoices/new" element={<ProtectedRoute allowedRoles={['admin', 'receptionist', 'accountant']}><InvoiceForm /></ProtectedRoute>} />
          <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
          <Route path="/lab-tests" element={<ProtectedRoute><LabTestList /></ProtectedRoute>} />
          <Route path="/lab-tests/new" element={<ProtectedRoute allowedRoles={['admin', 'doctor']}><LabTestForm /></ProtectedRoute>} />
          <Route path="/lab-tests/:id" element={<ProtectedRoute><LabTestDetail /></ProtectedRoute>} />
          <Route path="/medicines" element={<ProtectedRoute><MedicineList /></ProtectedRoute>} />
          <Route path="/medicines/new" element={<ProtectedRoute allowedRoles={['admin', 'pharmacist']}><MedicineForm /></ProtectedRoute>} />
          <Route path="/medicines/:id/edit" element={<ProtectedRoute allowedRoles={['admin', 'pharmacist']}><MedicineForm /></ProtectedRoute>} />
          <Route path="/patients/:patientId/lab-tests" element={<ProtectedRoute><PatientLabTests /></ProtectedRoute>} />
          <Route path="/dispense" element={<ProtectedRoute allowedRoles={['admin', 'pharmacist']}><DispenseForm /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;