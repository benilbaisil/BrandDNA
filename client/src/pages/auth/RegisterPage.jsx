import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dna, Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { isValidPhoneNumber } from 'libphonenumber-js';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .refine(
        (val) => {
          try {
            return isValidPhoneNumber(val);
          } catch (e) {
            return false;
          }
        },
        'Please enter a valid phone number including country code (e.g. +1...)'
      ),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const RegisterPage = () => {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'startup_owner',
    },
  });

  const watchPassword = watch('password', '');
  const watchConfirmPassword = watch('confirmPassword', '');

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1: return { score: 25, label: 'Weak', color: 'bg-rose-500' };
      case 2: return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3: return { score: 75, label: 'Good', color: 'bg-blue-500' };
      case 4: return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default: return { score: 10, label: 'Too Short', color: 'bg-rose-400' };
    }
  };

  const strength = getPasswordStrength(watchPassword);
  const passwordsMatch = watchPassword && watchConfirmPassword && watchPassword === watchConfirmPassword;

  const onSubmit = async (data) => {
    const success = await registerUser(data);
    if (success) {
      navigate('/dashboard', { replace: true });
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
          <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-500 mt-1">Get started with your minimal AI workspace.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Sarah Founder"
                className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white text-xs text-slate-900 rounded-xl px-3.5 py-3 outline-none transition-all pl-10 font-medium"
                {...register('fullName')}
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            {errors.fullName && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.fullName.message}</p>}
          </div>

          {/* Email Address */}
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
            {errors.email && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone Number with Country Code */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <Controller
              name="phone"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className="relative bg-[#EAF4F7]/40 border border-[#D6E6EC] focus-within:border-slate-900 focus-within:bg-white text-xs text-slate-900 rounded-xl px-3.5 py-2.5 outline-none transition-all font-medium">
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={value}
                    onChange={onChange}
                    placeholder="e.g. 987 654 3210"
                    className="w-full bg-transparent outline-none border-none"
                    style={{ '--PhoneInput-color--focus': 'transparent' }}
                  />
                </div>
              )}
            />
            {errors.phone && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.phone.message}</p>}
          </div>

          {/* Password */}
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
            {errors.password && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.password.message}</p>}

            {watchPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Strength:</span>
                  <span className="font-semibold text-slate-700">{strength.label}</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Password Confirmation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full bg-[#EAF4F7]/40 border border-[#D6E6EC] focus:border-slate-900 focus:bg-white text-xs text-slate-900 rounded-xl px-3.5 py-3 outline-none transition-all pl-10 pr-10 font-medium"
                {...register('confirmPassword')}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 absolute right-2.5 top-2.5 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.confirmPassword.message}</p>
            )}
            {passwordsMatch && !errors.confirmPassword && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Create Free Workspace Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span className="bg-white px-2 text-slate-400">Or sign up with Google</span>
          </div>
        </div>

        {/* Google Sign-Up Button */}
        <div className="w-full">
          <GoogleSignInButton text="signup_with" />
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-slate-900 hover:underline">
              Sign In
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
