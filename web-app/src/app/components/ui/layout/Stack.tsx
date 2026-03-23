import * as React from 'react';
import { cn } from '../utils';
import { Container } from './Box';

interface ColumnProps extends React.ComponentProps<typeof Container> {
  gap?: string;
}

export function Column({
  gap = 'gap-4',
  className,
  ...props
}: ColumnProps) {
  return <Container className={cn('flex flex-col', gap, className)} {...props} />;
}

type ListProps = React.ComponentPropsWithoutRef<'ul'> & {
  gap?: string;
};

export function List({ gap = 'gap-1', className, ...props }: ListProps) {
  return <ul className={cn('flex flex-col list-inside list-disc', gap, className)} {...props} />;
}

type ListItemProps = React.ComponentPropsWithoutRef<'li'>;

export function ListItem({ className, ...props }: ListItemProps) {
  return <li className={cn("font-['Outfit'] text-sm text-black/70", className)} {...props} />;
}
