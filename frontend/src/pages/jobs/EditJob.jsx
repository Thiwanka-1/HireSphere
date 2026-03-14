import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, FileText, Save, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    salaryRange: '',
  });

  // Fetch existing job data when page loads
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        const job = response.data;
        setFormData({
          title: job.title,
          description: job.description,
          location: job.location,
          jobType: job.jobType,
          salaryRange: job.salaryRange === 'Not specified' ? '' : job.salaryRange,
        });
      } catch (error) {
        toast.error('Failed to load job details.');
        navigate('/my-jobs');
      } finally {
        setIsFetching(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'salaryRange' && !/^[0-9\s-]*$/.test(value)) {
      toast.error("Only numbers and hyphens (-) are allowed", { id: 'salary-error' });
      return; 
    }
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Job Title is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Job Description is required';
    if (!formData.salaryRange.trim()) {
      newErrors.salaryRange = 'Salary is required';
    } else if (!/^(\d+)(\s*-\s*\d+)?$/.test(formData.salaryRange.trim())) {
      newErrors.salaryRange = 'Format must be a number (e.g. 50000) or a range (e.g. 50000 - 75000)';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) toast.error("Please fix the errors before saving.");
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; 

    setIsLoading(true);
    try {
      await api.put(`/jobs/${id}`, formData);
      toast.success('Job updated successfully!');
      navigate('/my-jobs'); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <button onClick={() => navigate('/my-jobs')} className="flex items-center text-slate-500 hover:text-indigo-600 font-semibold mb-6 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Jobs
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Edit Job Posting</h1>
        <p className="text-slate-500 mt-2">Update the details for this position.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-4 bg-indigo-600 w-full"></div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8" noValidate>
          
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center border-b border-slate-100 pb-2"><Briefcase className="w-5 h-5 mr-2 text-indigo-500"/> Job Fundamentals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Job Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className={`w-full px-4 py-3 border ${errors.title ? 'border-red-500' : 'border-slate-200'} rounded-xl outline-none bg-slate-50`} />
                {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Employment Type <span className="text-red-500">*</span></label>
                <select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none bg-slate-50">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center"><MapPin className="w-4 h-4 mr-1 text-slate-400"/> Location <span className="text-red-500 ml-1">*</span></label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className={`w-full px-4 py-3 border ${errors.location ? 'border-red-500' : 'border-slate-200'} rounded-xl outline-none bg-slate-50`} />
                {errors.location && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.location}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center border-b border-slate-100 pb-2"><FileText className="w-5 h-5 mr-2 text-indigo-500"/> Description & Compensation</h3>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center"><DollarSign className="w-4 h-4 mr-1 text-slate-400"/> Salary / Range <span className="text-red-500 ml-1">*</span></label>
              <input type="text" name="salaryRange" value={formData.salaryRange} onChange={handleChange} className={`w-full px-4 py-3 border ${errors.salaryRange ? 'border-red-500' : 'border-slate-200'} rounded-xl outline-none bg-slate-50`} />
              {errors.salaryRange && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.salaryRange}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Job Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="6" className={`w-full px-4 py-3 border ${errors.description ? 'border-red-500' : 'border-slate-200'} rounded-xl outline-none bg-slate-50 resize-none`}></textarea>
              {errors.description && <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{errors.description}</p>}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={isLoading} className="flex items-center bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-70">
              {isLoading ? 'Saving...' : <><Save className="w-5 h-5 mr-2" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}