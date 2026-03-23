import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../../figma/ImageWithFallback";
import type { Track } from "./tracks";

interface TrackCardProps {
  track: Track;
  current: number;
}

export function TrackCard({ track, current }: TrackCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current}
        initial={{ opacity: 0, x: 120 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -120 }}
        transition={{
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          position: "relative",
          background:
            "linear-gradient(135deg, #0d1a24 0%, #1a1129 100%)",
          border: `1px solid ${track.borderColor}`,
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${track.borderColor}`,
        }}
      >
        {/* Card image */}
        <div
          style={{
            height: "240px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <ImageWithFallback
            src={track.image}
            alt={track.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to bottom, rgba(13,26,36,0.1) 0%, rgba(13,26,36,0.9) 100%)`,
            }}
          />

          {/* Track icon + name on image */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "24px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: track.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 32px ${track.gradientFrom}60`,
              }}
            >
              {(() => {
                const I = track.icon;
                return <I size={24} color="#fff" />;
              })()}
            </div>
            <div>
              <div
                style={{
                  fontFamily:
                    "'Space Grotesk', sans-serif",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#ECE9DE",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {track.title}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  color: track.tagColor,
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                  marginTop: "5px",
                }}
              >
                {track.subtitle}
              </div>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "24px 26px 26px" }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              color: "rgba(236,233,222,0.6)",
              lineHeight: 1.7,
              margin: "0 0 18px",
              fontWeight: 500,
            }}
          >
            {track.description}
          </p>
          <div
            style={{
              display: "flex",
              gap: "9px",
              flexWrap: "wrap",
            }}
          >
            {track.tags.map((tag, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: `1px solid ${track.borderColor}`,
                  background: track.bgColor,
                  color: track.tagColor,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
