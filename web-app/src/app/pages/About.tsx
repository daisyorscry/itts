import { motion } from "motion/react";
import {
  Users,
  Target,
  Heart,
  Zap,
  Network,
  Shield,
  Code,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "@components/figma/ImageWithFallback";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
};

export function About() {
  return (
    <div className="overflow-x-clip  bg-[#04090C]">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto bg-[#04090C] text-white relative overflow-hidden min-h-[70vh] flex items-center">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        <div className=" relative py-28 md:py-36">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.1,
            }}
            className="font-['Sora'] text-[clamp(40px,7vw,96px)] font-extrabold tracking-[-0.04em] leading-[1.0] max-w-4xl mb-6"
          >
            Building Indonesia&apos;s
            <br />
            Tech Future,{" "}
            <span className="text-accent">Together.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2,
            }}
            className="font-['Outfit'] text-[clamp(16px,2vw,20px)] text-white/60 max-w-2xl leading-relaxed"
          >
            ITTS Community is more than a learning platform —
            it&apos;s a movement of passionate students and
            professionals committed to mastering technology and
            sharing knowledge across 3 focused tracks.
          </motion.p>
        </div>
      </section>

      {/* ── STORY / IMAGE ─────────────────────────────────── */}
      <section className="bg-[#04090C] py-20 md:py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <motion.div {...fadeUp}>
              <h2 className="font-['Sora'] text-[clamp(32px,5vw,60px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-white mb-6">
                Started small.
                <br />
                <span className="text-accent">
                  Growing fast.
                </span>
              </h2>
              <p className="font-['Outfit'] text-white/55 text-lg leading-relaxed mb-6">
                What began as a small study group grew into a
                full-fledged tech community. We started because
                we felt the gap — students finishing courses but
                still struggling to land real jobs. ITTS was
                built to bridge that gap.
              </p>
              <p className="font-['Outfit'] text-white/55 text-lg leading-relaxed">
                We combine structured learning, real project
                experience, and a tight-knit community so you
                never have to figure it out alone.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{
                duration: 0.75,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.15,
              }}
              className="rounded-3xl overflow-hidden aspect-[4/3] border border-white/10"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1587038787166-becd08a156f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="ITTS Community"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3 TRACKS ──────────────────────────────────────── */}
      <section className="bg-[#ECE9DE] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-14">
            <h2 className="font-['Sora'] text-[clamp(32px,5vw,64px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-[#04090C] max-w-2xl">
              Three tracks.
              <br />
              <span
                style={{
                  WebkitTextStroke: "2px #29E68C",
                  color: "transparent",
                }}
              >
                One community.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Network,
                title: "Networking",
                subtitle: "Infrastructure & System Admin",
                desc: "Master network protocols, infrastructure design, and system administration from basics to enterprise-level.",
                color: "#38BDF8",
                tags: [
                  "OSI Model",
                  "Cisco/MikroTik",
                  "Cloud Networking",
                ],
              },
              {
                icon: Shield,
                title: "DevSecOps",
                subtitle: "Security-First Operations",
                desc: "Build, deploy, and secure applications with modern CI/CD pipelines, containerization, and cloud platforms.",
                color: "#F472B6",
                tags: [
                  "Docker & K8s",
                  "CI/CD",
                  "Cloud Security",
                ],
              },
              {
                icon: Code,
                title: "Programming",
                subtitle: "Full-Stack Development",
                desc: "Create production-ready applications with modern frameworks, databases, and industry best practices.",
                color: "#29E68C",
                tags: ["React", "Backend APIs", "Databases"],
              },
            ].map((track, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.1,
                }}
                className="bg-[#e5e4d8] rounded-3xl p-7 flex flex-col gap-5 border border-black/[0.08] hover:border-black/[0.16] transition-colors duration-300"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `${track.color}22`,
                    border: `1px solid ${track.color}60`,
                  }}
                >
                  <track.icon
                    size={26}
                    style={{ color: track.color }}
                  />
                </div>
                <div>
                  <h3 className="font-['Sora'] text-[#04090C] font-extrabold text-xl tracking-tight mb-1">
                    {track.title}
                  </h3>
                  <p className="font-['Outfit'] text-[#04090C]/55 text-sm mb-3">
                    {track.subtitle}
                  </p>
                  <p className="font-['Outfit'] text-[#04090C]/50 text-sm leading-relaxed">
                    {track.desc}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {track.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-['Outfit'] text-xs px-3 py-1 rounded-full"
                      style={{
                        background: `${track.color}20`,
                        color: track.color,
                        border: `1px solid ${track.color}40`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ───────────────────────────────────── */}
      <section className="bg-[#04090C] py-20 md:py-28 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div {...fadeUp} className="mb-14">
            <h2 className="font-['Sora'] text-[clamp(32px,5vw,64px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-white">
              Core values that
              <br />
              <span className="text-accent">
                drive us forward.
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: Heart,
                title: "Passion",
                desc: "We genuinely love technology and learning. That energy is what brings the community to life every day.",
                color: "#F472B6",
              },
              {
                icon: Users,
                title: "Collaboration",
                desc: "No one grows in isolation. We learn better together — through code reviews, pair programming, and shared projects.",
                color: "#38BDF8",
              },
              {
                icon: Zap,
                title: "Innovation",
                desc: "We embrace new tools, languages, and ideas. Staying current is not optional \u2014 it's our standard.",
                color: "#FACC15",
              },
              {
                icon: Target,
                title: "Excellence",
                desc: "Good enough is never the goal. We push for mastery, clean code, and outcomes that actually matter.",
                color: "#29E68C",
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.08,
                }}
                className="flex gap-5 bg-white/[0.03] border border-white/[0.08] rounded-3xl p-7 hover:border-white/15 transition-colors duration-300"
              >
                <div
                  className="w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center mt-0.5"
                  style={{
                    background: `${value.color}18`,
                    border: `1px solid ${value.color}30`,
                  }}
                >
                  <value.icon
                    size={22}
                    style={{ color: value.color }}
                  />
                </div>
                <div>
                  <h3 className="font-['Sora'] text-white font-extrabold text-xl tracking-tight mb-2">
                    {value.title}
                  </h3>
                  <p className="font-['Outfit'] text-white/50 text-sm leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────────── */}
      <section className="bg-[#ECE9DE] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-14">
            <h2 className="font-['Sora'] text-[clamp(32px,5vw,64px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-[#04090C]">
              Core team &amp;
              <br />
              <span className="text-accent">volunteers.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
            {[
              {
                name: "Reza Pratama",
                role: "Founder",
                color: "#29E68C",
              },
              {
                name: "Siti Nurhaliza",
                role: "Program Lead",
                color: "#38BDF8",
              },
              {
                name: "Andi Wijaya",
                role: "Tech Lead",
                color: "#F472B6",
              },
              {
                name: "Maya Kusuma",
                role: "Community Mgr",
                color: "#FACC15",
              },
              {
                name: "Fajar Ramadan",
                role: "Content Lead",
                color: "#A78BFA",
              },
              {
                name: "Lina Hartono",
                role: "Events Lead",
                color: "#FB923C",
              },
            ].map((member, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.06,
                }}
              >
                <div
                  className="w-full aspect-square rounded-2xl mb-3 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${member.color}22, ${member.color}44)`,
                    border: `1px solid ${member.color}30`,
                  }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center font-['Sora'] font-extrabold text-2xl"
                    style={{ color: member.color }}
                  >
                    {member.name
                      .split(" ")
                      .map((w: string) => w[0])
                      .join("")}
                  </div>
                </div>
                <h4 className="font-['Sora'] font-extrabold text-[#04090C] text-sm tracking-tight leading-tight mb-0.5">
                  {member.name}
                </h4>
                <p className="font-['Outfit'] text-xs text-[#04090C]/50">
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="bg-[#04090C] py-20 md:py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div {...fadeUp}>
            <h2 className="font-['Sora'] text-[clamp(32px,6vw,72px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-white mb-6">
              Want to be part
              <br />
              of the{" "}
              <span className="text-accent">movement?</span>
            </h2>

            <p className="font-['Outfit'] text-white/55 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              Whether you want to volunteer, mentor, partner
              with us, or just say hello — we&apos;d love to
              hear from you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-black rounded-full font-['Outfit'] font-semibold hover:bg-accent/90 transition-colors"
              >
                <span>Join the Community</span>
                <ArrowRight size={16} />
              </Link>
              <button className="px-8 py-4 border border-white/15 text-white rounded-full font-['Outfit'] font-semibold hover:bg-white/5 transition-colors">
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}