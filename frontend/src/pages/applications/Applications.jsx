import { useAuth } from '../../context/AuthContext';
import EmployerApplications from './EmployerApplications';
import SeekerApplications from './SeekerApplications'; // <-- Uncommented this!

export default function Applications() {
  const { user } = useAuth();

  // If the user is an employer, show their dashboard
  if (user?.role === 'employer') {
    return <EmployerApplications />;
  }
  
  // If the user is a seeker (or admin checking things out), show the seeker dashboard
  return <SeekerApplications />;
}