import React from 'react';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';
import { useAuth } from '../contexts/AuthContext';

const AdminPage: React.FC = () => {
  const { currentUser } = useAuth();
  const isStaff = currentUser?.role === 'department_head' || currentUser?.role === 'lecturer';

  if (isStaff) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen">
      <AdminLogin />
    </div>
  );
};

export default AdminPage;
