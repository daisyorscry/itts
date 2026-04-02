import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import * as AvatarUI from '@components/ui/avatar';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { DataPagination } from '@components/ui/pagination';
import { SearchField } from '@components/ui/search';
import { DataTable, type DataTableColumn } from '@components/ui/table';
import { Text } from '@components/ui/text';
import { QueryStatePanel } from '@components/query-state-panel';
import { useCertificates } from '@feature/learning/hooks';
import type { LearningCertificate } from '@feature/learning/types';

function getInitials(name?: string, fallback?: string) {
  const source = (name || fallback || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return '?';
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

function escapeCsv(value: string) {
  const normalized = value.replace(/"/g, '""');
  return `"${normalized}"`;
}

function createCertificateColumns(
  onOpenDetail: (certificate: LearningCertificate) => void,
): Array<DataTableColumn<LearningCertificate>> {
  return [
    {
      id: 'certificate',
      header: 'Certificate',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse" className="font-medium">{row.certificate_number}</Text>
          <Text variant="muted-inverse" size="xs">{row.template_name || 'Default template'}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'course',
      header: 'Course',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse" className="font-medium">{row.course_title || row.course_id}</Text>
          <Text variant="muted-inverse" size="xs">{row.course_slug || row.course_id}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'learner',
      header: 'Learner',
      cell: ({ row }) => (
        <LayoutUI.Row gap="gap-3" align="items-center">
          <AvatarUI.Avatar className="size-10 border border-black/10">
            <AvatarUI.AvatarFallback className="bg-[#29E68C1F] font-semibold text-[#04090C]">
              {getInitials(row.user_full_name, row.user_email || row.user_id)}
            </AvatarUI.AvatarFallback>
          </AvatarUI.Avatar>
          <LayoutUI.Column gap="gap-1">
            <Text variant="inverse" className="font-medium">{row.user_full_name || row.user_id}</Text>
            <Text variant="muted-inverse" size="xs">{row.user_email || row.user_id}</Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.status === 'issued' ? 'success' : 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'issued_at',
      header: 'Issued',
      accessorKey: 'issued_at',
      cell: ({ row }) => <Text variant="muted-inverse">{new Date(row.issued_at).toLocaleString()}</Text>,
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      cell: ({ row }) => (
        <LayoutUI.Row className="justify-end gap-2">
          <Button type="button" variant="ghost-inverse" size="sm" onClick={() => onOpenDetail(row)}>
            Detail
          </Button>
          <Button
            type="button"
            variant="ghost-inverse"
            size="sm"
            onClick={() => window.open(`/learning/certificates/${row.certificate_number}`, '_blank', 'noopener,noreferrer')}
          >
            Verify
          </Button>
        </LayoutUI.Row>
      ),
    },
  ];
}

export function AdminLearningCertificates() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useCertificates({
    page,
    page_size: pageSize,
    search: search || undefined,
  });

  const handleExportCsv = () => {
    const rows = data?.data ?? [];
    if (rows.length === 0) {
      return;
    }

    const header = ['certificate_number', 'course_title', 'course_slug', 'user_full_name', 'user_email', 'status', 'issued_at'];
    const body = rows.map((row) =>
      [
        row.certificate_number,
        row.course_title || row.course_id,
        row.course_slug || '',
        row.user_full_name || row.user_id,
        row.user_email || '',
        row.status,
        row.issued_at,
      ].map((value) => escapeCsv(String(value ?? ''))).join(','),
    );
    const csv = [header.join(','), ...body].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `learning-certificates-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Column gap="gap-2">
          <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">
            Learning certificates
          </Text>
          <Text variant="muted-inverse">
            Review every certificate issued by the learning platform and jump to the public verification page.
          </Text>
        </LayoutUI.Column>
        <Button type="button" variant="ghost-inverse" size="form" onClick={handleExportCsv} disabled={!data?.data?.length}>
          <Icons.Download size={18} />
          Export CSV
        </Button>
      </LayoutUI.Row>

      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <SearchField
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by certificate number, course ID, or user ID"
          />
        </CardUI.CardContent>
      </CardUI.Card>

      <CardUI.Card tone="inverse" className="overflow-hidden">
        <CardUI.CardContent padding="auth" spacing="lg">
          {isLoading ? (
            <QueryStatePanel icon={Icons.LoaderCircle} title="Loading certificates" description="Fetching issued learning certificates." />
          ) : error ? (
            <QueryStatePanel icon={Icons.AlertCircle} tone="error" title="Failed to load certificates" description="Please refresh and try again." />
          ) : (
            <LayoutUI.Column gap="gap-4">
              <LayoutUI.Row justify="justify-between" align="items-center" className="gap-3 max-md:flex-col max-md:items-start">
                <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Issued certificates</Text>
                <Badge variant="outline">{data?.total ?? 0} total</Badge>
              </LayoutUI.Row>

              <DataTable
                data={data?.data ?? []}
                columns={createCertificateColumns((certificate) => navigate(`/admin/learning/certificates/${certificate.certificate_number}`))}
                rowKey="id"
                emptyMessage="No certificates have been issued yet."
              />

              {data ? (
                <DataPagination
                  pagination={data}
                  onPageChange={setPage}
                  onPageSizeChange={(value) => {
                    setPageSize(value);
                    setPage(1);
                  }}
                />
              ) : null}
            </LayoutUI.Column>
          )}
        </CardUI.CardContent>
      </CardUI.Card>
    </LayoutUI.Column>
  );
}
