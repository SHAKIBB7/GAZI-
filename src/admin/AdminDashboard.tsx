import React from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { AdminLogin } from './components/AdminLogin';
import { AdminLayout } from './components/AdminLayout';

interface AdminDashboardProps {
  onReturnToStore: () => void;
}

const AdminPortalContent: React.FC<AdminDashboardProps> = ({ onReturnToStore }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ccff00] text-black font-black font-mono flex items-center justify-center text-xl animate-pulse mb-4">
          GZ
        </div>
        <div className="text-sm font-bold uppercase tracking-widest text-neutral-400">
          Verifying administrative credentials...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onBackToStore={onReturnToStore} />;
  }

  return <AdminLayout onReturnToStore={onReturnToStore} />;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  return (
    <AdminAuthProvider>
      <AdminPortalContent {...props} />
    </AdminAuthProvider>
  );
};
