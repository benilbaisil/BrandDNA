import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Camera,
  ShieldCheck,
  Save,
  Check,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminProfilePage = () => {
  const { user, updateProfile, loading } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || 'System Administrator',
    email: user?.email || 'admin@branddna.ai',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
    };
    if (formData.newPassword.trim()) {
      payload.password = formData.newPassword;
    }

    const success = await updateProfile(payload);
    if (success) {
      setFormData((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 text-left">
      
      {/* Header */}
      <div>
        <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
          System Access Credentials
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F291E] tracking-tight mt-1">
          Admin Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your administrator account details, email address, and security password.
        </p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        
        {/* Profile Card */}
        <div className="p-6 rounded-2xl glass-panel border border-[#E5E0D8] shadow-2xs space-y-6">
          
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#0F291E] text-white font-black text-xl flex items-center justify-center shadow-md">
                {(user?.fullName || 'A')[0].toUpperCase()}
              </div>
              <button
                type="button"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-blue-600 text-white shadow-xs hover:bg-blue-700 transition-colors"
                title="Upload Profile Image"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F291E]">{user?.fullName || formData.fullName}</h3>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-mono text-[10px] font-bold">
                Platform Root Administrator
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Administrator Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none focus:border-slate-900 focus:glass-panel"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none focus:border-slate-900 focus:glass-panel"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Security Password (Optional)</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none focus:border-slate-900 focus:glass-panel"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#0F291E] rounded-xl px-3.5 py-2.5 outline-none focus:border-slate-900 focus:glass-panel"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F291E] text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-white" />
                  <span>Update Profile Info</span>
                </>
              )}
            </button>
          </div>

        </div>

      </form>

    </div>
  );
};

