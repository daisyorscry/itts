import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '../input';
import { Button } from '../button';

interface PasswordFieldProps extends Omit<React.ComponentProps<typeof Input>, 'type' | 'icon'> {
  hasError?: boolean;
  showIcon?: boolean;
  tone?: 'default' | 'inverse';
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ hasError, showIcon = true, tone = 'default', className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isInverse = tone === 'inverse';

    const inputElement = (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        hasError={hasError}
        className={`${showIcon ? 'pl-12' : 'pl-4'} pr-12 ${
          isInverse
            ? 'border-black/10 bg-[#F7F4EC] text-[#04090C] placeholder:text-black/40 focus:ring-2 focus:ring-[#29E68C]'
            : ''
        } ${className || ''}`}
        style={
          isInverse
            ? { background: '#F7F4EC', color: '#04090C' }
            : props.style
        }
        {...props}
      />
    );

    return (
      <span className="relative block">
        {showIcon && (
          <span
            className="absolute w-5 h-5 pointer-events-none z-10 left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'rgba(4, 9, 12, 0.4)' }}
          >
            <Lock />
          </span>
        )}
        {inputElement}
        <Button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70 z-10 h-auto w-auto p-2 hover:bg-transparent"
          style={{ color: 'rgba(4, 9, 12, 0.4)' }}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </Button>
      </span>
    );
  }
);

PasswordField.displayName = 'PasswordField';
