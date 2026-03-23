import { useState } from 'react';
import * as Icons from 'lucide-react';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { DataPagination } from '@components/ui/pagination';
import { SearchField } from '@components/ui/search';
import * as SelectUI from '@components/ui/select';
import { DataTable } from '@components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Text } from '@components/ui/text';
import {
  useDeletePMBApplicant,
  useDeletePMBApplication,
  useDeletePMBAdmissionTrack,
  useDeletePMBFaculty,
  useDeletePMBStudyProgram,
  usePMBApplicationStats,
  usePMBProgramStats,
  useListPMBAdmissionTracks,
  useListPMBApplicants,
  useListPMBApplications,
  useListPMBDocuments,
  useListPMBFaculties,
  useListPMBPendingPayments,
  useListPMBStudyPrograms,
  useUpdatePMBDocumentVerification,
  useUpdatePMBApplicationStatus,
} from '@feature/pmb/hooks';
import type {
  PMBAdmissionTrack,
  PMBApplicant,
  PMBApplication,
  PMBApplicationStatus,
  PMBDocumentVerificationStatus,
  PMBDegreeLevel,
  PMBFaculty,
  PMBReRegistration,
  PMBStudyProgram,
} from '@feature/pmb/types';
import {
  createPMBApplicantColumns,
  createPMBApplicationColumns,
  createPMBDocumentColumns,
  createPMBFacultyColumns,
  createPMBPendingPaymentColumns,
  createPMBProgramColumns,
  createPMBReviewColumns,
  createPMBTrackColumns,
} from '@pages/admin/pmb/Columns';
import { ApplicantFormModal } from '@pages/admin/pmb/ApplicantFormModal';
import { ApplicationDetailsModal } from '@pages/admin/pmb/ApplicationDetailsModal';
import { ApplicationFormModal } from '@pages/admin/pmb/ApplicationFormModal';
import { DeletePMBEntityDialog } from '@pages/admin/pmb/DeletePMBEntityDialog';
import { FacultyFormModal } from '@pages/admin/pmb/FacultyFormModal';
import { PMBQueryState } from '@pages/admin/pmb/PMBQueryState';
import { ReRegistrationFormModal } from '@pages/admin/pmb/ReRegistrationFormModal';
import { StudyProgramFormModal } from '@pages/admin/pmb/StudyProgramFormModal';
import { TrackFormModal } from '@pages/admin/pmb/TrackFormModal';
import { useAuthStore } from '@store/auth.store';
import { formatDate } from '@utility/date';

const DEFAULT_ACADEMIC_YEAR = '2026/2027';
const adminPMBTabs = ['applicants', 'applications', 'documents', 'evaluations', 'results', 'payments', 'tracks', 'faculties', 'programs'] as const;

type AdminPMBTab = (typeof adminPMBTabs)[number];
type ApplicationDetailMode = 'default' | 'evaluation' | 'result' | 'payment';
type ApplicantGenderFilter = 'male' | 'female' | '';
type BooleanFilter = 'all' | 'true' | 'false';

function isAdminPMBTab(value: string): value is AdminPMBTab {
  return adminPMBTabs.includes(value as AdminPMBTab);
}

function getById<T extends { id: string }>(items: T[] | undefined, id: string): T | undefined {
  return items?.find((item) => item.id === id);
}

