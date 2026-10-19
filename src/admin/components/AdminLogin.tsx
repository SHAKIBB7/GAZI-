import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldAlert, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface AdminLoginProps {
  onBackToStore?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStore }) => {
  const { login, isLoading } = useAdminAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('AdminPassword2026!');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await login(username, password);
    if (!res.success) {
      setError(res.error || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center p-4 selection:bg-[#ccff00] selection:text-black font-sans">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#ccff00] text-black flex items-center justify-center font-black text-2xl font-mono mb-3 shadow-lg shadow-[#ccff00]/10">
            GZ
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase font-mono tracking-tight text-white">
            GAZI CRICKET ENTERPRISE
          </h1>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider font-semibold">
            Administrative Portal & Management Console
          </p>
          <div className="mt-2.5 inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-[11px] text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Dhaka Central Hub • Production V2.0</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start space-x-2.5">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Access Denied</p>
              <p className="text-[11px] text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <User size={16} />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin or admin@gazisports.com"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock size={16} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00] transition-colors"
              />
            </div>
          </div>

          {/* Preset Demo Credentials Box */}
          <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
            <div className="font-bold text-neutral-300 flex items-center space-x-1">
              <CheckCircle size={12} className="text-[#ccff00]" />
              <span>Configured System Credentials:</span>
            </div>
            <div className="flex justify-between">
              <span>Super Admin:</span>
              <code className="text-[#ccff00] font-mono">admin / AdminPassword2026!</code>
            </div>
            <div className="flex justify-between">
              <span>Warehouse Mgr:</span>
              <code className="text-neutral-300 font-mono">inventory / AdminPassword2026!</code>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ccff00] hover:bg-[#b5e600] text-black font-black py-3 rounded-xl uppercase tracking-wider text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-[#ccff00]/10 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>ENTER ADMINISTRATIVE PORTAL</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {onBackToStore && (
          <div className="mt-6 pt-4 border-t border-neutral-800 text-center">
            <button
              onClick={onBackToStore}
              className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Return to Customer Equipment Store
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-neutral-500 flex items-center space-x-2">
        <ShieldAlert size={14} />
        <span>Restricted Access: Authorized cricket administrative personnel only.</span>
      </div>
    </div>
  );
};
