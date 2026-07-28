import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">HMS Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p>
          Welcome, <strong>{user?.name}</strong>
        </p>
        <p>
          Role: <strong>{user?.role}</strong>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;