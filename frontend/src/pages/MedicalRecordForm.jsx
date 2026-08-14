import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMedicalRecord } from '../services/medicalRecordService';
import { getPatientById } from '../services/patientService';
import { getDoctors } from '../services/doctorService';

const emptyPrescription = { medicineName: '', dosage: '', frequency: '', duration: '' };

const MedicalRecordForm = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctor: '',
    symptoms: '',
    diagnosis: '',
    treatmentNotes: '',
    followUpDate: '',
    prescriptions: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getPatientById(patientId).then(({ patient }) => setPatient(patient));
    getDoctors().then((data) => setDoctors(data.doctors));
  }, [patientId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addPrescription = () => {
    setForm({ ...form, prescriptions: [...form.prescriptions, { ...emptyPrescription }] });
  };

  const updatePrescription = (index, field, value) => {
    const updated = [...form.prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, prescriptions: updated });
  };

  const removePrescription = (index) => {
    setForm({ ...form, prescriptions: form.prescriptions.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createMedicalRecord({ ...form, patient: patientId });
      navigate(`/patients/${patientId}/history`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-1 text-blue-700">New Medical Record</h1>
        <p className="text-gray-600 mb-6">
          Patient: {patient.firstName} {patient.lastName}
          {patient.allergies && (
            <span className="ml-2 text-red-600 font-medium">⚠ Allergies: {patient.allergies}</span>
          )}
        </p>

        {error && <div className="bg-red-100 text-red-700 text-sm p-2 rounded mb-4">{error}</div>}

        <label className="block text-sm font-medium mb-1">Attending Doctor</label>
        <select
          name="doctor"
          value={form.doctor}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 mb-4"
        >
          <option value="">Select doctor</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              Dr. {d.firstName} {d.lastName} — {d.specialization}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">Symptoms</label>
        <textarea
          name="symptoms"
          value={form.symptoms}
          onChange={handleChange}
          rows={2}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block text-sm font-medium mb-1">Diagnosis</label>
        <textarea
          name="diagnosis"
          value={form.diagnosis}
          onChange={handleChange}
          required
          rows={2}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Prescriptions</label>
            <button
              type="button"
              onClick={addPrescription}
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              + Add Medicine
            </button>
          </div>
          {form.prescriptions.map((rx, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 mb-2 items-center">
              <input
                placeholder="Medicine"
                value={rx.medicineName}
                onChange={(e) => updatePrescription(index, 'medicineName', e.target.value)}
                className="border rounded px-2 py-1 col-span-1"
                required
              />
              <input
                placeholder="Dosage (e.g. 500mg)"
                value={rx.dosage}
                onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                className="border rounded px-2 py-1"
                required
              />
              <input
                placeholder="Frequency"
                value={rx.frequency}
                onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                className="border rounded px-2 py-1"
                required
              />
              <input
                placeholder="Duration"
                value={rx.duration}
                onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                className="border rounded px-2 py-1"
                required
              />
              <button
                type="button"
                onClick={() => removePrescription(index)}
                className="text-red-600 text-sm underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <label className="block text-sm font-medium mb-1">Treatment Notes</label>
        <textarea
          name="treatmentNotes"
          value={form.treatmentNotes}
          onChange={handleChange}
          rows={2}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block text-sm font-medium mb-1">Follow-up Date (optional)</label>
        <input
          type="date"
          name="followUpDate"
          value={form.followUpDate}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 mb-6"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Record'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/patients/${patientId}/history`)}
            className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MedicalRecordForm;