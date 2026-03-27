import { FormEvent, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { useListPublicEvents, usePublicEvent, useRegisterToPublicEvent } from '@feature/event/hooks';
import { resolveAssetUrl } from '@utility/asset';

function formatEventDate(value?: string | null) {
  if (!value) {
    return 'Schedule pending';
  }

  const date = new Date(value);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
}

function getDetailEventImage(event?: { landscape_image_url?: string; square_image_url?: string; image_url?: string } | null) {
  if (!event) {
    return '';
  }

  return resolveAssetUrl(event.landscape_image_url || event.square_image_url || event.image_url || '');
}

export function EventDetail() {
  const { slug = '' } = useParams();
  const { data: event, isLoading, isError, error } = usePublicEvent(slug, !!slug);
  const relatedEventsQuery = useListPublicEvents(
    event?.program
      ? {
          page_size: 4,
          program: event.program,
          status: 'open',
        }
      : {
          page_size: 4,
          status: 'open',
        },
  );
  const registerMutation = useRegisterToPublicEvent(event?.id ?? '');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [institution, setInstitution] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const relatedEvents = useMemo(() => {
    if (!event) {
      return [];
    }

    return (relatedEventsQuery.data?.data ?? [])
      .filter((candidate) => candidate.slug !== event.slug)
      .slice(0, 3);
  }, [event, relatedEventsQuery.data?.data]);

  const handleSubmit = async (eventForm: FormEvent<HTMLFormElement>) => {
    eventForm.preventDefault();
    if (!event?.id) {
      return;
    }

    await registerMutation.mutateAsync({
      full_name: fullName,
      email,
      phone_number: phoneNumber.trim() || undefined,
      institution: institution.trim() || undefined,
    });

    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setInstitution('');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#ECE9DE] pt-6 text-[#04090C] sm:pt-8 lg:pt-10">
      <section className="relative border-b border-black/10 bg-[#ECE9DE]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.45) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="absolute right-0 top-0 h-[380px] w-[380px] rounded-full bg-accent/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Link to="/events" className="mb-8 inline-flex items-center gap-2 text-sm text-[#04090C]/60 transition hover:text-[#04090C]">
            <Icons.ArrowLeft className="size-4" />
            Back to events
          </Link>

        {isLoading ? (
          <div className="rounded-[2rem] border border-black/10 bg-black/[0.03] p-10 text-[#04090C]/70">
            Loading event details...
          </div>
        ) : null}

        {!isLoading && isError ? (
          <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-10 text-red-100">
            Failed to load event detail.
            {error instanceof Error ? ` ${error.message}` : ''}
          </div>
        ) : null}

        {!isLoading && !isError && event ? (
          <div className="space-y-10">
            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden rounded-[1.25rem] border border-black/10 bg-[#ECE9DE]"
              >
                <div className="relative h-72 overflow-hidden sm:h-96">
                  {getDetailEventImage(event) ? (
                    <img src={getDetailEventImage(event)} alt={event.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-black/[0.03] text-[#04090C]/35">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04090C]/85 via-[#04090C]/30 to-transparent" />
                  <div className="absolute bottom-0 right-0 p-6 sm:p-8">
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <span className="rounded-full border border-[#29E68C]/20 bg-[#29E68C] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-black">
                        {event.status}
                      </span>
                      {event.program ? (
                        <span className="rounded-full border border-white/15 bg-black/35 px-4 py-1.5 text-xs font-medium text-white">
                          {event.program}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-8 p-6 sm:p-8">
                  <div>
                    <h1 className="max-w-4xl font-['Sora'] text-[clamp(32px,5vw,56px)] font-extrabold tracking-[-0.04em] leading-[0.98] text-[#04090C]">
                      {event.title}
                    </h1>
                  </div>

                  <div className="grid gap-x-8 gap-y-6 border-t border-black/10 pt-6 sm:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm text-[#04090C]/45">
                        <Icons.CalendarDays className="size-4" />
                        Date & time
                      </div>
                      <p className="text-sm leading-relaxed text-[#04090C]/80">{formatEventDate(event.starts_at)}</p>
                      {event.ends_at ? (
                        <p className="mt-2 text-xs text-[#04090C]/45">Ends {formatEventDate(event.ends_at)}</p>
                      ) : null}
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm text-[#04090C]/45">
                        <Icons.MapPin className="size-4" />
                        Venue
                      </div>
                      <p className="text-sm leading-relaxed text-[#04090C]/80">{event.venue || 'Venue will be announced soon'}</p>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm text-[#04090C]/45">
                        <Icons.Users className="size-4" />
                        Seats
                      </div>
                      <p className="text-sm leading-relaxed text-[#04090C]/80">
                        {event.capacity > 0 ? `${event.remaining_slots} seats left from ${event.capacity}` : 'Open capacity'}
                      </p>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm text-[#04090C]/45">
                        <Icons.BadgeDollarSign className="size-4" />
                        Ticket
                      </div>
                      <p className="text-sm leading-relaxed text-[#04090C]/80">
                        {event.is_paid ? `${event.currency || 'IDR'} ${new Intl.NumberFormat('id-ID').format(event.price)}` : 'Free event'}
                      </p>
                    </div>
                  </div>

                  {event.registration_deadline ? (
                    <div className="border-t border-black/10 pt-6">
                      <div className="mb-2 flex items-center gap-2 text-sm text-[#04090C]/45">
                        <Icons.Clock3 className="size-4" />
                        Registration deadline
                      </div>
                      <p className="text-sm leading-relaxed text-[#04090C]/80">{formatEventDate(event.registration_deadline)}</p>
                    </div>
                  ) : null}

                  <div>
                    <h2 className="mb-3 font-['Sora'] text-2xl font-bold">Overview</h2>
                    <p className="leading-7 text-[#04090C]/72">{event.description || event.summary || 'Event description will be published soon.'}</p>
                  </div>

                  {event.benefits?.length ? (
                    <div>
                      <h2 className="mb-4 font-['Sora'] text-2xl font-bold">Benefits</h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {event.benefits.map((benefit) => (
                          <div key={benefit} className="flex items-start gap-3 border-b border-black/10 pb-3 last:border-b-0 last:pb-0">
                            <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-[#04090C]/70">
                              <Icons.Check className="size-4" />
                            </div>
                            <p className="text-sm leading-6 text-[#04090C]/75">{benefit}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {event.speakers?.length ? (
                    <div>
                      <h2 className="mb-4 font-['Sora'] text-2xl font-bold">Speakers</h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {event.speakers.map((speaker) => (
                          <div key={speaker.id} className="rounded-[1rem] border border-black/10 bg-black/[0.045] p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-11 items-center justify-center rounded-full bg-black/[0.05] text-[#04090C]/70">
                                <Icons.Mic className="size-4" />
                              </div>
                              <div>
                                <p className="font-semibold text-[#04090C]">{speaker.name}</p>
                                <p className="text-sm text-[#04090C]/50">{speaker.title || 'Speaker'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </motion.article>

              <div className="lg:sticky lg:top-20 lg:self-start">
                <motion.aside
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.05 }}
                  className="h-fit rounded-[1.25rem] border border-black/10 bg-[#ECE9DE] p-6 text-[#04090C] sm:p-8"
                >
                  <div className="mb-6">
                    <div
                      className="mb-4 inline-block rounded-sm bg-accent px-4 py-2"
                    >
                      <span className="font-['Sora'] text-lg font-black tracking-[-0.03em] text-black">
                        RESERVE A SEAT
                      </span>
                    </div>
                    <h2 className="font-['Sora'] text-3xl font-extrabold tracking-[-0.04em]">Reserve your seat</h2>
                    <p className="mt-3 text-sm leading-6 text-[#04090C]/60">
                      Submit your details first. We will email a verification link before your registration moves to confirmed, waitlist, or payment.
                    </p>
                  </div>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {submitted ? (
                      <div className="rounded-[1rem] border border-[#29E68C]/20 bg-[#29E68C]/10 p-4 text-sm leading-6 text-[#04090C]/72">
                        Registration submitted. Check your email and open the verification link to continue.
                      </div>
                    ) : null}

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#04090C]/70">Full name</span>
                      <input
                        value={fullName}
                        onChange={(inputEvent) => setFullName(inputEvent.target.value)}
                        required
                        minLength={3}
                        className="w-full rounded-full border border-black/10 bg-black/[0.03] px-5 py-3 outline-none transition focus:border-black/25"
                        placeholder="Your full name"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#04090C]/70">Email</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(inputEvent) => setEmail(inputEvent.target.value)}
                        required
                        className="w-full rounded-full border border-black/10 bg-black/[0.03] px-5 py-3 outline-none transition focus:border-black/25"
                        placeholder="you@example.com"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#04090C]/70">Phone number</span>
                      <input
                        value={phoneNumber}
                        onChange={(inputEvent) => setPhoneNumber(inputEvent.target.value)}
                        className="w-full rounded-full border border-black/10 bg-black/[0.03] px-5 py-3 outline-none transition focus:border-black/25"
                        placeholder="+62..."
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-[#04090C]/70">Institution</span>
                      <input
                        value={institution}
                        onChange={(inputEvent) => setInstitution(inputEvent.target.value)}
                        className="w-full rounded-full border border-black/10 bg-black/[0.03] px-5 py-3 outline-none transition focus:border-black/25"
                        placeholder="Campus, school, or company"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={registerMutation.isPending || !event.id}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {registerMutation.isPending ? 'Submitting...' : 'Register Now'}
                      <Icons.ArrowRight className="size-4" />
                    </button>
                  </form>
                </motion.aside>
              </div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex h-1.5 overflow-hidden rounded-full"
              style={{ transformOrigin: 'left' }}
            >
              <div className="flex-1 bg-blue-500" />
              <div className="flex-1 bg-cyan-500" />
              <div className="flex-1 bg-purple-500" />
              <div className="flex-1 bg-pink-500" />
              <div className="flex-1 bg-green-500" />
              <div className="flex-1 bg-accent" />
            </motion.div>

            <section className="rounded-[1.25rem] border border-black/10 bg-[#ECE9DE] p-6 sm:p-8">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-block rounded-sm bg-[#FF6B35] px-3 py-1.5">
                    <span className="font-['Sora'] text-base font-black tracking-[-0.03em] text-black">
                      MORE EVENTS
                    </span>
                  </div>
                  <h2 className="mt-3 font-['Sora'] text-3xl font-extrabold tracking-[-0.04em] text-[#04090C]">Keep exploring the program</h2>
                </div>
                <Link to="/events" className="inline-flex items-center gap-2 self-start rounded-full bg-[#04090C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black sm:self-auto">
                  Browse all events
                  <Icons.ArrowRight className="size-4" />
                </Link>
              </div>

              {relatedEventsQuery.isLoading ? <p className="text-sm text-[#04090C]/55">Loading more events...</p> : null}

              {!relatedEventsQuery.isLoading && !relatedEvents.length ? (
                <div className="rounded-[1rem] border border-black/10 bg-black/[0.045] p-5 text-sm text-[#04090C]/60">
                  More events for this stream are being prepared. Check back soon for the next session.
                </div>
              ) : null}

              {relatedEvents.length ? (
                <div className="grid gap-4 lg:grid-cols-3">
                  {relatedEvents.map((relatedEvent) => (
                    <Link
                      key={relatedEvent.id}
                      to={`/events/${relatedEvent.slug}`}
                      className="group rounded-[1rem] border border-black/10 bg-black/[0.045] p-5 transition hover:border-black/20 hover:bg-black/[0.07]"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="rounded-full border border-[#29E68C]/20 bg-[#29E68C] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-black">
                          {relatedEvent.status}
                        </span>
                        <Icons.MoveRight className="size-4 text-[#04090C]/40 transition group-hover:translate-x-1 group-hover:text-[#04090C]/70" />
                      </div>
                      <h3 className="font-['Sora'] text-xl font-bold tracking-[-0.03em] text-[#04090C]">{relatedEvent.title}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#04090C]/60">
                        {relatedEvent.summary || relatedEvent.description || 'Another event in the same stream.'}
                      </p>
                      <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#04090C]/35">
                        <Icons.CalendarDays className="size-3.5" />
                        {formatEventDate(relatedEvent.starts_at)}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        ) : null}
        </div>
      </section>
    </div>
  );
}
