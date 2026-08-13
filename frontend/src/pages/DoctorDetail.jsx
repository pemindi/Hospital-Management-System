import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDoctorById } from '../services/doctorService';

const DoctorDetail = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    getDoctorById(id).then(({ doctor }) => setDoctor(doctor));
  }, [id]);

  if (!doctor) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">
            Dr. {doctor.firstName} {doctor.lastName}
          </h1>
          <Link to="/doctors" className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Back
          </Link>
        </div>

        <p className="mb-1">
          <strong>Specialization:</strong> {doctor.specialization}
        </p>
        <p className="mb-1">
          <strong>Department:</strong> {doctor.department?.name}
        </p>
        <p className="mb-1">
          <strong>Phone:</strong> {doctor.phone}
        </p>
        <p className="mb-1">
          <strong>Email:</strong> {doctor.email || '-'}
        </p>
        <p className="mb-4">
          <strong>Consultation Fee:</strong> Rs. {doctor.consultationFee}
        </p>

        <h2 className="font-bold mb-2">Weekly Schedule</h2>
        {doctor.schedule?.length === 0 ? (
          <p className="text-gray-500 text-sm">No schedule set</p>
        ) : (
          <ul className="list-disc list-inside">
            {doctor.schedule.map((slot, i) => (
              <li key={i}>
                {slot.day}: {slot.startTime} – {slot.endTime}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DoctorDetail;