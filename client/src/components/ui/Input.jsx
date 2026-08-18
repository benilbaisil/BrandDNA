import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      rightElement,
      className = '',
      id,
      type = 'text',
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 tracking-tight flex items-center justify-between"
          >
            <span>
              {label} {required && <span className="text-rose-500">*</span>}
            </span>
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={`w-full bg-white text-slate-900 placeholder:text-slate-400 text-sm rounded-xl border px-3.5 py-2.5 transition-all duration-150 outline-none
              ${Icon ? 'pl-10' : ''}
              ${rightElement ? 'pr-11' : ''}
              ${
                error
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/10'
                  : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10'
              }
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs font-medium text-rose-500 animate-in fade-in-50 duration-150">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-slate-400">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
