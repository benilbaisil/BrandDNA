import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dna, Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password is required'),
});

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
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
      const savedUser = localStorage.getItem('branddna_user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      const target = parsedUser?.role === 'admin' ? '/admin' : '/dashboard';
      navigate(target, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF4F7] flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans selection:bg-slate-900 selection:text-white">
      
      {/* Minimal Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
            <Dna className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-slate-900">
            BrandDNA <span className="text-xs font-sans font-extrabold px-1.5 py-0.5 rounded-full bg-slate-900 text-white">AI</span>
          </span>
        </Link>
      </header>

      {/* Floating Pristine White Card */}
      <main className="max-w-md w-full mx-auto my-auto bg-white rounded-3xl border border-[#D6E6EC] shadow-sm p-6 sm:p-10 text-left space-y-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Sign in to your minimal brand workspace.</p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white text-xs text-slate-900 rounded-xl px-3.5 py-3 outline-none transition-all pl-10 font-medium"
                {...register('email')}
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white text-xs text-slate-900 rounded-xl px-3.5 py-3 outline-none transition-all pl-10 pr-10 font-medium"
                {...register('password')}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 absolute right-2.5 top-2.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-rose-600 mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-end text-xs">
            <Link to="/forgot-password" className="font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-white px-2 text-slate-400">Or continue with Google</span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <div className="w-full">
          <GoogleSignInButton text="signin_with" />
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-slate-900 hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center py-2 text-xs text-slate-500">
        © {new Date().getFullYear()} BrandDNA AI. Minimal Workspace.
      </footer>

    </div>
  );
};
