import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import HeadDashboard from './HeadDashboard';
import LecturerDashboard from './LecturerDashboard';

interface AdminDashboardProps {
  onLogout?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { isHead, isLecturer } = useAuth();

  // Route to appropriate dashboard based on role
  if (isHead) {
    return <HeadDashboard onLogout={onLogout} />;
  }

  if (isLecturer) {
    return <LecturerDashboard onLogout={onLogout} />;
  }

  // Fallback for unauthorized access
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this dashboard.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
