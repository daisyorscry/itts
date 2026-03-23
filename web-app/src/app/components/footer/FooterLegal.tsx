import { Link } from 'react-router';
import { motion } from 'motion/react';

interface LegalLink {
  label: string;
  to: string;
}

interface FooterLegalProps {
  links: LegalLink[];
  delay?: number;
  className?: string;
}

export function FooterLegal({ links, delay = 0.5, className = '' }: FooterLegalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        paddingTop: '32px',
        paddingBottom: '16px',
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
        flexWrap: 'wrap',
      }}
      className={className}
    >
      {links.map((link) => (
        <Link
          key={link.label}
          to={link.to}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '15px',
            color: '#fff',
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#29E68C'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#fff'}
        >
          {link.label}
        </Link>
      ))}
    </motion.div>
  );
}
