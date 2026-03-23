import { motion } from 'motion/react';
import { type LucideIcon } from 'lucide-react';

interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
}

interface FooterSocialProps {
  socialLinks: SocialLink[];
  showContact?: boolean;
  contactHref?: string;
  contactLabel?: string;
  className?: string;
}

export function FooterSocial({
  socialLinks,
  showContact = true,
  contactHref = '#',
  contactLabel = 'Contact Us',
  className = '',
}: FooterSocialProps) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} className={className}>
      {socialLinks.map((social) => (
        <motion.a
          key={social.label}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          href={social.href}
          target={social.href.startsWith('http') ? '_blank' : undefined}
          rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          aria-label={social.label}
          style={{
            width: '48px',
            height: '48px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.6)',
            transition: 'all 0.2s ease',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
          }}
        >
          <social.icon size={20} />
        </motion.a>
      ))}
      
      {showContact && (
        <a
          href={contactHref}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
            color: '#fff',
            textDecoration: 'none',
            marginLeft: '16px',
            padding: '14px 28px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          {contactLabel}
        </a>
      )}
    </div>
  );
}
