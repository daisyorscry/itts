import { type ReactNode } from 'react';
import { Label } from '../label';
import { Text } from '../text';
import { cn } from '../utils';

interface FormFieldProps {
  id: string;
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'inverse';
  spacing?: 'sm' | 'md';
}

export function FormField({
  id,
  label,
  error,
  required,
  children,
  className = '',
  tone = 'default',
  spacing = 'md',
}: FormFieldProps) {
  return (
    <div
      data-slot="form-field"
      className={cn(
        spacing === 'sm' && 'space-y-1.5',
        spacing === 'md' && 'space-y-2',
        className,
      )}
    >
      {label && (
        <Label
          htmlFor={id}
          tone={tone}
          className="block"
        >
          {label}
          {required && (
            <Text as="span" variant="error">
              {' '}
              *
            </Text>
          )}
        </Label>
      )}
      {children}
      {error && (
        <Text as="span" className="block" variant="error" size="sm">
          {error}
        </Text>
      )}
    </div>
  );
}
