import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, ChevronDown, Bell, Menu, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

// Notice we added onMenuClick as a prop here!
export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'User'}&backgroundColor=e2e8f0`;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Left Side: Mobile Menu Button & Home Icon */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link to="/" className="flex items-center gap-2 lg:hidden text-indigo-600 hover:text-indigo-800 transition">
            <Home className="w-6 h-6" />
            <span className="text-slate-800 font-bold text-xl hidden sm:block">HireSphere</span>
          </Link>
        </div>
        
        {/* Right Side - Same as before */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {user ? (
            <>
              <button className="text-slate-400 hover:text-indigo-600 transition relative hidden sm:block">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 focus:outline-none p-1 rounded-full hover:bg-slate-50 transition"
                >
                  <img src={avatarUrl} alt="Avatar" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-indigo-100 shadow-sm" />
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-xs text-slate-500 font-medium capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className={`hidden sm:block w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                    <Link 
                      to="/profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                    >
                      <User className="w-4 h-4 mr-3" /> Profile Settings
                    </Link>
                    <div className="h-px bg-slate-100 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4 mr-3" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md shadow-indigo-200 text-sm sm:text-base">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}