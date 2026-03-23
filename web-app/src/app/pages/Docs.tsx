import { motion } from "motion/react";
import {
  Code,
  FileText,
  Video,
  ArrowRight,
  ChevronRight,
  Clock,
  BookOpen,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
};

const tracks = [
  {
    title: "Networking",
    description:
      "From fundamentals to advanced infrastructure — learn how data moves across the world.",
    modules: [
      { title: "Network Fundamentals", lessons: 12, duration: "3 hours" },
      { title: "Routing & Switching", lessons: 15, duration: "4 hours" },
      { title: "Network Security", lessons: 10, duration: "2.5 hours" },
      { title: "Cloud Networking", lessons: 8, duration: "2 hours" },
    ],
  },
  {
    title: "DevSecOps",
    description:
      "Integrate security into every phase of development. Build, deploy, and protect production systems.",
    modules: [
      { title: "Linux Administration", lessons: 18, duration: "5 hours" },
      { title: "CI/CD Pipelines", lessons: 12, duration: "3 hours" },
      { title: "Docker & Kubernetes", lessons: 14, duration: "4 hours" },
      { title: "Security Automation", lessons: 10, duration: "3 hours" },
    ],
  },
  {
    title: "Programming",
    description:
      "Master modern web development from frontend to backend. Build real-world applications that scale.",
    modules: [
      { title: "JavaScript Fundamentals", lessons: 20, duration: "6 hours" },
      { title: "React Mastery", lessons: 16, duration: "5 hours" },
      { title: "Backend with Node.js", lessons: 14, duration: "4 hours" },
      { title: "Database Design", lessons: 10, duration: "3 hours" },
    ],
  },
];

const resources = [
  {
    title: "Cheat Sheets",
    desc: "Quick reference guides for commands, syntax, and common patterns across all tracks.",
    icon: FileText,
  },
  {
    title: "Video Tutorials",
    desc: "Step-by-step video walkthroughs recorded from live workshops and community sessions.",
    icon: Video,
  },
  {
    title: "Code Examples",
    desc: "Real-world project templates and boilerplate code to jump-start your learning.",
    icon: Code,
  },
];

export function Docs() {
  return (
    <div className="overflow-x-clip bg-[#04090C]">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl bg-[#04090C] text-white relative overflow-hidden min-h-[70vh] flex items-center">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative px-4 sm:px-6 lg:px-8 py-28 md:py-36">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="font-['Sora'] text-[clamp(40px,7vw,96px)] font-extrabold tracking-[-0.04em] leading-[1.0] max-w-5xl mb-6"
          >
            Learning
            <br />
            <span className="text-accent">Docs.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="font-['Outfit'] text-[clamp(16px,2vw,20px)] text-white/60 max-w-2xl leading-relaxed"
          >
            Comprehensive guides, modules, and resources for all 3 tracks.
            Everything you need to go from zero to production-ready.
          </motion.p>
        </div>
      </section>

      {/* ── COLORFUL SEPARATOR ───────────────────────────── */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="h-1.5 flex"
        style={{ transformOrigin: "left" }}
      >
        <div className="flex-1 bg-[#38BDF8]" />
        <div className="flex-1 bg-purple-500" />
        <div className="flex-1 bg-[#F472B6]" />
        <div className="flex-1 bg-accent" />
        <div className="flex-1 bg-blue-500" />
      </motion.div>

      {/* ── DOCS BY TRACK ────────────────────────────────── */}
      <section className="bg-[#ECE9DE] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-14">
            <h2 className="font-['Sora'] text-[clamp(28px,4vw,52px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-[#04090C]">
              Documentation by Track
            </h2>
          </motion.div>

          <div className="space-y-5">
            {tracks.map((track, i) => (
              <motion.div
                key={track.title}
                {...fadeUp}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.08,
                }}
                className="rounded-3xl overflow-hidden border border-black/[0.08] hover:border-black/[0.14] transition-colors duration-300"
                style={{ background: `#e5e4d8` }}
              >
                {/* Track header */}
                <div className="px-8 md:px-10 pt-8 pb-7">
                  <h3 className="font-['Sora'] font-extrabold text-[clamp(20px,2.5vw,28px)] tracking-tight text-[#04090C] mb-1">
                    {track.title}
                  </h3>
                  <p className="font-['Outfit'] text-[#04090C]/55 text-sm leading-relaxed max-w-xl">
                    {track.description}
                  </p>
                </div>

                {/* Modules list */}
                <div
                  className="mx-6 md:mx-8 mb-6 rounded-2xl overflow-hidden"
                  style={{ background: `#d8d7cb` }}
                >
                  {track.modules.map((module, mi) => (
                    <motion.div
                      key={mi}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className={`group flex items-center gap-4 md:gap-6 px-6 py-4 cursor-pointer hover:bg-black/[0.04] transition-colors duration-150 ${
                        mi < track.modules.length - 1
                          ? "border-b border-black/[0.06]"
                          : ""
                      }`}
                    >
                      {/* Title */}
                      <span className="font-['Outfit'] font-semibold text-[#04090C] text-base flex-1 leading-snug min-w-0">
                        {module.title}
                      </span>

                      {/* Meta */}
                      <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1.5 text-[#04090C]/40">
                          <BookOpen size={13} />
                          <span className="font-['Outfit'] text-sm">
                            {module.lessons} lessons
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#04090C]/40">
                          <Clock size={13} />
                          <span className="font-['Outfit'] text-sm">
                            {module.duration}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight
                        size={15}
                        className="text-[#04090C]/20 group-hover:text-[#04090C]/50 group-hover:translate-x-0.5 transition-all duration-150 flex-shrink-0"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESOURCES ─────────────────────────────────────── */}
      <section className="bg-[#04090C] py-20 md:py-28 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[500px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div {...fadeUp} className="mb-14">
            <h2 className="font-['Sora'] text-[clamp(28px,4vw,52px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-white">
              Additional Resources
            </h2>
            <p className="font-['Outfit'] text-white/45 text-lg mt-3 max-w-xl leading-relaxed">
              Supplement your learning with curated materials from the ITTS
              community.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {resources.map((res, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.08,
                }}
                className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 hover:border-white/15 transition-colors duration-300 group"
              >
                <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-6">
                  <res.icon className="text-accent" size={22} />
                </div>
                <h3 className="font-['Sora'] text-white font-extrabold text-xl tracking-tight mb-3">
                  {res.title}
                </h3>
                <p className="font-['Outfit'] text-white/45 text-sm leading-relaxed">
                  {res.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="bg-[#ECE9DE] py-20 md:py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#04090C] rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                backgroundSize: "60px 60px",
              }}
            />
            <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div {...fadeUp} className="relative max-w-2xl">
              <h2 className="font-['Sora'] text-[clamp(28px,5vw,60px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-white mb-4">
                Can&apos;t find what
                <br />
                <span className="text-accent">you&apos;re looking for?</span>
              </h2>
              <p className="font-['Outfit'] text-white/55 text-lg leading-relaxed mb-8">
                Reach out to the community or suggest new documentation topics.
                We build this knowledge base together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-black rounded-full font-['Outfit'] font-semibold hover:bg-accent/90 transition-colors">
                  <span>Join Discord</span>
                  <ArrowRight size={16} />
                </button>
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/15 rounded-full font-['Outfit'] font-semibold hover:bg-white/15 transition-colors">
                  Request Documentation
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
