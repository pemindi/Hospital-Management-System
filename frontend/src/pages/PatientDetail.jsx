import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPatientById } from '../services/patientService';

const PatientDetail = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    getPatientById(id).then(({ patient }) => setPatient(patient));
  }, [id]);

  if (!patient) return <div className="p-8 text-center">Loading...</div>;

  const Row = ({ label, value }) => (
    <div className="flex border-b py-2">
      <span className="w-48 font-medium text-gray-600">{label}</span>
      <span>{value || '-'}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">
            {patient.firstName} {patient.lastName}
          </h1>

          <div className="flex gap-2">
            <Link
              to={`/patients/${patient._id}/history`}
              className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
            >
              Medical History
            </Link>

            <Link
              to={`/patients/${patient._id}/lab-tests`}
              className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800"
            >
              Lab Tests
            </Link>

            <Link
              to="/patients"
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Back
            </Link>
          </div>
        </div>

        <Row
          label="Date of Birth"
          value={patient.dateOfBirth?.split('T')[0]}
        />
        <Row label="Gender" value={patient.gender} />
        <Row label="Phone" value={patient.phone} />
        <Row label="Email" value={patient.email} />
        <Row label="Address" value={patient.address} />
        <Row label="Blood Group" value={patient.bloodGroup} />
        <Row
          label="Emergency Contact"
          value={patient.emergencyContactName}
        />
        <Row
          label="Emergency Phone"
          value={patient.emergencyContactPhone}
        />
        <Row label="Allergies" value={patient.allergies} />
      </div>
    </div>
  );
};

export default PatientDetail;
