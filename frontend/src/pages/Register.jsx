import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'seeker', companyName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Must be at least 6 characters';
    if (formData.role === 'employer' && !formData.companyName) newErrors.companyName = 'Company name is required for employers';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.post('/auth/register', formData);
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* LEFT HALF - Futuristic Graphic Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-800 items-center justify-center">
        <div className="absolute top-[10%] left-[-20%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center text-white px-12 glassmorphism bg-white/10 p-12 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl">
          <Briefcase className="w-20 h-20 mx-auto mb-6 text-cyan-300" />
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Join HireSphere</h1>
          <p className="text-xl text-blue-100 font-light">Connect with top talent or find your next big opportunity.</p>
        </div>
      </div>

      {/* RIGHT HALF - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Create an Account</h2>
          <p className="text-slate-500 mb-8">Fill in the details below to get started.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account Type Selection */}
            <div className="flex gap-4 mb-6">
              <label className={`flex-1 cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${formData.role === 'seeker' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                <input type="radio" name="role" value="seeker" checked={formData.role === 'seeker'} onChange={handleChange} className="hidden" />
                <User className="w-6 h-6 mx-auto mb-2" />
                <span className="font-semibold text-sm">Job Seeker</span>
              </label>
              <label className={`flex-1 cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${formData.role === 'employer' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-indigo-300'}`}>
                <input type="radio" name="role" value="employer" checked={formData.role === 'employer'} onChange={handleChange} className="hidden" />
                <Briefcase className="w-6 h-6 mx-auto mb-2" />
                <span className="font-semibold text-sm">Employer</span>
              </label>
            </div>

            {/* Conditional Company Name Field */}
            {formData.role === 'employer' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-slate-400" />
                  </div>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className={`w-full pl-10 pr-4 py-3 border ${errors.companyName ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50`} placeholder="TechCorp Inc." />
                </div>
                {errors.companyName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.companyName}</p>}
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full pl-10 pr-4 py-3 border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50`} placeholder="John Doe" />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50`} placeholder="you@example.com" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
            </div>
            
            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50`} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 transition">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl mt-4 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-70">
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}