import type { ReactNode } from 'react';
import { useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { useListEvents, useListSpeakers } from '@feature/event/hooks';
import type { Speaker } from '@feature/event/types';
import { resolveAssetUrl } from '@utility/asset';

export function AdminSpeakerView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: speakerList, isLoading, error } = useListSpeakers({ page_size: 100 });
  const { data: events } = useListEvents({ page_size: 100 });
  const speaker = (speakerList?.data ?? []).find((item) => item.id === id) as Speaker | undefined;

  useEffect(() => {
    if (!id) {
      navigate('/admin/speakers', { replace: true });
    }
  }, [id, navigate]);

  if (isLoading) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#29E68C]" />
            <Text className="mt-4" style={{ color: 'rgba(4, 9, 12, 0.6)' }}>Loading speaker data...</Text>
          </div>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  if (error || !speaker) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <div className="p-12 text-center">
            <Text className="font-medium" style={{ color: '#04090C' }}>
              {error ? 'Error loading speaker data' : 'Speaker not found'}
            </Text>
            <Button onClick={() => navigate('/admin/speakers')} variant="accent" size="form" className="mt-4">
              Back to Speakers
            </Button>
          </div>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  const eventTitle = (events?.data ?? []).find((event) => event.id === speaker.event_id)?.title || 'Unknown event';

  return (
    <div className="mx-auto w-full max-w-6xl">
      <LayoutUI.Column gap="gap-6">
        <LayoutUI.Row justify="justify-between" className="gap-4 max-md:flex-col">
          <LayoutUI.Row gap="gap-3 sm:gap-4">
            <Button type="button" onClick={() => navigate('/admin/speakers')} variant="ghost-inverse" size="icon">
              <Icons.ArrowLeft size={20} />
            </Button>
            <LayoutUI.Column gap="gap-2">
              <Text as="h1" variant="inverse" className="font-['Sora'] text-2xl font-bold sm:text-3xl">
                Speaker Details
              </Text>
              <Text variant="muted-inverse" className="max-w-2xl">
                Review the speaker profile, avatar styling, and event assignment before making changes.
              </Text>
            </LayoutUI.Column>
          </LayoutUI.Row>
          <Button type="button" onClick={() => navigate(`/admin/speakers/edit/${speaker.id}`)} variant="accent" size="form" className="max-md:w-full">
            <Icons.Edit size={18} />
            Edit Speaker
          </Button>
        </LayoutUI.Row>

        <SpeakerDetailContent speaker={speaker} eventTitle={eventTitle} />
      </LayoutUI.Column>
    </div>
  );
}

function SpeakerDetailContent({ speaker, eventTitle }: { speaker: Speaker; eventTitle: string }) {
  const avatarSrc = resolveAssetUrl(speaker.avatar_url);
  const initials = speaker.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="w-full">
      <LayoutUI.Column gap="gap-6">
        <CardUI.Card tone="inverse" border={false}>
          <CardUI.CardContent padding="auth" spacing="lg">
            <LayoutUI.Column gap="gap-6">
              <LayoutUI.Container className="overflow-hidden rounded-[1rem] border border-black/5 bg-[#F7F4EC] sm:rounded-[1.25rem]">
                <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.45),_transparent_24%),linear-gradient(135deg,_#F7F4EC,_#ECE9DC_52%,_#E5E4D8)]">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(4,9,12,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(4,9,12,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-65" />
                  <div className="relative p-5 sm:p-6">
                    <LayoutUI.Column gap="gap-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <LayoutUI.Column gap="gap-2">
                          <span className="inline-flex w-fit rounded-full border border-[#29E68C]/20 bg-[#29E68C] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-black">
                            Speaker spotlight
                          </span>
                          <Text variant="inverse" className="font-['Sora'] text-2xl font-bold sm:text-3xl">
                            {speaker.name}
                          </Text>
                          <Text size="sm" style={{ color: 'rgba(4, 9, 12, 0.62)' }}>
                            {speaker.title || 'Speaker'}
                          </Text>
                        </LayoutUI.Column>

                        <div className="relative mx-auto sm:mx-0">
                          <div className="relative overflow-hidden rounded-full bg-white/65">
                            <div className="size-28 sm:size-36">
                              {avatarSrc ? (
                                <img src={avatarSrc} alt={speaker.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-black/5 text-3xl font-semibold text-[#04090C]">
                                  {initials || 'SP'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-x-8 gap-y-6 border-t border-black/10 pt-6 sm:grid-cols-2">
                        <DetailBlock
                          icon={<Icons.CalendarDays className="size-4" />}
                          label="Assigned event"
                          value={eventTitle}
                        />
                        <DetailBlock
                          icon={<Icons.ArrowUpDown className="size-4" />}
                          label="Sort order"
                          value={String(speaker.sort_order)}
                        />
                        <DetailBlock
                          icon={<Icons.Mic2 className="size-4" />}
                          label="Speaker title"
                          value={speaker.title || 'Not set'}
                        />
                        <DetailBlock
                          icon={<Icons.Image className="size-4" />}
                          label="Avatar status"
                          value={speaker.avatar_url ? 'Avatar uploaded' : 'No avatar uploaded'}
                        />
                        <DetailBlock
                          icon={<Icons.Link2 className="size-4" />}
                          label="Avatar asset path"
                          value={speaker.avatar_url || 'Not set'}
                          multiline
                        />
                      </div>
                    </LayoutUI.Column>
                  </div>
                </div>
              </LayoutUI.Container>
            </LayoutUI.Column>
          </CardUI.CardContent>
        </CardUI.Card>
      </LayoutUI.Column>
    </div>
  );
}

function DetailBlock({
  icon,
  label,
  value,
  multiline = false,
  dark = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  multiline?: boolean;
  dark?: boolean;
}) {
  return (
    <div>
      <div className={`mb-2 flex items-center gap-2 text-sm ${dark ? 'text-white/60' : 'text-[#04090C]/55'}`}>
        {icon}
        {label}
      </div>
      <Text
        variant="inverse"
        size="sm"
        style={dark ? { color: '#FFFFFF' } : undefined}
        className={multiline ? 'break-all leading-relaxed' : 'leading-relaxed'}
      >
        {value}
      </Text>
    </div>
  );
}
