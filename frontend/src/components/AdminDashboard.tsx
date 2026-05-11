import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HeadDashboard from './HeadDashboard';
import LecturerDashboard from './LecturerDashboard';

interface AdminDashboardProps {
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { isHead, isLecturer, currentUser, isAuthenticated } = useAuth();

  // Route to appropriate dashboard based on role
  if (isHead) {
    return <HeadDashboard onLogout={onLogout} />;
  }

  if (isLecturer) {
    return <LecturerDashboard onLogout={onLogout} />;
  }

  if (currentUser?.role === 'student') {
    return <Navigate to="/home" replace />;
  }

  // Authenticated but unknown role, or session mismatch
  if (isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don&apos;t have permission to access this dashboard.</p>
        <a href="/login" className="text-primary-600 font-medium hover:underline">Go to login</a>
      </div>
    </div>
  );
};

export default AdminDashboard;
