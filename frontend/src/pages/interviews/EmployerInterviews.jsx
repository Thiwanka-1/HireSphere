import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Video, User, Briefcase, 
  CheckCircle, XCircle, AlertCircle, PlusCircle, X, Edit2, Trash2 
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function EmployerInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [enrichedData, setEnrichedData] = useState({}); // { interviewId: { applicantName, email, jobTitle } }
  const [isLoading, setIsLoading] = useState(true);

  // --- MODAL STATES ---
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [modalJobs, setModalJobs] = useState([]);
  const [modalApps, setModalApps] = useState([]);
  
  const [formData, setFormData] = useState({
    id: '', // Used for updates
    jobId: '',
    applicationId: '',
    applicantId: '',
    scheduledDate: '',
    meetingLink: ''
  });

  // Helper: Get local datetime string for the HTML input 'min' attribute
  const getLocalMinDateTime = () => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);
  };

  // 1. Fetch Existing Interviews & Orchestrate Data
  const fetchDashboardData = async () => {
    try {
      const intRes = await api.get('/interviews/employer');
      const fetchedInterviews = intRes.data;
      setInterviews(fetchedInterviews);

      if (fetchedInterviews.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch Jobs and Applications to map data correctly
      const jobsRes = await api.get('/jobs/employer/me');
      const jobs = jobsRes.data;
      
      const dataMap = {};
      
      for (const interview of fetchedInterviews) {
        try {
          // Find the related application to get the Job ID
          const appRes = await api.get(`/applications/job/${jobs[0]?._id}`); // Simplified fallback
          // Best practice: We find the job that matches the application
          let jobTitle = 'Unknown Job';
          for (const job of jobs) {
            const apps = await api.get(`/applications/job/${job._id}`);
            if (apps.data.some(app => app._id === interview.applicationId)) {
              jobTitle = job.title;
              break;
            }
          }

          // Get Applicant Name & Email
          const userRes = await api.get(`/auth/users/${interview.applicantId}`);
          
          dataMap[interview._id] = { 
            applicantName: userRes.data.name,
            email: userRes.data.email,
            jobTitle: jobTitle
          };
        } catch (err) {
          dataMap[interview._id] = { applicantName: 'Unknown', email: 'N/A', jobTitle: 'Unavailable' };
        }
      }
      setEnrichedData(dataMap);
    } catch (error) {
      toast.error('Failed to load interviews.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- MODAL HANDLERS ---
  const openScheduleModal = async () => {
    setFormData({ id: '', jobId: '', applicationId: '', applicantId: '', scheduledDate: '', meetingLink: '' });
    setIsScheduleModalOpen(true);
    try {
      const jobsRes = await api.get('/jobs/employer/me');
      setModalJobs(jobsRes.data);
    } catch (error) {
      toast.error('Failed to load jobs.');
    }
  };

  const openUpdateModal = (interview) => {
    // Format the UTC date to local for the input field
    const localDate = new Date(interview.scheduledDate);
    const tzOffset = localDate.getTimezoneOffset() * 60000;
    const localISOString = (new Date(localDate - tzOffset)).toISOString().slice(0, 16);

    setFormData({
      id: interview._id,
      scheduledDate: localISOString,
      meetingLink: interview.meetingLink,
      status: 'Rescheduled' // Auto-update status when changing date/link
    });
    setIsUpdateModalOpen(true);
  };

  const handleJobSelect = async (jobId) => {
    setFormData({ ...formData, jobId, applicationId: '', applicantId: '' });
    if (!jobId) return setModalApps([]);

    try {
      const appRes = await api.get(`/applications/job/${jobId}`);
      const reviewedApps = appRes.data.filter(app => app.status === 'Reviewed' || app.status === 'Pending');
      
      const appsWithNames = await Promise.all(reviewedApps.map(async (app) => {
        try {
          const userRes = await api.get(`/auth/users/${app.applicantId}`);
          return { ...app, applicantName: userRes.data.name };
        } catch (e) {
          return { ...app, applicantName: 'Unknown User' };
        }
      }));
      setModalApps(appsWithNames);
    } catch (error) {
      toast.error('Failed to load applicants.');
    }
  };

  // --- CRUD OPERATIONS ---
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // FIX: Force Javascript to parse the input as a timezone-aware Date before sending to Mongo
      const correctUtcDate = new Date(formData.scheduledDate).toISOString();

      await api.post('/interviews', {
        applicationId: formData.applicationId,
        applicantId: formData.applicantId,
        scheduledDate: correctUtcDate,
        meetingLink: formData.meetingLink
      });
      toast.success('Interview scheduled and email sent!');
      setIsScheduleModalOpen(false);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const correctUtcDate = new Date(formData.scheduledDate).toISOString();
      await api.put(`/interviews/${formData.id}`, {
        scheduledDate: correctUtcDate,
        meetingLink: formData.meetingLink,
        status: 'Rescheduled'
      });
      toast.success('Interview updated successfully!');
      setIsUpdateModalOpen(false);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update interview.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const confirmMsg = newStatus === 'Canceled' 
      ? "Cancel this interview? The application will revert to 'Reviewed'." 
      : `Mark this interview as ${newStatus}?`;
      
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/interviews/${id}`, { status: newStatus });
      toast.success(`Interview marked as ${newStatus}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this interview record completely?')) return;
    try {
      await api.delete(`/interviews/${id}`);
      setInterviews(interviews.filter(inv => inv._id !== id));
      toast.success('Interview deleted.');
    } catch (error) {
      toast.error('Failed to delete.');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm('Delete ALL Canceled and Failed interviews? This cleans your dashboard.')) return;
    try {
      const res = await api.delete('/interviews/bulk/cleanup');
      toast.success(res.data.message);
      fetchDashboardData();
    } catch (error) {
      toast.error('Bulk cleanup failed.');
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Interview Management</h1>
          <p className="text-slate-500">Schedule calls, evaluate candidates, and manage timelines.</p>
        </div>
        <div className="flex gap-3">
          {interviews.some(i => ['Canceled', 'Failed'].includes(i.status)) && (
            <button onClick={handleBulkDelete} className="flex items-center text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-3 rounded-xl transition">
              <Trash2 className="w-4 h-4 mr-2" /> Clean Closed
            </button>
          )}
          <button onClick={openScheduleModal} className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
            <PlusCircle className="w-5 h-5 mr-2" /> Schedule New
          </button>
        </div>
      </div>

      {/* Interviews Grid */}
      {interviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-800">No interviews scheduled</h3>
          <p className="text-slate-500 mt-2">Click "Schedule New" to set up a meeting with a candidate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {interviews.map((interview) => {
            const data = enrichedData[interview._id] || { applicantName: 'Loading...', jobTitle: 'Loading...' };
            const interviewDate = new Date(interview.scheduledDate);
            const isActive = ['Scheduled', 'Rescheduled'].includes(interview.status);

            return (
              <div key={interview._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition">
                
                {/* Status & Delete */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    interview.status === 'Passed' ? 'bg-green-100 text-green-700' :
                    interview.status === 'Failed' || interview.status === 'Canceled' ? 'bg-red-100 text-red-700' :
                    interview.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {interview.status}
                  </span>
                  
                  <button onClick={() => handleDelete(interview._id)} className="text-slate-400 hover:text-red-500 transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Candidate & Job Info */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-slate-100 p-4 rounded-full"><User className="w-6 h-6 text-slate-600"/></div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{data.applicantName}</h3>
                    <p className="text-sm text-slate-500 font-medium mb-1">{data.email}</p>
                    <p className="text-xs font-bold text-indigo-600 flex items-center bg-indigo-50 inline-flex px-2 py-0.5 rounded">
                      <Briefcase className="w-3 h-3 mr-1" /> {data.jobTitle}
                    </p>
                  </div>
                </div>

                {/* Time & Link */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3 border border-slate-100 flex-1">
                  <div className="flex items-center text-slate-700 font-semibold">
                    <Calendar className="w-5 h-5 mr-3 text-slate-400" />
                    {interviewDate.toLocaleDateString()} at {interviewDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="flex items-center text-indigo-600 font-semibold">
                    <Video className="w-5 h-5 mr-3 text-indigo-400" />
                    <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="hover:underline line-clamp-1">
                      {interview.meetingLink}
                    </a>
                  </div>
                </div>

                {/* Action Buttons based on Status */}
                <div className="mt-auto pt-4 border-t border-slate-100">
                  {isActive && (
                    <div className="flex gap-2">
                      <button onClick={() => handleStatusUpdate(interview._id, 'Completed')} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-2.5 rounded-lg flex items-center justify-center transition">
                         Mark Completed
                      </button>
                      <button onClick={() => openUpdateModal(interview)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-lg flex items-center justify-center transition border border-slate-200">
                        <Edit2 className="w-4 h-4 mr-2" /> Edit/Reschedule
                      </button>
                      <button onClick={() => handleStatusUpdate(interview._id, 'Canceled')} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2.5 rounded-lg transition">
                        Cancel
                      </button>
                    </div>
                  )}

                  {interview.status === 'Completed' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleStatusUpdate(interview._id, 'Passed')} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg flex items-center justify-center transition">
                        <CheckCircle className="w-4 h-4 mr-2" /> Pass Candidate
                      </button>
                      <button onClick={() => handleStatusUpdate(interview._id, 'Failed')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2.5 rounded-lg flex items-center justify-center transition border border-red-200">
                        <XCircle className="w-4 h-4 mr-2" /> Fail
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================== */}
      {/* SCHEDULE MODAL */}
      {/* ========================================== */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Schedule Interview</h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-red-500 transition"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Job</label>
                <select required value={formData.jobId} onChange={(e) => handleJobSelect(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Choose a Job --</option>
                  {modalJobs.map(job => <option key={job._id} value={job._id}>{job.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Applicant (Pending/Reviewed)</label>
                <select required disabled={!formData.jobId || modalApps.length === 0} value={formData.applicationId} onChange={(e) => {
                    const app = modalApps.find(a => a._id === e.target.value);
                    setFormData({ ...formData, applicationId: e.target.value, applicantId: app?.applicantId });
                  }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">-- Choose Candidate --</option>
                  {modalApps.map(app => <option key={app._id} value={app._id}>{app.applicantName} ({app.status})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Date & Time</label>
                {/* FIX: Set minimum allowed time to current local time to prevent past booking */}
                <input type="datetime-local" required min={getLocalMinDateTime()} value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Meeting Link</label>
                <input type="url" required placeholder="https://zoom.us/j/..." value={formData.meetingLink} onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isProcessing} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">{isProcessing ? 'Saving...' : 'Confirm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* UPDATE/RESCHEDULE MODAL */}
      {/* ========================================== */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Reschedule / Update Link</h3>
              <button onClick={() => setIsUpdateModalOpen(false)} className="text-slate-400 hover:text-red-500 transition"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">New Date & Time</label>
                <input type="datetime-local" required min={getLocalMinDateTime()} value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">New Meeting Link</label>
                <input type="url" required value={formData.meetingLink} onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isProcessing} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">{isProcessing ? 'Updating...' : 'Save Updates'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}