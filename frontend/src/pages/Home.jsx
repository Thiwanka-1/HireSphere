import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Briefcase, Video, ArrowRight, Sparkles, 
  Globe, Zap, CheckCircle2, Star, Calendar, UserCheck, LayoutDashboard 
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="animate-in fade-in duration-700 -mt-8">
      
      {/* ========================================== */}
      {/* HERO SECTION (FUTURISTIC DARK MODE) */}
      {/* ========================================== */}
      <section className="relative bg-[#0b0f19] rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl mt-4 mb-20 pb-24 pt-16">
        
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-cyan-600/20 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 text-center flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-md mb-8">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-slate-300">HireSphere Next-Gen Talent Platform</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-8 leading-tight">
            Where World-Class Talent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500">
              Meets Next-Gen Opportunity.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-12 font-medium leading-relaxed">
            Experience the future of hiring. HireSphere eliminates the friction between applying and interviewing with real-time tracking, seamless scheduling, and integrated video calls.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <Link to="/jobs" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-indigo-600 rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(79,70,229,0.7)]">
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <Search className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" /> Explore Jobs
            </Link>
            
            {/* DYNAMIC BUTTON: Changes based on login status */}
            {user ? (
              <Link to="/profile" className="group inline-flex items-center justify-center px-8 py-4 font-bold text-slate-300 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl transition-all hover:bg-slate-700 hover:text-white">
                <LayoutDashboard className="w-5 h-5 mr-2" /> Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="group inline-flex items-center justify-center px-8 py-4 font-bold text-slate-300 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl transition-all hover:bg-slate-700 hover:text-white hover:border-slate-500">
                <Briefcase className="w-5 h-5 mr-2" /> Join as Employer
              </Link>
            )}
          </div>
        </div>

        {/* Floating UI Elements (Decorative) */}
        <div className="hidden lg:block absolute top-1/4 left-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl transform -rotate-6 animate-bounce" style={{ animationDuration: '4s' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-400"/></div>
            <div>
              <p className="text-white font-bold text-sm">Application Accepted</p>
              <p className="text-slate-400 text-xs">Status updated instantly</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute bottom-1/4 right-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl transform rotate-6 animate-bounce" style={{ animationDuration: '5s' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center"><Video className="w-5 h-5 text-purple-400"/></div>
            <div>
              <p className="text-white font-bold text-sm">Interview Scheduled</p>
              <p className="text-slate-400 text-xs">Calendar synced</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* PLATFORM FEATURES */}
      {/* ========================================== */}
      <section className="py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-slate-800 mb-4">Designed for Speed and Clarity</h2>
          <p className="text-slate-500 text-lg">We took the waiting, wondering, and messy email threads out of the hiring process. Everything you need is in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Real-Time Tracking</h3>
            <p className="text-slate-500 leading-relaxed">
              No more "resume black holes." Candidates get a visual pipeline showing exactly where their application stands—from pending to final offer.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Automated Interviews</h3>
            <p className="text-slate-500 leading-relaxed">
              Employers can schedule video interviews with one click. Automatic email notifications and secure meeting links are dispatched instantly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UserCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Unified Dashboards</h3>
            <p className="text-slate-500 leading-relaxed">
              Whether you are managing 100 job postings or actively seeking a new role, our dedicated portals keep your data beautifully organized.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* QUICK STATS (Visual Break) */}
      {/* ========================================== */}
      <section className="py-12 my-12 bg-indigo-600 rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative z-10 px-8">
          <div>
            <p className="text-5xl font-black mb-2">10k+</p>
            <p className="text-indigo-200 font-bold uppercase tracking-wider text-sm">Active Job Postings</p>
          </div>
          <div className="md:border-x md:border-indigo-500/50 py-4 md:py-0">
            <p className="text-5xl font-black mb-2">50k+</p>
            <p className="text-indigo-200 font-bold uppercase tracking-wider text-sm">Interviews Scheduled</p>
          </div>
          <div>
            <p className="text-5xl font-black mb-2">99%</p>
            <p className="text-indigo-200 font-bold uppercase tracking-wider text-sm">Platform Uptime</p>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* HOW IT WORKS */}
      {/* ========================================== */}
      <section className="py-16 bg-slate-50 rounded-[3rem] border border-slate-200 my-12 px-6 sm:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl font-black text-slate-800 leading-tight">
              A seamless pipeline from <br/><span className="text-indigo-600">Application to Offer.</span>
            </h2>
            <p className="text-lg text-slate-600">
              We connected every stage of the hiring journey. When an employer makes a move, the candidate is notified immediately.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mr-4 shrink-0">1</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">Discover & Apply</h4>
                  <p className="text-slate-500 mt-1">Candidates browse global listings and submit their resumes directly to the employer's dashboard.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mr-4 shrink-0">2</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">Review & Schedule</h4>
                  <p className="text-slate-500 mt-1">Employers review documents and instantly dispatch video interview links to top candidates.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mr-4 shrink-0">3</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">Meet & Hire</h4>
                  <p className="text-slate-500 mt-1">Both parties join the call via their portals. Statuses automatically close when a decision is made.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Collage grid */}
          <div className="flex-1 w-full grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80" alt="Office" className="rounded-3xl shadow-lg w-full h-64 object-cover transform translate-y-8" />
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80" alt="Team" className="rounded-3xl shadow-lg w-full h-64 object-cover" />
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80" alt="Professional" className="rounded-3xl shadow-lg w-full h-64 object-cover col-span-2 mt-4" />
          </div>
          
        </div>
      </section>

      {/* ========================================== */}
      {/* FINAL CTA */}
      {/* ========================================== */}
      <section className="bg-slate-900 rounded-[3rem] p-12 sm:p-20 text-center text-white relative overflow-hidden shadow-2xl mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <h2 className="text-4xl sm:text-5xl font-black mb-6 relative z-10">Ready to transform your career?</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 relative z-10">
          Join thousands of other professionals and employers on the most advanced job portal available today.
        </p>
        
        {user ? (
          <Link to="/profile" className="inline-flex items-center px-8 py-4 font-bold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 relative z-10">
            Access Your Account <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 font-bold text-slate-900 bg-white rounded-2xl hover:bg-slate-100 transition-all shadow-xl">
              Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-slate-800 border border-slate-700 rounded-2xl hover:bg-slate-700 transition-all">
              Sign In
            </Link>
          </div>
        )}
      </section>

    </div>
  );
}