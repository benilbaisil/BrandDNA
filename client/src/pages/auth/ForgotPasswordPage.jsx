import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dna, Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 text-left">
        
        <div className="mb-6 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
            <Dna className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900">
            BrandDNA <span className="text-blue-600 font-extrabold">AI</span>
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Reset Password</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Enter your registered email address and we'll send you instructions to reset your password.
        </p>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm leading-relaxed space-y-3">
            <p className="font-semibold">Check your inbox!</p>
            <p>We have dispatched a password reset link to your email address.</p>
            <Link to="/login" className="inline-block text-xs font-bold text-blue-600 hover:underline pt-2">
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-md shadow-blue-500/20"
              isLoading={loading}
              icon={Send}
            >
              Send Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
