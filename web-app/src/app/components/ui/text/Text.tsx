import { type ReactNode, type ElementType, type ComponentPropsWithoutRef } from 'react';

interface TextOwnProps {
  children: ReactNode;
  variant?: 'default' | 'muted' | 'bold' | 'error' | 'success' | 'inverse' | 'muted-inverse';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  className?: string;
  as?: ElementType;
  style?: React.CSSProperties;
}

type TextProps<T extends ElementType = 'span'> = TextOwnProps & Omit<ComponentPropsWithoutRef<T>, keyof TextOwnProps>;

const variantMap = {
  default: 'rgba(4, 9, 12, 0.6)',
  muted: 'rgba(4, 9, 12, 0.4)',
  bold: '#04090C',
  error: '#EF4444',
  success: '#29E68C',
  inverse: '#04090C',
  'muted-inverse': 'rgba(4, 9, 12, 0.6)',
};

const sizeMap = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export function Text<T extends ElementType = 'span'>({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className = '',
  as,
  style,
  ...props
}: TextProps<T>) {
  const Component = as || 'span';
  const fontWeightClass = variant === 'bold' ? 'font-bold' : '';

  return (
    <Component
      className={`font-['Outfit'] ${sizeMap[size]} ${fontWeightClass} ${className}`}
      style={{ color: variantMap[variant], ...style }}
      {...props}
    >
      {children}
    </Component>
  );
}
