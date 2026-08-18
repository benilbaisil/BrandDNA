import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ShieldAlert,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  KeyRound,
  Terminal,
  ShieldCheck,
  Zap,
  Server,
  Activity,
  CheckCircle2,
  AlertOctagon
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid admin email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  twoFactorCode: z.string().optional()
});

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useTwoFactor, setUseTwoFactor] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: 'admin@branddna.ai',
      password: 'adminmasterpass',
      twoFactorCode: '849201'
    },
  });

  const handleFillDemo = () => {
    setValue('email', 'admin@branddna.ai');
    setValue('password', 'adminmasterpass');
    setValue('twoFactorCode', '849201');
    addToast('Admin demo credentials populated!', 'info');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('branddna_token', 'admin_jwt_token_verified');
      localStorage.setItem('branddna_user', JSON.stringify({ fullName: 'System Administrator', email: data.email, role: 'admin' }));
      addToast('Administrator Security Clearance Granted!', 'success');
      window.location.href = '/admin';
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden text-left">
      
      {/* Background Cyber Grid & Glowing Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full bg-[#0D111A]/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Dedicated Security Command Control Banner */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-[#111624] via-[#0E121D] to-[#080A10] p-8 text-white flex-col justify-between border-r border-white/10 relative overflow-hidden">
          
          <div className="space-y-6 relative z-10">
            {/* Top Badge */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                RESTRICTED AREA • LEVEL 5
              </span>
            </div>

            {/* Main Title */}
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-tight">
                Command & Control System
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                BrandDNA AI Master Portal for user management, USPTO synchronization, and neural engine oversight.
              </p>
            </div>

            {/* Realtime System Telemetry */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">System Telemetry:</span>
              
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300 font-medium">USPTO Database Sync</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">OPERATIONAL</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300 font-medium">Neural Engine Cluster</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 font-bold">140ms LATENCY</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-300 font-medium">Audit Vault Encryption</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400 font-bold">AES-256</span>
              </div>
            </div>
          </div>

          {/* Footer Security Stamp */}
          <div className="pt-6 border-t border-white/10 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-slate-400" /> AUTH_VAULT_V4.5
            </span>
            <span className="text-emerald-400 font-bold">2FA MANDATORY</span>
          </div>
        </div>

        {/* Right Side: Admin Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          
          <div>
            {/* Header */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[11px] font-mono text-amber-400 uppercase font-bold">Administrator Portal</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[10px] font-mono text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                >
                  ⚡ Auto-Fill Demo Admin
                </button>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">Admin System Authentication</h2>
              <p className="text-xs text-slate-400">Enter your master administrator credentials and security 2FA code.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Master Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    placeholder="admin@branddna.ai"
                    {...register('email')}
                    className="w-full bg-[#151B28] border border-white/15 focus:border-amber-500 text-xs text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all"
                  />
                </div>
                {errors.email && <span className="text-[10px] text-rose-400 mt-1 block">{errors.email.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Master Passphrase</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    {...register('password')}
                    className="w-full bg-[#151B28] border border-white/15 focus:border-amber-500 text-xs text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-2.5 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <span className="text-[10px] text-rose-400 mt-1 block">{errors.password.message}</span>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Two-Factor Passcode (2FA)</label>
                  <span className="text-[10px] font-mono text-emerald-400">Authenticator App</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="849201"
                    {...register('twoFactorCode')}
                    className="w-full bg-[#151B28] border border-white/15 focus:border-amber-500 text-xs font-mono tracking-widest text-amber-400 placeholder-slate-600 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-98 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-black" />
                    <span>Verifying Security Clearance...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>Authenticate Admin Access</span>
                  </>
                )}
              </button>
            </form>

            {/* Audit Log Disclaimer */}
            <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-2.5 text-[11px] text-amber-300/80">
              <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Security Warning: All admin login attempts are recorded, timestamped, and bound to biometric 2FA signatures.</span>
            </div>
          </div>

          {/* Bottom Back Link */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              <span>Return to Standard User Portal</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};
