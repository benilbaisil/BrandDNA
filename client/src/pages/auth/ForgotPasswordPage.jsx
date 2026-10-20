import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Sparkles, Mail, ArrowLeft, Send } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ForgotPasswordPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
      addToast('Reset instructions sent to your email!', 'success');
    } catch (error) {
      addToast('Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 sm:p-6 font-sans text-left">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-10 space-y-6">
        
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#08221B] border border-emerald-700/50 flex items-center justify-center text-emerald-300 shadow-md">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <span className="font-serif font-bold text-2xl text-slate-900 tracking-tight">
            BrandDNA
          </span>
        </div>

        <div>
          <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your registered email address and we'll send instructions to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm leading-relaxed space-y-3">
            <p className="font-bold">Check your inbox!</p>
            <p>We have dispatched a password reset link to your email address.</p>
            <Link to="/login" className="inline-block text-xs font-bold text-[#0F382C] hover:underline pt-1">
              ← Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              icon={Mail}
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#0F382C] hover:bg-[#16503f] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Sending Instructions...' : 'Send Reset Link'}</span>
              <Send className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#0F382C] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

