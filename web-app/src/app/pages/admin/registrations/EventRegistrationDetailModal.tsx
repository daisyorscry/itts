import * as Icons from 'lucide-react';
import * as CardUI from '@components/ui/card';
import * as DialogUI from '@components/ui/dialog';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { useEventRegistration, useEventRegistrationActivities } from '@feature/event/hooks';

interface EventRegistrationDetailModalProps {
  registrationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EventRegistrationDetailModal({
  registrationId,
  isOpen,
  onClose,
}: EventRegistrationDetailModalProps) {
  const refetchInterval = isOpen ? 8000 : false;
  const { data, isLoading } = useEventRegistration(registrationId, isOpen && !!registrationId, refetchInterval);
  const { data: activities } = useEventRegistrationActivities(registrationId, isOpen && !!registrationId, refetchInterval);

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogUI.DialogContent className="max-w-2xl border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]">
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Row align="items-start" gap="gap-3">
              <LayoutUI.Container surface="accent" radius="xl" className="flex h-11 w-11 items-center justify-center">
                <Icons.FileText className="size-5 text-[#04090C]" />
              </LayoutUI.Container>
              <LayoutUI.Column gap="gap-1">
                <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                  Event Registration Detail
                </DialogUI.DialogTitle>
                <DialogUI.DialogDescription className="text-sm text-black/60">
                  Review attendee data, payment status, and current lifecycle state.
                </DialogUI.DialogDescription>
              </LayoutUI.Column>
            </LayoutUI.Row>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            {isLoading ? (
              <Text variant="muted-inverse">Loading registration detail...</Text>
            ) : data ? (
              <LayoutUI.Column gap="gap-6">
                <LayoutUI.Container className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailItem label="Event" value={data.event_title || data.event_id} />
                  <DetailItem label="Full name" value={data.full_name} />
                  <DetailItem label="Email" value={data.email} />
                  <DetailItem label="Phone" value={data.phone_number || '-'} />
                  <DetailItem label="Institution" value={data.institution || '-'} />
                  <DetailItem label="Status" value={data.status.replaceAll('_', ' ')} />
                  <DetailItem label="Payment" value={data.payment_status.replaceAll('_', ' ')} />
                  <DetailItem label="Payment URL" value={data.payment_url || '-'} />
                  <DetailItem label="Verified at" value={data.verified_at || '-'} />
                  <DetailItem label="Approved at" value={data.approved_at || '-'} />
                  <DetailItem label="Waitlisted at" value={data.waitlisted_at || '-'} />
                  <DetailItem label="Rejected at" value={data.rejected_at || '-'} />
                  <DetailItem label="Rejected reason" value={data.rejected_reason || '-'} className="sm:col-span-2" />
                </LayoutUI.Container>

                <div className="space-y-3">
                  <Text variant="inverse" className="font-['Sora'] text-lg font-bold">Activity Log</Text>
                  <div className="space-y-3">
                    {(activities ?? []).length ? (
                      activities?.map((activity) => (
                        <div key={activity.id} className="rounded-xl border border-black/10 bg-transparent p-4">
                          <p className="text-sm font-semibold text-[#04090C]">{activity.action}</p>
                          <p className="mt-1 text-xs text-black/55">
                            {activity.user_email || 'System'} • {activity.created_at}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-black/10 bg-transparent p-4">
                        <p className="text-sm text-black/60">No activity recorded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </LayoutUI.Column>
            ) : (
              <Text variant="muted-inverse">Registration data is unavailable.</Text>
            )}
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}

function DetailItem({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="rounded-xl border border-black/10 bg-transparent p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-black/45">{label}</p>
        <p className="mt-2 break-words text-sm leading-6 text-[#04090C]">{value}</p>
      </div>
    </div>
  );
}
