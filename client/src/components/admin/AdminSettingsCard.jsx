import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Settings, Save, ShieldCheck, Key, Mail, Cpu, ToggleLeft, ToggleRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsCard = () => {
  const { addToast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [appName, setAppName] = useState('BrandDNA AI');
  const [jwtExpiry, setJwtExpiry] = useState('7d');
  const [aiProvider, setAiProvider] = useState('OpenAI GPT-4o / Claude 3.5');

  const handleSave = (e) => {
    e.preventDefault();
    addToast('System settings saved successfully!', 'success');
  };

  return (
    <Card hoverEffect className="text-left border-slate-200/90 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">System Settings</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Application Config, Security & AI Providers</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Application Name"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
          />

          <Input
            label="JWT Expiration"
            value={jwtExpiry}
            onChange={(e) => setJwtExpiry(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Primary AI Provider"
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value)}
            icon={Cpu}
          />

          <Input
            label="SMTP Email Gateway"
            value="smtp.sendgrid.net (TLS Port 587)"
            icon={Mail}
          />
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Maintenance Mode</p>
              <p className="text-[11px] text-slate-500">Temporarily restrict public access for system upgrades.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setMaintenanceMode(!maintenanceMode);
              addToast(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`, 'info');
            }}
            className="text-slate-700 hover:text-slate-900"
          >
            {maintenanceMode ? (
              <ToggleRight className="w-8 h-8 text-blue-600" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-400" />
            )}
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" size="md" icon={Save}>
            Save Configuration
          </Button>
        </div>

      </form>
    </Card>
  );
};
