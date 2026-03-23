import { motion, AnimatePresence } from 'motion/react';
import { useDropdownContext } from './dropdown';
import type { DropdownContentProps } from './types';

export function DropdownContent({ children }: DropdownContentProps) {
  const { isOpen } = useDropdownContext();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-50 w-full mt-2 rounded-xl shadow-lg overflow-hidden"
          style={{
            background: '#F5F3EE',
            border: '1px solid rgba(4, 9, 12, 0.1)',
          }}
        >
          {children}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}