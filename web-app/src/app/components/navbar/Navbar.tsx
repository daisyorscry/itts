import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';

interface NavbarProps {
  children: ReactNode;
  className?: string;
}

export function Navbar({ children, className = '' }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      if (currentY > lastY && currentY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'} ${className}`}>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`w-full max-w-[1536px] rounded-2xl text-white border transition-all duration-300 ${
          scrolled
            ? 'bg-black/90 backdrop-blur-xl border-white/15 shadow-2xl shadow-black/40'
            : 'bg-black/70 backdrop-blur-md border-white/10'
        }`}
      >
        {children}
      </motion.nav>
    </div>
  );
}