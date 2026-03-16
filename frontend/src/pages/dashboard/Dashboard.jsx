import { useAuth } from '../../context/AuthContext';
import EmployerDashboard from './EmployerDashboard';
import AdminDashboard from './AdminDashboard'; // <-- Import added

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'employer') {
    return <EmployerDashboard />;
  }
  
  if (user?.role === 'admin') {
    return <AdminDashboard />; // <-- Component connected
  }

  // Seekers will eventually see the Home Page here
  return <div className="p-10 text-center font-bold">Seeker Home Page Coming Soon...</div>;
}