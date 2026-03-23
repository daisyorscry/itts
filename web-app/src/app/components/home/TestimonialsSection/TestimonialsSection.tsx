import { motion } from "motion/react"
import { MarqueeRow } from "./MarqueeRow"
import { row1, row2 } from "./testimonials-data"

export function TestimonialsSection() {
  return (
    <section className="tsm-section">
      {/* ── Header ── */}
      <motion.div
        className="tsm-header"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="tsm-eyebrow">MEMBER STORIES</span>
        <h2 className="tsm-heading">
          Mereka Udah
          <br />
          <span className="tsm-heading-accent">Buktiin.</span>
        </h2>
        <p className="tsm-subheading">
          Ratusan alumni ITTS sekarang kerja di perusahaan tech terbaik Indonesia —
          <br className="tsm-br" />
          dari startup hingga korporat Fortune 500.
        </p>
      </motion.div>

      {/* ── Marquee rows ── */}
      <motion.div
        className="tsm-marquee-area"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <MarqueeRow items={row1} />
        <MarqueeRow items={row2} reverse />
      </motion.div>

      {/* ── Bottom stat strip ── */}
      <motion.div
        className="tsm-stat-strip"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {[
          { value: "94%", label: "Placement Rate" },
          { value: "8mo", label: "Avg Time to Hired" },
          { value: "3 Track", label: "Spesialisasi" },
          { value: "500+", label: "Alumni Aktif" },
        ].map((s) => (
          <div key={s.label} className="tsm-stat-item">
            <span className="tsm-stat-value">{s.value}</span>
            <span className="tsm-stat-label">{s.label}</span>
          </div>
        ))}
      </motion.div>

      <StyleSheet />
    </section>
  )
}

