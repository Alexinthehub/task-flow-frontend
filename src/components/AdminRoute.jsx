// src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  // If user is not logged in or not staff, redirect to dashboard
  if (!user || !user.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;