import * as React from 'react';
import { cn } from '../utils';

interface ContainerProps extends React.ComponentProps<'div'> {
  className?: string;
  surface?: 'none' | 'panel' | 'panel-soft' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'none' | 'lg' | 'xl';
}

const surfaceMap = {
  none: '',
  panel: 'border border-black/10 bg-black/[0.03]',
  'panel-soft': 'bg-black/[0.03] border border-black/[0.04]',
  accent: 'border border-[#29E68C66] bg-[#29E68C33]',
};

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const radiusMap = {
  none: '',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};

export function Container({
  className,
  surface = 'none',
  padding = 'none',
  radius = 'none',
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(surfaceMap[surface], paddingMap[padding], radiusMap[radius], className)}
      {...props}
    />
  );
}
