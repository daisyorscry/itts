import * as Icons from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as DropdownMenuUI from '@components/ui/dropdown-menu';
import * as LayoutUI from '@components/ui/layout';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import type { DataTableColumn } from '@components/ui/table';
import type {
  PMBAdmissionTrack,
  PMBApplicant,
  PMBApplicantDocument,
  PMBApplication,
  PMBApplicationStatus,
  PMBDocumentVerificationStatus,
  PMBFaculty,
  PMBReRegistration,
  PMBStudyProgram,
} from '@feature/pmb/types';
import { usePMBAverageScore } from '@feature/pmb/hooks';
import { formatDate, formatDateTime } from '@utility/date';

interface PMBEntityActionsMenuProps<T> {
  row: T;
  isDeleting: boolean;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}

function PMBEntityActionsMenu<T>({ row, isDeleting, onEdit, onDelete }: PMBEntityActionsMenuProps<T>) {
  return (
    <LayoutUI.Row justify="justify-end" className="w-full">
      <DropdownMenuUI.DropdownMenu>
        <DropdownMenuUI.DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 rounded-lg text-black/60 hover:bg-black/10 hover:text-[#04090C]">
            <Icons.MoreVertical className="size-4" />
          </Button>
        </DropdownMenuUI.DropdownMenuTrigger>
        <DropdownMenuUI.DropdownMenuContent align="end" className="w-44 rounded-xl border-black/10 bg-[#F7F4EC] p-1.5">
          <DropdownMenuUI.DropdownMenuItem className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]" onClick={() => onEdit(row)}>
            <Icons.Edit className="text-black/70" />
            Edit
          </DropdownMenuUI.DropdownMenuItem>
          <DropdownMenuUI.DropdownMenuSeparator className="my-1.5 bg-black/10" />
          <DropdownMenuUI.DropdownMenuItem variant="destructive" className="rounded-lg px-3 py-2.5" disabled={isDeleting} onClick={() => onDelete(row)}>
            <Icons.Trash2 />
            Delete
          </DropdownMenuUI.DropdownMenuItem>
        </DropdownMenuUI.DropdownMenuContent>
      </DropdownMenuUI.DropdownMenu>
    </LayoutUI.Row>
  );
}

interface PMBApplicationActionsMenuProps {
  application: PMBApplication;
  isDeleting: boolean;
  onEdit: (application: PMBApplication) => void;
  onView: (application: PMBApplication) => void;
  onDelete: (application: PMBApplication) => void;
}

interface PMBReviewActionColumnProps {
  label: string;
  onClick: (application: PMBApplication) => void;
}

function getApplicationStatusVariant(status: string): 'secondary' | 'success' | 'destructive' | 'outline' {
  if (status === 'passed' || status === 'verified' || status === 're_registered') return 'success';
  if (status === 'failed') return 'destructive';
  if (status === 'draft') return 'secondary';
  return 'outline';
}

function getDocumentStatusVariant(status: string): 'secondary' | 'success' | 'destructive' | 'outline' {
  if (status === 'valid') return 'success';
  if (status === 'invalid') return 'destructive';
  if (status === 'pending') return 'secondary';
  return 'outline';
}

function getPaymentStatusVariant(status: string): 'secondary' | 'success' | 'destructive' | 'outline' {
  if (status === 'paid') return 'success';
  if (status === 'unpaid') return 'destructive';
  return 'outline';
}

function PMBAverageScoreCell({ applicationId }: { applicationId: string }) {
  const { data } = usePMBAverageScore(applicationId, true);
  const value = data?.average_score;

  return (
    <Text variant="muted-inverse">
      {typeof value === 'number' ? value.toFixed(2) : '-'}
    </Text>
  );
}

