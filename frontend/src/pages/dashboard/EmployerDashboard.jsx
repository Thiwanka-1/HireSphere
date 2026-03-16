import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, FileText, Calendar, Users, 
  TrendingUp, ChevronRight, Activity, Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard Metrics
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    upcomingInterviews: 0
  });
  
  const [recentJobs, setRecentJobs] = useState([]);
  const [upcomingInterviewsList, setUpcomingInterviewsList] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch Employer's Jobs
        const jobsRes = await api.get('/jobs/employer/me');
        const jobs = jobsRes.data;
        
        // 2. Fetch Employer's Interviews
        const intRes = await api.get('/interviews/employer');
        const interviews = intRes.data;

        // 3. Calculate Total Applications (Fetch apps for each job)
        let totalAppsCount = 0;
        await Promise.all(jobs.map(async (job) => {
          try {
            const appRes = await api.get(`/applications/job/${job._id}`);
            totalAppsCount += appRes.data.length;
          } catch (e) {
            console.error("Failed to fetch apps for job", job._id);
          }
        }));

        // 4. Filter Upcoming Interviews
        const upcoming = interviews.filter(i => 
          i.status === 'Scheduled' && new Date(i.scheduledDate) > new Date()
        );

        // Set State
        setStats({
          activeJobs: jobs.length,
          totalApplications: totalAppsCount,
          upcomingInterviews: upcoming.length
        });

        // Grab the 3 most recent jobs for the quick-view list
        setRecentJobs(jobs.slice(0, 3));
        
        // Grab the next 3 upcoming interviews, sorted by date
        setUpcomingInterviewsList(
          upcoming.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)).slice(0, 3)
        );

      } catch (error) {
        toast.error("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">
            Welcome back, {user?.name || 'Employer'}! 👋
          </h1>
          <p className="text-indigo-200 font-medium text-lg max-w-2xl">
            Here is what's happening with your job postings and candidates today.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center hover:shadow-md transition">
          <div className="bg-indigo-50 p-4 rounded-2xl mr-5">
            <Briefcase className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Active Jobs</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.activeJobs}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center hover:shadow-md transition">
          <div className="bg-green-50 p-4 rounded-2xl mr-5">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Applicants</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.totalApplications}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center hover:shadow-md transition">
          <div className="bg-amber-50 p-4 rounded-2xl mr-5">
            <Calendar className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Upcoming Interviews</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.upcomingInterviews}</h3>
          </div>
        </div>
      </div>

      {/* Quick View Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Jobs Panel */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 sm:px-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-500" /> Recent Postings
            </h2>
            <Link to="/my-jobs" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-6 sm:p-8 flex-1">
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 font-medium mb-4">You haven't posted any jobs yet.</p>
                <Link to="/jobs/create" className="bg-indigo-50 text-indigo-700 font-bold px-6 py-2 rounded-xl hover:bg-indigo-100 transition">Post a Job</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map(job => (
                  <div key={job._id} className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                    <div>
                      <h4 className="font-bold text-slate-800">{job.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">{job.location} • {job.jobType}</p>
                    </div>
                    <Link to={`/jobs/edit/${job._id}`} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition">
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Interviews Panel */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 sm:px-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-amber-500" /> Next Interviews
            </h2>
            <Link to="/interviews" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center">
              Schedule <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-6 sm:p-8 flex-1">
            {upcomingInterviewsList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 font-medium mb-4">Your calendar is currently clear.</p>
                <Link to="/interviews" className="bg-amber-50 text-amber-700 font-bold px-6 py-2 rounded-xl hover:bg-amber-100 transition">View Calendar</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingInterviewsList.map(interview => {
                  const date = new Date(interview.scheduledDate);
                  return (
                    <div key={interview._id} className="flex items-center p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                      <div className="bg-indigo-50 text-indigo-700 w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold mr-4 shrink-0">
                        <span className="text-xs uppercase">{date.toLocaleString('en-US', { month: 'short' })}</span>
                        <span className="text-lg leading-none mt-0.5">{date.getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800">Video Interview</h4>
                        <p className="text-sm text-slate-500 font-medium mt-0.5 flex items-center">
                          <Clock className="w-3 h-3 mr-1"/> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-100">
                        Join
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}