import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';

interface NavLink {
  name: string;
  path: string;
}

interface NavbarMobileMenuProps {
  isOpen: boolean;
  links: NavLink[];
  ctaTo?: string;
  ctaLabel?: string;
  onLinkClick: () => void;
  className?: string;
}

export function NavbarMobileMenu({
  isOpen,
  links,
  ctaTo = '/sign-in',
  ctaLabel = 'Join Now',
  onLinkClick,
  className = '',
}: NavbarMobileMenuProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`md:hidden border-t border-white/10 overflow-hidden rounded-b-2xl ${className}`}
        >
          <div className="px-4 py-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={onLinkClick}
                className={`block px-4 py-3 rounded-xl transition-colors ${
                  isActive(link.path)
                    ? 'bg-accent text-black'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to={ctaTo}
              onClick={onLinkClick}
              className="block px-4 py-3 bg-accent text-black rounded-xl text-center hover:bg-accent/90 transition-colors font-semibold"
            >
              {ctaLabel}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