function PMBApplicationActionsMenu({ application, isDeleting, onEdit, onView, onDelete }: PMBApplicationActionsMenuProps) {
  return (
    <LayoutUI.Row justify="justify-end" className="w-full">
      <DropdownMenuUI.DropdownMenu>
        <DropdownMenuUI.DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 rounded-lg text-black/60 hover:bg-black/10 hover:text-[#04090C]">
            <Icons.MoreVertical className="size-4" />
          </Button>
        </DropdownMenuUI.DropdownMenuTrigger>
        <DropdownMenuUI.DropdownMenuContent align="end" className="w-44 rounded-xl border-black/10 bg-[#F7F4EC] p-1.5">
          <DropdownMenuUI.DropdownMenuItem className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]" onClick={() => onEdit(application)}>
            <Icons.Edit className="text-black/70" />
            Edit
          </DropdownMenuUI.DropdownMenuItem>
          <DropdownMenuUI.DropdownMenuItem className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]" onClick={() => onView(application)}>
            <Icons.Eye className="text-black/70" />
            View Details
          </DropdownMenuUI.DropdownMenuItem>
          <DropdownMenuUI.DropdownMenuSeparator className="my-1.5 bg-black/10" />
          <DropdownMenuUI.DropdownMenuItem variant="destructive" className="rounded-lg px-3 py-2.5" disabled={isDeleting} onClick={() => onDelete(application)}>
            <Icons.Trash2 />
            Delete
          </DropdownMenuUI.DropdownMenuItem>
        </DropdownMenuUI.DropdownMenuContent>
      </DropdownMenuUI.DropdownMenu>
    </LayoutUI.Row>
  );
}

function PMBReviewActionButton({ label, onClick, application }: PMBReviewActionColumnProps & { application: PMBApplication }) {
  return (
    <LayoutUI.Row justify="justify-end" className="w-full">
      <Button type="button" onClick={() => onClick(application)} variant="soft-action" size="sm">
        {label}
      </Button>
    </LayoutUI.Row>
  );
}

export function createPMBApplicationColumns({
  isUpdatingStatus,
  isDeleting,
  onStatusChange,
  onEdit,
  onView,
  onDelete,
}: {
  isUpdatingStatus: boolean;
  isDeleting: boolean;
  onStatusChange: (application: PMBApplication, status: PMBApplicationStatus) => void;
  onEdit: (application: PMBApplication) => void;
  onView: (application: PMBApplication) => void;
  onDelete: (application: PMBApplication) => void;
}): Array<DataTableColumn<PMBApplication>> {
  return [
    {
      id: 'application',
      header: 'Application',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.application_number}</Text>
          <Text variant="muted-inverse" size="xs">{row.applicant?.full_name || row.applicant_id}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'program',
      header: 'Program',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.program?.name || '-'}</Text>
          <Text variant="muted-inverse" size="xs">{row.track?.track_name || '-'}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'academic_year',
      header: 'Academic Year',
      cell: ({ row }) => <Text variant="muted-inverse">{row.academic_year}</Text>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-2" className="items-start">
          <Badge variant={getApplicationStatusVariant(row.status)} className="capitalize">
            {row.status.replace('_', ' ')}
          </Badge>
          <SelectUI.Select
            value={row.status}
            onValueChange={(value) => onStatusChange(row, value as PMBApplicationStatus)}
            disabled={isUpdatingStatus}
          >
            <SelectUI.SelectTrigger appearance="admin" className="h-auto min-w-32 rounded-lg px-2 py-1.5">
              <SelectUI.SelectValue>{row.status.replace('_', ' ')}</SelectUI.SelectValue>
            </SelectUI.SelectTrigger>
            <SelectUI.SelectContent appearance="admin">
              <SelectUI.SelectItem value="draft">Draft</SelectUI.SelectItem>
              <SelectUI.SelectItem value="verified">Verified</SelectUI.SelectItem>
              <SelectUI.SelectItem value="passed">Passed</SelectUI.SelectItem>
              <SelectUI.SelectItem value="failed">Failed</SelectUI.SelectItem>
              <SelectUI.SelectItem value="re_registered">Re-registered</SelectUI.SelectItem>
            </SelectUI.SelectContent>
          </SelectUI.Select>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'created_at',
      header: 'Submitted',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDateTime(row.created_at)}</Text>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <PMBApplicationActionsMenu application={row} isDeleting={isDeleting} onEdit={onEdit} onView={onView} onDelete={onDelete} />
      ),
    },
  ];
}

