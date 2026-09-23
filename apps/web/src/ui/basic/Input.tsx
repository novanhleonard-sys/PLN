import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ComponentProps<typeof Icon>['name'];
  rightIcon?: React.ComponentProps<typeof Icon>['name'];
  onRightIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconClick,
  ...props
}, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-sm font-fredoka text-text-main">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
            <Icon name={leftIcon} size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full h-12 bg-white border border-border-light rounded-2xl px-4 font-nunito text-base text-text-main placeholder:text-text-muted focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors",
            leftIcon && "pl-11",
            rightIcon && "pr-11",
            error && "border-feedback-error focus:border-feedback-error focus:ring-feedback-error"
          )}
          {...props}
        />
        {rightIcon && (
          <button 
            type="button"
            onClick={onRightIconClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main focus:outline-none"
            disabled={!onRightIconClick}
          >
            <Icon name={rightIcon} size={18} />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-feedback-error font-nunito">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
