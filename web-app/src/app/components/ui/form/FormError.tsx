import { type ReactNode } from 'react';

interface FormErrorProps {
  message?: string | ReactNode;
  className?: string;
}

export function FormError({ message, className = '' }: FormErrorProps) {
  if (!message) return null;

  return (
    <span
      className={`mt-1.5 text-xs font-['Outfit'] block ${className}`}
      style={{ color: '#EF4444' }}
    >
      {message}
    </span>
  );
}
