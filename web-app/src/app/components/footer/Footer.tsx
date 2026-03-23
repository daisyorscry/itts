import { type ReactNode } from 'react';

interface FooterProps {
  children: ReactNode;
  className?: string;
}

export function Footer({ children, className = '' }: FooterProps) {
  return (
    <footer style={{ background: '#000', position: 'relative' }} className={className}>
      <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '80px 64px 48px' }}>
        {children}
      </div>
    </footer>
  );
}
