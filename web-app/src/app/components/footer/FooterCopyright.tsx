import { motion } from 'motion/react';

interface FooterCopyrightProps {
  text?: string;
  delay?: number;
  className?: string;
}

export function FooterCopyright({
  text = '©2026 ITTS COMMUNITY. ALL RIGHTS RESERVED',
  delay = 0.4,
  className = '',
}: FooterCopyrightProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      style={{
        paddingBottom: '32px',
        textAlign: 'center',
      }}
      className={className}
    >
      <p style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: '12px',
        color: '#fff',
        margin: '0 0 28px 0',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        {text}
      </p>
    </motion.div>
  );
}
