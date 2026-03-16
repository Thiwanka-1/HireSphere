import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; // <-- IMPORT THIS
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

import CreateJob from './pages/jobs/CreateJob';
import JobListings from './pages/jobs/JobListings';
import JobDetails from './pages/jobs/JobDetails';
import MyJobs from './pages/jobs/MyJobs';
import EditJob from './pages/jobs/EditJob';

import Applications from './pages/applications/Applications';
import Interviews from './pages/interviews/Interviews';
import ManageJobs from './pages/admin/ManageJobs';
import Dashboard from './pages/dashboard/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import CreateAdmin from './pages/admin/CreateAdmin';
export default function App() {
  const { loading } = useAuth();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000, className: 'font-sans font-medium' }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> 

        {/* ALL ROUTES INSIDE HERE REQUIRE THE USER TO BE LOGGED IN */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/jobs/create" element={
        <ProtectedRoute allowedRoles={['employer', 'admin']}>
          <Layout><CreateJob /></Layout>
        </ProtectedRoute>
      } />
        <Route path="/jobs" element={
          <ProtectedRoute>
            <Layout><JobListings /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/jobs/:id" element={
          <ProtectedRoute>
            <Layout><JobDetails /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/my-jobs" element={
          <ProtectedRoute allowedRoles={['employer', 'admin']}>
            <Layout><MyJobs /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/jobs/edit/:id" element={
          <ProtectedRoute allowedRoles={['employer', 'admin']}>
            <Layout><EditJob /></Layout>
          </ProtectedRoute>
        } />
        {/* ADMIN ROUTES */}
        <Route path="/admin/jobs" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><ManageJobs /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/applications" element={
          <ProtectedRoute>
            <Layout><Applications /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/interviews" element={
          <ProtectedRoute>
            <Layout><Interviews /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/dash" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
      <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><ManageUsers /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/create" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout><CreateAdmin /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}