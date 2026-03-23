import { Menu, X } from 'lucide-react';

interface NavbarMobileToggleProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function NavbarMobileToggle({ isOpen, onClick, className = '' }: NavbarMobileToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`md:hidden p-2 rounded-lg hover:bg-white/10 ${className}`}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? <X size={22} /> : <Menu size={22} />}
    </button>
  );
}
