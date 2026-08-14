import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecordsByPatient } from '../services/medicalRecordService';
import { getPatientById } from '../services/patientService';
import { useAuth } from '../context/AuthContext';

const PatientHistory = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const canAddRecord = ['admin', 'doctor'].includes(user?.role);

  useEffect(() => {
    getPatientById(patientId).then(({ patient }) => setPatient(patient));
    getRecordsByPatient(patientId).then((data) => {
      setRecords(data.records);
      setLoading(false);
    });
  }, [patientId]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Medical History</h1>
          {patient && (
            <p className="text-gray-600">
              {patient.firstName} {patient.lastName}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/patients/${patientId}`}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Back to Patient
          </Link>
          {canAddRecord && (
            <Link
              to={`/patients/${patientId}/history/new`}
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              + New Record
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <p className="text-gray-500">No medical records yet for this patient.</p>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r._id} className="bg-white p-5 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold">{new Date(r.visitDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">
                    Dr. {r.doctor?.firstName} {r.doctor?.lastName} — {r.doctor?.specialization}
                  </p>
                </div>
              </div>
              {r.symptoms && (
                <p className="text-sm mb-1">
                  <strong>Symptoms:</strong> {r.symptoms}
                </p>
              )}
              <p className="text-sm mb-1">
                <strong>Diagnosis:</strong> {r.diagnosis}
              </p>
              {r.prescriptions?.length > 0 && (
                <div className="text-sm mb-1">
                  <strong>Prescriptions:</strong>
                  <ul className="list-disc list-inside ml-2">
                    {r.prescriptions.map((rx, i) => (
                      <li key={i}>
                        {rx.medicineName} — {rx.dosage}, {rx.frequency}, {rx.duration}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {r.treatmentNotes && (
                <p className="text-sm mb-1">
                  <strong>Notes:</strong> {r.treatmentNotes}
                </p>
              )}
              {r.followUpDate && (
                <p className="text-sm text-blue-700">
                  <strong>Follow-up:</strong> {new Date(r.followUpDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistory;