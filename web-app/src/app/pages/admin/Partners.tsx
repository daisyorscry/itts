import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { DataPagination } from '@components/ui/pagination';
import { SearchField } from '@components/ui/search';
import * as SelectUI from '@components/ui/select';
import { DataTable } from '@components/ui/table';
import { Text } from '@components/ui/text';
import { useDeletePartner, useListPartners, useSetPartnerActive, useSetPartnerPriority } from '@feature/partner/hooks';
import { type Partner, type PartnerKind, type PartnerListResponse } from '@feature/partner/types';
import { createPartnerColumns } from '@pages/admin/partners/Columns';
import { PartnersQueryState } from '@pages/admin/partners/PartnersQueryState';

export function AdminPartners() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<PartnerKind | ''>('');

  const { data, isLoading, error } = useListPartners({
    page,
    page_size: pageSize,
    search: search || undefined,
    kind: kind || undefined,
  });
  const { mutate: deletePartner, isPending: deleting } = useDeletePartner();
  const { mutate: setActive, isPending: settingActive } = useSetPartnerActive();
  const { mutate: setPriority, isPending: settingPriority } = useSetPartnerPriority();

  const listPartnersResponse: PartnerListResponse | null = data ?? null;
  const partners = listPartnersResponse?.data ?? [];
  const hasPartners = partners.length > 0;

  const partnerColumns = createPartnerColumns({
    isSettingActive: settingActive,
    isSettingPriority: settingPriority,
    isDeleting: deleting,
    onPriorityChange: (partner, priority) => {
      setPriority({ id: partner.id, payload: { priority } });
    },
    onToggleActive: (partner) => {
      setActive({ id: partner.id, payload: { active: !partner.is_active } });
    },
    onView: (partner) => navigate(`/admin/partners/${partner.id}`),
    onEdit: (partner) => navigate(`/admin/partners/edit/${partner.id}`),
    onDelete: (partner) => {
      deletePartner(partner.id);
    },
  });

  return (
    <LayoutUI.Column gap="gap-8">
      <LayoutUI.Row justify="justify-between" align="items-center" className="gap-4 max-md:flex-col max-md:items-start">
        <LayoutUI.Column gap="gap-2">
          <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
            Partners Management
          </Text>
          <Text variant="muted-inverse">
            Manage labs, academic partners, and industry partners.
          </Text>
        </LayoutUI.Column>
        <Button onClick={() => navigate('/admin/partners/create')} variant="accent" size="form">
          <Icons.Plus />
          Add Partner
        </Button>
      </LayoutUI.Row>

      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
        {typeof listPartnersResponse?.total === 'number' ? (
          <Text variant="muted-inverse" className="shrink-0 md:pt-2">
            Showing {(page - 1) * (listPartnersResponse?.page_size ?? pageSize) + 1} to{' '}
            {Math.min(page * (listPartnersResponse?.page_size ?? pageSize), listPartnersResponse.total)} of{' '}
            {listPartnersResponse.total} partners
          </Text>
        ) : null}

        <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
          <CardUI.CardContent>
            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
              <SearchField
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search partners"
              />

              <SelectUI.Select
                value={kind || 'all'}
                onValueChange={(value) => {
                  setKind(value === 'all' ? '' : (value as PartnerKind));
                  setPage(1);
                }}
              >
                <SelectUI.SelectTrigger appearance="admin">
                  <SelectUI.SelectValue>{kind || 'All kinds'}</SelectUI.SelectValue>
                </SelectUI.SelectTrigger>
                <SelectUI.SelectContent appearance="admin">
                  <SelectUI.SelectItem value="all">All kinds</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="lab">Lab</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="partner_academic">Academic</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="partner_industry">Industry</SelectUI.SelectItem>
                </SelectUI.SelectContent>
              </SelectUI.Select>
            </LayoutUI.Container>
          </CardUI.CardContent>
        </CardUI.Card>
      </LayoutUI.Row>

      {isLoading ? <PartnersQueryState type="loading" /> : null}
      {!isLoading && error ? <PartnersQueryState type="error" /> : null}
      {!isLoading && !error && !hasPartners ? <PartnersQueryState type="empty" /> : null}

      {!isLoading && !error && listPartnersResponse && hasPartners ? (
        <LayoutUI.Column>
          <CardUI.Card tone="inverse" className="overflow-hidden">
            <DataTable data={partners} columns={partnerColumns} rowKey="id" emptyMessage="No partners found." />
          </CardUI.Card>

          <DataPagination
            pagination={listPartnersResponse}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        </LayoutUI.Column>
      ) : null}
    </LayoutUI.Column>
  );
}
