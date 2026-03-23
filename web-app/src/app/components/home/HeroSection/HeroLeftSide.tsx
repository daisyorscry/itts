import { motion } from "motion/react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

interface HeroLeftSideProps {
  onRegisterOpen: () => void;
}

export function HeroLeftSide({ onRegisterOpen }: HeroLeftSideProps) {
  return (
    <div
      className="hero-left max-md:!flex-none max-md:!w-full max-md:py-[140px] max-md:px-6 max-md:min-h-[70vh]"
      style={{
        flex: "0 0 60%",
        background: "#ECE9DE",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "200px 64px 80px 72px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 100, rotateX: -15, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)" }}
          transition={{
            duration: 1.4,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2,
          }}
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(48px, 8vw, 110px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.92,
            margin: "0 0 32px",
            textTransform: "uppercase",
            perspective: "1000px",
          }}
        >
          <motion.span
            style={{ display: "block", color: "#04090C" }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            BUILD YOUR
          </motion.span>
          <motion.span 
            style={{ color: "#29E68C" }}
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            TECH{" "}
          </motion.span>
          <motion.span 
            style={{ color: "#04090C" }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            FUTURE
          </motion.span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 60, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: "clamp(16px, 1.75vw, 22px)",
            color: "rgba(4,9,12,0.65)",
            lineHeight: 1.6,
            margin: "0 0 36px",
            maxWidth: "540px",
            fontWeight: 500,
          }}
        >
          Learn Networking, DevSecOps, and Programming
          through hands-on projects and real practice.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={onRegisterOpen}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#04090C",
              color: "#ECE9DE",
              border: "none",
              borderRadius: "12px",
              padding: "17px 32px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              letterSpacing: "-0.01em",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (
                e.currentTarget as HTMLButtonElement
              ).style.background = "#29E68C";
              (
                e.currentTarget as HTMLButtonElement
              ).style.color = "#04090C";
            }}
            onMouseLeave={(e) => {
              (
                e.currentTarget as HTMLButtonElement
              ).style.background = "#04090C";
              (
                e.currentTarget as HTMLButtonElement
              ).style.color = "#ECE9DE";
            }}
          >
            Start Learning <ArrowRight size={16} />
          </button>

          <Link
            to="/program"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(4,9,12,0.06)",
              color: "#04090C",
              borderRadius: "12px",
              padding: "17px 32px",
              border: "none",
              fontFamily: "'Inter', sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "-0.01em",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (
                e.currentTarget as HTMLAnchorElement
              ).style.background = "rgba(4,9,12,0.12)";
            }}
            onMouseLeave={(e) => {
              (
                e.currentTarget as HTMLAnchorElement
              ).style.background = "rgba(4,9,12,0.06)";
            }}
          >
            Explore Programs
          </Link>
        </motion.div>
      </div>
    </div>
  );
}