import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, FileText, Calendar, Settings, X, Users, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  // DYNAMIC SIDEBAR BASED ON ROLE
  let navItems = [];
  
  if (user?.role === 'admin') {
    navItems = [
      { name: 'Admin Dashboard', path: '/dash', icon: Shield },
      { name: 'Manage Users', path: '/admin/users', icon: Users },
      { name: 'Manage Jobs', path: '/admin/jobs', icon: Briefcase },
    ];
  } else if (user?.role === 'employer') {
    navItems = [
      { name: 'Dashboard', path: '/dash', icon: Home },
      { name: 'My Jobs', path: '/my-jobs', icon: Briefcase },
      { name: 'Applications', path: '/applications', icon: FileText },
      { name: 'Interviews', path: '/interviews', icon: Calendar },
    ];
  } else {
    // Default to Seeker
    navItems = [
      { name: 'Discover Jobs', path: '/jobs', icon: Home },
      { name: 'My Applications', path: '/applications', icon: FileText },
      { name: 'My Interviews', path: '/interviews', icon: Calendar },
    ];
  }

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out
      lg:static lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
        {/* Clickable Brand Logo linking to Home */}
        <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">HireSphere</span>
        </Link>
        <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)} 
              className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-indigo-600' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}