export function createPMBTrackColumns({
  isDeleting,
  onEdit,
  onDelete,
}: {
  isDeleting: boolean;
  onEdit: (track: PMBAdmissionTrack) => void;
  onDelete: (track: PMBAdmissionTrack) => void;
}): Array<DataTableColumn<PMBAdmissionTrack>> {
  return [
    {
      id: 'track_code',
      header: 'Code',
      cell: ({ row }) => <Text variant="inverse">{row.track_code}</Text>,
    },
    {
      id: 'track_name',
      header: 'Track',
      cell: ({ row }) => <Text variant="inverse">{row.track_name}</Text>,
    },
    {
      id: 'requires_test',
      header: 'Test',
      cell: ({ row }) => <Text variant="muted-inverse">{row.requires_test ? 'Required' : 'No test'}</Text>,
    },
    {
      id: 'is_active',
      header: 'Status',
      cell: ({ row }) => <Badge variant={row.is_active ? 'success' : 'secondary'}>{row.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      id: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDate(row.updated_at)}</Text>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <PMBEntityActionsMenu row={row} isDeleting={isDeleting} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ];
}

export function createPMBApplicantColumns({
  isDeleting,
  onEdit,
  onDelete,
}: {
  isDeleting: boolean;
  onEdit: (applicant: PMBApplicant) => void;
  onDelete: (applicant: PMBApplicant) => void;
}): Array<DataTableColumn<PMBApplicant>> {
  return [
    {
      id: 'full_name',
      header: 'Applicant',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.full_name}</Text>
          <Text variant="muted-inverse" size="xs">{row.phone_number}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'gender',
      header: 'Gender',
      cell: ({ row }) => <Text variant="muted-inverse" className="capitalize">{row.gender}</Text>,
    },
    {
      id: 'school_origin',
      header: 'School',
      cell: ({ row }) => <Text variant="muted-inverse">{row.school_origin}</Text>,
    },
    {
      id: 'graduation_year',
      header: 'Grad Year',
      cell: ({ row }) => <Text variant="muted-inverse">{row.graduation_year}</Text>,
    },
    {
      id: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDate(row.updated_at)}</Text>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <PMBEntityActionsMenu row={row} isDeleting={isDeleting} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ];
}

export function createPMBFacultyColumns({
  isDeleting,
  onEdit,
  onDelete,
}: {
  isDeleting: boolean;
  onEdit: (faculty: PMBFaculty) => void;
  onDelete: (faculty: PMBFaculty) => void;
}): Array<DataTableColumn<PMBFaculty>> {
  return [
    {
      id: 'code',
      header: 'Code',
      cell: ({ row }) => <Text variant="inverse">{row.code}</Text>,
    },
    {
      id: 'name',
      header: 'Faculty',
      cell: ({ row }) => <Text variant="inverse">{row.name}</Text>,
    },
    {
      id: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDate(row.updated_at)}</Text>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <PMBEntityActionsMenu row={row} isDeleting={isDeleting} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ];
}

export function createPMBProgramColumns({
  isDeleting,
  onEdit,
  onDelete,
}: {
  isDeleting: boolean;
  onEdit: (program: PMBStudyProgram) => void;
  onDelete: (program: PMBStudyProgram) => void;
}): Array<DataTableColumn<PMBStudyProgram>> {
  return [
    {
      id: 'code',
      header: 'Code',
      cell: ({ row }) => <Text variant="inverse">{row.code}</Text>,
    },
    {
      id: 'program',
      header: 'Program',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.name}</Text>
          <Text variant="muted-inverse" size="xs">{row.faculty?.name || '-'}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'degree_level',
      header: 'Degree',
      cell: ({ row }) => <Text variant="muted-inverse">{row.degree_level}</Text>,
    },
    {
      id: 'quota',
      header: 'Quota',
      align: 'right',
      cell: ({ row }) => <Text variant="muted-inverse">{row.quota}</Text>,
    },
    {
      id: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDate(row.updated_at)}</Text>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <PMBEntityActionsMenu row={row} isDeleting={isDeleting} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ];
}

