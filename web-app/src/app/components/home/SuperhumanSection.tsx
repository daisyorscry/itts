import { motion } from "motion/react"
import { useRef } from "react"

const manifesto = [
  { text: "SUPERCOMPUTERS",   accent: true  },
  { text: "DON'T MAKE",       accent: false },
  { text: "HUMANS OBSOLETE.", accent: false },
  { text: "THEY MAKE THE",    accent: false },
  { text: "ONES WHO MASTER",  accent: false },
  { text: "THEM —",           accent: false },
  { text: "SUPERHUMAN.",      accent: true  },
]

export function SuperhumanSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden py-[120px] max-[600px]:py-[80px]"
      style={{ background: '#04090C' }}
    >
      {/* ── Ambient background glow ── */}
      <div
        className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[700px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(41,230,140,0.07) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[-100px] right-[-200px] w-[700px] h-[500px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(41,230,140,0.05) 0%, transparent 70%)',
        }}
      />

      {/* ── Manifesto ── */}
      <div className="relative z-[2] px-12 max-[600px]:px-6 max-w-[1100px] mx-auto">
        <motion.div
          className="flex flex-col gap-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px", amount: 0.3 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {manifesto.map((line, i) => (
            <motion.span
              key={i}
              className="block overflow-hidden uppercase"
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(44px, 8.5vw, 112px)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.0,
                color: line.accent ? '#29E68C' : 'rgba(236,233,222,0.13)',
              }}
              variants={{
                hidden: { opacity: 0, y: 80, skewY: 6, scale: 0.9 },
                visible: {
                  opacity: 1,
                  y: 0,
                  skewY: 0,
                  scale: 1,
                  transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            >
              {line.text}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
