import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'success' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'relative inline-flex items-center justify-center font-semibold text-center transition-all duration-200 ease-in-out border-2 border-black shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-neo-sm active:translate-x-0 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-neo-sm';

  const variantClasses = {
    primary: 'bg-primary-500 text-white border-primary-700 hover:bg-primary-600 focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-white border-secondary-700 hover:bg-secondary-600 focus:ring-secondary-500',
    accent: 'bg-accent-500 text-black border-accent-700 hover:bg-accent-600 focus:ring-accent-500',
    danger: 'bg-danger-500 text-white border-danger-700 hover:bg-danger-600 focus:ring-danger-500',
    success: 'bg-success-500 text-white border-success-700 hover:bg-success-600 focus:ring-success-500',
    neutral: 'bg-white text-black border-black hover:bg-neutral-100 focus:ring-black',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
    xl: 'px-12 py-6 text-lg',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="loading-neo mr-2" />
      )}
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="form-neo-label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'input-neo',
              icon && 'pl-10',
              error && 'border-danger-500 focus:border-danger-500',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="form-neo-error">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="form-neo-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            'input-neo min-h-[100px] resize-y',
            error && 'border-danger-500 focus:border-danger-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="form-neo-error">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="form-neo-label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={clsx(
            'input-neo',
            error && 'border-danger-500 focus:border-danger-500',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="form-neo-error">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'card-neo',
    primary: 'card-neo-primary',
    secondary: 'card-neo-secondary',
    accent: 'card-neo-accent',
  };

  return (
    <div className={clsx(variantClasses[variant], className)}>
      {children}
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className,
}) => {
  const variantClasses = {
    primary: 'badge-neo-primary',
    secondary: 'badge-neo-secondary',
    accent: 'badge-neo-accent',
    success: 'badge-neo-success',
    danger: 'badge-neo-danger',
  };

  return (
    <span className={clsx(variantClasses[variant], className)}>
      {children}
    </span>
  );
};

interface AlertProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  className,
}) => {
  const variantClasses = {
    success: 'alert-neo-success',
    danger: 'alert-neo-danger',
    warning: 'alert-neo-warning',
    info: 'alert-neo-info',
  };

  return (
    <div className={clsx(variantClasses[variant], className)}>
      {children}
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={clsx('loading-neo', sizeClasses[size], className)} />
  );
};
