import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export function FAQHeader() {
  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto 64px',
        padding: '0 32px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {/* title + subtitle + Discord - centered */}
      <motion.div
        initial={{ opacity: 0, y: 80, rotateX: 15, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: '820px', textAlign: 'center', perspective: '1000px' }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 'clamp(52px, 7vw, 90px)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 0.95,
          marginBottom: '32px',
          textTransform: 'uppercase',
        }}>
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ display: 'block', color: '#ECE9DE' }}
          >
            FREQUENTLY
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ display: 'block', color: '#29E68C' }}
          >
            ASKED
          </motion.span>
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ 
            display: 'block', 
            color: 'transparent',
            WebkitTextStroke: '2px rgba(236,233,222,0.25)',
          }}>QUESTIONS</motion.span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '17px',
          fontWeight: 400,
          color: 'rgba(236,233,222,0.6)',
          lineHeight: 1.65,
          marginBottom: '40px',
          letterSpacing: '-0.01em',
        }}>
          Still have questions? Reach out to the community on Discord — we'll answer.
        </motion.p>
        <motion.a
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.98 }}
          href="https://discord.gg/itts"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            color: '#ECE9DE',
            background: 'rgba(236,233,222,0.08)',
            border: '1px solid rgba(236,233,222,0.2)',
            borderRadius: '12px',
            padding: '14px 24px',
            textDecoration: 'none',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(236,233,222,0.14)';
            e.currentTarget.style.borderColor = 'rgba(236,233,222,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(236,233,222,0.08)';
            e.currentTarget.style.borderColor = 'rgba(236,233,222,0.2)';
          }}
        >
          <MessageCircle size={18} />
          Join Discord
        </motion.a>
      </motion.div>
    </div>
  );
}
