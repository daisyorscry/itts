import type { Testimonial } from "./testimonials-data"

interface TestimonialCardProps {
  t: Testimonial
}

export function TestimonialCard({ t }: TestimonialCardProps) {
  return (
    <div className="tsm-card">
      <div className="tsm-card-inner">
        {/* Quote mark */}
        <div className="tsm-quote-mark">"</div>

        {/* Quote text */}
        <p className="tsm-quote-text">{t.quote}</p>

        {/* Footer */}
        <div className="tsm-card-footer">
          <div className="tsm-avatar-wrap">
            <img src={t.avatar} alt={t.name} className="tsm-avatar" />
            <div className="tsm-avatar-ring" />
          </div>
          <div className="tsm-author-info">
            <span className="tsm-author-name">{t.name}</span>
            <span className="tsm-author-role">
              {t.role} · <span className="tsm-author-company">{t.company}</span>
            </span>
          </div>
          <span
            className="tsm-track-badge"
            style={{ "--track-color": t.trackColor } as React.CSSProperties}
          >
            {t.track}
          </span>
        </div>
      </div>
    </div>
  )
}
