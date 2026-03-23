import * as Icons from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { useGetPermission } from '@feature/permission/hooks';
import { formatDate } from '@utility/date';

export function AdminPermissionView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: permission, isLoading, error } = useGetPermission(id ?? '', Boolean(id));

  if (isLoading) {
    return <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth"><div className="p-12 text-center"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#29E68C]" /><Text className="mt-4" style={{ color: 'rgba(4, 9, 12, 0.6)' }}>Loading permission data...</Text></div></CardUI.CardContent></CardUI.Card>;
  }
  if (error || !permission) {
    return <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth"><div className="p-12 text-center"><Text className="font-medium" style={{ color: '#04090C' }}>{error ? 'Error loading permission data' : 'Permission not found'}</Text><Button onClick={() => navigate('/admin/permissions')} variant="accent" size="form" className="mt-4">Back to Permissions</Button></div></CardUI.CardContent></CardUI.Card>;
  }

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row gap="gap-4">
        <Button type="button" onClick={() => navigate('/admin/permissions')} variant="ghost-inverse" size="icon" className="rounded-xl border border-black/10 bg-black/5"><Icons.ArrowLeft size={20} /></Button>
        <LayoutUI.Column gap="gap-2">
          <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">Permission Details</Text>
          <Text variant="muted-inverse">Inspect how this permission is composed.</Text>
        </LayoutUI.Column>
      </LayoutUI.Row>

      <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth" spacing="lg">
        <CardUI.Card tone="inverse"><CardUI.CardContent className="py-4"><LayoutUI.Column gap="gap-2"><Text variant="muted-inverse" size="sm">Permission Name</Text><Text variant="inverse" className="break-words font-mono text-base font-semibold text-[#29E68C]">{permission.name}</Text></LayoutUI.Column></CardUI.CardContent></CardUI.Card>
        <CardUI.Card tone="inverse"><CardUI.CardContent className="py-4"><LayoutUI.Column gap="gap-2"><Text variant="muted-inverse" size="sm">Description</Text><Text variant="inverse">{permission.description}</Text></LayoutUI.Column></CardUI.CardContent></CardUI.Card>
        <LayoutUI.Row gap="gap-4" className="grid grid-cols-1 md:grid-cols-2">
          <CardUI.Card tone="inverse"><CardUI.CardContent className="py-4"><LayoutUI.Column gap="gap-3"><Text variant="muted-inverse" size="sm">Resource</Text><Badge variant="secondary">{permission.resource.name}</Badge><Text variant="muted-inverse">{permission.resource.description}</Text></LayoutUI.Column></CardUI.CardContent></CardUI.Card>
          <CardUI.Card tone="inverse"><CardUI.CardContent className="py-4"><LayoutUI.Column gap="gap-3"><Text variant="muted-inverse" size="sm">Action</Text><Badge variant="secondary">{permission.action.name}</Badge><Text variant="muted-inverse">{permission.action.description}</Text></LayoutUI.Column></CardUI.CardContent></CardUI.Card>
        </LayoutUI.Row>
        <CardUI.Card tone="inverse"><CardUI.CardContent className="py-4"><LayoutUI.Column gap="gap-1"><Text variant="muted-inverse" size="sm">Created At</Text><Text variant="inverse" className="font-medium">{formatDate(permission.created_at, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text></LayoutUI.Column></CardUI.CardContent></CardUI.Card>
      </CardUI.CardContent></CardUI.Card>
    </LayoutUI.Column>
  );
}
