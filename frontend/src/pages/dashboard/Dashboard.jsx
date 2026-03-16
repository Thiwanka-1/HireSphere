import { useAuth } from '../../context/AuthContext';
import EmployerDashboard from './EmployerDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'employer') {
    return <EmployerDashboard />;
  }
  
  if (user?.role === 'admin') {
    return <div className="p-10 text-center font-bold">Admin Dashboard Coming Soon...</div>;
  }

  // Seekers will eventually see the Home Page here, or their own dashboard
  return <div className="p-10 text-center font-bold">Seeker Home Page Coming Soon...</div>;
}