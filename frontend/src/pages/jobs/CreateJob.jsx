import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function CreateJob() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form State - CHANGED 'salary' to 'salaryRange'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time', 
    salaryRange: '', 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // REAL-TIME VALIDATION: Salary Field Restriction
    if (name === 'salaryRange') {
      // Only allow numbers, spaces, and hyphens. Blocks $, letters, etc.
      if (!/^[0-9\s-]*$/.test(value)) {
        toast.error("Only numbers and hyphens (-) are allowed in the salary field", { id: 'salary-error' });
        return; 
      }
    }

    setFormData({ ...formData, [name]: value });
    
    // Clear the error for this specific field once the user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // SUBMIT-TIME VALIDATION
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Job Title is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Job Description is required';
    
    if (!formData.salaryRange.trim()) {
      newErrors.salaryRange = 'Salary is required';
    } else if (!/^(\d+)(\s*-\s*\d+)?$/.test(formData.salaryRange.trim())) {
      // Ensures format is "50000" or "50000 - 75000"
      newErrors.salaryRange = 'Format must be a number (e.g. 50000) or a range (e.g. 50000 - 75000)';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form before submitting.");
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return; 

    setIsLoading(true);

    try {
      await api.post('/jobs', {
        ...formData,
        companyName: user.companyName
      });
      
      toast.success('Job posted successfully!');
      navigate('/jobs'); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post job.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Post a New Job</h1>
        <p className="text-slate-500 mt-2">Fill out the details below to publish a new opportunity.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-4 bg-indigo-600 w-full"></div>
        
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8" noValidate>
          
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center border-b border-slate-100 pb-2">
              <Briefcase className="w-5 h-5 mr-2 text-indigo-500"/> Job Fundamentals
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Job Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleChange}
                  placeholder="e.g. Senior Full Stack Developer" 
                  className={`w-full px-4 py-3 border ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl focus:ring-2 outline-none bg-slate-50`} 
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Employment Type <span className="text-red-500">*</span></label>
                <select 
                  name="jobType" value={formData.jobType} onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-slate-400"/> Location <span className="text-red-500 ml-1">*</span>
                </label>
                <input 
                  type="text" name="location" value={formData.location} onChange={handleChange}
                  placeholder="e.g. New York, NY or Remote" 
                  className={`w-full px-4 py-3 border ${errors.location ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl focus:ring-2 outline-none bg-slate-50`} 
                />
                {errors.location && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.location}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center border-b border-slate-100 pb-2">
              <FileText className="w-5 h-5 mr-2 text-indigo-500"/> Description & Compensation
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-slate-400"/> Salary / Range <span className="text-red-500 ml-1">*</span>
              </label>
              {/* CHANGED name to salaryRange */}
              <input 
                type="text" name="salaryRange" value={formData.salaryRange} onChange={handleChange}
                placeholder="e.g. 50000 or 50000 - 75000" 
                className={`w-full px-4 py-3 border ${errors.salaryRange ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl focus:ring-2 outline-none bg-slate-50`} 
              />
              <p className="text-xs text-slate-400 mt-1">Do not include currency symbols ($). Just numbers and a hyphen if it is a range.</p>
              {errors.salaryRange && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.salaryRange}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Job Description & Requirements <span className="text-red-500">*</span></label>
              <textarea 
                name="description" value={formData.description} onChange={handleChange} rows="6"
                placeholder="Describe the role, responsibilities, and ideal candidate..." 
                className={`w-full px-4 py-3 border ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl focus:ring-2 outline-none bg-slate-50 resize-none`} 
              ></textarea>
              {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.description}</p>}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="button" 
              onClick={() => navigate('/my-jobs')}
              className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl mr-4 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-70"
            >
              {isLoading ? 'Publishing...' : <><CheckCircle className="w-5 h-5 mr-2" /> Post Job</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}