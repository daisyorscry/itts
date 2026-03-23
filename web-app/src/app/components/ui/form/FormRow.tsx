import { type ReactNode } from 'react';

interface FormRowProps {
  children: ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const gapMap = {
  none: '',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function FormRow({
  children,
  justify = 'start',
  align = 'center',
  gap = 'md',
  className = '',
}: FormRowProps) {
  return (
    <article className={`flex flex-wrap ${justifyMap[justify]} ${alignMap[align]} ${gapMap[gap]} ${className}`}>
      {children}
    </article>
  );
}
