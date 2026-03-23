import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import type { FAQItem } from './data';
import { TAG_STYLE } from './data';

interface FAQAccordionItemProps {
  faq: FAQItem;
  realIdx: number;
  isOpen: boolean;
  onToggle: () => void;
  animationDelay: number;
}

export function FAQAccordionItem({
  faq,
  realIdx,
  isOpen,
  onToggle,
  animationDelay,
}: FAQAccordionItemProps) {
  const ts = TAG_STYLE[faq.tag];

  return (
    <motion.div
      key={realIdx}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: animationDelay }}
      style={{
        borderTop: '1px solid rgba(236,233,222,0.07)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* left accent bar */}
      <motion.div
        animate={{ scaleY: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '2px',
          background: ts.color,
          transformOrigin: 'top',
          boxShadow: `0 0 12px ${ts.color}`,
        }}
      />

      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: '28px',
          padding: '28px 0 28px 24px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* tag only */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: ts.color,
            background: ts.bg,
            border: `1px solid ${ts.border}`,
            borderRadius: '4px',
            padding: '2px 8px',
            whiteSpace: 'nowrap',
            opacity: 1,
          }}>
            {faq.tag}
          </span>
        </div>

        {/* question */}
        <span style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 'clamp(16px, 2vw, 22px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#ECE9DE',
          transition: 'color 0.25s ease',
          lineHeight: 1.3,
        }}>
          {faq.q}
        </span>

        {/* icon */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: `1px solid ${isOpen ? ts.color : 'rgba(236,233,222,0.35)'}`,
            background: isOpen ? ts.bg : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.25s ease',
            boxShadow: isOpen ? `0 0 16px ${ts.bg}` : 'none',
          }}
        >
          <Plus size={15} color={isOpen ? ts.color : '#ECE9DE'} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="max-md:!pl-6"
              style={{ padding: '0 0 32px 116px' }}
            >
              <div style={{ height: '1px', background: 'rgba(236,233,222,0.06)', marginBottom: '24px' }} />
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(14px, 1.4vw, 16px)',
                color: 'rgba(236,233,222,0.75)',
                lineHeight: 1.8,
                margin: 0,
                maxWidth: '680px',
              }}>
                {faq.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}