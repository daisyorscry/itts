import * as Icons from 'lucide-react';
import { useParams } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Badge } from '@components/ui/badge';
import { Text } from '@components/ui/text';
import { QueryStatePanel } from '@components/query-state-panel';
import { LearningPublicShell } from '@feature/learning/components/LearningPublicShell';
import { useVerifyCertificate } from '@feature/learning/hooks';

export function LearningCertificateVerify() {
  const { certificateNumber = '' } = useParams();
  const { data, isLoading, error } = useVerifyCertificate(certificateNumber);

  return (
    <LearningPublicShell
      eyebrow="Certificate Verification"
      title="Validate learning certificates against the ITTS platform."
      description="Use the public verification view to confirm a certificate number, its issued course, and whether the credential is still recognized by the system."
      leftMeta={(
        <LayoutUI.Row className="flex-wrap gap-3">
          <Badge variant="outline">Public verification</Badge>
          <Badge variant="outline">Course-linked</Badge>
          <Badge variant="outline">Status-aware</Badge>
        </LayoutUI.Row>
      )}
      rightPanel={(
        <LayoutUI.Column gap="gap-4" className="mx-auto max-w-xl">
          <LayoutUI.Column surface="panel" padding="lg" radius="2xl" className="border border-white/10 bg-white/5">
            <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">Verification endpoint</Text>
            <Text variant="muted-inverse" className="leading-7">
              Shareable certificate URLs can be checked publicly without opening the learner dashboard.
            </Text>
          </LayoutUI.Column>
          <LayoutUI.Container className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LayoutUI.Column surface="panel" padding="md" radius="xl" gap="gap-1" className="border border-white/10 bg-white/5">
              <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">1 URL</Text>
              <Text variant="muted-inverse" size="sm">Per certificate</Text>
            </LayoutUI.Column>
            <LayoutUI.Column surface="panel" padding="md" radius="xl" gap="gap-1" className="border border-white/10 bg-white/5">
              <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">Live</Text>
              <Text variant="muted-inverse" size="sm">Status lookup</Text>
            </LayoutUI.Column>
          </LayoutUI.Container>
        </LayoutUI.Column>
      )}
    >

      {isLoading ? (
        <QueryStatePanel icon={Icons.LoaderCircle} title="Verifying certificate" description="Cross-checking certificate data." />
      ) : null}

      {!isLoading && error ? (
        <QueryStatePanel icon={Icons.AlertCircle} tone="error" title="Certificate lookup failed" description="Please check the URL and try again." />
      ) : null}

      {!isLoading && !error && data ? (
        <CardUI.Card tone="paper" className="mx-auto max-w-4xl border border-black/10 shadow-[0_24px_80px_rgba(4,9,12,0.08)]">
          <CardUI.CardContent padding="auth" spacing="lg">
            <LayoutUI.Column gap="gap-4">
              <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
                <LayoutUI.Column gap="gap-2">
                  <Text className="font-['Sora'] text-2xl font-semibold text-[#04090C]">
                    {data.certificate.certificate_number || certificateNumber}
                  </Text>
                  <Text className="text-black/60">
                    Issued for {data.certificate.course_title || data.certificate.course_id || '-'}
                  </Text>
                </LayoutUI.Column>
                <Badge variant={data.verified ? 'success' : 'destructive'}>
                  {data.verified ? 'Verified' : 'Not valid'}
                </Badge>
              </LayoutUI.Row>

              <LayoutUI.Row justify="justify-between" surface="panel" padding="md" radius="xl">
                <Text className="text-black/60">Learner</Text>
                <Text className="font-medium text-[#04090C]">{data.certificate.user_full_name || data.certificate.user_id || '-'}</Text>
              </LayoutUI.Row>
              <LayoutUI.Row justify="justify-between" surface="panel" padding="md" radius="xl">
                <Text className="text-black/60">Status</Text>
                <Text className="font-medium text-[#04090C]">{data.certificate.status || 'unknown'}</Text>
              </LayoutUI.Row>
              <LayoutUI.Row justify="justify-between" surface="panel" padding="md" radius="xl">
                <Text className="text-black/60">Issued at</Text>
                <Text className="font-medium text-[#04090C]">{data.certificate.issued_at || '-'}</Text>
              </LayoutUI.Row>
            </LayoutUI.Column>
          </CardUI.CardContent>
        </CardUI.Card>
      ) : null}
    </LearningPublicShell>
  );
}
