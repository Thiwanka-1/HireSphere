import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Building, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function SeekerInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [enrichedData, setEnrichedData] = useState({}); // Stores { interviewId: { jobTitle, companyName } }
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeekerInterviews = async () => {
      try {
        // Step A: Fetch seeker's interviews
        const intRes = await api.get('/interviews/seeker');
        const fetchedInterviews = intRes.data;
        setInterviews(fetchedInterviews);

        if (fetchedInterviews.length === 0) {
          setIsLoading(false);
          return;
        }

        // Step B & C: Fetch Applications to find Job IDs, then fetch Job Details
        const appRes = await api.get('/applications/seeker');
        const userApplications = appRes.data;
        
        const dataMap = {};
        for (const interview of fetchedInterviews) {
          // Find the matching application to get the jobId
          const matchedApp = userApplications.find(app => app._id === interview.applicationId);
          
          if (matchedApp) {
            try {
              // Fetch the specific Job Details
              const jobRes = await api.get(`/jobs/${matchedApp.jobId}`);
              dataMap[interview._id] = {
                jobTitle: jobRes.data.title,
                companyName: jobRes.data.companyName
              };
            } catch (err) {
              dataMap[interview._id] = { jobTitle: 'Job Unavailable', companyName: 'Unknown' };
            }
          } else {
            dataMap[interview._id] = { jobTitle: 'Application Not Found', companyName: 'Unknown' };
          }
        }
        
        setEnrichedData(dataMap);
      } catch (error) {
        toast.error('Failed to load your interviews.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeekerInterviews();
  }, []);

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Stunning Futuristic Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight flex items-center">
            <Video className="w-8 h-8 mr-3 opacity-90" /> My Interviews
          </h1>
          <p className="text-indigo-100 font-medium text-lg">Your upcoming video calls and past meeting history.</p>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
          <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-12 h-12 text-indigo-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">No interviews yet</h3>
          <p className="text-slate-500 max-w-md mx-auto">Keep applying! When an employer wants to meet you, your scheduled video calls will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {interviews.map((interview) => {
            const data = enrichedData[interview._id] || { jobTitle: 'Loading...', companyName: 'Loading...' };
            const interviewDate = new Date(interview.scheduledDate);
            const isPast = interviewDate < new Date();
            const isActive = (interview.status === 'Scheduled' || interview.status === 'Rescheduled') && !isPast;
            return (
              <div key={interview._id} className={`bg-white rounded-3xl p-8 border-2 relative overflow-hidden transition-all ${isActive ? 'border-indigo-400 shadow-xl shadow-indigo-100' : 'border-slate-100 shadow-sm opacity-80'}`}>
                
                {/* Visual Status Indicator */}
                {isActive && <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>}
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 ${
                  (interview.status === 'Scheduled' || interview.status === 'Rescheduled') && !isPast ? 'bg-indigo-100 text-indigo-700' :
                  interview.status === 'Passed' ? 'bg-green-100 text-green-700' :
                  interview.status === 'Failed' ? 'bg-red-100 text-red-700' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {isPast && (interview.status === 'Scheduled' || interview.status === 'Rescheduled') ? 'Meeting Ended' : interview.status}
                </span>
                    <h3 className="text-2xl font-bold text-slate-800 line-clamp-1">{data.jobTitle}</h3>
                    <p className="text-slate-500 font-bold flex items-center mt-1">
                      <Building className="w-4 h-4 mr-1.5 text-indigo-400" /> {data.companyName}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-slate-700 font-semibold bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <Calendar className="w-6 h-6 mr-3 text-indigo-500" />
                    <div>
                      <p className="text-sm text-slate-400 uppercase tracking-widest text-[10px]">Date & Time</p>
                      <p>{interviewDate.toLocaleDateString()} at {interviewDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                </div>

                {/* Call to Action Button */}
                {isActive ? (
                  <a 
                    href={interview.meetingLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-indigo-200 hover:-translate-y-1"
                  >
                    <Video className="w-5 h-5 mr-2" /> Join Video Call
                  </a>
                ) : (
                  <div className="w-full flex justify-center items-center bg-slate-50 border-2 border-slate-100 text-slate-400 font-bold py-4 rounded-xl cursor-not-allowed">
                    {interview.status === 'Passed' ? 'Congratulations! You passed.' : 
                     interview.status === 'Failed' ? 'The employer has closed this application.' : 
                     'Meeting link inactive'}
                  </div>
                )}
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}