import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dna, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

const schema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export const ResetPasswordPage = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      await authService.resetPassword(resetToken, data.password);
      addToast('Password reset successfully! Please log in with your new password.', 'success');
      navigate('/login');
    } catch (error) {
      addToast('Failed to reset password. Link may have expired.', 'error');
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
            BrandDNA <span className="text-blue-600">AI</span>
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Set New Password</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Please enter your new secure password below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={Lock}
            required
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-md shadow-blue-500/20"
            isLoading={loading}
            icon={CheckCircle2}
          >
            Reset Password
          </Button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs font-semibold text-slate-600 hover:text-blue-600">
              Return to Login
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
};
