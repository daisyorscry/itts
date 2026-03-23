import { motion, useScroll, useSpring } from "motion/react"
import { ProjectSection } from "./ProjectSection"
import { projects } from "./data"

export function HowItWorksSection() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <div className="bg-[#04090C] relative">
      {/* ── Intro ── */}
      <section className="md:min-h-screen md:flex md:flex-col md:justify-center items-center text-center relative bg-[#04090C] md:px-0 px-6 max-md:pt-8 max-md:pb-10">
        <motion.h2
          className="font-['Sora'] text-[clamp(52px,9vw,112px)] font-extrabold tracking-[-0.04em] leading-[1.0] text-[#ECE9DE] m-0"
          initial={{
            opacity: 0,
            y: 120,
            rotateX: -20,
            scale: 0.85,
            filter: "blur(15px)",
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            filter: "blur(0px)",
          }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 1.4,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.15,
          }}
          style={{ perspective: "1200px" }}
        >
          {/* Desktop text */}
          <span className="max-md:hidden">
            Not just learning
            <br />
            <span className="text-accent">We build together</span>
          </span>
          {/* Mobile text — shorter */}
          <span className="md:hidden">
            Build together
            <br />
            <span className="text-accent">Just learning</span>
          </span>
        </motion.h2>

        <motion.div
          className="absolute md:bottom-10 bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-['Outfit'] text-[10px] tracking-[0.14em] text-[rgba(41,230,140,0.4)] uppercase max-md:hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 1.2,
            delay: 0.6,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            scroll to view projects
          </motion.span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3v10M4 9l4 4 4-4"
              stroke="#29E68C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </section>

      {/* ── Projects ── */}
      {projects.map((p, i) => (
        <ProjectSection key={p.id} project={p} index={i} />
      ))}

      {/* progress bar */}
      <motion.div
        className="fixed left-0 right-0 bottom-0 h-[3px] bg-gradient-to-r from-accent to-accent/30 origin-left z-[9999] motion-reduce:hidden"
        style={{ scaleX }}
      />
    </div>
  )
}
