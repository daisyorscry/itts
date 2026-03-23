import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Track } from "./tracks";

interface NavigationControlsProps {
  tracks: Track[];
  current: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

export function NavigationControls({
  tracks,
  current,
  onPrev,
  onNext,
  onSelect,
}: NavigationControlsProps) {
  return (
    <>
      {/* Nav controls */}
      <div
        style={{
          position: "absolute",
          bottom: "48px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          zIndex: 3,
        }}
      >
        {/* Arrows */}
        {[
          { fn: onPrev, Icon: ChevronLeft },
          { fn: onNext, Icon: ChevronRight },
        ].map(({ fn, Icon }, i) => (
          <button
            key={i}
            onClick={fn}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              border: "1.5px solid rgba(236,233,222,0.15)",
              background: "rgba(236,233,222,0.08)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ECE9DE",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = "rgba(236,233,222,0.18)";
              b.style.borderColor = "rgba(236,233,222,0.3)";
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget as HTMLButtonElement;
              b.style.background = "rgba(236,233,222,0.08)";
              b.style.borderColor = "rgba(236,233,222,0.15)";
            }}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>

      {/* Indicator dots */}
      <div
        style={{
          position: "absolute",
          bottom: "104px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        {tracks.map((t, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              height: "4px",
              width: i === current ? "28px" : "8px",
              borderRadius: "999px",
              border: "none",
              padding: 0,
              cursor: "pointer",
              background:
                i === current
                  ? t.tagColor
                  : "rgba(236,233,222,0.2)",
              transition: "all 0.35s ease",
            }}
          />
        ))}
      </div>
    </>
  );
}
