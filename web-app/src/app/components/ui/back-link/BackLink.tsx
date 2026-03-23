import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

interface BackLinkProps {
  to?: string;
  label?: string;
  className?: string;
}

export function BackLink({ to = '/', label = 'Back to home', className = '' }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 mb-8 font-['Outfit'] text-sm transition-colors ${className}`}
      style={{ color: 'rgba(4, 9, 12, 0.6)' }}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hover:opacity-70 transition-opacity">{label}</span>
    </Link>
  );
}
