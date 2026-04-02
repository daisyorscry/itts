import * as Icons from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import * as AvatarUI from '@components/ui/avatar';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { QueryStatePanel } from '@components/query-state-panel';
import { useVerifyCertificate } from '@feature/learning/hooks';

function getInitials(name?: string, fallback?: string) {
  const source = (name || fallback || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return '?';
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export function AdminLearningCertificateDetail() {
  const navigate = useNavigate();
  const { certificateNumber = '' } = useParams();
  const { data, isLoading, error } = useVerifyCertificate(certificateNumber);

  if (isLoading) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <QueryStatePanel icon={Icons.LoaderCircle} title="Loading certificate" description="Fetching certificate details and verification data." />
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  if (error || !data) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <QueryStatePanel icon={Icons.AlertCircle} tone="error" title="Certificate unavailable" description="The requested certificate could not be found." />
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  const certificate = data.certificate;

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Row gap="gap-4">
          <Button
            type="button"
            onClick={() => navigate('/admin/learning/certificates')}
            variant="ghost-inverse"
            size="icon"
            className="rounded-xl border border-black/10 bg-black/5"
          >
            <Icons.ArrowLeft size={20} />
          </Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">
              Certificate detail
            </Text>
            <Text variant="muted-inverse">
              Review certificate metadata, jump to the public verification page, or print/export it as PDF.
            </Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
        <LayoutUI.Row className="flex-wrap gap-3">
          <Button type="button" variant="ghost-inverse" size="form" onClick={() => window.print()}>
            <Icons.Printer size={18} />
            Print / Export PDF
          </Button>
          <Button asChild variant="accent" size="form">
            <Link to={`/learning/certificates/${certificate.certificate_number}`} target="_blank" rel="noreferrer">
              <Icons.ExternalLink size={18} />
              Open public verify
            </Link>
          </Button>
        </LayoutUI.Row>
      </LayoutUI.Row>

      <CardUI.Card tone="paper">
        <CardUI.CardContent padding="auth" spacing="lg">
          <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
            <LayoutUI.Column gap="gap-2">
              <Text className="font-['Sora'] text-3xl font-bold text-[#04090C]">{certificate.certificate_number}</Text>
              <Text className="text-black/65">{certificate.course_title || certificate.course_id}</Text>
            </LayoutUI.Column>
            <Badge variant={data.verified ? 'success' : 'destructive'}>
              {data.verified ? 'Verified' : 'Not valid'}
            </Badge>
          </LayoutUI.Row>

          <LayoutUI.Row surface="panel" padding="md" radius="xl" className="gap-4">
            <AvatarUI.Avatar className="size-16 border border-black/10">
              <AvatarUI.AvatarFallback className="bg-[#29E68C1F] text-lg font-semibold text-[#04090C]">
                {getInitials(certificate.user_full_name, certificate.user_email || certificate.user_id)}
              </AvatarUI.AvatarFallback>
            </AvatarUI.Avatar>
            <LayoutUI.Column gap="gap-1">
              <Text className="font-medium text-[#04090C]">{certificate.user_full_name || certificate.user_id}</Text>
              <Text className="text-sm text-black/60">{certificate.user_email || '-'}</Text>
              <Text className="text-sm text-black/50">Learner profile summary</Text>
            </LayoutUI.Column>
          </LayoutUI.Row>

          <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LayoutUI.Row justify="justify-between" surface="panel" padding="md" radius="xl">
              <Text className="text-black/60">Learner</Text>
              <Text className="font-medium text-[#04090C]">{certificate.user_full_name || certificate.user_id}</Text>
            </LayoutUI.Row>
            <LayoutUI.Row justify="justify-between" surface="panel" padding="md" radius="xl">
              <Text className="text-black/60">Learner email</Text>
              <Text className="font-medium text-[#04090C]">{certificate.user_email || '-'}</Text>
            </LayoutUI.Row>
            <LayoutUI.Row justify="justify-between" surface="panel" padding="md" radius="xl">
              <Text className="text-black/60">Course slug</Text>
              <Text className="font-medium text-[#04090C]">{certificate.course_slug || '-'}</Text>
            </LayoutUI.Row>
            <LayoutUI.Row justify="justify-between" surface="panel" padding="md" radius="xl">
              <Text className="text-black/60">Status</Text>
              <Text className="font-medium text-[#04090C]">{certificate.status}</Text>
            </LayoutUI.Row>
            <LayoutUI.Row justify="justify-between" surface="panel" padding="md" radius="xl">
              <Text className="text-black/60">Issued at</Text>
              <Text className="font-medium text-[#04090C]">{new Date(certificate.issued_at).toLocaleString()}</Text>
            </LayoutUI.Row>
            <LayoutUI.Row justify="justify-between" surface="panel" padding="md" radius="xl">
              <Text className="text-black/60">Template</Text>
              <Text className="font-medium text-[#04090C]">{certificate.template_name || 'Default template'}</Text>
            </LayoutUI.Row>
          </LayoutUI.Container>
        </CardUI.CardContent>
      </CardUI.Card>
    </LayoutUI.Column>
  );
}
