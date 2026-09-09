import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope, Building2, CalendarClock,
  FileText, Pill, FlaskConical, Receipt, UserCog, BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Clinical',
    items: [
      { to: '/patients', label: 'Patients', icon: Users },
      { to: '/doctors', label: 'Doctors', icon: Stethoscope },
      { to: '/appointments', label: 'Appointments', icon: CalendarClock },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/lab-tests', label: 'Laboratory', icon: FlaskConical },
      { to: '/medicines', label: 'Pharmacy', icon: Pill },
      { to: '/invoices', label: 'Billing', icon: Receipt },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/departments', label: 'Departments', icon: Building2 },
      { to: '/employees', label: 'Staff', icon: UserCog },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
];

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen flex flex-col shrink-0">
      <div className="px-6 py-6 border-b border-white/10">
        <p className="font-heading font-bold text-lg leading-tight">HMS</p>
        <p className="text-xs text-white/50 mt-0.5">Hospital Management</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-2.5 text-sm mb-4 ${
              isActive ? 'text-white font-medium' : 'text-white/70 hover:text-white'
            }`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-6 text-xs font-medium text-white/40 mb-1.5">{group.label}</p>
            {group.items.map((item) => {
              // hide admin-only items for non-admins
              if ((item.to === '/employees' || item.to === '/reports') && user?.role !== 'admin') return null;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white font-medium border-r-2 border-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
