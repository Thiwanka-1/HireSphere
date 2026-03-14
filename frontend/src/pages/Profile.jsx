import { useAuth } from '../context/AuthContext';
import SeekerProfile from './SeekerProfile';
import EmployerProfile from './EmployerProfile';

export default function Profile() {
  const { user } = useAuth();

  // Automatically serve the correct UI based on the user's role!
  if (user?.role === 'employer') {
    return <EmployerProfile />;
  }
  
  return <SeekerProfile />;
}