function StyleSheet() {
  return (
    <style>{`
      /* ── Section ── */
      .tsm-section {
        background: #ECE9DE;
        padding: 100px 0 80px;
        overflow: hidden;
      }

      /* ── Header ── */
      .tsm-header {
        text-align: center;
        padding: 0 24px 64px;
        max-width: 720px;
        margin: 0 auto;
      }

      .tsm-eyebrow {
        display: inline-block;
        font-family: 'Outfit', sans-serif;
        font-size: 11px;
        letter-spacing: 0.22em;
        color: #04090C;
        background: rgba(4, 9, 12, 0.08);
        border: 1px solid rgba(4, 9, 12, 0.15);
        border-radius: 999px;
        padding: 5px 14px;
        margin-bottom: 24px;
      }

      .tsm-heading {
        font-family: 'Sora', sans-serif;
        font-size: clamp(48px, 8vw, 88px);
        font-weight: 800;
        line-height: 1.0;
        letter-spacing: -0.03em;
        color: #04090C;
        margin: 0 0 20px;
      }

      .tsm-heading-accent {
        color: #04090C;
        position: relative;
        display: inline-block;
      }

      .tsm-heading-accent::after {
        content: '';
        position: absolute;
        bottom: 4px;
        left: 0;
        right: 0;
        height: 5px;
        background: #29E68C;
        border-radius: 3px;
      }

      .tsm-subheading {
        font-family: 'Outfit', sans-serif;
        font-size: clamp(14px, 1.8vw, 17px);
        color: rgba(4, 9, 12, 0.55);
        line-height: 1.7;
        margin: 0;
      }

      .tsm-br { display: block; }
      @media (max-width: 600px) { .tsm-br { display: none; } }

      /* ── Marquee ── */
      .tsm-marquee-area {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .tsm-marquee-wrapper {
        width: 100%;
        overflow: hidden;
        mask-image: linear-gradient(
          to right,
          transparent 0%,
          black 8%,
          black 92%,
          transparent 100%
        );
        -webkit-mask-image: linear-gradient(
          to right,
          transparent 0%,
          black 8%,
          black 92%,
          transparent 100%
        );
      }

      .tsm-marquee-track {
        display: flex;
        gap: 20px;
        width: max-content;
        animation: tsm-scroll-left 40s linear infinite;
      }

      .tsm-marquee-reverse {
        animation: tsm-scroll-right 40s linear infinite;
      }

      @keyframes tsm-scroll-left {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }

      @keyframes tsm-scroll-right {
        from { transform: translateX(-50%); }
        to   { transform: translateX(0); }
      }

      .tsm-marquee-wrapper:hover .tsm-marquee-track {
        animation-play-state: paused;
      }

      /* ── Card ── */
      .tsm-card {
        flex-shrink: 0;
        width: 340px;
      }

      .tsm-card-inner {
        background: #04090C;
        border: 1px solid rgba(41, 230, 140, 0.12);
        border-radius: 20px;
        padding: 28px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        transition: border-color 0.25s ease, transform 0.25s ease;
        cursor: default;
        height: 100%;
      }

      .tsm-card-inner:hover {
        border-color: rgba(41, 230, 140, 0.35);
        transform: translateY(-3px);
      }

      .tsm-quote-mark {
        font-family: 'Sora', serif;
        font-size: 64px;
        line-height: 0.6;
        color: #29E68C;
        opacity: 0.5;
        font-weight: 800;
        padding-top: 16px;
      }

      .tsm-quote-text {
        font-family: 'Outfit', sans-serif;
        font-size: 14.5px;
        line-height: 1.65;
        color: rgba(236, 233, 222, 0.8);
        margin: 0;
        flex: 1;
      }

      /* ── Card footer ── */
      .tsm-card-footer {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid rgba(236, 233, 222, 0.07);
      }

      .tsm-avatar-wrap {
        position: relative;
        flex-shrink: 0;
      }

      .tsm-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        display: block;
      }

      .tsm-avatar-ring {
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        border: 1.5px solid #29E68C;
        opacity: 0.5;
      }

      .tsm-author-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .tsm-author-name {
        font-family: 'Sora', sans-serif;
        font-size: 13px;
        font-weight: 700;
        color: #ECE9DE;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tsm-author-role {
        font-family: 'Outfit', sans-serif;
        font-size: 11.5px;
        color: rgba(236, 233, 222, 0.4);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .tsm-author-company {
        color: rgba(236, 233, 222, 0.6);
      }

      .tsm-track-badge {
        flex-shrink: 0;
        font-family: 'Outfit', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid var(--track-color);
        color: var(--track-color);
        white-space: nowrap;
        opacity: 0.85;
      }

      /* ── Stat strip ── */
      .tsm-stat-strip {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0;
        margin: 56px 24px 0;
        background: #04090C;
        border-radius: 20px;
        max-width: 760px;
        margin-left: auto;
        margin-right: auto;
        overflow: hidden;
      }

      .tsm-stat-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 28px 20px;
        border-right: 1px solid rgba(236, 233, 222, 0.07);
      }

      .tsm-stat-item:last-child {
        border-right: none;
      }

      .tsm-stat-value {
        font-family: 'Sora', sans-serif;
        font-size: clamp(22px, 3.5vw, 30px);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #29E68C;
      }

      .tsm-stat-label {
        font-family: 'Outfit', sans-serif;
        font-size: 11px;
        letter-spacing: 0.1em;
        color: rgba(236, 233, 222, 0.4);
        text-transform: uppercase;
        text-align: center;
      }

      /* ── Mobile ── */
      @media (max-width: 600px) {
        .tsm-section {
          padding: 72px 0 60px;
        }
        .tsm-card {
          width: 280px;
        }
        .tsm-card-inner {
          padding: 22px;
        }
        .tsm-stat-strip {
          flex-wrap: wrap;
          border-radius: 16px;
          margin: 40px 16px 0;
        }
        .tsm-stat-item {
          flex: 1 1 50%;
          border-right: none;
          border-bottom: 1px solid rgba(236, 233, 222, 0.07);
          padding: 20px 16px;
        }
        .tsm-stat-item:nth-child(odd) {
          border-right: 1px solid rgba(236, 233, 222, 0.07);
        }
        .tsm-stat-item:nth-last-child(-n+2) {
          border-bottom: none;
        }
      }

      /* ── Reduced motion ── */
      @media (prefers-reduced-motion: reduce) {
        .tsm-marquee-track,
        .tsm-marquee-reverse {
          animation: none;
        }
      }
    `}</style>
  )
}
