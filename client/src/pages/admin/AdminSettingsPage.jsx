import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Mail,
  Building2
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem('branddna_admin_settings');
    return saved
      ? JSON.parse(saved)
      : {
          appName: 'BrandDNA AI',
          contactEmail: 'admin@branddna.ai',
        };
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSettings();
      if (res && res.data) {
        setAppSettings(res.data);
        localStorage.setItem('branddna_admin_settings', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Failed to load settings from DB:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await adminService.updateSettings(appSettings);
      if (res && res.data) {
        setAppSettings(res.data);
        localStorage.setItem('branddna_admin_settings', JSON.stringify(res.data));
      } else {
        localStorage.setItem('branddna_admin_settings', JSON.stringify(appSettings));
      }
      addToast('Platform settings saved successfully!', 'success');
    } catch (err) {
      localStorage.setItem('branddna_admin_settings', JSON.stringify(appSettings));
      addToast('Platform settings saved locally.', 'info');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-left">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D6E6EC] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-sans font-bold uppercase tracking-wider">
            Platform Configuration
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-slate-900 tracking-tight mt-2">
            Admin System Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure application branding and system support credentials.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving || loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 text-white animate-spin" /> : <Save className="w-4 h-4 text-white" />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Application Settings */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#D6E6EC] shadow-2xs space-y-6">
          <div className="flex items-center gap-3 border-b border-[#D6E6EC] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF4F7] text-slate-900 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Application Settings</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage platform name and official support contact email.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-500" /> Application Name
              </label>
              <input
                type="text"
                value={appSettings.appName || ''}
                onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                placeholder="BrandDNA AI"
                className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white text-xs font-bold text-slate-900 rounded-xl px-4 py-3 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> System Support Email
              </label>
              <input
                type="email"
                value={appSettings.contactEmail || ''}
                onChange={(e) => setAppSettings({ ...appSettings, contactEmail: e.target.value })}
                placeholder="admin@branddna.ai"
                className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white text-xs font-bold text-slate-900 rounded-xl px-4 py-3 outline-none transition-all"
              />
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
