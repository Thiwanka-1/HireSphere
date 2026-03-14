import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, DollarSign, Clock, Building } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and Filter State
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: ''
  });

  // Fetch jobs whenever filters change
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        // Axios automatically converts the params object into a query string: ?search=...&location=...
        const response = await api.get('/jobs', { params: filters });
        setJobs(response.data);
      } catch (error) {
        toast.error('Failed to load job listings.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a slight debounce so we don't spam the backend on every single keystroke
    const delayDebounceFn = setTimeout(() => {
      fetchJobs();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Search Bar Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Discover Your Next Opportunity</h1>
        <p className="text-slate-500 mb-6">Browse through hundreds of job openings from top companies.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" name="search" value={filters.search} onChange={handleFilterChange}
              placeholder="Job title or keyword" 
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 transition"
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" name="location" value={filters.location} onChange={handleFilterChange}
              placeholder="City, state, or 'Remote'" 
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 transition"
            />
          </div>

          {/* Job Type Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-slate-400" />
            </div>
            <select 
              name="jobType" value={filters.jobType} onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 transition appearance-none"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Postings Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No jobs found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search filters to find what you are looking for.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow group flex flex-col h-full">
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 p-3 rounded-xl">
                    <Building className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                    {job.jobType}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium mt-1 mb-4 line-clamp-1">
                  {job.companyName || 'HireSphere Partner'}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" /> {job.location}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <DollarSign className="w-4 h-4 mr-2 text-slate-400" /> 
                    {job.salaryRange && job.salaryRange !== 'Not specified' ? `$${job.salaryRange}` : 'Salary undisclosed'}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" /> 
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Action Button locked to bottom */}
              <div className="pt-4 border-t border-slate-100 mt-auto">
                <Link 
                  to={`/jobs/${job._id}`} 
                  className="block w-full text-center bg-white border-2 border-indigo-100 text-indigo-600 font-bold py-2.5 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition"
                >
                  View Details
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}