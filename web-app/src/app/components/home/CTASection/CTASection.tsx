import { ArrowRight, Network, Shield, Code, Users, BookOpen, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface CTASectionProps {
  onRegisterOpen: () => void;
}

export function CTASection({ onRegisterOpen }: CTASectionProps) {
  const features = [
    { icon: Network, text: 'Networking Track • Expert-Led Curriculum' },
    { icon: Shield, text: 'DevSecOps Track • Hands-On Projects' },
    { icon: Code, text: 'Programming Track • Real-World Experience' },
    { icon: Users, text: 'Active Community • 1,200+ Learners' },
    { icon: BookOpen, text: 'Free Resources • Learn at Your Pace' },
    { icon: Zap, text: 'Career Ready • Industry Standards' },
  ];

  return (
    <section className="bg-background relative">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`
      }} />

      <div className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Headlines */}
          <div className="mb-8 md:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-3 md:mb-4"
            >
              <div style={{
                display: 'inline-block',
                background: '#FF6B35',
                padding: 'clamp(8px, 1.5vw, 12px) clamp(16px, 4vw, 32px)',
                borderRadius: '4px',
              }}>
                <span style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 'clamp(32px, 8vw, 96px)',
                  fontWeight: 900,
                  color: '#000',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}>
                  MORE LEARNING
                </span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              style={{
                textAlign: 'right',
              }}
            >
              <span style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(32px, 8vw, 96px)',
                fontWeight: 900,
                color: '#000',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}>
                LESS CONFUSION
              </span>
            </motion.div>
          </div>

          {/* Description & CTA */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(16px, 2.5vw, 24px)',
                color: '#000',
                lineHeight: 1.5,
                maxWidth: '500px',
              }}>
                Join the community today.<br />
                No credit card required.
              </p>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRegisterOpen}
              className="self-start md:self-auto"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(14px, 2vw, 16px)',
                fontWeight: 600,
                padding: 'clamp(14px, 2vw, 18px) clamp(28px, 4vw, 40px)',
                background: '#000',
                color: '#fff',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>Get Started Free</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Scrolling Marquee - Bottom */}
      <div style={{
        borderTop: '1px solid rgba(4,9,12,0.1)',
        borderBottom: '1px solid rgba(4,9,12,0.1)',
        background: 'rgba(4,9,12,0.02)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <motion.div
          animate={{
            x: [0, -1920],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
          style={{
            display: 'flex',
            gap: '64px',
            padding: '20px 0',
            whiteSpace: 'nowrap',
          }}
        >
          {/* Duplicate features array 3 times for seamless loop */}
          {[...features, ...features, ...features].map((feature, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                color: 'rgba(4,9,12,0.8)',
              }}
            >
              <feature.icon size={18} style={{ color: '#04090C', flexShrink: 0 }} />
              <span>{feature.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
