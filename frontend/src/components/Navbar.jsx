import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, ChevronDown, Menu, Hexagon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      logout();
      setIsDropdownOpen(false);
      toast.success('Logged out successfully', { duration: 2000 });
      navigate('/'); 
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const toggleProfile = (e) => {
    e.stopPropagation(); // Prevent the navbar click from interfering
    toast.dismiss();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'User'}&backgroundColor=e2e8f0`;

  return (
    // Any click on the navbar immediately dismisses all toasts
    <nav 
      onClick={() => toast.dismiss()} 
      className="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        
        {/* Left Side: Mobile Menu Button & Futuristic Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); toast.dismiss(); onMenuClick(); }}
            className="p-2 -ml-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl lg:hidden transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 rounded-xl shadow-md group-hover:shadow-indigo-200 transition">
              <Hexagon className="w-6 h-6 text-white fill-white/20" />
            </div>
            <span className="font-black text-2xl tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              HireSphere
            </span>
          </Link>
        </div>
        
        {/* Right Side: Profile System */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <div className="relative pl-2 sm:pl-4" ref={dropdownRef}>
              <button 
                onClick={toggleProfile}
                className="flex items-center space-x-3 focus:outline-none p-1.5 rounded-full hover:bg-slate-50 transition border border-transparent hover:border-slate-200"
              >
                <img src={avatarUrl} alt="Avatar" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-indigo-100 shadow-sm" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{user.role}</p>
                </div>
                <ChevronDown className={`hidden sm:block w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>

              {/* Profile Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-5 py-3 border-b border-slate-50 md:hidden">
                     <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                     <p className="text-xs text-slate-500 font-medium capitalize">{user.role}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <User className="w-4 h-4 mr-3" /> Account Settings
                  </Link>
                  <div className="h-px bg-slate-100 my-1 mx-3"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4 mr-3" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-600 hover:text-indigo-600 transition">
                Log In
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-200 hover:-translate-y-0.5 text-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
        
      </div>
    </nav>
  );
}