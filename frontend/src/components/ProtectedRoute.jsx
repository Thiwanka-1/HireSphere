import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // 1. If not logged in, kick them to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If the route requires specific roles (like Admin-only) and they don't match, kick them to home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 3. If they pass the checks, render the page!
  return children;
}