export function createPMBDocumentColumns({
  isUpdatingStatus,
  onStatusChange,
}: {
  isUpdatingStatus: boolean;
  onStatusChange: (document: PMBApplicantDocument, status: PMBDocumentVerificationStatus) => void;
}): Array<DataTableColumn<PMBApplicantDocument>> {
  return [
    {
      id: 'document_type',
      header: 'Document',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.document_type}</Text>
          <Text variant="muted-inverse" size="xs" className="break-all">{row.file_path}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'applicant',
      header: 'Applicant',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.applicant?.full_name || row.applicant_id}</Text>
          <Text variant="muted-inverse" size="xs">{row.applicant?.phone_number || '-'}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'verification_status',
      header: 'Verification',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-2" className="items-start">
          <Badge variant={getDocumentStatusVariant(row.verification_status)} className="capitalize">
            {row.verification_status}
          </Badge>
          <SelectUI.Select
            value={row.verification_status}
            onValueChange={(value) => onStatusChange(row, value as PMBDocumentVerificationStatus)}
            disabled={isUpdatingStatus}
          >
            <SelectUI.SelectTrigger appearance="admin" className="h-auto min-w-32 rounded-lg px-2 py-1.5">
              <SelectUI.SelectValue>{row.verification_status}</SelectUI.SelectValue>
            </SelectUI.SelectTrigger>
            <SelectUI.SelectContent appearance="admin">
              <SelectUI.SelectItem value="pending">Pending</SelectUI.SelectItem>
              <SelectUI.SelectItem value="valid">Valid</SelectUI.SelectItem>
              <SelectUI.SelectItem value="invalid">Invalid</SelectUI.SelectItem>
            </SelectUI.SelectContent>
          </SelectUI.Select>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDateTime(row.updated_at)}</Text>,
    },
  ];
}

export function createPMBReviewColumns({
  actionLabel,
  onAction,
}: {
  actionLabel: string;
  onAction: (application: PMBApplication) => void;
}): Array<DataTableColumn<PMBApplication>> {
  return [
    {
      id: 'application',
      header: 'Application',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.application_number}</Text>
          <Text variant="muted-inverse" size="xs">{row.applicant?.full_name || row.applicant_id}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'program',
      header: 'Program',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.program?.name || '-'}</Text>
          <Text variant="muted-inverse" size="xs">{row.track?.track_name || '-'}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getApplicationStatusVariant(row.status)} className="capitalize">
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      id: 'average_score',
      header: 'Avg Score',
      align: 'right',
      cell: ({ row }) => <PMBAverageScoreCell applicationId={row.id} />,
    },
    {
      id: 'submitted',
      header: 'Submitted',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDateTime(row.created_at)}</Text>,
    },
    {
      id: 'action',
      header: 'Action',
      align: 'right',
      cell: ({ row }) => <PMBReviewActionButton application={row} label={actionLabel} onClick={onAction} />,
    },
  ];
}

export function createPMBPendingPaymentColumns({
  onUpdate,
}: {
  onUpdate: (row: PMBReRegistration) => void;
}): Array<DataTableColumn<PMBReRegistration>> {
  return [
    {
      id: 'application',
      header: 'Application',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.application?.application_number || row.application_id}</Text>
          <Text variant="muted-inverse" size="xs">{row.application?.applicant?.full_name || '-'}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'program',
      header: 'Program',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.application?.program?.name || '-'}</Text>
          <Text variant="muted-inverse" size="xs">{row.application?.track?.track_name || '-'}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 're_registration_date',
      header: 'Re-registration',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDate(row.re_registration_date)}</Text>,
    },
    {
      id: 'payment_status',
      header: 'Payment',
      cell: ({ row }) => (
        <Badge variant={getPaymentStatusVariant(row.payment_status)} className="capitalize">
          {row.payment_status}
        </Badge>
      ),
    },
    {
      id: 'action',
      header: 'Action',
      align: 'right',
      cell: ({ row }) => (
        <LayoutUI.Row justify="justify-end">
          <Button type="button" onClick={() => onUpdate(row)} variant="soft-action" size="sm">
            Update Payment
          </Button>
        </LayoutUI.Row>
      ),
    },
  ];
}
