import { motion } from "motion/react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  Mic,
} from "lucide-react";
import { ImageWithFallback } from "@components/figma/ImageWithFallback";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
};

const events = [
  {
    id: 1,
    title: "Docker & Kubernetes Workshop",
    date: "March 20, 2026",
    time: "14:00 – 17:00 WIB",
    location: "Online (Zoom)",
    speaker: "Ahmad Rizki",
    track: "DevSecOps",
    trackColor: "#F472B6",
    status: "Open",
    attendees: 45,
    maxAttendees: 100,
    image:
      "https://images.unsplash.com/photo-1587691592099-24045742c181?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description:
      "Learn container orchestration and deployment strategies with hands-on labs covering real-world production scenarios.",
  },
  {
    id: 2,
    title: "Web Security Fundamentals",
    date: "March 25, 2026",
    time: "15:00 – 18:00 WIB",
    location: "Hybrid",
    speaker: "Sarah Lestari",
    track: "DevSecOps",
    trackColor: "#F472B6",
    status: "Open",
    attendees: 32,
    maxAttendees: 80,
    image:
      "https://images.unsplash.com/photo-1760611656615-db3fad24a314?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description:
      "Explore common vulnerabilities and learn how to secure your web applications against modern attack vectors.",
  },
  {
    id: 3,
    title: "Monthly Meetup & Networking",
    date: "April 1, 2026",
    time: "18:00 – 21:00 WIB",
    location: "Jakarta (TBA)",
    speaker: "Community Team",
    track: "Community",
    trackColor: "#29E68C",
    status: "Open",
    attendees: 87,
    maxAttendees: 150,
    image:
      "https://images.unsplash.com/photo-1518107616985-bd48230d3b20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description:
      "Connect with fellow members, share your projects, and enjoy lightning tech talks from community contributors.",
  },
  {
    id: 4,
    title: "React Advanced Patterns",
    date: "February 28, 2026",
    time: "14:00 – 16:00 WIB",
    location: "Online",
    speaker: "Budi Santoso",
    track: "Programming",
    trackColor: "#38BDF8",
    status: "Closed",
    attendees: 120,
    maxAttendees: 120,
    image:
      "https://images.unsplash.com/photo-1772971919689-c216435a5899?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    description:
      "Master advanced React patterns including hooks composition, context architecture, and performance optimization.",
  },
];

