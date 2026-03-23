import { TestimonialCard } from "./TestimonialCard"
import type { Testimonial } from "./testimonials-data"

interface MarqueeRowProps {
  items: Testimonial[]
  reverse?: boolean
}

export function MarqueeRow({ items, reverse = false }: MarqueeRowProps) {
  const doubled = [...items, ...items]

  return (
    <div className="tsm-marquee-wrapper">
      <div className={`tsm-marquee-track ${reverse ? "tsm-marquee-reverse" : ""}`}>
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  )
}
