import { type ReactNode } from 'react';
import { motion } from 'motion/react';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  background?: string;
  centered?: boolean;
  className?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

export function PageContainer({
  children,
  maxWidth = 'md',
  background = '#ECE9DE',
  centered = true,
  className = '',
}: PageContainerProps) {
  return (
    <section
      className={`min-h-screen ${centered ? 'flex items-center justify-center' : ''} px-4 py-20 sm:px-6 md:py-24 ${className}`}
      style={{ background }}
    >
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full ${maxWidthClasses[maxWidth]}`}
      >
        {children}
      </motion.article>
    </section>
  );
}
