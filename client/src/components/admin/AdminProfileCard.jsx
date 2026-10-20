import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { User, Lock, Save, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminProfileCard = () => {
  const { addToast } = useToast();
  const [name, setName] = useState('System Administrator');
  const [email, setEmail] = useState('admin@branddna.ai');

  const handleUpdate = (e) => {
    e.preventDefault();
    addToast('Admin profile updated successfully!', 'success');
  };

  return (
    <Card hoverEffect className="text-left border-[#E5E0D8]/90 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#0F291E] text-white flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F291E] leading-tight">Admin Profile & Security</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Manage Administrator Credentials</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={User}
          />
          <Input
            label="Admin Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <h4 className="font-bold text-[#0F291E] mb-3 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-600" />
            Change Admin Password
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" size="md" icon={Save}>
            Update Admin Profile
          </Button>
        </div>
      </form>
    </Card>
  );
};