export function Events() {
  const upcoming = events.filter((e) => e.status === "Open");
  const past = events.filter((e) => e.status === "Closed");

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
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative px-4 sm:px-6 lg:px-8 py-28 md:py-36">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.1,
            }}
            className="font-['Sora'] text-[clamp(40px,7vw,96px)] font-extrabold tracking-[-0.04em] leading-[1.0] max-w-5xl mb-6"
          >
            Workshops &amp;
            <br />
            <span className="text-accent">Events.</span>
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
            Join hands-on workshops, meetups, and tech talks.
            Learn from practitioners and connect with the ITTS
            community.
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
        <div className="flex-1 bg-blue-500" />
        <div className="flex-1 bg-purple-500" />
        <div className="flex-1 bg-[#F472B6]" />
        <div className="flex-1 bg-accent" />
        <div className="flex-1 bg-[#38BDF8]" />
      </motion.div>

      {/* ── UPCOMING EVENTS ──────────────────────────────── */}
      <section className="bg-[#ECE9DE] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-14">
            <h2 className="font-['Sora'] text-[clamp(28px,4vw,52px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-[#04090C]">
              Upcoming Events
            </h2>
          </motion.div>

          <div className="space-y-5">
            {upcoming.map((event, i) => (
              <motion.div
                key={event.id}
                {...fadeUp}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.08,
                }}
                className="bg-[#e5e4d8] rounded-3xl overflow-hidden border border-black/[0.08] hover:border-black/[0.16] transition-colors duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-0">
                  {/* Image */}
                  <div className="relative h-56 md:h-auto overflow-hidden">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {/* Track badge */}
                    <div
                      className="absolute top-4 left-4 px-3 py-1 rounded-full font-['Outfit'] text-xs font-semibold"
                      style={{
                        background: `${event.trackColor}22`,
                        color: event.trackColor,
                        border: `1px solid ${event.trackColor}40`,
                      }}
                    >
                      {event.track}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-7 md:p-10 flex flex-col justify-between gap-6">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="font-['Sora'] text-[#04090C] font-extrabold text-[clamp(20px,2.5vw,30px)] tracking-tight leading-tight">
                          {event.title}
                        </h3>
                        <span className="flex-shrink-0 px-3 py-1 bg-accent text-black rounded-full font-['Outfit'] text-xs font-semibold">
                          {event.status}
                        </span>
                      </div>
                      <p className="font-['Outfit'] text-[#04090C]/50 text-sm leading-relaxed mb-6">
                        {event.description}
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { icon: Calendar, label: event.date },
                          { icon: Clock, label: event.time },
                          {
                            icon: MapPin,
                            label: event.location,
                          },
                          {
                            icon: Users,
                            label: `${event.attendees}/${event.maxAttendees} attending`,
                          },
                        ].map(({ icon: Icon, label }, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5"
                          >
                            <Icon
                              size={15}
                              className="text-[#04090C]/40 flex-shrink-0"
                            />
                            <span className="font-['Outfit'] text-[#04090C]/55 text-sm">
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Mic
                          size={14}
                          className="text-[#04090C]/30"
                        />
                        <span className="font-['Outfit'] text-[#04090C]/35 text-xs">
                          Speaker:{" "}
                          <span className="text-[#04090C]/60">
                            {event.speaker}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Progress + CTA */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex justify-between mb-1.5">
                          <span className="font-['Outfit'] text-[#04090C]/35 text-xs">
                            Seats filled
                          </span>
                          <span className="font-['Outfit'] text-[#04090C]/55 text-xs">
                            {Math.round(
                              (event.attendees /
                                event.maxAttendees) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{
                              width: `${(event.attendees / event.maxAttendees) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <button className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-accent text-black rounded-full font-['Outfit'] font-semibold hover:bg-accent/90 transition-colors">
                        <span>Register Now</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAST EVENTS ───────────────────────────────────── */}
      <section className="bg-[#04090C] py-20 md:py-28 relative overflow-hidden">
        <div className="absolute left-0 bottom-0 w-[500px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div {...fadeUp} className="mb-14">
            <h2 className="font-['Sora'] text-[clamp(28px,4vw,52px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-white">
              Past Events
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {past.map((event, i) => (
              <motion.div
                key={event.id}
                {...fadeUp}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.08,
                }}
                className="bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden hover:border-white/15 transition-colors duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover opacity-60 grayscale"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div
                    className="absolute top-4 left-4 px-3 py-1 rounded-full font-['Outfit'] text-xs font-semibold"
                    style={{
                      background: `${event.trackColor}22`,
                      color: event.trackColor,
                      border: `1px solid ${event.trackColor}40`,
                    }}
                  >
                    {event.track}
                  </div>
                  <span className="absolute top-4 right-4 px-3 py-1 bg-white/10 text-white/50 border border-white/10 rounded-full font-['Outfit'] text-xs">
                    Closed
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-['Sora'] text-white font-extrabold text-lg tracking-tight mb-2">
                    {event.title}
                  </h3>
                  <p className="font-['Outfit'] text-white/40 text-sm leading-relaxed mb-4">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-4 text-white/30">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      <span className="font-['Outfit'] text-xs">
                        {event.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={13} />
                      <span className="font-['Outfit'] text-xs">
                        {event.attendees} attended
                      </span>
                    </div>
                  </div>
                </div>
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

            <motion.div
              {...fadeUp}
              className="relative max-w-2xl"
            >
              <h2 className="font-['Sora'] text-[clamp(28px,5vw,60px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-white mb-4">
                Want to host
                <br />
                <span className="text-accent">
                  your own event?
                </span>
              </h2>
              <p className="font-['Outfit'] text-white/55 text-lg leading-relaxed mb-8">
                Share your knowledge with the community.
                We&apos;re always looking for speakers and
                workshop facilitators across all 3 tracks.
              </p>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-black rounded-full font-['Outfit'] font-semibold hover:bg-accent/90 transition-colors">
                <span>Become a Speaker</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}