import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth, getRoleRedirectPath } from '../../context/AuthContext';
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
        'Please enter a valid phone number including country code'
      ),
    role: z.string().optional().default('customer'),
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
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'customer',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    const success = await registerUser(data);
    if (success) {
      const savedUser = localStorage.getItem('branddna_user');
      const parsedUser = (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
      const target = getRoleRedirectPath(parsedUser?.role);
      navigate(target, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans selection:bg-[#0F382C] selection:text-white py-12">
      
      <div className="max-w-5xl w-full bg-white rounded-3xl border border-stone-200/80 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        
        {/* Left Side: Editorial Outdoor Hero Visual */}
        <div className="lg:col-span-5 relative bg-[#08221B] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-emerald-900/50">
          <img
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop"
            alt="Workout Essentials Backdrop"
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

            <div className="pt-6 space-y-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 inline-block">
                CREATE CUSTOMER ACCOUNT
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-white">
                Join our outdoor & performance community.
              </h1>
              <p className="text-xs text-emerald-200/80 leading-relaxed max-w-sm">
                Unlock exclusive customer shopping, instant cart checkout, live 5-step order timelines, and hassle-free returns.
              </p>
            </div>
          </div>

          <div className="pt-8 z-10 relative space-y-2.5 border-t border-emerald-900/60 text-xs text-emerald-200/80 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified Customer Store Access</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Razorpay 256-Bit Encrypted Payments</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white text-left space-y-6">
          <div className="space-y-6">
            
            <div>
              <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-500 mt-1">Enter your details below to register as a customer.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Sarah Miller"
                    className="w-full bg-[#FAF8F5] border border-stone-200 focus:border-[#0F382C] focus:bg-white text-xs text-slate-900 rounded-2xl px-4 py-3 outline-none transition-all pl-10 font-medium"
                    {...register('fullName')}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                {errors.fullName && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full bg-[#FAF8F5] border border-stone-200 focus:border-[#0F382C] focus:bg-white text-xs text-slate-900 rounded-2xl px-4 py-3 outline-none transition-all pl-10 font-medium"
                    {...register('email')}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
                {errors.email && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="relative bg-[#FAF8F5] border border-stone-200 focus-within:border-[#0F382C] focus-within:bg-white text-xs text-slate-900 rounded-2xl px-3.5 py-2 text-left font-medium">
                      <PhoneInput
                        international
                        defaultCountry="IN"
                        value={value}
                        onChange={onChange}
                        placeholder="e.g. 987 654 3210"
                        className="w-full bg-transparent outline-none border-none text-xs"
                      />
                    </div>
                  )}
                />
                {errors.phone && <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.phone.message}</p>}
              </div>

              {/* Customer Account Badge */}
              <div className="bg-[#E8F5E9] border border-[#C4E1D4] rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0F382C] animate-pulse" />
                  <span className="font-bold text-[#0F382C]">Customer Registration</span>
                </div>
                <span className="text-[10px] font-mono bg-[#0F382C] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Store Front
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF8F5] border border-stone-200 focus:border-[#0F382C] focus:bg-white text-xs text-slate-900 rounded-2xl px-4 py-3 outline-none transition-all pl-10 pr-10 font-medium"
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF8F5] border border-stone-200 focus:border-[#0F382C] focus:bg-white text-xs text-slate-900 rounded-2xl px-4 py-3 outline-none transition-all pl-10 pr-10 font-medium"
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
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#0F382C] hover:bg-[#08221B] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest font-mono">
                <span className="bg-white px-3 text-slate-400">OR SIGN UP WITH GOOGLE</span>
              </div>
            </div>

            <div className="w-full">
              <GoogleSignInButton text="signup_with" />
            </div>

          </div>

          <div className="text-center pt-4 border-t border-stone-100">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#0F382C] hover:underline">
                Sign In
              </Link>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};


