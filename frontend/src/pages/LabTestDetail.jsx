import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLabTestById, enterResult, removeAttachment } from '../services/labTestService';
import { useAuth } from '../context/AuthContext';

const LabTestDetail = () => {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [resultText, setResultText] = useState('');
  const [files, setFiles] = useState([]);
  const { user } = useAuth();

  const canEnterResult = ['admin', 'lab_staff'].includes(user?.role);

  const fetchTest = () => {
    getLabTestById(id).then(({ labTest }) => setTest(labTest));
  };

  useEffect(() => {
    fetchTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    await enterResult(id, resultText, files);
    setResultText('');
    setFiles([]);
    // reset file input value if present in DOM
    const input = document.getElementById('result-files-input');
    if (input) input.value = '';
    fetchTest();
  };

  const handleFilesChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  if (!test) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">
            {test.testType}
          </h1>

          <Link
            to="/lab-tests"
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Back
          </Link>
        </div>

        <p>
          <strong>Patient:</strong>{' '}
          {test.patient?.firstName} {test.patient?.lastName}
        </p>

        <p>
          <strong>Requested by:</strong> Dr.{' '}
          {test.requestedByDoctor?.firstName}{' '}
          {test.requestedByDoctor?.lastName}
        </p>

        <p>
          <strong>Status:</strong>{' '}
          {test.status.replace('_', ' ')}
        </p>

        {test.notes && (
          <p>
            <strong>Notes:</strong> {test.notes}
          </p>
        )}

        {test.resultText ? (
          <div className="mt-4 p-4 bg-gray-50 rounded border">
            <h2 className="font-bold mb-2">Result</h2>

            <p className="whitespace-pre-wrap">
              {test.resultText}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Entered:{' '}
              {new Date(test.resultEnteredAt).toLocaleString()}
            </p>

            {/* Attachments */}
            {test.attachments?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Attachments</h3>

                <div className="space-y-2">
                  {test.attachments.map((att, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <a
                        href={att.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline"
                      >
                        📄 {att.originalName}
                      </a>
                      {canEnterResult && (
                        <button
                          onClick={async () => {
                            if (!window.confirm('Delete this attachment?')) return;
                            await removeAttachment(test._id, index);
                            fetchTest();
                          }}
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : canEnterResult && test.status !== 'cancelled' ? (
          <form
            onSubmit={handleSubmitResult}
            className="mt-4 border-t pt-4"
          >
            <h2 className="font-bold mb-2">Enter Result</h2>

            <textarea
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              rows={4}
              required
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Enter test result details..."
            />

            <label className="block text-sm font-medium mb-1">Attach files (optional)</label>
            <input
              id="result-files-input"
              type="file"
              multiple
              onChange={handleFilesChange}
              className="w-full mb-3"
            />

            {files.length > 0 && (
              <div className="mb-3 text-sm text-gray-700">
                Selected files: {files.map((f) => f.name).join(', ')}
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
            >
              Submit Result
            </button>
          </form>
        ) : (
          <p className="text-gray-500 mt-4">
            No result entered yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default LabTestDetail;
