import type { ReactNode } from 'react';
import { useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { QueryStatePanel } from '@components/query-state-panel';
import type { Event } from '@feature/event/types';
import { useEvent } from '@feature/event/hooks';
import { resolveAssetUrl } from '@utility/asset';
import { formatDateTime } from '@utility/date';
import { PERMISSIONS, useHasPermission } from '@utils/permissions';

export function AdminEventView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const canRead = useHasPermission(PERMISSIONS.EVENTS_READ);
  const canUpdate = useHasPermission(PERMISSIONS.EVENTS_UPDATE);
  const { data: event, isLoading, error } = useEvent(id ?? '', Boolean(id) && canRead);

  useEffect(() => {
    if (!id) {
      navigate('/admin/events', { replace: true });
    }
  }, [id, navigate]);

  if (isLoading) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#29E68C]" />
            <Text className="mt-4" style={{ color: 'rgba(4, 9, 12, 0.6)' }}>Loading event data...</Text>
          </div>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  if (!canRead) {
    return (
      <QueryStatePanel
        tone="error"
        icon={Icons.ShieldAlert}
        title="You do not have permission to view this event"
        description="Ask an administrator for events:read access."
      />
    );
  }

  if (error || !event) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <div className="p-12 text-center">
            <Text className="font-medium" style={{ color: '#04090C' }}>
              {error ? 'Error loading event data' : 'Event not found'}
            </Text>
            <Button onClick={() => navigate('/admin/events')} variant="accent" size="form" className="mt-4">
              Back to Events
            </Button>
          </div>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <LayoutUI.Column gap="gap-6">
        <LayoutUI.Row justify="justify-between" className="gap-4 max-md:flex-col">
          <LayoutUI.Row gap="gap-3 sm:gap-4">
            <Button type="button" onClick={() => navigate('/admin/events')} variant="ghost-inverse" size="icon">
              <Icons.ArrowLeft size={20} />
            </Button>
            <LayoutUI.Column gap="gap-2">
              <Text as="h1" variant="inverse" className="font-['Sora'] text-2xl font-bold sm:text-3xl">
                Event Details
              </Text>
              <Text variant="muted-inverse" className="max-w-2xl">
                Review the event setup, visuals, and ticket configuration before making changes.
              </Text>
            </LayoutUI.Column>
          </LayoutUI.Row>
          {canUpdate ? (
            <Button type="button" onClick={() => navigate(`/admin/events/edit/${event.id}`)} variant="accent" size="form" className="max-md:w-full">
              <Icons.Edit size={18} />
              Edit Event
            </Button>
          ) : null}
        </LayoutUI.Row>

        <EventDetailContent event={event} />
      </LayoutUI.Column>
    </div>
  );
}

