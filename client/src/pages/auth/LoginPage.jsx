import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, Compass } from 'lucide-react';
import { useAuth, getRoleRedirectPath } from '../../context/AuthContext';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password is required'),
});

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const success = await login(data);
    if (success) {
      const savedUser = sessionStorage.getItem('branddna_user') || localStorage.getItem('branddna_user');
      const parsedUser = (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
      const from = location.state?.from;
      const target = (from && from !== '/login') ? from : getRoleRedirectPath(parsedUser?.role);
      navigate(target, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-[#0F382C] selection:text-white">
      
      <div className="max-w-5xl w-full bg-white rounded-3xl border border-stone-200/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Side: Editorial Outdoor Hero Background */}
        <div className="lg:col-span-5 relative bg-[#08221B] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-emerald-900/50">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop"
            alt="Outdoor Trekking Luxury Backdrop"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08221B] via-[#08221B]/60 to-transparent" />

          <div className="space-y-6 z-10 relative">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="font-serif font-extrabold text-3xl tracking-tight text-white lowercase">
                brand.
              </span>
              <span className="text-[10px] font-sans font-bold tracking-widest text-emerald-300 uppercase bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-700/50">
                sports
              </span>
            </Link>

            <div className="pt-10 space-y-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 inline-block">
                MEMBER SIGN IN
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-white">
                Elevate your active journey & workspace.
              </h1>
              <p className="text-xs text-emerald-200/80 leading-relaxed max-w-sm">
                Access customer orders, inventory balance control, AI strategy generators, and executive analytics.
              </p>
            </div>
          </div>

          <div className="pt-8 z-10 relative space-y-2.5 border-t border-emerald-900/60 text-xs text-emerald-200/80 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>JWT Encrypted Role Authorization</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Unified Single Store Operations</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Luxury Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white text-left space-y-6">
          <div className="space-y-6">
            
            <div>
              <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Sign In</h2>
              <p className="text-xs text-slate-500 mt-1">Enter your email and password to access your role portal.</p>
            </div>

            {location.state?.message && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-center gap-2.5 shadow-2xs">
                <Lock className="w-4 h-4 text-[#0F382C] shrink-0" />
                <span>{location.state.message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full bg-[#FAF8F5] border border-stone-200 focus:border-[#0F382C] focus:bg-white text-xs text-slate-900 rounded-2xl px-4 py-3.5 outline-none transition-all pl-10 font-medium"
                    {...register('email')}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                </div>
                {errors.email && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF8F5] border border-stone-200 focus:border-[#0F382C] focus:bg-white text-xs text-slate-900 rounded-2xl px-4 py-3.5 outline-none transition-all pl-10 pr-10 font-medium"
                    {...register('password')}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 absolute right-3 top-3 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-end text-xs">
                <Link to="/forgot-password" className="font-bold text-slate-600 hover:text-[#0F382C] transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#0F382C] hover:bg-[#08221B] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest font-mono">
                <span className="bg-white px-3 text-slate-400">OR GOOGLE AUTH</span>
              </div>
            </div>

            <div className="w-full">
              <GoogleSignInButton text="signin_with" />
            </div>

          </div>

          <div className="text-center pt-4 border-t border-stone-100">
            <p className="text-xs text-slate-500">
              Don't have a customer account?{' '}
              <Link to="/register" className="font-bold text-[#0F382C] hover:underline">
                Register Customer Account
              </Link>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};


