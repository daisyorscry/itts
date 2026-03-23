import { Link } from 'react-router';

interface NavbarLogoProps {
  to?: string;
  className?: string;
}

export function NavbarLogo({ to = '/', className = '' }: NavbarLogoProps) {
  return (
    <Link to={to} className={`flex items-center space-x-2 ${className}`}>
      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
        <span className="text-black font-bold text-sm">IT</span>
      </div>
      <span className="font-bold text-lg hidden sm:block">ITTS Community</span>
    </Link>
  );
}
