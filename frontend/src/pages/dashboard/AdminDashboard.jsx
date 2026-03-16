import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, Briefcase, Activity, ShieldCheck, 
  TrendingUp, UserPlus, Building 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // System Metrics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSeekers: 0,
    totalEmployers: 0,
    totalJobs: 0,
  });
  
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        // 1. Fetch all users from Auth Service (Admin only route)
        const usersRes = await api.get('/auth/users');
        const users = usersRes.data;
        
        // 2. Fetch all jobs from Job Service
        const jobsRes = await api.get('/jobs');
        const jobs = jobsRes.data;

        // Calculate User Breakdown
        const seekers = users.filter(u => u.role === 'seeker').length;
        const employers = users.filter(u => u.role === 'employer').length;

        setStats({
          totalUsers: users.length,
          totalSeekers: seekers,
          totalEmployers: employers,
          totalJobs: jobs.length,
        });

        // Get 5 most recent users (assuming the backend returns them sorted, or we sort here)
        // Using createdAt if available, otherwise just grabbing the last 5
        const sortedUsers = [...users].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setRecentUsers(sortedUsers.slice(0, 5));

      } catch (error) {
        toast.error("Failed to load system metrics. Ensure admin routes are protected.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Admin Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl text-white relative overflow-hidden border border-slate-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center">
          <ShieldCheck className="w-16 h-16 text-red-500 mr-6 hidden sm:block" />
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight flex items-center">
              System Administrator
            </h1>
            <p className="text-slate-400 font-medium text-lg max-w-2xl">
              Platform overview, user management, and global job moderation.
            </p>
          </div>
        </div>
      </div>

      {/* Global Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center hover:shadow-md transition">
          <div className="bg-blue-50 p-4 rounded-2xl mr-4">
            <Users className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center hover:shadow-md transition">
          <div className="bg-indigo-50 p-4 rounded-2xl mr-4">
            <UserPlus className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Seekers</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalSeekers}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center hover:shadow-md transition">
          <div className="bg-purple-50 p-4 rounded-2xl mr-4">
            <Building className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Employers</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalEmployers}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center hover:shadow-md transition">
          <div className="bg-emerald-50 p-4 rounded-2xl mr-4">
            <Briefcase className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">Active Jobs</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.totalJobs}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Quick Actions Panel */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col justify-center items-center text-center">
          <Activity className="w-16 h-16 text-slate-200 mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Platform Control</h2>
          <p className="text-slate-500 mb-8 max-w-sm">Manage user accounts or moderate job postings across the entire platform.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link to="/admin/users" className="flex items-center justify-center bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg">
              <Users className="w-5 h-5 mr-2" /> Manage Users
            </Link>
            <Link to="/admin/jobs" className="flex items-center justify-center bg-red-50 text-red-600 border border-red-100 px-6 py-3.5 rounded-xl font-bold hover:bg-red-100 transition">
              <Briefcase className="w-5 h-5 mr-2" /> Moderate Jobs
            </Link>
          </div>
        </div>

        {/* Recent Users Panel */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 sm:px-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-500" /> Newest Accounts
            </h2>
            <Link to="/admin/users" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
              View All &rarr;
            </Link>
          </div>
          <div className="p-6 sm:p-8 flex-1">
            <div className="space-y-4">
              {recentUsers.map(u => (
                <div key={u._id} className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                  <div>
                    <h4 className="font-bold text-slate-800 flex items-center">
                      {u.name} 
                      {u.role === 'admin' && <ShieldCheck className="w-4 h-4 ml-2 text-red-500" />}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">{u.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    u.role === 'employer' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'admin' ? 'bg-red-100 text-red-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}