export function EventDetailContent({ event }: { event: Event }) {
  const heroImage = resolveAssetUrl(event.landscape_image_url || event.square_image_url || event.image_url || '');
  const squareImage = resolveAssetUrl(event.square_image_url || event.landscape_image_url || event.image_url || '');
  const landscapeImage = resolveAssetUrl(event.landscape_image_url || event.square_image_url || event.image_url || '');
  const priceLabel = event.is_paid
    ? `${event.currency || 'IDR'} ${new Intl.NumberFormat('id-ID').format(event.price || 0)}`
    : 'Free event';
  const capacityLabel = event.capacity > 0 ? `${event.capacity} seats` : 'Unlimited';
  const remainingSlotsLabel = event.capacity > 0 ? `${event.remaining_slots} seats left` : 'Open capacity';

  return (
    <div className="w-full">
      <LayoutUI.Column gap="gap-6">
        <CardUI.Card tone="inverse" border={false}>
          <CardUI.CardContent padding="auth" spacing="lg">
            <LayoutUI.Column gap="gap-6">
              <LayoutUI.Container className="overflow-hidden rounded-[1rem] border border-black/10 bg-black/5 sm:rounded-[1.25rem]">
                <div className="relative aspect-[16/9]">
                  {heroImage ? (
                    <img src={heroImage} alt={event.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-[#04090C]/50">
                      No image uploaded
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-end gap-2 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 sm:gap-3 sm:p-6">
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
              </LayoutUI.Container>

              <LayoutUI.Column gap="gap-2">
                <Text as="h2" variant="inverse" className="font-['Sora'] text-xl font-bold sm:text-2xl">
                  {event.title}
                </Text>
                <Text variant="muted-inverse">
                  {event.summary || 'No summary added yet.'}
                </Text>
              </LayoutUI.Column>

              <LayoutUI.Container className="grid gap-x-8 gap-y-6 border-t border-black/10 pt-6 sm:grid-cols-2">
                <DetailBlock
                  icon={<Icons.CalendarDays className="size-4" />}
                  label="Date & time"
                  value={formatDateTime(event.starts_at)}
                  subvalue={event.ends_at ? `Ends ${formatDateTime(event.ends_at)}` : undefined}
                />
                <DetailBlock
                  icon={<Icons.MapPin className="size-4" />}
                  label="Venue"
                  value={event.venue || 'Not set'}
                />
                <DetailBlock
                  icon={<Icons.Users className="size-4" />}
                  label="Seats"
                  value={remainingSlotsLabel}
                  subvalue={event.capacity > 0 ? `Capacity ${capacityLabel}` : undefined}
                />
                <DetailBlock
                  icon={<Icons.BadgeDollarSign className="size-4" />}
                  label="Ticket"
                  value={priceLabel}
                />
              </LayoutUI.Container>

              <LayoutUI.Column gap="gap-6">
                <div className="border-t border-black/10 pt-6">
                  <div className="mb-2 flex items-center gap-2 text-sm text-[#04090C]/55">
                    <Icons.Clock3 className="size-4" />
                    Registration deadline
                  </div>
                  <Text variant="inverse" size="sm">
                    {event.registration_deadline ? formatDateTime(event.registration_deadline) : 'Not set'}
                  </Text>
                </div>

                <div>
                  <Text variant="inverse" className="mb-4 font-['Sora'] text-xl font-semibold">
                    Overview
                  </Text>
                  <Text variant="inverse" className="whitespace-pre-line leading-7">
                    {event.description || 'No event description added yet.'}
                  </Text>
                </div>

                <div>
                  <Text variant="inverse" className="mb-4 font-['Sora'] text-xl font-semibold">
                    Benefits
                  </Text>
                  {event.benefits?.length ? (
                    <LayoutUI.Container className="grid gap-3 sm:grid-cols-2">
                      {event.benefits.map((benefit, index) => (
                        <LayoutUI.Row key={`${benefit}-${index}`} align="items-start" gap="gap-3" className="border-b border-black/10 pb-3 last:border-b-0 last:pb-0">
                          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-black/10 text-[#04090C]/70">
                            <Icons.Check className="size-4" />
                          </div>
                          <Text variant="inverse" size="sm" className="leading-6">{benefit}</Text>
                        </LayoutUI.Row>
                      ))}
                    </LayoutUI.Container>
                  ) : (
                    <Text variant="muted-inverse">No attendee benefits have been added yet.</Text>
                  )}
                </div>

                <DetailGroup title="Event images">
                  <LayoutUI.Container className="grid gap-4 md:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)]">
                    <LayoutUI.Column gap="gap-2">
                      <Text variant="inverse" className="font-medium">Square image</Text>
                      <LayoutUI.Container className="overflow-hidden rounded-[1rem]">
                        <div className="relative h-56 sm:h-64 md:h-72">
                          {squareImage ? (
                            <div className="absolute inset-y-0 left-1/2 flex aspect-square h-full -translate-x-1/2 overflow-hidden">
                              <img src={squareImage} alt={`${event.title} square`} className="h-full w-full object-cover rounded-[1rem]" />
                            </div>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-[#04090C]/50">
                              No square image uploaded
                            </div>
                          )}
                        </div>
                      </LayoutUI.Container>
                    </LayoutUI.Column>

                    <LayoutUI.Column gap="gap-2">
                      <Text variant="inverse" className="font-medium">Landscape image</Text>
                      <LayoutUI.Container className="overflow-hidden rounded-[1rem]">
                        <div className="relative h-56 sm:h-64 md:h-72">
                          {landscapeImage ? (
                            <img src={landscapeImage} alt={`${event.title} landscape`} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-[#04090C]/50">
                              No landscape image uploaded
                            </div>
                          )}
                        </div>
                      </LayoutUI.Container>
                    </LayoutUI.Column>
                  </LayoutUI.Container>
                </DetailGroup>

                <DetailGroup title="Speaker spotlight">
                  {event.speakers?.length ? (
                    <LayoutUI.Column gap="gap-4" className="mx-auto w-full max-w-md">
                      {event.speakers
                        .slice()
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((speaker, index) => (
                          <LayoutUI.Column key={speaker.id} gap="gap-3" className="rounded-[1rem] p-3 sm:p-4 items-center text-center">
                            <div className="mx-auto inline-flex rounded-sm bg-accent px-3 py-1.5">
                              <span className="font-['Sora'] text-sm font-black uppercase tracking-[0.08em] text-black">
                                {index === 0 ? 'Featured speaker' : `Speaker ${index + 1}`}
                              </span>
                            </div>
                            <div className="relative mx-auto">
                              <div className="absolute inset-0 rounded-full bg-accent/25 blur-2xl" />
                              <div className="relative overflow-hidden rounded-full border border-black/10 bg-black/5">
                                <div className="size-28 sm:size-36">
                                  {speaker.avatar_url ? (
                                    <img src={resolveAssetUrl(speaker.avatar_url)} alt={speaker.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-black/10 text-3xl font-semibold text-[#04090C]">
                                      {speaker.name.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <LayoutUI.Column gap="gap-2 items-center">
                              <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">
                                {speaker.name}
                              </Text>
                              <Text variant="muted-inverse" size="sm">
                                {speaker.title || 'Speaker'}
                              </Text>
                              <LayoutUI.Row gap="gap-2" align="items-center" className="rounded-full border border-black/10 bg-black/5 px-3 py-1.5">
                                <Icons.Mic className="size-3.5 text-[#04090C]/55" />
                                <Text variant="muted-inverse" size="xs">
                                  Session order {speaker.sort_order}
                                </Text>
                              </LayoutUI.Row>
                            </LayoutUI.Column>
                          </LayoutUI.Column>
                        ))}
                    </LayoutUI.Column>
                  ) : (
                    <Text variant="muted-inverse">No speakers assigned yet.</Text>
                  )}
                </DetailGroup>
              </LayoutUI.Column>
            </LayoutUI.Column>
          </CardUI.CardContent>
        </CardUI.Card>
      </LayoutUI.Column>
    </div>
  );
}

function DetailGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <CardUI.Card tone="inverse" border={false}>
      <CardUI.CardContent>
        <LayoutUI.Column gap="gap-4">
          <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">
            {title}
          </Text>
          {children}
        </LayoutUI.Column>
      </CardUI.CardContent>
    </CardUI.Card>
  );
}

function DetailBlock({
  icon,
  label,
  value,
  subvalue,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm text-[#04090C]/55">
        {icon}
        {label}
      </div>
      <Text variant="inverse" size="sm" className="leading-relaxed">
        {value}
      </Text>
      {subvalue ? (
        <Text variant="muted-inverse" size="xs" className="mt-2">
          {subvalue}
        </Text>
      ) : null}
    </div>
  );
}
