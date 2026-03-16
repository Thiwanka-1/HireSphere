import { useState, useEffect } from 'react';
import { 
  Building, MapPin, Clock, ExternalLink, Trash2, 
  CheckCircle, CircleDashed, Activity, AlertCircle, FileText
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function SeekerApplications() {
  const [applications, setApplications] = useState([]);
  const [jobsData, setJobsData] = useState({}); // Stores { jobId: { title, companyName, location } }
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationsAndJobs = async () => {
      try {
        // 1. Fetch the user's applications
        const appRes = await api.get('/applications/seeker');
        const apps = appRes.data;
        setApplications(apps);

        // 2. Microservice Integration: Fetch Job Details for each application
        const uniqueJobIds = [...new Set(apps.map(app => app.jobId))];
        const jobsMap = {};

        await Promise.all(uniqueJobIds.map(async (jobId) => {
          try {
            const jobRes = await api.get(`/jobs/${jobId}`);
            jobsMap[jobId] = jobRes.data;
          } catch (error) {
            // If the employer deleted the job after the user applied
            jobsMap[jobId] = { title: 'Job Unavailable', companyName: 'Unknown Company', location: 'N/A', _deleted: true };
          }
        }));

        setJobsData(jobsMap);
      } catch (error) {
        toast.error('Failed to load your applications.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationsAndJobs();
  }, []);

  const handleWithdraw = async (appId, jobTitle) => {
    const isConfirmed = window.confirm(`Are you sure you want to withdraw your application for "${jobTitle}"? This will delete your submitted resume.`);
    if (!isConfirmed) return;

    try {
      await api.delete(`/applications/${appId}`);
      setApplications(applications.filter(app => app._id !== appId));
      toast.success('Application withdrawn successfully.');
    } catch (error) {
      toast.error('Failed to withdraw application.');
    }
  };

  // Helper function to render a non-linear, futuristic status pipeline
  const renderStatusPipeline = (status) => {
    const stages = ['Pending', 'Reviewed', 'Interview Scheduled', 'Final'];
    
    return (
      <div className="flex items-center w-full max-w-md mt-4 sm:mt-0">
        {stages.map((stage, index) => {
          let isCompleted = false;
          let isCurrent = false;
          let isRejected = false;
          let isClosed = false;

          // Non-linear logic based on the specific application status
          if (status === 'Pending') {
              if (index === 0) isCurrent = true;
          } else if (status === 'Reviewed') {
              if (index === 0) isCompleted = true;
              if (index === 1) isCurrent = true;
          } else if (status === 'Interview Scheduled') {
              if (index <= 1) isCompleted = true;
              if (index === 2) isCurrent = true;
          } else if (status === 'Rejected') {
              // If rejected, ONLY Pending is considered completed. Intervening are skipped.
              if (index === 0) isCompleted = true;
              if (index === 3) { isCurrent = true; isRejected = true; }
          } else if (status === 'Closed') {
              // Closed implies all prior stages were completed or not applicable.
              if (index <= 2) isCompleted = true;
              if (index === 3) { isCurrent = true; isClosed = true; }
          }

          let colorClass = "text-slate-300";
          let bgClass = "bg-slate-200";
          
          if (isCompleted) {
            colorClass = "text-indigo-600";
            bgClass = "bg-indigo-600";
          } else if (isCurrent) {
            colorClass = isRejected ? "text-red-500" : (isClosed ? "text-slate-600" : "text-indigo-600");
            bgClass = isRejected ? "bg-red-500" : (isClosed ? "bg-slate-500" : "bg-indigo-600 animate-pulse");
          }

          return (
            <div key={stage} className="flex items-center flex-1 last:flex-none">
              <div className="relative flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isCompleted || isCurrent ? (isRejected ? 'bg-red-100' : (isClosed ? 'bg-slate-100' : 'bg-indigo-100')) : 'bg-slate-100'}`}>
                  {isCompleted ? <CheckCircle className={`w-4 h-4 ${colorClass}`} /> : 
                   isCurrent && isRejected ? <AlertCircle className={`w-4 h-4 ${colorClass}`} /> :
                   isCurrent ? <Activity className={`w-4 h-4 ${colorClass}`} /> : 
                   <CircleDashed className={`w-4 h-4 ${colorClass}`} />}
                </div>
                <span className={`absolute top-8 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${isCurrent ? colorClass : 'text-slate-400'}`}>
                  {isRejected && index === 3 ? 'Rejected' : (status === 'Closed' && index === 3 ? 'Closed' : stage)}
                </span>
              </div>
              {index < stages.length - 1 && (
                <div className={`h-1 w-full mx-2 rounded-full ${bgClass} opacity-50`}></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Dashboard Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-3xl shadow-2xl border border-indigo-900/50 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold mb-2 tracking-tight">My Applications</h1>
            <p className="text-indigo-200 font-medium">Track your job hunt progress and manage submitted resumes.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
              <p className="text-3xl font-black">{applications.length}</p>
              <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mt-1">Total Applied</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
              <p className="text-3xl font-black">{applications.filter(a => a.status === 'Interview Scheduled').length}</p>
              <p className="text-xs font-bold text-green-400 uppercase tracking-widest mt-1">Interviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-indigo-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Your journey starts here</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">You haven't applied to any jobs yet. Browse our job board to find your next big opportunity.</p>
          <a href="/jobs" className="inline-flex items-center bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
            Browse Jobs
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const job = jobsData[app.jobId] || { title: 'Loading...', companyName: 'Loading...' };
            
            return (
              <div key={app._id} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-md transition-shadow relative overflow-hidden group">
                
                {/* Left Accent Border based on status */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  app.status === 'Rejected' ? 'bg-red-500' : 
                  app.status === 'Interview Scheduled' ? 'bg-green-500' : 
                  app.status === 'Closed' ? 'bg-slate-400' : 'bg-indigo-500'
                }`}></div>

                <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-12">
                  
                  {/* Job Details */}
                  <div className="flex-1 w-full pl-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold text-slate-800 line-clamp-1">{job.title}</h3>
                      {job._deleted && <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-4">Job Removed</span>}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-slate-500 font-medium text-sm mb-6">
                      <span className="flex items-center text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-lg">
                        <Building className="w-4 h-4 mr-2" /> {job.companyName}
                      </span>
                      <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {job.location || 'N/A'}</span>
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Status Pipeline */}
                    <div className="pb-8 pt-2">
                      {renderStatusPipeline(app.status)}
                    </div>
                  </div>

                  {/* Actions (Right Side) */}
                  <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-48 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                    <a 
                      href={app.resumeUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-100 transition"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" /> My Resume
                    </a>
                    
                    <button 
                      onClick={() => handleWithdraw(app._id, job.title)}
                      className="flex-1 flex items-center justify-center bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Withdraw
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}