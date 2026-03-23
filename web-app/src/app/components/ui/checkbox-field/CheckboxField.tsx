import { forwardRef, type ReactNode } from 'react';
import { Label } from '../label';

interface CheckboxFieldProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  id: string;
  label: ReactNode;
  error?: string;
  className?: string;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ id, label, error, className = '', ...props }, ref) => {
    return (
      <fieldset className={`border-0 p-0 m-0 pt-1 ${className}`}>
        <Label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="mt-1 w-4 h-4 rounded accent-[#29E68C]"
            {...props}
          />
          <span
            className="font-['Outfit'] text-sm leading-relaxed"
            style={{ color: 'rgba(4, 9, 12, 0.6)' }}
          >
            {label}
          </span>
        </Label>
        {error && (
          <span
            className="mt-1.5 text-xs font-['Outfit'] block"
            style={{ color: '#EF4444' }}
          >
            {error}
          </span>
        )}
      </fieldset>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';
