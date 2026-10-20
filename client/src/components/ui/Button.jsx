import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F382C] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#0F382C] hover:bg-[#16503f] text-white shadow-sm hover:shadow-md border border-[#0F382C]',
    secondary:
      'bg-stone-900 hover:bg-stone-800 text-white shadow-sm hover:shadow-md border border-stone-900',
    outline:
      'bg-white hover:bg-[#FAF8F5] text-slate-800 border border-stone-300 hover:border-[#0F382C] hover:text-[#0F382C] shadow-2xs',
    ghost:
      'bg-transparent hover:bg-stone-100 text-slate-700 hover:text-slate-900',
    soft:
      'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2.5 gap-2',
    lg: 'text-sm px-6 py-3.5 gap-2.5 rounded-2xl',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

