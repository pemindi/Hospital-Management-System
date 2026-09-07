import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLabTestsByPatient } from '../services/labTestService';

const statusColors = {
  requested: 'bg-yellow-100 text-yellow-700',
  sample_collected: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-200 text-gray-700',
};

const PatientLabTests = () => {
  const { patientId } = useParams();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLabTestsByPatient(patientId)
      .then((data) => {
        setTests(data.labTests);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch lab tests:', error);
        setLoading(false);
      });
  }, [patientId]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">
          Lab Test History
        </h1>

        <Link
          to={`/patients/${patientId}`}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Back to Patient
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : tests.length === 0 ? (
        <p className="text-gray-500">
          No lab tests on record for this patient.
        </p>
      ) : (
        <div className="space-y-4">
          {tests.map((t) => (
            <div
              key={t._id}
              className="bg-white p-5 rounded-lg shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold">{t.testType}</p>

                  <p className="text-sm text-gray-600">
                    Requested{' '}
                    {new Date(t.createdAt).toLocaleDateString()} by Dr.{' '}
                    {t.requestedByDoctor?.lastName}
                  </p>
                </div>

                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    statusColors[t.status] ||
                    'bg-gray-200 text-gray-700'
                  }`}
                >
                  {t.status.replace('_', ' ')}
                </span>
              </div>

              {t.resultText && (
                <p className="text-sm mt-2 whitespace-pre-wrap">
                  <strong>Result:</strong> {t.resultText}
                </p>
              )}

              {t.attachments?.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-1">
                    Attachments:
                  </p>

                  <div className="flex flex-col gap-1">
                    {t.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline text-sm"
                      >
                        📄 {att.originalName}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientLabTests;
