import { useState } from 'react';
import { motion } from 'motion/react';
import { faqs } from './data';
import { FAQHeader } from './FAQHeader';
import { FAQAccordionItem } from './FAQAccordionItem';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));
  const filtered = activeTag ? faqs.filter(f => f.tag === activeTag) : faqs;

  return (
    <section
      style={{
        background: '#04090C',
        padding: '140px 0 160px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient orbs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.15, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(41,230,140,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── HEADER ── */}
      <FAQHeader />

      {/* ── ACCORDION ── */}
      <div
        className="max-md:px-6"
        style={{ 
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 32px',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0' 
      }}>
        {filtered.map((faq, i) => {
          const realIdx = faqs.indexOf(faq);
          const isOpen = openIndex === realIdx;

          return (
            <FAQAccordionItem
              key={realIdx}
              faq={faq}
              realIdx={realIdx}
              isOpen={isOpen}
              onToggle={() => toggle(realIdx)}
              animationDelay={i * 0.05}
            />
          );
        })}

        {/* final rule */}
        <div style={{ borderTop: '1px solid rgba(236,233,222,0.07)' }} />
      </div>
    </section>
  );
}
