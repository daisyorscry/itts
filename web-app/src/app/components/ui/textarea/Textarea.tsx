import { type ReactNode, forwardRef } from 'react';
import { cn } from '../utils';

interface TextareaProps extends React.ComponentProps<'textarea'> {
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  hasError?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, icon, iconPosition = 'left', hasError, ...props }, ref) => {
    const borderStyle = hasError
      ? '1px solid #EF4444'
      : '1px solid rgba(4, 9, 12, 0.1)';

    const defaultStyle = {
      background: '#F7F4EC',
      border: borderStyle,
      color: '#04090C',
    };

    const paddingClass = icon
      ? iconPosition === 'left'
        ? 'pl-12 pr-4'
        : 'pl-4 pr-12'
      : 'px-4';

    const textareaElement = (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-xl py-3 font-["Outfit"] text-sm resize-none outline-none transition-colors',
          paddingClass,
          className
        )}
        style={defaultStyle}
        aria-invalid={hasError}
        {...props}
      />
    );

    if (!icon) {
      return textareaElement;
    }

    const horizontalClasses = iconPosition === 'left' ? 'left-4' : 'right-4';

    return (
      <span className="relative block">
        <span
          className={`absolute w-5 h-5 pointer-events-none z-10 ${horizontalClasses} top-4`}
          style={{ color: 'rgba(4, 9, 12, 0.4)' }}
        >
          {icon}
        </span>
        {textareaElement}
      </span>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
