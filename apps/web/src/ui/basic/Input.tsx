import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ComponentProps<typeof Icon>['name'];
  rightIcon?: React.ComponentProps<typeof Icon>['name'];
  onRightIconClick?: () => void;
  rightIconDivider?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconClick,
  rightIconDivider,
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
            "w-full h-12 bg-white border border-border-light shadow-md rounded-full px-4 font-nunito text-base text-text-main placeholder:text-text-muted focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal transition-colors",
            leftIcon && "pl-11",
            rightIcon && (rightIconDivider ? "pr-14" : "pr-11"),
            error && "border-feedback-error focus:border-feedback-error focus:ring-feedback-error"
          )}
          {...props}
        />
        {rightIcon && (
          <div className={cn("absolute right-2 top-1/2 -translate-y-1/2 flex items-center", rightIconDivider ? "h-6" : "h-full")}>
            {rightIconDivider && <div className="w-[1px] h-full bg-border-light mr-2" />}
            <button 
              type="button"
              onClick={onRightIconClick}
              className={cn("text-text-muted hover:text-text-main focus:outline-none", rightIconDivider ? "pr-2" : "pr-2")}
              disabled={!onRightIconClick}
            >
              <Icon name={rightIcon} size={18} />
            </button>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-feedback-error font-nunito">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
