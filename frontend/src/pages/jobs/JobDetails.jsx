import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, Building, ArrowLeft, Send, X, UploadCloud, FileText } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function JobDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal & Application State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        setJob(response.data);
      } catch (error) {
        toast.error('Failed to load job details. It may have been removed.');
        navigate('/jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file.');
        setResumeFile(null);
        e.target.value = null; // Reset input
      } else if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File is too large. Maximum size is 5MB.');
        setResumeFile(null);
        e.target.value = null;
      } else {
        setResumeFile(file);
      }
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    
    if (!resumeFile) {
      toast.error('A PDF resume is required to apply.');
      return;
    }

    setIsApplying(true);

    try {
      // Because we are sending a file, we MUST use FormData instead of a standard JSON object
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('coverLetter', coverLetter);
      
      // NOTE: Ensure your backend Multer middleware is looking for a file named 'resume'
      // Example: upload.single('resume')
      formData.append('resume', resumeFile);

      // Hit the Application Service via the Gateway
      await api.post('/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success(`Successfully applied to ${job.title}!`);
      setIsModalOpen(false); // Close modal on success
      
      // Reset form
      setResumeFile(null);
      setCoverLetter('');
      
    } catch (error) {
      // Handles your backend's 11000 duplicate application error gracefully
      toast.error(error.response?.data?.message || 'Failed to submit application.');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 relative">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/jobs')}
        className="flex items-center text-slate-500 hover:text-indigo-600 font-semibold mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Job Board
      </button>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="h-4 bg-gradient-to-r from-indigo-500 to-purple-600 w-full"></div>
        <div className="p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
                {job.title}
              </h1>
              <div className="flex items-center text-lg font-semibold text-indigo-600">
                <Building className="w-5 h-5 mr-2" />
                {job.companyName || 'HireSphere Partner'}
              </div>
            </div>
            <span className="bg-green-100 text-green-800 text-sm font-bold px-4 py-1.5 rounded-full inline-flex items-center whitespace-nowrap">
              <Briefcase className="w-4 h-4 mr-2" /> {job.jobType}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-slate-100">
            <div className="flex items-center text-slate-600 font-medium">
              <div className="bg-slate-50 p-2 rounded-lg mr-3"><MapPin className="w-5 h-5 text-slate-400" /></div>
              {job.location}
            </div>
            <div className="flex items-center text-slate-600 font-medium">
              <div className="bg-slate-50 p-2 rounded-lg mr-3"><DollarSign className="w-5 h-5 text-slate-400" /></div>
              {job.salaryRange && job.salaryRange !== 'Not specified' ? `$${job.salaryRange}` : 'Salary undisclosed'}
            </div>
            <div className="flex items-center text-slate-600 font-medium">
              <div className="bg-slate-50 p-2 rounded-lg mr-3"><Clock className="w-5 h-5 text-slate-400" /></div>
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" /> Full Job Description
            </h2>
            <div className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
              {job.description}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Interested in this role?</h3>
            <p className="text-sm text-slate-500 mb-6">Submit your application now to be considered by the employer.</p>
            
            {user?.role === 'employer' ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold p-4 rounded-xl text-center">
                Employers cannot apply to jobs. Switch to a Seeker account to apply.
              </div>
            ) : (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
              >
                <Send className="w-5 h-5 mr-2" /> Apply Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* APPLICATION MODAL OVERLAY */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Submit Application</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleApplySubmit} className="p-6">
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-1">Applying for:</p>
                <p className="font-bold text-indigo-700">{job.title}</p>
                <p className="text-sm font-medium text-slate-600">{job.companyName}</p>
              </div>

              {/* Resume Upload */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Resume (PDF only) <span className="text-red-500">*</span>
                </label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${resumeFile ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50'}`}>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleFileChange}
                    className="hidden" 
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className={`w-10 h-10 mb-2 ${resumeFile ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-slate-700">
                      {resumeFile ? resumeFile.name : 'Click to upload your resume'}
                    </span>
                    <span className="text-xs text-slate-500 mt-1">Max file size: 5MB</span>
                  </label>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea 
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Why are you a great fit for this role?"
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 resize-none transition"
                ></textarea>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isApplying || !resumeFile}
                  className="flex-1 flex justify-center items-center bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isApplying ? 'Uploading...' : <><Send className="w-5 h-5 mr-2" /> Submit</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}