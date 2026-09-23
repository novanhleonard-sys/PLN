import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'text';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ComponentProps<typeof Icon>['name'];
  rightIcon?: React.ComponentProps<typeof Icon>['name'];
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}, ref) => {
  const base = "inline-flex items-center justify-center font-fredoka rounded-pill transition-colors focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-teal text-white hover:bg-teal-dark shadow-warm",
    secondary: "bg-white text-teal border border-border-light hover:bg-cream shadow-warm",
    ghost: "bg-cream text-text-main hover:bg-border-light",
    text: "bg-transparent text-text-muted hover:text-text-main underline-offset-4 hover:underline"
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base min-w-[44px]", // min-w/h 44px for accessibility
    lg: "h-14 px-8 text-lg min-w-[44px]"
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Icon name="LoaderCircle" className="mr-2 animate-spin" size={18} />}
      {!isLoading && leftIcon && <Icon name={leftIcon} className="mr-2" size={18} />}
      {children}
      {!isLoading && rightIcon && <Icon name={rightIcon} className="ml-2" size={18} />}
    </button>
  );
});
Button.displayName = 'Button';
