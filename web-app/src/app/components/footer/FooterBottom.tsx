import { type ReactNode } from 'react';
import { motion } from 'motion/react';

interface FooterBottomProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FooterBottom({ children, delay = 0.3, className = '' }: FooterBottomProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '48px',
        paddingBottom: '48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '32px',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
