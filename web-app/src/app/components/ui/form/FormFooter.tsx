import { type ReactNode } from 'react';
import { cn } from '../utils';

interface FormFooterProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  flush?: boolean;
  className?: string;
}

const alignMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};

const gapMap = {
  none: '',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function FormFooter({
  children,
  align = 'start',
  gap = 'none',
  flush = false,
  className = '',
}: FormFooterProps) {
  return (
    <footer
      data-slot="form-footer"
      className={cn(
        'flex items-center max-sm:flex-col max-sm:items-stretch [&>[data-slot=button]]:max-sm:w-full [&>[data-slot=button]]:max-sm:justify-center',
        alignMap[align],
        gapMap[gap],
        flush ? 'pt-4' : 'mt-6',
        className,
      )}
    >
      {children}
    </footer>
  );
}
