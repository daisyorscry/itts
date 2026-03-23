import { useState } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import * as Icons from 'lucide-react';
import { ImageWithFallback } from '@components/figma/ImageWithFallback';
import { useListPublicEvents } from '@feature/event/hooks';

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
};

function formatEventDate(value?: string | null) {
  if (!value) {
    return 'Schedule pending';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getProgramColor(program?: string) {
  if (program === 'networking') {
    return '#38BDF8';
  }
  if (program === 'devsecops') {
    return '#F472B6';
  }
  if (program === 'programming') {
    return '#29E68C';
  }
  return '#F59E0B';
}

export function Events() {
  const navigate = useNavigate();
  const [eventSlug, setEventSlug] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [program, setProgram] = useState<'networking' | 'devsecops' | 'programming' | ''>('');
  const [status, setStatus] = useState<'open' | 'ongoing' | 'closed' | ''>('');
  const { data, isLoading, isError } = useListPublicEvents({
    page_size: 24,
    search: search || undefined,
    program: program || undefined,
    status: status || undefined,
  });
  const upcoming = data?.data ?? [];

  return (
    <div className="overflow-x-clip bg-[#04090C]">
      <section className="mx-auto flex min-h-[70vh] max-w-7xl items-center overflow-hidden bg-[#04090C] text-white relative">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

        <div className="relative px-4 py-28 sm:px-6 md:py-36 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="mb-6 max-w-5xl font-['Sora'] text-[clamp(40px,7vw,96px)] font-extrabold tracking-[-0.04em] leading-[1.0]"
          >
            Workshops &amp;
            <br />
            <span className="text-accent">Events.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="max-w-2xl font-['Outfit'] text-[clamp(16px,2vw,20px)] leading-relaxed text-white/60"
          >
            This page now consumes the public event endpoints directly. Open events are loaded from the backend and each card links to a public detail page by slug.
          </motion.p>

        </div>
      </section>

      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-1.5"
        style={{ transformOrigin: 'left' }}
      >
        <div className="flex-1 bg-blue-500" />
        <div className="flex-1 bg-purple-500" />
        <div className="flex-1 bg-[#F472B6]" />
        <div className="flex-1 bg-accent" />
        <div className="flex-1 bg-[#38BDF8]" />
      </motion.div>

      <section className="bg-[#ECE9DE] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-14">
            <h2 className="font-['Sora'] text-[clamp(28px,4vw,52px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-[#04090C]">
              Upcoming Events
            </h2>

            <div className="mt-8 max-w-4xl space-y-4">
              <motion.form
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                onSubmit={(event) => {
                  event.preventDefault();
                  const slug = eventSlug.trim();
                  if (!slug) {
                    return;
                  }
                  navigate(`/events/${slug}`);
                }}
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <input
                  value={eventSlug}
                  onChange={(event) => setEventSlug(event.target.value)}
                  className="min-w-0 flex-1 rounded-full border border-black/10 bg-black/[0.03] px-5 py-3 font-['Outfit'] text-sm text-[#04090C] outline-none placeholder:text-[#04090C]/35 focus:border-black/25"
                  placeholder="Open event detail by slug"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-accent px-6 py-3 font-['Outfit'] text-sm font-semibold text-black transition hover:bg-accent/90 sm:self-auto"
                >
                  Open Detail
                  <Icons.ArrowRight size={16} />
                </button>
              </motion.form>

              <motion.form
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                onSubmit={(event) => {
                  event.preventDefault();
                  setSearch(searchInput.trim());
                }}
                className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]"
              >
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="rounded-full border border-black/10 bg-black/[0.03] px-5 py-3 font-['Outfit'] text-sm text-[#04090C] outline-none placeholder:text-[#04090C]/35 focus:border-black/25"
                  placeholder="Search title, summary, venue..."
                />
                <select value={program} onChange={(event) => setProgram(event.target.value as typeof program)} className="rounded-full border border-black/10 bg-black/[0.03] px-5 py-3 text-sm text-[#04090C] outline-none">
                  <option value="">All programs</option>
                  <option value="networking">Networking</option>
                  <option value="devsecops">DevSecOps</option>
                  <option value="programming">Programming</option>
                </select>
                <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded-full border border-black/10 bg-black/[0.03] px-5 py-3 text-sm text-[#04090C] outline-none">
                  <option value="">All statuses</option>
                  <option value="open">Open</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="closed">Closed</option>
                </select>
                <button type="submit" className="rounded-full bg-[#04090C] px-6 py-3 text-sm font-semibold text-white">
                  Apply Filters
                </button>
              </motion.form>
            </div>
          </motion.div>

          {isLoading ? <div className="rounded-3xl border border-black/[0.08] bg-[#ECE9DE] p-6 font-['Outfit'] text-[#04090C]/60">Loading public events...</div> : null}
          {!isLoading && isError ? <div className="rounded-3xl border border-red-500/20 bg-red-100/80 p-6 font-['Outfit'] text-red-900">Failed to load public events.</div> : null}

          <div className="space-y-5">
            {upcoming.map((event, index) => {
              const trackColor = getProgramColor(event.program);
              return (
                <motion.div
                  key={event.id}
                  {...fadeUp}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
                  className="overflow-hidden rounded-3xl border border-black/[0.08] bg-[#ECE9DE] transition-colors duration-300 hover:border-black/[0.16]"
                >
                  <div className="grid grid-cols-1 gap-0 md:grid-cols-[320px_1fr]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#ECE9DE] md:h-full md:min-h-[320px] md:aspect-auto">
                      <ImageWithFallback src={event.image_url || ''} alt={event.title} className="absolute inset-0 h-full w-full object-cover object-center" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div
                        className="absolute top-4 left-4 rounded-full px-3 py-1 font-['Outfit'] text-xs font-semibold"
                        style={{ background: `${trackColor}22`, color: trackColor, border: `1px solid ${trackColor}40` }}
                      >
                        {event.program || 'General'}
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-6 p-7 md:p-10">
                      <div>
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <h3 className="font-['Sora'] text-[clamp(20px,2.5vw,30px)] font-extrabold tracking-tight leading-tight text-[#04090C]">
                            {event.title}
                          </h3>
                          <span className="flex-shrink-0 rounded-full bg-accent px-3 py-1 font-['Outfit'] text-xs font-semibold uppercase text-black">
                            {event.status}
                          </span>
                        </div>
                        <p className="mb-6 font-['Outfit'] text-sm leading-relaxed text-[#04090C]/50">
                          {event.summary || event.description || 'Open the detail page to see the full public event information.'}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { icon: Icons.Calendar, label: formatEventDate(event.starts_at) },
                            { icon: Icons.Clock, label: event.ends_at ? formatEventDate(event.ends_at) : 'End time TBD' },
                            { icon: Icons.MapPin, label: event.venue || 'Venue TBD' },
                            { icon: Icons.Users, label: `${event.speakers?.length ?? 0} speaker(s)` },
                          ].map(({ icon: Icon, label }, itemIndex) => (
                            <div key={itemIndex} className="flex items-center gap-2.5">
                              <Icon size={15} className="flex-shrink-0 text-[#04090C]/40" />
                              <span className="font-['Outfit'] text-sm text-[#04090C]/55">{label}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <Icons.Mic size={14} className="text-[#04090C]/30" />
                          <span className="font-['Outfit'] text-xs text-[#04090C]/35">
                            Speaker:{' '}
                            <span className="text-[#04090C]/60">
                              {event.speakers?.[0]?.name || 'TBA'}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <Link
                          to={event.slug ? `/events/${event.slug}` : '#'}
                          className="inline-flex items-center gap-2 rounded-full bg-[#04090C] px-6 py-3 font-['Outfit'] text-sm font-semibold text-white transition-colors hover:bg-black"
                        >
                          View Detail
                          <Icons.ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#04090C] py-20 md:py-28">
        <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-14">
            <h2 className="font-['Sora'] text-[clamp(28px,4vw,52px)] font-extrabold tracking-[-0.04em] leading-[1.05] text-white">
              Event Feed
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.filter((event) => event.status === 'closed').map((event, index) => (
              <motion.div
                key={event.id}
                {...fadeUp}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
                className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] transition-colors duration-300 hover:border-white/15"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                  <ImageWithFallback src={event.image_url || ''} alt={event.title} className="absolute inset-0 h-full w-full object-cover object-center grayscale opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 font-['Outfit'] text-xs text-white/70">
                    {event.program || 'General'}
                  </div>
                </div>

                <div className="p-6">
                  <div className="font-['Outfit'] text-sm text-[#ECE9DE]/45">{formatEventDate(event.starts_at)}</div>
                  <h3 className="mt-1 mb-3 font-['Sora'] text-xl font-extrabold tracking-tight text-white">{event.title}</h3>
                  <p className="mb-4 font-['Outfit'] text-sm leading-relaxed text-white/55">
                    {event.summary || event.description || 'This event has ended.'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-white/40">
                    <span>{event.venue || 'Venue TBD'}</span>
                    {event.slug ? <span>•</span> : null}
                    {event.slug ? (
                      <Link to={`/events/${event.slug}`} className="underline-offset-4 hover:text-white hover:underline">
                        Read detail
                      </Link>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-black/[0.08] bg-white px-5 py-3">
              <Icons.Users size={18} className="text-accent" />
              <span className="font-['Outfit'] text-sm text-[#04090C]/60">
                Public event feed backed by the Go API
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
