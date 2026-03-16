import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Trash2, Search, ShieldAlert, 
  Mail, Building, ShieldCheck, UserCircle, UserPlus 
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State
  const [filters, setFilters] = useState({
    search: '',
    role: ''
  });

  // Fetch all users on load
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await api.get('/auth/users'); // Ensure your Auth backend has this admin route
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        toast.error('Failed to load system users. Are you an admin?');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  // Filter Logic
  useEffect(() => {
    const applyFilters = () => {
      let result = users;

      if (filters.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(u => 
          u.name.toLowerCase().includes(query) || 
          u.email.toLowerCase().includes(query)
        );
      }
      
      if (filters.role) {
        result = result.filter(u => u.role === filters.role);
      }

      setFilteredUsers(result);
    };

    applyFilters();
  }, [filters, users]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Delete User Handler
  const handleDeleteUser = async (id, name, role) => {
    if (role === 'admin') {
      toast.error("Cannot delete fellow administrators from this dashboard.");
      return;
    }

    const isConfirmed = window.confirm(`WARNING: Are you sure you want to permanently delete user "${name}"? This action cannot be undone.`);
    if (!isConfirmed) return;

    try {
      await api.delete(`/auth/users/${id}`); // Ensure your Auth backend has this route
      setUsers(users.filter(u => u._id !== id));
      toast.success(`User ${name} deleted successfully.`);
    } catch (error) {
      toast.error('Failed to delete user.');
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <ShieldCheck className="w-5 h-5 text-red-500" />;
      case 'employer': return <Building className="w-5 h-5 text-purple-500" />;
      default: return <UserCircle className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-800 text-white">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center mb-2">
            <Users className="w-8 h-8 mr-3 text-blue-500" />
            User Management
          </h1>
          <p className="text-slate-400 font-medium">Monitor and moderate all registered accounts on HireSphere.</p>
        </div>
        
        {/* Updated Action Area with New Admin Button */}
        <div className="flex gap-4 w-full sm:w-auto mt-4 sm:mt-0">
          <Link to="/admin/create" className="flex-1 sm:flex-none flex justify-center items-center bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-lg shadow-red-900/50">
            <UserPlus className="w-5 h-5 mr-2" /> New Admin
          </Link>
          <div className="bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-700 hidden sm:block">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-0.5">Total Accounts</span>
            <p className="text-2xl font-black text-white text-right leading-none">{users.length}</p>
          </div>
        </div>
        
      </div>

      {/* Instant Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input 
            type="text" name="search" value={filters.search} onChange={handleFilterChange} 
            placeholder="Search by name or email..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
          />
        </div>
        <select 
          name="role" value={filters.role} onChange={handleFilterChange} 
          className="w-full md:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="seeker">Seeker (Candidate)</option>
          <option value="employer">Employer</option>
          <option value="admin">Administrator</option>
        </select>
      </div>

      {/* User Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No matching users</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider font-bold">
                  <th className="p-4 pl-6">User Info</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Account Type</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center">
                        <div className="bg-slate-100 p-2 rounded-lg mr-3">
                          {getRoleIcon(u.role)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{u.name}</p>
                          <p className="text-xs font-mono text-slate-400 mt-0.5">ID: {u._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-slate-600 font-medium">
                        <Mail className="w-4 h-4 mr-2 text-slate-400" />
                        {u.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        u.role === 'employer' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'admin' ? 'bg-red-100 text-red-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end">
                        {u.role !== 'admin' ? (
                          <button 
                            onClick={() => handleDeleteUser(u._id, u.name, u.role)} 
                            title="Delete User" 
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-100 sm:opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 uppercase">Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}