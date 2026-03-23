import { Link, useLocation } from 'react-router';

interface NavLink {
  name: string;
  path: string;
}

interface NavbarLinksProps {
  links: NavLink[];
  className?: string;
}

export function NavbarLinks({ links, className = '' }: NavbarLinksProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`hidden md:flex items-center space-x-1 ${className}`}>
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            isActive(link.path)
              ? 'bg-accent text-black'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
}
