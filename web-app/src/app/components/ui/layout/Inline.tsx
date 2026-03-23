import * as React from 'react';
import { cn } from '../utils';
import { Container } from './Box';

interface RowProps extends React.ComponentProps<typeof Container> {
  gap?: string;
  align?: string;
  justify?: string;
}

export function Row({
  gap = 'gap-4',
  align = 'items-center',
  justify,
  className,
  ...props
}: RowProps) {
  return (
    <Container className={cn('flex', align, justify, gap, className)} {...props} />
  );
}
