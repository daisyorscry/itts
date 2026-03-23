import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useVelocity,
  useSpring,
  useAnimationFrame,
} from "motion/react"
import { useRef } from "react"
import { TRACK_STYLE, wrapValue, type TechItem } from "./tech-stack-data"

interface MarqueeRowProps {
  items: TechItem[]
  baseVelocity: number
  size?: "md" | "lg" | "xl"
}

export function MarqueeRow({ items, baseVelocity, size = "lg" }: MarqueeRowProps) {
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false })
  const directionFactor = useRef<number>(1)
  const x = useTransform(baseX, (v) => `${wrapValue(-50, 0, v)}%`)

  useAnimationFrame((_t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000)
    if (velocityFactor.get() < 0) directionFactor.current = -1
    else if (velocityFactor.get() > 0) directionFactor.current = 1
    moveBy += directionFactor.current * moveBy * velocityFactor.get()
    baseX.set(baseX.get() + moveBy)
  })

  const doubled = [...items, ...items, ...items, ...items]

  return (
    <div className="overflow-hidden whitespace-nowrap py-[22px] max-md:pt-[6px] max-md:pb-0">
      <motion.div className="inline-flex gap-[22px] max-md:gap-3" style={{ x }}>
        {doubled.map((item, i) => {
          const Icon = item.icon
          const ts = TRACK_STYLE[item.category] ?? TRACK_STYLE["Programming"]
          return (
            <div
              key={i}
              className="inline-flex items-center gap-4 max-md:gap-2 px-11 max-md:px-4 py-[22px] max-md:py-2 rounded-full border border-[#ECE9DE]/[0.07] bg-white/[0.02] flex-shrink-0"
            >
              <Icon
                size={26}
                color={ts.color}
                strokeWidth={1.5}
                className="max-md:w-4 max-md:h-4"
              />
              <span className="font-['Sora'] text-[34px] max-md:text-sm font-bold tracking-[-0.02em] text-[#ECE9DE]">
                {item.name}
              </span>
              <span
                className="font-['Outfit'] text-xs max-md:text-[8px] font-bold tracking-[0.14em] uppercase rounded-[5px] px-2.5 max-md:px-1.5 py-[3px] max-md:py-0.5"
                style={{
                  color: ts.color,
                  background: ts.bg,
                  border: `1px solid ${ts.border}`,
                }}
              >
                {item.category}
              </span>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
