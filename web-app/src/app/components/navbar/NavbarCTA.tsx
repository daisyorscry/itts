import { Link } from 'react-router';

interface NavbarCTAProps {
  to?: string;
  label?: string;
  className?: string;
}

export function NavbarCTA({ to = '/sign-in', label = 'Join Now', className = '' }: NavbarCTAProps) {
  return (
    <div className={`hidden md:flex items-center space-x-4 ${className}`}>
      <Link
        to={to}
        className="px-5 py-2 bg-accent text-black rounded-full text-sm hover:bg-accent/90 transition-colors font-semibold"
      >
        {label}
      </Link>
    </div>
  );
}
