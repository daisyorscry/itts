import { motion, useScroll } from "motion/react"
import { useRef } from "react"
import { ImageWithFallback } from "../../figma/ImageWithFallback"
import type { Project } from "./data"

interface ProjectSectionProps {
  project: Project
  index: number
}

export function ProjectSection({ project, index }: ProjectSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const rev = index % 2 === 1

  return (
    <section
      ref={ref}
      className={`relative grid md:grid-cols-[40fr_60fr] grid-cols-1 overflow-hidden bg-[#04090C] md:items-center
    items-start
    md:px-20 md:py-[100px] md:gap-20
    px-6 py-12 gap-8
    ${rev ? "md:rtl" : ""}`}
    >
      {/* ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at ${rev ? "75% 50%" : "25% 50%"}, rgba(${project.rgb},0.09) 0%, transparent 60%)`,
        }}
      />

      {/* top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px z-[1]"
        style={{
          background: `linear-gradient(to right, rgba(${project.rgb},0.6), rgba(${project.rgb},0.0))`,
        }}
      />

      {/* ── Info panel ── */}
      <motion.div
        className={`relative z-[2] flex flex-col gap-0 ${rev ? "md:ltr" : ""}`}
        initial={{ opacity: 0, x: rev ? 56 : -56 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* meta row */}
        <div className="flex items-center gap-3.5 mb-7 flex-wrap">
          <span
            className="font-['Outfit'] text-[11px] font-bold tracking-[0.1em] py-[5px] px-3.5 rounded-full border"
            style={{
              color: project.accent,
              borderColor: `rgba(${project.rgb},0.25)`,
            }}
          >
            {project.track}
          </span>
          <span
            className="font-['Outfit'] text-[10px] font-bold tracking-[0.16em] py-[5px] px-3.5 rounded-full border flex items-center gap-[7px] ml-auto"
            style={{
              color:
                project.status === "LIVE"
                  ? "#29E68C"
                  : project.status === "BETA"
                    ? "#F472B6"
                    : "rgba(236,233,222,0.35)",
              borderColor:
                project.status === "LIVE"
                  ? "rgba(41,230,140,0.35)"
                  : project.status === "BETA"
                    ? "rgba(244,114,182,0.35)"
                    : "rgba(236,233,222,0.15)",
            }}
          >
            {project.status.includes("DEVELOPMENT") && (
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(41,230,140,0.9)] flex-shrink-0 animate-pulse" />
            )}
            {project.status}
          </span>
        </div>

        {/* name */}
        <h3 className="m-0 mb-6 leading-[0.9]">
          <span className="block font-['Sora'] text-[clamp(13px,1.4vw,16px)] font-bold tracking-[0.22em] text-[rgba(236,233,222,0.3)] uppercase mb-1">
            ITTS
          </span>
          <span
            className="block font-['Sora'] text-[clamp(52px,7.5vw,92px)] md:text-[clamp(52px,7.5vw,92px)] text-[clamp(44px,12vw,64px)] font-extrabold tracking-[-0.04em] leading-[1.0] uppercase"
            style={{ color: project.accent }}
          >
            {project.name}
          </span>
        </h3>

        {/* divider */}
        <div
          className="w-12 h-0.5 rounded-sm mb-5"
          style={{ background: `rgba(${project.rgb},0.3)` }}
        />

        <p className="font-['Sora'] text-[clamp(16px,2vw,21px)] font-semibold tracking-[-0.01em] text-[#ECE9DE] m-0 mb-3.5 leading-[1.3]">
          {project.tagline}
        </p>
        <p className="font-['Outfit'] text-[clamp(13px,1.3vw,15px)] text-[rgba(236,233,222,0.5)] leading-[1.7] m-0 mb-7 max-w-[440px]">
          {project.desc}
        </p>

        {/* tech stack */}
        <div className="flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <span
              key={t}
              className="font-['Outfit'] text-[10px] font-bold tracking-[0.1em] py-[5px] px-3 rounded-[5px] border"
              style={{
                borderColor: `rgba(${project.rgb},0.22)`,
                color: `rgba(${project.rgb},0.75)`,
                background: `rgba(${project.rgb},0.05)`,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ── Decorative panel ── */}
      <motion.div
        className={`relative z-[2] flex items-center justify-center ${rev ? "md:ltr" : ""}`}
        initial={{ opacity: 0, x: rev ? -56 : 56 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.12,
        }}
      >
        {/* Project image */}
        <div className="relative z-[1] w-full h-[560px] md:h-[560px] h-[320px]">
          <ImageWithFallback
            src={project.image}
            alt={`${project.name} - ${project.tagline}`}
            className="w-full h-full object-cover rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_80px_rgba(0,0,0,0.6),0_8px_24px_rgba(0,0,0,0.4)]"
          />
          {/* Accent border overlay */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none z-0"
            style={{
              borderColor: `rgba(${project.rgb},0.3)`,
              boxShadow: `0 0 0 1px rgba(${project.rgb},0.1), 0 24px 64px rgba(${project.rgb},0.12)`,
            }}
          />
        </div>
      </motion.div>
    </section>
  )
}