export function AdminPMB() {
  const user = useAuthStore((state) => state.user);
  const [statsAcademicYear, setStatsAcademicYear] = useState<string>(DEFAULT_ACADEMIC_YEAR);
  const [tab, setTab] = useState<AdminPMBTab>('applications');
  const [applicantPage, setApplicantPage] = useState(1);
  const [applicantPageSize, setApplicantPageSize] = useState(10);
  const [applicantSearch, setApplicantSearch] = useState('');
  const [applicantGender, setApplicantGender] = useState<ApplicantGenderFilter>('');
  const [editingApplicant, setEditingApplicant] = useState<PMBApplicant | null>(null);
  const [isCreatingApplicant, setIsCreatingApplicant] = useState(false);
  const [applicantToDelete, setApplicantToDelete] = useState<PMBApplicant | null>(null);
  const [documentPage, setDocumentPage] = useState(1);
  const [documentPageSize, setDocumentPageSize] = useState(10);
  const [documentSearch, setDocumentSearch] = useState('');
  const [documentApplicantId, setDocumentApplicantId] = useState('');
  const [documentStatus, setDocumentStatus] = useState<PMBDocumentVerificationStatus | ''>('');
  const [pendingPaymentsAcademicYear, setPendingPaymentsAcademicYear] = useState<string>(DEFAULT_ACADEMIC_YEAR);
  const [pendingPaymentsTrackId, setPendingPaymentsTrackId] = useState('');
  const [pendingPaymentsProgramId, setPendingPaymentsProgramId] = useState('');
  const [editingPendingPayment, setEditingPendingPayment] = useState<PMBReRegistration | null>(null);
  const [applicationPage, setApplicationPage] = useState(1);
  const [applicationPageSize, setApplicationPageSize] = useState(10);
  const [applicationSearch, setApplicationSearch] = useState('');
  const [applicationAcademicYear, setApplicationAcademicYear] = useState('');
  const [applicationStatus, setApplicationStatus] = useState<PMBApplicationStatus | ''>('');
  const [applicationTrackId, setApplicationTrackId] = useState('');
  const [applicationProgramId, setApplicationProgramId] = useState('');
  const [editingApplication, setEditingApplication] = useState<PMBApplication | null>(null);
  const [isCreatingApplication, setIsCreatingApplication] = useState(false);
  const [viewingApplication, setViewingApplication] = useState<PMBApplication | null>(null);
  const [applicationDetailMode, setApplicationDetailMode] = useState<ApplicationDetailMode>('default');
  const [applicationToDelete, setApplicationToDelete] = useState<PMBApplication | null>(null);
  const [trackPage, setTrackPage] = useState(1);
  const [trackPageSize, setTrackPageSize] = useState(10);
  const [trackSearch, setTrackSearch] = useState('');
  const [trackActive, setTrackActive] = useState<BooleanFilter>('all');
  const [facultyPage, setFacultyPage] = useState(1);
  const [facultyPageSize, setFacultyPageSize] = useState(10);
  const [facultySearch, setFacultySearch] = useState('');
  const [programPage, setProgramPage] = useState(1);
  const [programPageSize, setProgramPageSize] = useState(10);
  const [programSearch, setProgramSearch] = useState('');
  const [degreeLevel, setDegreeLevel] = useState<PMBDegreeLevel | ''>('');
  const [editingTrack, setEditingTrack] = useState<PMBAdmissionTrack | null>(null);
  const [isCreatingTrack, setIsCreatingTrack] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<PMBAdmissionTrack | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<PMBFaculty | null>(null);
  const [isCreatingFaculty, setIsCreatingFaculty] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<PMBFaculty | null>(null);
  const [editingProgram, setEditingProgram] = useState<PMBStudyProgram | null>(null);
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<PMBStudyProgram | null>(null);

  const { data: applicants, isLoading: loadingApplicants, error: applicantsError } = useListPMBApplicants({
    page: applicantPage,
    page_size: applicantPageSize,
    search: applicantSearch || undefined,
    gender: applicantGender || undefined,
  });
  const { data: applications, isLoading: loadingApplications, error: applicationsError } = useListPMBApplications({
    page: applicationPage,
    page_size: applicationPageSize,
    search: applicationSearch || undefined,
    academic_year: applicationAcademicYear || undefined,
    status: applicationStatus || undefined,
    track_id: applicationTrackId || undefined,
    program_id: applicationProgramId || undefined,
  });
  const { data: documents, isLoading: loadingDocuments, error: documentsError } = useListPMBDocuments({
    page: documentPage,
    page_size: documentPageSize,
    search: documentSearch || undefined,
    applicant_id: documentApplicantId || undefined,
    verification_status: documentStatus || undefined,
  });
  const { data: pendingPayments, isLoading: loadingPendingPayments, error: pendingPaymentsError } = useListPMBPendingPayments(
    pendingPaymentsAcademicYear,
    tab === 'payments',
  );
  const { data: tracks, isLoading: loadingTracks, error: tracksError } = useListPMBAdmissionTracks({
    page: trackPage,
    page_size: trackPageSize,
    search: trackSearch || undefined,
    is_active: trackActive === 'all' ? undefined : trackActive === 'true',
  });
  const { data: faculties, isLoading: loadingFaculties, error: facultiesError } = useListPMBFaculties({
    page: facultyPage,
    page_size: facultyPageSize,
    search: facultySearch || undefined,
  });
  const { data: programs, isLoading: loadingPrograms, error: programsError } = useListPMBStudyPrograms({
    page: programPage,
    page_size: programPageSize,
    search: programSearch || undefined,
    degree_level: degreeLevel || undefined,
  });
  const { data: facultyOptions } = useListPMBFaculties({ page_size: 100 });
  const { data: applicantOptions } = useListPMBApplicants({ page_size: 100 });
  const { data: trackOptions } = useListPMBAdmissionTracks({ page_size: 100 });
  const { data: programOptions } = useListPMBStudyPrograms({ page_size: 100 });
  const { data: applicationStats } = usePMBApplicationStats(statsAcademicYear, tab === 'applications');
  const { data: selectedProgramStats } = usePMBProgramStats(applicationProgramId, statsAcademicYear, tab === 'applications' && !!applicationProgramId);
  const { mutate: updateDocumentVerification, isPending: updatingDocumentVerification } = useUpdatePMBDocumentVerification();
  const { mutate: deleteApplicant, isPending: deletingApplicant } = useDeletePMBApplicant();
  const { mutate: updateApplicationStatus, isPending: updatingApplicationStatus } = useUpdatePMBApplicationStatus();
  const { mutate: deleteApplication, isPending: deletingApplication } = useDeletePMBApplication();
  const { mutate: deleteTrack, isPending: deletingTrack } = useDeletePMBAdmissionTrack();
  const { mutate: deleteFaculty, isPending: deletingFaculty } = useDeletePMBFaculty();
  const { mutate: deleteProgram, isPending: deletingProgram } = useDeletePMBStudyProgram();

  const applicantRows = applicants?.data ?? [];
  const documentRows = documents?.data ?? [];
  const pendingPaymentRows = pendingPayments?.data ?? [];
  const applicationRows = applications?.data ?? [];
  const trackRows = tracks?.data ?? [];
  const facultyRows = faculties?.data ?? [];
  const programRows = programs?.data ?? [];

  const statsCards = [
    { label: 'Total Applications', value: applicationStats?.total ?? 0 },
    { label: 'Draft', value: applicationStats?.by_status?.draft ?? 0 },
    { label: 'Verified', value: applicationStats?.by_status?.verified ?? 0 },
    { label: 'Passed', value: applicationStats?.by_status?.passed ?? 0 },
  ];

  const topTrack = applicationStats?.by_track?.[0];
  const topProgram = applicationStats?.by_program?.[0];
  const pendingDocumentsCount = documentRows.filter((item) => item.verification_status === 'pending').length;
  const validDocumentsCount = documentRows.filter((item) => item.verification_status === 'valid').length;
  const invalidDocumentsCount = documentRows.filter((item) => item.verification_status === 'invalid').length;
  const filteredPendingPaymentRows = pendingPaymentRows.filter((item) => {
    const matchesTrack = !pendingPaymentsTrackId || item.application?.track_id === pendingPaymentsTrackId;
    const matchesProgram = !pendingPaymentsProgramId || item.application?.program_id === pendingPaymentsProgramId;
    return matchesTrack && matchesProgram;
  });
  const uniquePendingApplicants = new Set(
    filteredPendingPaymentRows.map((item) => item.application?.applicant?.id || item.application_id),
  ).size;
  const nextPendingDate = filteredPendingPaymentRows
    .map((item) => item.re_registration_date)
    .filter(Boolean)
    .sort()[0];
  const filteredApplicationsCount = applicationRows.length;
  const filteredDocumentsCount = documentRows.length;
  const filteredPaymentsCount = filteredPendingPaymentRows.length;

  const resetApplicationFilters = () => {
    setApplicationSearch('');
    setApplicationAcademicYear('');
    setApplicationStatus('');
    setApplicationTrackId('');
    setApplicationProgramId('');
    setApplicationPage(1);
  };

  const resetDocumentFilters = () => {
    setDocumentSearch('');
    setDocumentApplicantId('');
    setDocumentStatus('');
    setDocumentPage(1);
  };

  const resetPaymentFilters = () => {
    setPendingPaymentsAcademicYear(DEFAULT_ACADEMIC_YEAR);
    setPendingPaymentsTrackId('');
    setPendingPaymentsProgramId('');
  };

  const applicationFilterControls = (
    <LayoutUI.Container className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_180px_200px_220px_180px]">
      <SearchField
        value={applicationSearch}
        onChange={(event) => {
          setApplicationSearch(event.target.value);
          setApplicationPage(1);
        }}
        placeholder="Search application or applicant"
      />
      <Input
        value={applicationAcademicYear}
        onChange={(event) => {
          setApplicationAcademicYear(event.target.value);
          setApplicationPage(1);
        }}
        placeholder="Academic year"
        tone="inverse"
      />
      <SelectUI.Select
        value={applicationTrackId || 'all'}
        onValueChange={(value) => {
          setApplicationTrackId(value === 'all' ? '' : value);
          setApplicationPage(1);
        }}
      >
        <SelectUI.SelectTrigger appearance="admin">
          <SelectUI.SelectValue>{applicationTrackId ? getById(trackOptions?.data, applicationTrackId)?.track_name || 'Track' : 'All tracks'}</SelectUI.SelectValue>
        </SelectUI.SelectTrigger>
        <SelectUI.SelectContent appearance="admin">
          <SelectUI.SelectItem value="all">All tracks</SelectUI.SelectItem>
          {(trackOptions?.data ?? []).map((track) => (
            <SelectUI.SelectItem key={track.id} value={track.id}>
              {track.track_name}
            </SelectUI.SelectItem>
          ))}
        </SelectUI.SelectContent>
      </SelectUI.Select>
      <SelectUI.Select
        value={applicationProgramId || 'all'}
        onValueChange={(value) => {
          setApplicationProgramId(value === 'all' ? '' : value);
          setApplicationPage(1);
        }}
      >
        <SelectUI.SelectTrigger appearance="admin">
          <SelectUI.SelectValue>{applicationProgramId ? getById(programOptions?.data, applicationProgramId)?.name || 'Program' : 'All programs'}</SelectUI.SelectValue>
        </SelectUI.SelectTrigger>
        <SelectUI.SelectContent appearance="admin">
          <SelectUI.SelectItem value="all">All programs</SelectUI.SelectItem>
          {(programOptions?.data ?? []).map((program) => (
            <SelectUI.SelectItem key={program.id} value={program.id}>
              {program.name}
            </SelectUI.SelectItem>
          ))}
        </SelectUI.SelectContent>
      </SelectUI.Select>
      <SelectUI.Select
        value={applicationStatus || 'all'}
        onValueChange={(value) => {
          setApplicationStatus(value === 'all' ? '' : (value as PMBApplicationStatus));
          setApplicationPage(1);
        }}
      >
        <SelectUI.SelectTrigger appearance="admin">
          <SelectUI.SelectValue>{applicationStatus || 'All statuses'}</SelectUI.SelectValue>
        </SelectUI.SelectTrigger>
        <SelectUI.SelectContent appearance="admin">
          <SelectUI.SelectItem value="all">All statuses</SelectUI.SelectItem>
          <SelectUI.SelectItem value="draft">Draft</SelectUI.SelectItem>
          <SelectUI.SelectItem value="verified">Verified</SelectUI.SelectItem>
          <SelectUI.SelectItem value="passed">Passed</SelectUI.SelectItem>
          <SelectUI.SelectItem value="failed">Failed</SelectUI.SelectItem>
          <SelectUI.SelectItem value="re_registered">Re-registered</SelectUI.SelectItem>
        </SelectUI.SelectContent>
      </SelectUI.Select>
    </LayoutUI.Container>
  );

  return (
    <LayoutUI.Column gap="gap-8">
      <LayoutUI.Column gap="gap-2">
        <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
          PMB Management
        </Text>
        <Text variant="muted-inverse">
          Monitor admission applications, tracks, faculties, and study programs.
        </Text>
      </LayoutUI.Column>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (isAdminPMBTab(value)) {
            setTab(value);
          }
        }}
        className="space-y-6"
      >
        <TabsList className="rounded-2xl bg-black/5 p-1">
          <TabsTrigger value="applicants" className="text-[#04090C] data-[state=active]:bg-black/10">
            Applicants
          </TabsTrigger>
          <TabsTrigger value="applications" className="text-[#04090C] data-[state=active]:bg-black/10">
            Applications
            <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">{filteredApplicationsCount}</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-[#04090C] data-[state=active]:bg-black/10">
            Documents
            <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">{filteredDocumentsCount}</span>
          </TabsTrigger>
          <TabsTrigger value="evaluations" className="text-[#04090C] data-[state=active]:bg-black/10">
            Evaluations
            <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">{filteredApplicationsCount}</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="text-[#04090C] data-[state=active]:bg-black/10">
            Results
            <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">{filteredApplicationsCount}</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-[#04090C] data-[state=active]:bg-black/10">
            Payments
            <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">{filteredPaymentsCount}</span>
          </TabsTrigger>
          <TabsTrigger value="tracks" className="text-[#04090C] data-[state=active]:bg-black/10">
            Tracks
          </TabsTrigger>
          <TabsTrigger value="faculties" className="text-[#04090C] data-[state=active]:bg-black/10">
            Faculties
          </TabsTrigger>
          <TabsTrigger value="programs" className="text-[#04090C] data-[state=active]:bg-black/10">
            Programs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applicants" className="space-y-4">
          <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
            {typeof applicants?.total === 'number' ? (
              <Text variant="muted-inverse" className="shrink-0 md:pt-2">
                Showing {(applicantPage - 1) * (applicants.page_size ?? applicantPageSize) + 1} to{' '}
                {Math.min(applicantPage * (applicants.page_size ?? applicantPageSize), applicants.total)} of {applicants.total} applicants
              </Text>
            ) : null}
            <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
              <CardUI.CardContent>
                <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_auto]">
                  <SearchField
                    value={applicantSearch}
                    onChange={(event) => {
                      setApplicantSearch(event.target.value);
                      setApplicantPage(1);
                    }}
                    placeholder="Search applicant"
                  />
                  <SelectUI.Select
                    value={applicantGender || 'all'}
                    onValueChange={(value) => {
                      setApplicantGender(value === 'all' ? '' : (value as Exclude<ApplicantGenderFilter, ''>));
                      setApplicantPage(1);
                    }}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue>{applicantGender || 'All genders'}</SelectUI.SelectValue>
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="all">All genders</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="male">Male</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="female">Female</SelectUI.SelectItem>
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                  <Button type="button" onClick={() => setIsCreatingApplicant(true)} variant="accent" size="form">
                    <Icons.Plus size={18} />
                    Create Applicant
                  </Button>
                </LayoutUI.Container>
              </CardUI.CardContent>
            </CardUI.Card>
          </LayoutUI.Row>

          {loadingApplicants ? <PMBQueryState type="loading" scope="applicants" /> : null}
          {!loadingApplicants && applicantsError ? <PMBQueryState type="error" scope="applicants" /> : null}
          {!loadingApplicants && !applicantsError && applicantRows.length === 0 ? <PMBQueryState type="empty" scope="applicants" /> : null}

          {!loadingApplicants && !applicantsError && applicants && applicantRows.length > 0 ? (
            <LayoutUI.Column>
              <CardUI.Card tone="inverse" className="overflow-hidden">
                <DataTable
                  data={applicantRows}
                  columns={createPMBApplicantColumns({
                    isDeleting: deletingApplicant,
                    onEdit: setEditingApplicant,
                    onDelete: setApplicantToDelete,
                  })}
                  rowKey="id"
                  emptyMessage="No applicants found."
                />
              </CardUI.Card>
              <DataPagination
                pagination={applicants}
                onPageChange={setApplicantPage}
                onPageSizeChange={(value) => {
                  setApplicantPageSize(value);
                  setApplicantPage(1);
                }}
              />
            </LayoutUI.Column>
          ) : null}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <CardUI.Card tone="inverse" border={false}>
            <CardUI.CardContent>
              <LayoutUI.Column gap="gap-4">
                <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
                  <LayoutUI.Column gap="gap-1">
                    <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Admission Snapshot</Text>
                    <Text variant="muted-inverse">Quick overview by academic year.</Text>
                  </LayoutUI.Column>
                  <LayoutUI.Container className="w-full md:max-w-[220px]">
                    <Input
                      value={statsAcademicYear}
                      onChange={(event) => setStatsAcademicYear(event.target.value)}
                      placeholder="2026/2027"
                      tone="inverse"
                    />
                  </LayoutUI.Container>
                </LayoutUI.Row>

                <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {statsCards.map((item) => (
                    <LayoutUI.Container key={item.label} className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-4">
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">{item.label}</Text>
                        <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{item.value}</Text>
                      </LayoutUI.Column>
                    </LayoutUI.Container>
                  ))}
                </LayoutUI.Container>

                <LayoutUI.Container className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <LayoutUI.Container className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-4">
                    <LayoutUI.Column gap="gap-1">
                      <Text variant="muted-inverse" size="sm">Top Track</Text>
                      <Text variant="inverse" className="font-medium">{topTrack?.track_name || '-'}</Text>
                      <Text variant="muted-inverse" size="xs">{topTrack ? `${topTrack.count} applications` : 'No track data yet.'}</Text>
                    </LayoutUI.Column>
                  </LayoutUI.Container>
                  <LayoutUI.Container className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-4">
                    <LayoutUI.Column gap="gap-1">
                      <Text variant="muted-inverse" size="sm">Top Program</Text>
                      <Text variant="inverse" className="font-medium">{topProgram?.program_name || '-'}</Text>
                      <Text variant="muted-inverse" size="xs">
                        {applicationProgramId && selectedProgramStats
                          ? `${selectedProgramStats.filled_quota}/${selectedProgramStats.quota} quota filled`
                          : topProgram
                            ? `${topProgram.count} applications`
                            : 'No program data yet.'}
                      </Text>
                    </LayoutUI.Column>
                  </LayoutUI.Container>
                </LayoutUI.Container>
              </LayoutUI.Column>
            </CardUI.CardContent>
          </CardUI.Card>

          <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
            {typeof applications?.total === 'number' ? (
              <Text variant="muted-inverse" className="shrink-0 md:pt-2">
                Showing {(applicationPage - 1) * (applications.page_size ?? applicationPageSize) + 1} to{' '}
                {Math.min(applicationPage * (applications.page_size ?? applicationPageSize), applications.total)} of {applications.total} applications
              </Text>
            ) : null}
            <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
              <CardUI.CardContent>
                <LayoutUI.Container className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_auto]">
                  {applicationFilterControls}
                  <LayoutUI.Row gap="gap-3" className="max-sm:flex-col">
                    <Button type="button" onClick={resetApplicationFilters} variant="destructive" size="form">
                      Reset Filters
                    </Button>
                    <Button type="button" onClick={() => setIsCreatingApplication(true)} variant="accent" size="form">
                      <Icons.Plus size={18} />
                      Create Application
                    </Button>
                  </LayoutUI.Row>
                </LayoutUI.Container>
              </CardUI.CardContent>
            </CardUI.Card>
          </LayoutUI.Row>

          {loadingApplications ? <PMBQueryState type="loading" scope="applications" /> : null}
          {!loadingApplications && applicationsError ? <PMBQueryState type="error" scope="applications" /> : null}
          {!loadingApplications && !applicationsError && applicationRows.length === 0 ? <PMBQueryState type="empty" scope="applications" /> : null}

          {!loadingApplications && !applicationsError && applications && applicationRows.length > 0 ? (
            <LayoutUI.Column>
              <CardUI.Card tone="inverse" className="overflow-hidden">
                <DataTable
                  data={applicationRows}
                  columns={createPMBApplicationColumns({
                    isUpdatingStatus: updatingApplicationStatus,
                    isDeleting: deletingApplication,
                    onStatusChange: (application, status) => {
                      updateApplicationStatus({ id: application.id, payload: { status } });
                    },
                    onEdit: setEditingApplication,
                    onView: setViewingApplication,
                    onDelete: setApplicationToDelete,
                  })}
                  rowKey="id"
                  emptyMessage="No applications found."
                />
              </CardUI.Card>
              <DataPagination
                pagination={applications}
                onPageChange={setApplicationPage}
                onPageSizeChange={(value) => {
                  setApplicationPageSize(value);
                  setApplicationPage(1);
                }}
              />
            </LayoutUI.Column>
          ) : null}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <LayoutUI.Container className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-4">
              <LayoutUI.Column gap="gap-1">
                <Text variant="muted-inverse" size="sm">Pending</Text>
                <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{pendingDocumentsCount}</Text>
              </LayoutUI.Column>
            </LayoutUI.Container>
            <LayoutUI.Container className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-4">
              <LayoutUI.Column gap="gap-1">
                <Text variant="muted-inverse" size="sm">Valid</Text>
                <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{validDocumentsCount}</Text>
              </LayoutUI.Column>
            </LayoutUI.Container>
            <LayoutUI.Container className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-4">
              <LayoutUI.Column gap="gap-1">
                <Text variant="muted-inverse" size="sm">Invalid</Text>
                <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{invalidDocumentsCount}</Text>
              </LayoutUI.Column>
            </LayoutUI.Container>
          </LayoutUI.Container>

          <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
            {typeof documents?.total === 'number' ? (
              <Text variant="muted-inverse" className="shrink-0 md:pt-2">
                Showing {(documentPage - 1) * (documents.page_size ?? documentPageSize) + 1} to{' '}
                {Math.min(documentPage * (documents.page_size ?? documentPageSize), documents.total)} of {documents.total} documents
              </Text>
            ) : null}
            <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
              <CardUI.CardContent>
                <LayoutUI.Container className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_240px_220px_auto]">
                  <SearchField
                    value={documentSearch}
                    onChange={(event) => {
                      setDocumentSearch(event.target.value);
                      setDocumentPage(1);
                    }}
                    placeholder="Search document or applicant"
                  />
                  <SelectUI.Select
                    value={documentApplicantId || 'all'}
                    onValueChange={(value) => {
                      setDocumentApplicantId(value === 'all' ? '' : value);
                      setDocumentPage(1);
                    }}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue>
                        {documentApplicantId
                          ? getById(applicantOptions?.data, documentApplicantId)?.full_name || 'Applicant'
                          : 'All applicants'}
                      </SelectUI.SelectValue>
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="all">All applicants</SelectUI.SelectItem>
                      {(applicantOptions?.data ?? []).map((applicant) => (
                        <SelectUI.SelectItem key={applicant.id} value={applicant.id}>
                          {applicant.full_name}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                  <SelectUI.Select
                    value={documentStatus || 'all'}
                    onValueChange={(value) => {
                      setDocumentStatus(value === 'all' ? '' : (value as PMBDocumentVerificationStatus));
                      setDocumentPage(1);
                    }}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue>{documentStatus || 'All statuses'}</SelectUI.SelectValue>
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="all">All statuses</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="pending">Pending</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="valid">Valid</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="invalid">Invalid</SelectUI.SelectItem>
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                  <Button type="button" onClick={resetDocumentFilters} variant="destructive" size="form">
                    Reset Filters
                  </Button>
                </LayoutUI.Container>
              </CardUI.CardContent>
            </CardUI.Card>
          </LayoutUI.Row>

          {loadingDocuments ? <PMBQueryState type="loading" scope="documents" /> : null}
          {!loadingDocuments && documentsError ? <PMBQueryState type="error" scope="documents" /> : null}
          {!loadingDocuments && !documentsError && documentRows.length === 0 ? <PMBQueryState type="empty" scope="documents" /> : null}

          {!loadingDocuments && !documentsError && documents && documentRows.length > 0 ? (
            <LayoutUI.Column>
              <CardUI.Card tone="inverse" className="overflow-hidden">
                <DataTable
                  data={documentRows}
                  columns={createPMBDocumentColumns({
                    isUpdatingStatus: updatingDocumentVerification,
                    onStatusChange: (document, status) => {
                      if (!user?.id) return;
                      updateDocumentVerification({
                        id: document.id,
                        payload: {
                          status,
                          verified_by: user.id,
                        },
                      });
                    },
                  })}
                  rowKey="id"
                  emptyMessage="No documents found."
                />
              </CardUI.Card>
              <DataPagination
                pagination={documents}
                onPageChange={setDocumentPage}
                onPageSizeChange={(value) => {
                  setDocumentPageSize(value);
                  setDocumentPage(1);
                }}
              />
            </LayoutUI.Column>
          ) : null}
        </TabsContent>

        <TabsContent value="evaluations" className="space-y-4">
          <CardUI.Card tone="inverse" border={false}>
            <CardUI.CardContent>
              <LayoutUI.Column gap="gap-1">
                <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Evaluation Queue</Text>
                <Text variant="muted-inverse">Open an application directly in evaluation mode.</Text>
              </LayoutUI.Column>
            </CardUI.CardContent>
          </CardUI.Card>

          {applicationFilterControls}

          {loadingApplications ? <PMBQueryState type="loading" scope="evaluations" /> : null}
          {!loadingApplications && applicationsError ? <PMBQueryState type="error" scope="evaluations" /> : null}
          {!loadingApplications && !applicationsError && applicationRows.length === 0 ? <PMBQueryState type="empty" scope="evaluations" /> : null}

          {!loadingApplications && !applicationsError && applicationRows.length > 0 ? (
            <CardUI.Card tone="inverse" className="overflow-hidden">
              <DataTable
                data={applicationRows}
                columns={createPMBReviewColumns({
                  actionLabel: 'Manage Evaluation',
                  onAction: (application) => {
                    setApplicationDetailMode('evaluation');
                    setViewingApplication(application);
                  },
                })}
                rowKey="id"
                emptyMessage="No evaluation queue found."
              />
            </CardUI.Card>
          ) : null}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <CardUI.Card tone="inverse" border={false}>
            <CardUI.CardContent>
              <LayoutUI.Column gap="gap-1">
                <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Result Queue</Text>
                <Text variant="muted-inverse">Open an application directly in final result mode.</Text>
              </LayoutUI.Column>
            </CardUI.CardContent>
          </CardUI.Card>

          {applicationFilterControls}

          {loadingApplications ? <PMBQueryState type="loading" scope="results" /> : null}
          {!loadingApplications && applicationsError ? <PMBQueryState type="error" scope="results" /> : null}
          {!loadingApplications && !applicationsError && applicationRows.length === 0 ? <PMBQueryState type="empty" scope="results" /> : null}

          {!loadingApplications && !applicationsError && applicationRows.length > 0 ? (
            <CardUI.Card tone="inverse" className="overflow-hidden">
              <DataTable
                data={applicationRows}
                columns={createPMBReviewColumns({
                  actionLabel: 'Manage Result',
                  onAction: (application) => {
                    setApplicationDetailMode('result');
                    setViewingApplication(application);
                  },
                })}
                rowKey="id"
                emptyMessage="No result queue found."
              />
            </CardUI.Card>
          ) : null}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <LayoutUI.Container className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-4">
              <LayoutUI.Column gap="gap-1">
                <Text variant="muted-inverse" size="sm">Pending Payments</Text>
                <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{filteredPendingPaymentRows.length}</Text>
              </LayoutUI.Column>
            </LayoutUI.Container>
            <LayoutUI.Container className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-4">
              <LayoutUI.Column gap="gap-1">
                <Text variant="muted-inverse" size="sm">Applicants in Queue</Text>
                <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{uniquePendingApplicants}</Text>
              </LayoutUI.Column>
            </LayoutUI.Container>
            <LayoutUI.Container className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-4">
              <LayoutUI.Column gap="gap-1">
                <Text variant="muted-inverse" size="sm">Next Re-registration</Text>
                <Text variant="inverse" className="font-medium">{nextPendingDate ? formatDate(nextPendingDate) : '-'}</Text>
              </LayoutUI.Column>
            </LayoutUI.Container>
          </LayoutUI.Container>

          <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
            <Text variant="muted-inverse" className="shrink-0 md:pt-2">
              Pending payment queue for selected academic year.
            </Text>
            <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
              <CardUI.CardContent>
                <LayoutUI.Container className="grid grid-cols-1 gap-4 xl:grid-cols-[180px_220px_220px_auto] xl:justify-end">
                  <Input
                    value={pendingPaymentsAcademicYear}
                    onChange={(event) => setPendingPaymentsAcademicYear(event.target.value)}
                    placeholder="2026/2027"
                    tone="inverse"
                  />
                  <SelectUI.Select
                    value={pendingPaymentsTrackId || 'all'}
                    onValueChange={(value) => setPendingPaymentsTrackId(value === 'all' ? '' : value)}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue>{pendingPaymentsTrackId ? getById(trackOptions?.data, pendingPaymentsTrackId)?.track_name || 'Track' : 'All tracks'}</SelectUI.SelectValue>
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="all">All tracks</SelectUI.SelectItem>
                      {(trackOptions?.data ?? []).map((track) => (
                        <SelectUI.SelectItem key={track.id} value={track.id}>
                          {track.track_name}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                  <SelectUI.Select
                    value={pendingPaymentsProgramId || 'all'}
                    onValueChange={(value) => setPendingPaymentsProgramId(value === 'all' ? '' : value)}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue>{pendingPaymentsProgramId ? getById(programOptions?.data, pendingPaymentsProgramId)?.name || 'Program' : 'All programs'}</SelectUI.SelectValue>
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="all">All programs</SelectUI.SelectItem>
                      {(programOptions?.data ?? []).map((program) => (
                        <SelectUI.SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                  <Button type="button" onClick={resetPaymentFilters} variant="destructive" size="form">
                    Reset Filters
                  </Button>
                </LayoutUI.Container>
              </CardUI.CardContent>
            </CardUI.Card>
          </LayoutUI.Row>

          {loadingPendingPayments ? <PMBQueryState type="loading" scope="payments" /> : null}
          {!loadingPendingPayments && pendingPaymentsError ? <PMBQueryState type="error" scope="payments" /> : null}
          {!loadingPendingPayments && !pendingPaymentsError && pendingPaymentRows.length === 0 ? <PMBQueryState type="empty" scope="payments" /> : null}

          {!loadingPendingPayments && !pendingPaymentsError && pendingPaymentRows.length > 0 ? (
            <CardUI.Card tone="inverse" className="overflow-hidden">
              <DataTable
                data={filteredPendingPaymentRows}
                columns={createPMBPendingPaymentColumns({
                  onUpdate: setEditingPendingPayment,
                })}
                rowKey="id"
                emptyMessage="No pending payments found."
              />
            </CardUI.Card>
          ) : null}
        </TabsContent>

        <TabsContent value="tracks" className="space-y-4">
          <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
            {typeof tracks?.total === 'number' ? (
              <Text variant="muted-inverse" className="shrink-0 md:pt-2">
                Showing {(trackPage - 1) * (tracks.page_size ?? trackPageSize) + 1} to{' '}
                {Math.min(trackPage * (tracks.page_size ?? trackPageSize), tracks.total)} of {tracks.total} tracks
              </Text>
            ) : null}
            <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
              <CardUI.CardContent>
                <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_auto]">
                  <SearchField
                    value={trackSearch}
                    onChange={(event) => {
                      setTrackSearch(event.target.value);
                      setTrackPage(1);
                    }}
                    placeholder="Search track"
                  />
                  <SelectUI.Select
                    value={trackActive}
                    onValueChange={(value) => {
                      setTrackActive(value as BooleanFilter);
                      setTrackPage(1);
                    }}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue>{trackActive === 'all' ? 'All statuses' : trackActive === 'true' ? 'Active only' : 'Inactive only'}</SelectUI.SelectValue>
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="all">All statuses</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="true">Active only</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="false">Inactive only</SelectUI.SelectItem>
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                  <Button type="button" onClick={() => setIsCreatingTrack(true)} variant="accent" size="form">
                    <Icons.Plus size={18} />
                    Create Track
                  </Button>
                </LayoutUI.Container>
              </CardUI.CardContent>
            </CardUI.Card>
          </LayoutUI.Row>

          {loadingTracks ? <PMBQueryState type="loading" scope="tracks" /> : null}
          {!loadingTracks && tracksError ? <PMBQueryState type="error" scope="tracks" /> : null}
          {!loadingTracks && !tracksError && trackRows.length === 0 ? <PMBQueryState type="empty" scope="tracks" /> : null}

          {!loadingTracks && !tracksError && tracks && trackRows.length > 0 ? (
            <LayoutUI.Column>
              <CardUI.Card tone="inverse" className="overflow-hidden">
                <DataTable
                  data={trackRows}
                  columns={createPMBTrackColumns({
                    isDeleting: deletingTrack,
                    onEdit: setEditingTrack,
                    onDelete: setTrackToDelete,
                  })}
                  rowKey="id"
                  emptyMessage="No tracks found."
                />
              </CardUI.Card>
              <DataPagination
                pagination={tracks}
                onPageChange={setTrackPage}
                onPageSizeChange={(value) => {
                  setTrackPageSize(value);
                  setTrackPage(1);
                }}
              />
            </LayoutUI.Column>
          ) : null}
        </TabsContent>

        <TabsContent value="faculties" className="space-y-4">
          <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
            {typeof faculties?.total === 'number' ? (
              <Text variant="muted-inverse" className="shrink-0 md:pt-2">
                Showing {(facultyPage - 1) * (faculties.page_size ?? facultyPageSize) + 1} to{' '}
                {Math.min(facultyPage * (faculties.page_size ?? facultyPageSize), faculties.total)} of {faculties.total} faculties
              </Text>
            ) : null}
            <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
              <CardUI.CardContent>
                <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
                  <SearchField
                    value={facultySearch}
                    onChange={(event) => {
                      setFacultySearch(event.target.value);
                      setFacultyPage(1);
                    }}
                    placeholder="Search faculty"
                  />
                  <Button type="button" onClick={() => setIsCreatingFaculty(true)} variant="accent" size="form">
                    <Icons.Plus size={18} />
                    Create Faculty
                  </Button>
                </LayoutUI.Container>
              </CardUI.CardContent>
            </CardUI.Card>
          </LayoutUI.Row>

          {loadingFaculties ? <PMBQueryState type="loading" scope="faculties" /> : null}
          {!loadingFaculties && facultiesError ? <PMBQueryState type="error" scope="faculties" /> : null}
          {!loadingFaculties && !facultiesError && facultyRows.length === 0 ? <PMBQueryState type="empty" scope="faculties" /> : null}

          {!loadingFaculties && !facultiesError && faculties && facultyRows.length > 0 ? (
            <LayoutUI.Column>
              <CardUI.Card tone="inverse" className="overflow-hidden">
                <DataTable
                  data={facultyRows}
                  columns={createPMBFacultyColumns({
                    isDeleting: deletingFaculty,
                    onEdit: setEditingFaculty,
                    onDelete: setFacultyToDelete,
                  })}
                  rowKey="id"
                  emptyMessage="No faculties found."
                />
              </CardUI.Card>
              <DataPagination
                pagination={faculties}
                onPageChange={setFacultyPage}
                onPageSizeChange={(value) => {
                  setFacultyPageSize(value);
                  setFacultyPage(1);
                }}
              />
            </LayoutUI.Column>
          ) : null}
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
            {typeof programs?.total === 'number' ? (
              <Text variant="muted-inverse" className="shrink-0 md:pt-2">
                Showing {(programPage - 1) * (programs.page_size ?? programPageSize) + 1} to{' '}
                {Math.min(programPage * (programs.page_size ?? programPageSize), programs.total)} of {programs.total} programs
              </Text>
            ) : null}
            <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
              <CardUI.CardContent>
                <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_auto]">
                  <SearchField
                    value={programSearch}
                    onChange={(event) => {
                      setProgramSearch(event.target.value);
                      setProgramPage(1);
                    }}
                    placeholder="Search study program"
                  />
                  <SelectUI.Select
                    value={degreeLevel || 'all'}
                    onValueChange={(value) => {
                      setDegreeLevel(value === 'all' ? '' : (value as PMBDegreeLevel));
                      setProgramPage(1);
                    }}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue>{degreeLevel || 'All degrees'}</SelectUI.SelectValue>
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="all">All degrees</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="D3">D3</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="S1">S1</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="S2">S2</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="S3">S3</SelectUI.SelectItem>
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                  <Button type="button" onClick={() => setIsCreatingProgram(true)} variant="accent" size="form">
                    <Icons.Plus size={18} />
                    Create Program
                  </Button>
                </LayoutUI.Container>
              </CardUI.CardContent>
            </CardUI.Card>
          </LayoutUI.Row>

          {loadingPrograms ? <PMBQueryState type="loading" scope="programs" /> : null}
          {!loadingPrograms && programsError ? <PMBQueryState type="error" scope="programs" /> : null}
          {!loadingPrograms && !programsError && programRows.length === 0 ? <PMBQueryState type="empty" scope="programs" /> : null}

          {!loadingPrograms && !programsError && programs && programRows.length > 0 ? (
            <LayoutUI.Column>
              <CardUI.Card tone="inverse" className="overflow-hidden">
                <DataTable
                  data={programRows}
                  columns={createPMBProgramColumns({
                    isDeleting: deletingProgram,
                    onEdit: setEditingProgram,
                    onDelete: setProgramToDelete,
                  })}
                  rowKey="id"
                  emptyMessage="No study programs found."
                />
              </CardUI.Card>
              <DataPagination
                pagination={programs}
                onPageChange={setProgramPage}
                onPageSizeChange={(value) => {
                  setProgramPageSize(value);
                  setProgramPage(1);
                }}
              />
            </LayoutUI.Column>
          ) : null}
        </TabsContent>
      </Tabs>

      <TrackFormModal
        track={editingTrack}
        isOpen={isCreatingTrack || Boolean(editingTrack)}
        onClose={() => {
          setIsCreatingTrack(false);
          setEditingTrack(null);
        }}
      />

      <ApplicantFormModal
        applicant={editingApplicant}
        isOpen={isCreatingApplicant || Boolean(editingApplicant)}
        onClose={() => {
          setIsCreatingApplicant(false);
          setEditingApplicant(null);
        }}
      />

      <ApplicationFormModal
        application={editingApplication}
        applicants={applicantOptions?.data ?? []}
        tracks={trackOptions?.data ?? []}
        programs={programOptions?.data ?? []}
        isOpen={isCreatingApplication || Boolean(editingApplication)}
        onClose={() => {
          setIsCreatingApplication(false);
          setEditingApplication(null);
        }}
      />

      <ApplicationDetailsModal
        applicationId={viewingApplication?.id || ''}
        isOpen={Boolean(viewingApplication)}
        initialMode={applicationDetailMode}
        onClose={() => {
          setViewingApplication(null);
          setApplicationDetailMode('default');
        }}
      />

      <DeletePMBEntityDialog
        isOpen={Boolean(applicantToDelete)}
        title="Delete Applicant"
        description={`Are you sure you want to delete "${applicantToDelete?.full_name}"? This action cannot be undone.`}
        isDeleting={deletingApplicant}
        onClose={() => setApplicantToDelete(null)}
        onConfirm={() => {
          const id = applicantToDelete?.id;
          if (!id) return;
          deleteApplicant(id, { onSuccess: () => setApplicantToDelete(null) });
        }}
      />

      <DeletePMBEntityDialog
        isOpen={Boolean(applicationToDelete)}
        title="Delete Application"
        description={`Are you sure you want to delete "${applicationToDelete?.application_number}"? This action cannot be undone.`}
        isDeleting={deletingApplication}
        onClose={() => setApplicationToDelete(null)}
        onConfirm={() => {
          const id = applicationToDelete?.id;
          if (!id) return;
          deleteApplication(id, { onSuccess: () => setApplicationToDelete(null) });
        }}
      />

      <FacultyFormModal
        faculty={editingFaculty}
        isOpen={isCreatingFaculty || Boolean(editingFaculty)}
        onClose={() => {
          setIsCreatingFaculty(false);
          setEditingFaculty(null);
        }}
      />

      <StudyProgramFormModal
        program={editingProgram}
        faculties={facultyOptions?.data ?? []}
        isOpen={isCreatingProgram || Boolean(editingProgram)}
        onClose={() => {
          setIsCreatingProgram(false);
          setEditingProgram(null);
        }}
      />

      <ReRegistrationFormModal
        applicationId={editingPendingPayment?.application_id || ''}
        reRegistration={editingPendingPayment}
        isOpen={Boolean(editingPendingPayment)}
        onClose={() => setEditingPendingPayment(null)}
      />

      <DeletePMBEntityDialog
        isOpen={Boolean(trackToDelete)}
        title="Delete Track"
        description={`Are you sure you want to delete "${trackToDelete?.track_name}"? This action cannot be undone.`}
        isDeleting={deletingTrack}
        onClose={() => setTrackToDelete(null)}
        onConfirm={() => {
          if (!trackToDelete) return;
          deleteTrack(trackToDelete.id, { onSuccess: () => setTrackToDelete(null) });
        }}
      />

      <DeletePMBEntityDialog
        isOpen={Boolean(facultyToDelete)}
        title="Delete Faculty"
        description={`Are you sure you want to delete "${facultyToDelete?.name}"? This action cannot be undone.`}
        isDeleting={deletingFaculty}
        onClose={() => setFacultyToDelete(null)}
        onConfirm={() => {
          if (!facultyToDelete) return;
          deleteFaculty(facultyToDelete.id, { onSuccess: () => setFacultyToDelete(null) });
        }}
      />

      <DeletePMBEntityDialog
        isOpen={Boolean(programToDelete)}
        title="Delete Study Program"
        description={`Are you sure you want to delete "${programToDelete?.name}"? This action cannot be undone.`}
        isDeleting={deletingProgram}
        onClose={() => setProgramToDelete(null)}
        onConfirm={() => {
          if (!programToDelete) return;
          deleteProgram(programToDelete.id, { onSuccess: () => setProgramToDelete(null) });
        }}
      />
    </LayoutUI.Column>
  );
}
