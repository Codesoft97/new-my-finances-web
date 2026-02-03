import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const baseStyles = `
    ${sizes[size]}
    rounded-xl font-semibold transition-all duration-200 
    disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
    focus:outline-none focus:ring-4
  `;

  const variants = {
    primary: `
      bg-[var(--color-action)] text-white 
      hover:bg-[var(--color-action-dark)] 
      focus:ring-[var(--color-action-light)]
      shadow-md hover:shadow-lg
    `,
    secondary: `
      bg-[var(--color-bg-elevated)] text-[var(--color-text)] 
      border-2 border-[var(--color-border)]
      hover:bg-[var(--color-border-light)] hover:border-[var(--color-text-muted)]
      focus:ring-[var(--color-border)]
    `,
    danger: `
      bg-[var(--color-danger)] text-white 
      hover:bg-[var(--color-danger-dark)] 
      focus:ring-[var(--color-danger-light)]
    `,
    outline: `
      border-2 border-[var(--color-primary)] text-[var(--color-primary)] 
      hover:bg-[var(--color-primary)] hover:text-white
      focus:ring-[var(--color-primary-light)]
    `,
    ghost: `
      text-[var(--color-text-secondary)] 
      hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)]
      focus:ring-[var(--color-border)]
    `
  };

  return (
    <button
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}