import { useAuth } from '../../context/AuthContext';
import EmployerInterviews from './EmployerInterviews';
import SeekerInterviews from './SeekerInterviews';

export default function Interviews() {
  const { user } = useAuth();

  if (user?.role === 'employer') {
    return <EmployerInterviews />;
  }
  
  return <SeekerInterviews />;
}