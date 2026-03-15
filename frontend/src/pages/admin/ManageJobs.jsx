import { useState, useEffect } from 'react';
import { 
  Briefcase, Edit2, Trash2, Building, MapPin, ShieldAlert, 
  Search, X, Save, FileText, DollarSign, Eye
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FILTER STATE ---
  const [filters, setFilters] = useState({
    title: '',
    company: '',
    location: '',
    jobType: ''
  });

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [modalJob, setModalJob] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch all jobs on load
  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        const response = await api.get('/jobs');
        setJobs(response.data);
        setFilteredJobs(response.data);
      } catch (error) {
        toast.error('Failed to load system jobs.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllJobs();
  }, []);

  // --- FILTER LOGIC ---
  useEffect(() => {
    const applyFilters = () => {
      let result = jobs;

      if (filters.title) {
        result = result.filter(job => job.title.toLowerCase().includes(filters.title.toLowerCase()));
      }
      if (filters.company) {
        result = result.filter(job => (job.companyName || '').toLowerCase().includes(filters.company.toLowerCase()));
      }
      if (filters.location) {
        result = result.filter(job => job.location.toLowerCase().includes(filters.location.toLowerCase()));
      }
      if (filters.jobType) {
        result = result.filter(job => job.jobType === filters.jobType);
      }

      setFilteredJobs(result);
    };

    applyFilters();
  }, [filters, jobs]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // --- MODAL HANDLERS ---
  const openModal = (job, editMode = false) => {
    // Make a deep copy of the job for editing so we don't accidentally mutate the main list
    setModalJob({ ...job, salaryRange: job.salaryRange === 'Not specified' ? '' : job.salaryRange });
    setIsEditMode(editMode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalJob(null);
    setIsEditMode(false);
  };

  const handleModalChange = (e) => {
    setModalJob({ ...modalJob, [e.target.name]: e.target.value });
  };

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    
    // Quick validation
    if (!modalJob.title || !modalJob.location || !modalJob.description) {
      toast.error("Title, Location, and Description are required.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.put(`/jobs/${modalJob._id}`, modalJob);
      const updatedJob = response.data;
      
      // Update the main jobs array so the table reflects the changes instantly
      setJobs(jobs.map(j => j._id === updatedJob._id ? updatedJob : j));
      
      toast.success('Job updated successfully!');
      setIsEditMode(false); // Switch back to view mode
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- DELETE HANDLER ---
  const handleAdminDelete = async (id, title, company) => {
    const isConfirmed = window.confirm(`ADMIN OVERRIDE: Are you sure you want to permanently delete "${title}" by ${company}? This cannot be undone.`);
    if (!isConfirmed) return;

    try {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter(job => job._id !== id));
      toast.success('Job removed by Admin successfully.');
      if (isModalOpen) closeModal(); // Close modal if they delete from inside the modal
    } catch (error) {
      toast.error('Failed to delete job.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-800 text-white">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center mb-2">
            <ShieldAlert className="w-8 h-8 mr-3 text-red-500" />
            System Job Management
          </h1>
          <p className="text-slate-400 font-medium">Global overview and moderation of all active job postings.</p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
          <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Active Jobs</span>
          <p className="text-2xl font-black text-white text-right">{jobs.length}</p>
        </div>
      </div>

      {/* Instant Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input type="text" name="title" value={filters.title} onChange={handleFilterChange} placeholder="Search Job Title..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="relative flex-1">
          <Building className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input type="text" name="company" value={filters.company} onChange={handleFilterChange} placeholder="Filter by Company..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input type="text" name="location" value={filters.location} onChange={handleFilterChange} placeholder="Filter Location..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select name="jobType" value={filters.jobType} onChange={handleFilterChange} className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Job Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      {/* Admin Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-16 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No matching jobs</h3>
            <p className="text-slate-500 mt-2">Adjust your filters or search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider font-bold">
                  <th className="p-4 pl-6">Job Title</th>
                  <th className="p-4">Employer</th>
                  <th className="p-4">Location & Type</th>
                  <th className="p-4 pr-6 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-slate-800">{job.title}</p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">ID: {job._id}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-slate-600 font-medium">
                        <Building className="w-4 h-4 mr-2 text-indigo-500" />
                        {job.companyName || 'Unknown'}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-slate-400" /> {job.location}
                      </p>
                      <span className="inline-block mt-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded">
                        {job.jobType}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(job, false)} title="View Details" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => openModal(job, true)} title="Force Edit" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleAdminDelete(job._id, job.title, job.companyName)} title="Delete Post" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* VIEW & EDIT MODAL OVERLAY */}
      {/* ========================================== */}
      {isModalOpen && modalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                {isEditMode ? <><Edit2 className="w-5 h-5 mr-2 text-amber-500" /> Edit Job Override</> : <><Briefcase className="w-5 h-5 mr-2 text-indigo-500" /> Job Details</>}
              </h3>
              <div className="flex items-center gap-2">
                {!isEditMode && (
                  <button onClick={() => setIsEditMode(true)} className="flex items-center text-sm font-bold text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition">
                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                  </button>
                )}
                <button onClick={closeModal} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {isEditMode ? (
                /* --- EDIT MODE FORM --- */
                <form id="admin-edit-form" onSubmit={handleAdminUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Job Title</label>
                      <input type="text" name="title" value={modalJob.title} onChange={handleModalChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Company Name</label>
                      <input type="text" name="companyName" value={modalJob.companyName || ''} onChange={handleModalChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                      <input type="text" name="location" value={modalJob.location} onChange={handleModalChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Job Type</label>
                      <select name="jobType" value={modalJob.jobType} onChange={handleModalChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50">
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Salary Range</label>
                      <input type="text" name="salaryRange" value={modalJob.salaryRange} onChange={handleModalChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                      <textarea name="description" value={modalJob.description} onChange={handleModalChange} rows="5" className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50"></textarea>
                    </div>
                  </div>
                </form>
              ) : (
                /* --- VIEW MODE DETAILS --- */
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{modalJob.title}</h2>
                    <p className="text-lg font-medium text-indigo-600 mt-1">{modalJob.companyName}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 py-4 border-y border-slate-100">
                    <span className="flex items-center text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg"><MapPin className="w-4 h-4 mr-2" />{modalJob.location}</span>
                    <span className="flex items-center text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg"><Briefcase className="w-4 h-4 mr-2" />{modalJob.jobType}</span>
                    <span className="flex items-center text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg"><DollarSign className="w-4 h-4 mr-2" />{modalJob.salaryRange || 'Not specified'}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center"><FileText className="w-4 h-4 mr-2"/> Description</h4>
                    <p className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">{modalJob.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              {isEditMode ? (
                <>
                  <button onClick={() => setIsEditMode(false)} className="px-5 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition">Cancel Edit</button>
                  <button type="submit" form="admin-edit-form" disabled={isSaving} className="flex items-center bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-70">
                    <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button onClick={() => handleAdminDelete(modalJob._id, modalJob.title, modalJob.companyName)} className="flex items-center bg-red-100 text-red-700 px-5 py-2 rounded-lg font-bold hover:bg-red-200 transition">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Job
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}