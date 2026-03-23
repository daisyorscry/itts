import { type ReactNode, forwardRef } from 'react';
import { cn } from '../utils';

interface InputProps extends React.ComponentProps<'input'> {
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  hasError?: boolean;
  tone?: 'default' | 'inverse';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconPosition = 'left', hasError, tone = 'default', style, ...props }, ref) => {
    const isInverse = tone === 'inverse';
    const borderStyle = hasError
      ? '1px solid #EF4444'
      : isInverse
        ? '1px solid rgba(4, 9, 12, 0.1)'
        : '1px solid rgba(4, 9, 12, 0.1)';

    const defaultStyle = {
      background: isInverse ? '#F7F4EC' : 'rgba(4, 9, 12, 0.04)',
      border: borderStyle,
      color: '#04090C',
    };

    const paddingClass = icon
      ? iconPosition === 'left'
        ? 'pl-12 pr-4'
        : 'pl-4 pr-12'
      : 'px-4';

    const inputElement = (
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full rounded-xl py-3 font-["Outfit"] text-sm h-auto outline-none transition-colors',
          isInverse && 'placeholder:text-black/40 focus:ring-2 focus:ring-[#29E68C]',
          paddingClass,
          className
        )}
        style={{ ...defaultStyle, ...style }}
        aria-invalid={hasError}
        {...props}
      />
    );

    if (!icon) {
      return inputElement;
    }

    const horizontalClasses = iconPosition === 'left' ? 'left-4' : 'right-4';

    return (
      <span className="relative block">
        <span
          className={`absolute w-5 h-5 pointer-events-none z-10 ${horizontalClasses} top-1/2 -translate-y-1/2`}
          style={{ color: 'rgba(4, 9, 12, 0.4)' }}
        >
          {icon}
        </span>
        {inputElement}
      </span>
    );
  }
);

Input.displayName = 'Input';

export { Input };
