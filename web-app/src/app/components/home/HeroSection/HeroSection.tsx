import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { tracks } from "./tracks";
import { HeroLeftSide } from "./HeroLeftSide";
import { TrackCard } from "./TrackCard";
import { NavigationControls } from "./NavigationControls";

interface HeroSectionProps {
  onRegisterOpen: () => void;
}

export function HeroSection({ onRegisterOpen }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((p) => (p + 1) % tracks.length), []);
  const prev = useCallback(() =>
    setCurrent((p) => (p - 1 + tracks.length) % tracks.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [paused, next]);

  const track = tracks[current];

  return (
    <section
      className="flex min-h-[85vh] overflow-hidden max-md:flex-col"
    >
      {/* ── LEFT — Warm side ── */}
      <HeroLeftSide onRegisterOpen={onRegisterOpen} />

      {/* ── RIGHT — Dark side ── */}
      <div
        className="hero-right max-md:!flex-none max-md:!w-full max-md:py-[72px] max-md:px-6 max-md:min-h-[65vh]"
        style={{
          flex: "0 0 40%",
          background:
            "linear-gradient(135deg, #0a1628 0%, #1a0b2e 100%)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          padding: "120px 56px 80px",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Ambient glow */}
        <motion.div
          animate={{
            background: `radial-gradient(ellipse at 50% 30%, ${track.gradientFrom}18 0%, transparent 70%)`,
          }}
          transition={{ duration: 0.8 }}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        />

        {/* Main card container */}
        <div
          className="max-md:max-w-full"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "480px",
            zIndex: 1,
          }}
        >
          {/* Main active card */}
          <TrackCard track={track} current={current} />
        </div>

        {/* Navigation controls and dots */}
        <NavigationControls
          tracks={tracks}
          current={current}
          onPrev={prev}
          onNext={next}
          onSelect={setCurrent}
        />
      </div>
    </section>
  );
}