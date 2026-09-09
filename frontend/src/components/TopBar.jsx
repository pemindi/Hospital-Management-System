import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const TopBar = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
      <h1 className="font-heading font-semibold text-xl text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800 leading-tight">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize leading-tight">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="text-gray-500 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
