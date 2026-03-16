import { useState, useEffect } from 'react';
import { 
  FileText, Briefcase, Mail, User as UserIcon, 
  ExternalLink, Trash2, CheckCircle, Clock, XCircle, Building
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function EmployerApplications() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  
  const [applications, setApplications] = useState([]);
  const [applicantsData, setApplicantsData] = useState({});
  
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs/employer/me');
        setJobs(response.data);
        if (response.data.length > 0) {
          setSelectedJobId(response.data[0]._id);
        }
      } catch (error) {
        toast.error('Failed to load your jobs.');
      } finally {
        setIsLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;

    const fetchAppsAndUsers = async () => {
      setIsLoadingApps(true);
      try {
        const appRes = await api.get(`/applications/job/${selectedJobId}`);
        const fetchedApps = appRes.data;
        setApplications(fetchedApps);

        const uniqueUserIds = [...new Set(fetchedApps.map(app => app.applicantId))];
        const usersDataMap = { ...applicantsData };
        
        await Promise.all(uniqueUserIds.map(async (id) => {
          if (!usersDataMap[id]) {
            try {
              const userRes = await api.get(`/auth/users/${id}`);
              usersDataMap[id] = userRes.data;
            } catch (err) {
              usersDataMap[id] = { name: 'Unknown Applicant', email: 'N/A' };
            }
          }
        }));
        
        setApplicantsData(usersDataMap);
      } catch (error) {
        toast.error('Failed to load applications.');
      } finally {
        setIsLoadingApps(false);
      }
    };

    fetchAppsAndUsers();
  }, [selectedJobId]);

  const handleStatusUpdate = async (appId, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await api.put(`/applications/${appId}/status`, { status: newStatus });
      setApplications(applications.map(app => 
        app._id === appId ? { ...app, status: response.data.status } : app
      ));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    const isConfirmed = window.confirm('Are you sure you want to permanently delete all Rejected and Closed applications for this job?');
    if (!isConfirmed) return;

    try {
      const response = await api.delete('/applications/bulk', {
        data: { 
          jobId: selectedJobId, 
          status: ['Rejected', 'Closed'] 
        }
      });
      setApplications(applications.filter(app => !['Rejected', 'Closed'].includes(app.status)));
      toast.success(response.data.message || 'Applications cleaned up successfully.');
    } catch (error) {
      toast.error('Failed to bulk delete applications.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Reviewed': return 'bg-blue-100 text-blue-800';
      case 'Interview Scheduled': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Closed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  if (isLoadingJobs) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Review Applications</h1>
            <p className="text-slate-500">Select a job posting to view its candidates and resumes.</p>
          </div>
          
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-indigo-500" /> Select Job Posting
            </label>
            <select 
              value={selectedJobId} 
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-700 cursor-pointer"
            >
              {jobs.length === 0 ? <option value="">No jobs posted yet</option> : null}
              {jobs.map(job => (
                <option key={job._id} value={job._id}>{job.title} ({job.location})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {applications.length > 0 && (
        <div className="flex justify-between items-center px-2">
          <p className="font-bold text-slate-700">
            Total Applicants: <span className="text-indigo-600">{applications.length}</span>
          </p>
          <button onClick={handleBulkDelete} className="flex items-center text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition">
            <Trash2 className="w-4 h-4 mr-2" /> Clean Up Rejected
          </button>
        </div>
      )}

      <div className="space-y-4">
        {isLoadingApps ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <h3 className="text-xl font-bold text-slate-800">You need to post a job first!</h3>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No applications yet</h3>
            <p className="text-slate-500 mt-2">Candidates haven't applied to this position yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((app) => {
              const applicant = applicantsData[app.applicantId] || { name: 'Loading...', email: 'Loading...' };
              const isClosed = app.status === 'Closed';

              return (
                <div key={app._id} className={`bg-white rounded-2xl shadow-sm border ${isClosed ? 'border-slate-300 opacity-80' : 'border-slate-200'} p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition`}>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center">
                          <UserIcon className="w-5 h-5 mr-2 text-indigo-500" /> {applicant.name}
                        </h3>
                        <p className="text-slate-500 font-medium flex items-center mt-1">
                          <Mail className="w-4 h-4 mr-2" /> {applicant.email}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>

                    {app.coverLetter && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-32 overflow-y-auto">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cover Letter</p>
                        <p className="text-sm text-slate-600 italic">"{app.coverLetter}"</p>
                      </div>
                    )}
                    
                    <p className="text-xs text-slate-400 font-medium flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    
                    <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded-xl hover:bg-indigo-100 transition">
                      <ExternalLink className="w-4 h-4 mr-2" /> View Resume
                    </a>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Update Status</label>
                      {/* FIX: Select is completely disabled if the app is Closed, and "Closed" is added back to options */}
                      <select 
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                        disabled={isUpdating || isClosed}
                        className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold transition ${isClosed ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-200 cursor-pointer disabled:opacity-50'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Interview Scheduled" disabled>Interview Scheduled (Auto)</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Closed" disabled>Closed (Auto)</option>
                      </select>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}