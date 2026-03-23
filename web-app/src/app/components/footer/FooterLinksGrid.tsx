import { type ReactNode } from 'react';
import { motion } from 'motion/react';

interface FooterLinksGridProps {
  children: ReactNode;
  className?: string;
}

export function FooterLinksGrid({ children, className = '' }: FooterLinksGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '80px',
        paddingBottom: '80px',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
