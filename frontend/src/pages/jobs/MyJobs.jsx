import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Edit2, Trash2, PlusCircle, Building } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const response = await api.get('/jobs/employer/me');
        setJobs(response.data);
      } catch (error) {
        toast.error('Failed to load your jobs.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyJobs();
  }, []);

  const handleDelete = async (id, title) => {
    const isConfirmed = window.confirm(`Are you sure you want to permanently delete "${title}"?`);
    if (!isConfirmed) return;

    try {
      await api.delete(`/jobs/${id}`);
      setJobs(jobs.filter(job => job._id !== id)); // Remove from UI
      toast.success('Job deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete job.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">My Job Postings</h1>
          <p className="text-slate-500">Manage your active listings and update requirements.</p>
        </div>
        <Link to="/jobs/create" className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
          <PlusCircle className="w-5 h-5 mr-2" /> Post New Job
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">You haven't posted any jobs yet</h3>
          <p className="text-slate-500 mt-2 mb-6">Create your first job listing to start receiving applications.</p>
          <Link to="/jobs/create" className="text-indigo-600 font-bold hover:underline">Post a Job &rarr;</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 p-3 rounded-xl"><Building className="w-6 h-6 text-indigo-600" /></div>
                  <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full">{job.jobType}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{job.title}</h3>
                <div className="flex items-center text-sm text-slate-600 mt-3 mb-6">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" /> {job.location}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <Link to={`/jobs/edit/${job._id}`} className="flex-1 flex justify-center items-center bg-indigo-50 text-indigo-700 font-bold py-2.5 rounded-xl hover:bg-indigo-100 transition">
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Link>
                <button onClick={() => handleDelete(job._id, job.title)} className="flex justify-center items-center bg-red-50 text-red-600 font-bold py-2.5 px-4 rounded-xl hover:bg-red-100 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}