import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus, Mail, Lock, User, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function CreateAdmin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setIsLoading(true);
    try {
      await api.post('/auth/admin', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      toast.success('New Administrator account created successfully!');
      navigate('/admin/users'); // Send them back to the user list so they can see the new admin
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      <button onClick={() => navigate('/admin/users')} className="flex items-center text-slate-500 hover:text-red-600 font-semibold mb-2 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to User Management
      </button>

      {/* Admin Header */}
      <div className="bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center">
          <ShieldCheck className="w-12 h-12 text-red-500 mr-4" />
          <div>
            <h1 className="text-3xl font-extrabold mb-1 tracking-tight">Create Administrator</h1>
            <p className="text-slate-400 font-medium">Provision a new high-level access account for platform moderation.</p>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-3 bg-red-500 w-full"></div>
        <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input 
                type="text" name="name" required value={formData.name} onChange={handleChange}
                placeholder="e.g. Jane Doe" 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Official Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input 
                type="email" name="email" required value={formData.email} onChange={handleChange}
                placeholder="admin@hiresphere.com" 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="password" name="password" required minLength="6" value={formData.password} onChange={handleChange}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input 
                  type="password" name="confirmPassword" required minLength="6" value={formData.confirmPassword} onChange={handleChange}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition" 
                />
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start mt-6">
            <ShieldCheck className="w-5 h-5 text-red-600 mr-3 mt-0.5 shrink-0" />
            <p className="text-sm text-red-800 font-medium">
              By creating this account, you are granting full administrative privileges, including the ability to delete users, moderate job postings, and access all system data.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/admin/users')} className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex items-center bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg disabled:opacity-70">
              {isLoading ? 'Creating...' : <><UserPlus className="w-5 h-5 mr-2" /> Provision Account</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}