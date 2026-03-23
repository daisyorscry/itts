import { motion } from "motion/react"
import { MarqueeRow } from "./MarqueeRow"
import { row1, row2, row3 } from "./tech-stack-data"

export function WhatYoullMaster() {
  return (
    <section className="bg-[#04090C] pt-[120px] max-md:pt-[60px] pb-[100px] max-md:pb-0 overflow-hidden relative">
      <div className="max-w-[1280px] mx-auto px-8 max-md:px-5 grid grid-cols-[1fr_1.2fr] max-md:grid-cols-1 gap-16 max-md:gap-6 items-start">
        {/* left: title */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2,
            }}
            className="font-['Outfit'] text-[11px] max-md:text-[10px] font-bold tracking-[0.22em] text-[#29E68C]/50 uppercase mb-6 max-md:mb-4 flex items-center gap-3.5 max-md:gap-2.5"
          >
            <span className="block w-10 max-md:w-4 h-[1px] bg-[#29E68C]/35" />
            TECH STACK
            <span className="block w-10 max-md:w-4 h-[1px] bg-[#29E68C]/35" />
          </motion.div>

          <h2 className="font-['Sora'] text-[clamp(48px,10vw,130px)] max-md:text-[clamp(42px,12vw,64px)] font-extrabold tracking-[-0.04em] leading-[0.92] m-0">
            <span className="block text-[#ECE9DE]">WHAT</span>
            <span
              className="block text-transparent"
              style={{
                WebkitTextStroke: "2px rgba(236,233,222,0.2)",
              }}
            >
              YOU'LL
            </span>
            <span className="block text-[#29E68C]">MASTER</span>
          </h2>
        </motion.div>

        {/* right: stats */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.15,
          }}
          className="pb-3 max-md:pb-0"
        >
          <p className="font-['Outfit'] text-[15px] max-md:text-sm text-[#ECE9DE]/45 leading-[1.7] m-0 mb-8 max-md:mb-5 max-w-[320px] max-md:max-w-full">
            From infrastructure to code — we cover the full modern tech stack yang dipakai
            industri.
          </p>

          <div className="flex flex-col gap-0">
            {[
              {
                label: "Technologies",
                value: "20+",
                color: "#29E68C",
              },
              {
                label: "Learning Tracks",
                value: "3",
                color: "#38BDF8",
              },
              {
                label: "Hands-on Projects",
                value: "100%",
                color: "#F472B6",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between border-b border-[#ECE9DE]/[0.08] py-4 max-md:py-2.5 gap-8 max-md:gap-5"
              >
                <span className="font-['Outfit'] text-[13px] max-md:text-xs text-[#ECE9DE]/40 tracking-[0.04em]">
                  {stat.label}
                </span>
                <span
                  className="font-['Sora'] text-[28px] max-md:text-[22px] font-extrabold tracking-[-0.03em]"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Marquee rows ── */}
      <div className="mt-[72px] max-md:mt-3 relative">
        {/* edge fades */}
        <div className="absolute top-0 left-0 bottom-0 w-[220px] max-md:w-10 bg-gradient-to-r from-[#04090C] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-[220px] max-md:w-10 bg-gradient-to-l from-[#04090C] to-transparent z-10 pointer-events-none" />

        {/* green accent line between rows */}
        <div className="relative">
          <MarqueeRow items={row1} baseVelocity={-1.2} size="xl" />
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#29E68C]/10 to-transparent mx-20 max-md:mx-0" />
          <MarqueeRow items={row2} baseVelocity={1} size="xl" />
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#29E68C]/10 to-transparent mx-20 max-md:mx-0" />
          <MarqueeRow items={row3} baseVelocity={-0.8} size="xl" />
        </div>
      </div>
    </section>
  )
}
