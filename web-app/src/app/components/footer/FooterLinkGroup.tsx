import { Link } from 'react-router';
import { motion } from 'motion/react';

interface FooterLink {
  label: string;
  to: string;
  external?: boolean;
}

interface FooterLinkGroupProps {
  title: string;
  links: FooterLink[];
  delay?: number;
  className?: string;
}

export function FooterLinkGroup({ title, links, delay = 0, className = '' }: FooterLinkGroupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      <h4 style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '0.12em',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '28px',
        textTransform: 'uppercase',
      }}>
        {title}
      </h4>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', listStyle: 'none', padding: 0, margin: 0 }}>
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '15px',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.75)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#29E68C'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
              >
                {link.label}
              </a>
            ) : (
              <Link
                to={link.to}
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '15px',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.75)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#29E68C'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
