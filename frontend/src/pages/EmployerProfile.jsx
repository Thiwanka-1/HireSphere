import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Building, ShieldCheck, User as UserIcon, Edit2, Save, X, Key, Globe, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function EmployerProfile() {
const { user, login, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // <-- Add this line

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    companyName: user?.companyName || '',
    companyWebsite: user?.companyWebsite || '', // NEW FIELD
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    
    // Basic Website Validation (Optional)
    if (formData.companyWebsite && !/^https?:\/\//i.test(formData.companyWebsite)) {
      newErrors.companyWebsite = 'Website must start with http:// or https://';
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
      if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = { 
        name: formData.name, 
        email: formData.email,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite
      };
      if (formData.newPassword) payload.password = formData.newPassword;

      const response = await api.put('/auth/profile', payload);
      login(response.data);
      setIsEditing(false);
      setFormData({ ...formData, newPassword: '', confirmPassword: '' });
      toast.success('Company profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    // 1. Show the strict confirmation dialog
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to permanently delete your account? All your data will be erased. This action CANNOT be undone."
    );

    // If they click "Cancel", stop right here.
    if (!confirmDelete) return;

    try {
      // 2. Hit the new backend route
      await api.delete('/auth/profile');
      
      // 3. Clear the frontend React state
      logout();
      
      // 4. Show success message and redirect to the home page
      toast.success('Your account has been permanently deleted.');
      navigate('/');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account.');
    }
  };

  const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.companyName || user?.name}&backgroundColor=e2e8f0`;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Company Profile</h1>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="flex items-center bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-100 transition border border-indigo-200">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-800 w-full relative"></div>
        
        <div className="px-6 sm:px-10 pb-10">
          <div className="relative -mt-16 mb-6">
            <img src={avatarUrl} alt="Company Logo" className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white" />
          </div>

          

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-6 animate-in fade-in">
              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Representative Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-3 border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-xl outline-none bg-slate-50`} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-xl outline-none bg-slate-50`} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Company Details */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><Building className="w-5 h-5 mr-2 text-indigo-500"/> Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                    <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className={`w-full px-4 py-3 border ${errors.companyName ? 'border-red-500' : 'border-slate-200'} rounded-xl outline-none bg-slate-50`} />
                    {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Website URL</label>
                    <input type="text" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} placeholder="https://yourcompany.com" className={`w-full px-4 py-3 border ${errors.companyWebsite ? 'border-red-500' : 'border-slate-200'} rounded-xl outline-none bg-slate-50`} />
                    {errors.companyWebsite && <p className="text-red-500 text-xs mt-1">{errors.companyWebsite}</p>}
                  </div>
                </div>
              </div>

             

              {/* Password Change Section */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><Key className="w-5 h-5 mr-2 text-indigo-500"/> Change Password (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Leave blank to keep current" className={`w-full px-4 py-3 border ${errors.newPassword ? 'border-red-500' : 'border-slate-200'} rounded-xl outline-none bg-slate-50`} />
                    {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password" className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'} rounded-xl outline-none bg-slate-50`} />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isLoading} className="flex items-center bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-70">
                  <Save className="w-4 h-4 mr-2" /> {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="flex items-center bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">{user?.companyName || 'Company Name'}</h2>
                <p className="font-medium flex items-center gap-2 mt-1 capitalize text-slate-500">
                  <ShieldCheck className="w-4 h-4" /> Employer Account
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 font-semibold mb-1">Contact Email</p>
                  <div className="flex items-center text-slate-800 font-medium"><Mail className="w-5 h-5 mr-3 text-indigo-500" />{user?.email}</div>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 font-semibold mb-1">Representative</p>
                  <div className="flex items-center text-slate-800 font-medium"><UserIcon className="w-5 h-5 mr-3 text-indigo-500" />{user?.name}</div>
                </div>
                {user?.companyWebsite && (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 md:col-span-2">
                    <p className="text-sm text-slate-500 font-semibold mb-1">Website</p>
                    <div className="flex items-center text-slate-800 font-medium">
                      <Globe className="w-5 h-5 mr-3 text-indigo-500" />
                      <a href={user.companyWebsite} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{user.companyWebsite}</a>
                    </div>
                  </div>
                )}

                
              </div>
               {/* Danger Zone */}
      <div className="bg-red-50 rounded-2xl border border-red-100 p-6 mt-8 animate-in fade-in">
        <h3 className="text-lg font-bold text-red-800 flex items-center mb-2">
          <AlertTriangle className="w-5 h-5 mr-2" /> Danger Zone
        </h3>
        <p className="text-sm text-red-600 mb-4">Once you deactivate your account, there is no going back. Please be certain.</p>
        <button 
          onClick={handleDeleteRequest} 
          className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-sm"
        >
          Deactivate Account
        </button>
      </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}