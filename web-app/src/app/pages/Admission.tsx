import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { useAuthStore } from '@store/auth.store';
import {
  useCreateMyPMBApplicant,
  useCreatePMBApplication,
  useListPublicPMBActiveTracks,
  useListPublicPMBFaculties,
  useListPublicPMBPassedApplicants,
  useListPublicPMBProgramsByFaculty,
  useMyPMBApplicant,
  useUpdateMyPMBApplicant,
  usePublicPMBQuota,
} from '@feature/pmb/hooks';
import type { PMBApplicationStatus, PublicPMBApplicantFormRequest } from '@feature/pmb/types';

const initialApplicantForm: PublicPMBApplicantFormRequest = {
  full_name: '',
  national_id: '',
  place_of_birth: '',
  date_of_birth: '',
  gender: 'male',
  address: '',
  phone_number: '',
  school_origin: '',
  graduation_year: '',
};

const applicationSteps = [
  {
    key: 'account',
    label: 'Account',
    title: 'Sign in and verify your session',
    description: 'PMB self-service is available only after you authenticate into the platform.',
  },
  {
    key: 'profile',
    label: 'Applicant',
    title: 'Complete your applicant profile',
    description: 'Store your identity, contact details, school origin, and graduation background once.',
  },
  {
    key: 'submit',
    label: 'Application',
    title: 'Choose a track and submit',
    description: 'Pick the active admission track and final study program before creating the application.',
  },
] as const;

export function Admission() {
  const { isAuthenticated, user } = useAuthStore();
  const { data: tracks, isLoading: tracksLoading } = useListPublicPMBActiveTracks();
  const { data: facultyList, isLoading: facultiesLoading } = useListPublicPMBFaculties({ page_size: 100 });
  const myApplicantQuery = useMyPMBApplicant(isAuthenticated);
  const createMyApplicant = useCreateMyPMBApplicant();
  const updateMyApplicant = useUpdateMyPMBApplicant();
  const createApplication = useCreatePMBApplication();

  const [facultyLookupInput, setFacultyLookupInput] = useState('');
  const [facultyLookupId, setFacultyLookupId] = useState('');
  const [quotaProgramInput, setQuotaProgramInput] = useState('');
  const [quotaAcademicYearInput, setQuotaAcademicYearInput] = useState('2026/2027');
  const [quotaProgramId, setQuotaProgramId] = useState('');
  const [quotaAcademicYear, setQuotaAcademicYear] = useState('2026/2027');
  const [resultsProgramInput, setResultsProgramInput] = useState('');
  const [resultsAcademicYearInput, setResultsAcademicYearInput] = useState('2026/2027');
  const [resultsProgramId, setResultsProgramId] = useState('');
  const [resultsAcademicYear, setResultsAcademicYear] = useState('2026/2027');
  const [applicantForm, setApplicantForm] = useState(initialApplicantForm);
  const [applicationForm, setApplicationForm] = useState({
    track_id: '',
    program_id: '',
    academic_year: '2026/2027',
    status: 'draft' as PMBApplicationStatus,
  });

  const programsByFaculty = useListPublicPMBProgramsByFaculty(facultyLookupId, !!facultyLookupId);
  const quota = usePublicPMBQuota(quotaProgramId, quotaAcademicYear, !!quotaProgramId && !!quotaAcademicYear);
  const passedApplicants = useListPublicPMBPassedApplicants(
    {
      academic_year: resultsAcademicYear,
      program_id: resultsProgramId || undefined,
    },
    !!resultsAcademicYear,
  );

  const selectedFacultyPrograms = useMemo(() => {
    return facultyLookupId ? programsByFaculty.data ?? [] : [];
  }, [facultyLookupId, programsByFaculty.data]);

  const stepStatus = useMemo(
    () => ({
      account: isAuthenticated,
      profile: !!myApplicantQuery.data,
      submit: false,
    }),
    [isAuthenticated, myApplicantQuery.data],
  );

  const initialStep = useMemo(() => {
    if (!stepStatus.account) {
      return 0;
    }
    if (!stepStatus.profile) {
      return 1;
    }
    return 2;
  }, [stepStatus.account, stepStatus.profile]);

  const [activeStep, setActiveStep] = useState(initialStep);

  useEffect(() => {
    if (!myApplicantQuery.data) {
      return;
    }

    setApplicantForm({
      full_name: myApplicantQuery.data.full_name,
      national_id: myApplicantQuery.data.national_id,
      place_of_birth: myApplicantQuery.data.place_of_birth,
      date_of_birth: myApplicantQuery.data.date_of_birth?.slice(0, 10) ?? '',
      gender: myApplicantQuery.data.gender as 'male' | 'female',
      address: myApplicantQuery.data.address,
      phone_number: myApplicantQuery.data.phone_number,
      school_origin: myApplicantQuery.data.school_origin,
      graduation_year: myApplicantQuery.data.graduation_year,
    });
  }, [myApplicantQuery.data]);

  useEffect(() => {
    setActiveStep(initialStep);
  }, [initialStep]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#F4F1E8] text-[#04090C]">
      <section className="relative overflow-hidden bg-[#04090C] px-4 py-24 text-white sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, #29E68C 0, transparent 30%), radial-gradient(circle at 75% 20%, #38BDF8 0, transparent 24%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.32em] text-[#29E68C]">PMB Public</p>
          <h1 className="max-w-4xl font-['Sora'] text-[clamp(40px,7vw,84px)] font-extrabold tracking-[-0.05em] leading-[0.95]">
            Admission information and self-service registration.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            Public visitors can inspect tracks, faculties, quota, and passed results. Signed-in users can also create or update their applicant profile and submit an application directly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Icons.Route className="size-5 text-[#29E68C]" />
          <h2 className="font-['Sora'] text-3xl font-extrabold tracking-[-0.04em]">Active admission tracks</h2>
        </div>

        {tracksLoading ? <p className="text-[#04090C]/55">Loading active tracks...</p> : null}

        <div className="grid gap-4 md:grid-cols-3">
          {(tracks ?? []).map((track) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(4,9,12,0.06)]"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="rounded-full bg-[#29E68C]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#0a9e5a]">
                  {track.track_code}
                </span>
                <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-[#04090C]/55">
                  {track.requires_test ? 'Requires test' : 'No test'}
                </span>
              </div>
              <h3 className="font-['Sora'] text-2xl font-bold tracking-[-0.03em]">{track.track_name}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(4,9,12,0.06)] sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <Icons.Search className="size-5 text-[#38BDF8]" />
            <h2 className="font-['Sora'] text-2xl font-bold tracking-[-0.03em]">Programs by faculty</h2>
          </div>
          <form
            className="mb-6 flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setFacultyLookupId(facultyLookupInput.trim());
            }}
          >
            <select
              value={facultyLookupInput}
              onChange={(event) => setFacultyLookupInput(event.target.value)}
              className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25"
            >
              <option value="">Select faculty from public list</option>
              {(facultyList?.data ?? []).map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name} ({faculty.code})
                </option>
              ))}
            </select>
            <button type="submit" className="w-fit rounded-2xl bg-[#04090C] px-5 py-3 text-sm font-semibold text-white">
              Load Programs
            </button>
          </form>

          {facultiesLoading ? <p className="mb-4 text-sm text-[#04090C]/55">Loading public faculties...</p> : null}
          {programsByFaculty.isFetching ? <p className="text-sm text-[#04090C]/55">Loading study programs...</p> : null}

          <div className="space-y-3">
            {selectedFacultyPrograms.map((program) => (
              <Link key={program.id} to={`/admission/programs/${program.id}`} className="block rounded-2xl border border-black/10 bg-[#F7F4EC] p-4 transition hover:border-black/25 hover:bg-[#f0ede2]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#04090C]/45">{program.code}</p>
                <p className="mt-1 font-semibold text-[#04090C]">{program.name}</p>
                <p className="mt-1 text-sm text-[#04090C]/55">
                  {program.degree_level} • Quota {program.quota}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-[#04090C] p-6 text-white shadow-[0_14px_40px_rgba(4,9,12,0.12)] sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <Icons.BadgeCheck className="size-5 text-[#29E68C]" />
            <h2 className="font-['Sora'] text-2xl font-bold tracking-[-0.03em]">Quota checker</h2>
          </div>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              setQuotaProgramId(quotaProgramInput.trim());
              setQuotaAcademicYear(quotaAcademicYearInput.trim());
            }}
          >
            <input
              value={quotaProgramInput}
              onChange={(event) => setQuotaProgramInput(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-white/25"
              placeholder="Program ID"
            />
            <input
              value={quotaAcademicYearInput}
              onChange={(event) => setQuotaAcademicYearInput(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-white/25"
              placeholder="Academic year, e.g. 2026/2027"
            />
            <button type="submit" className="rounded-2xl bg-[#29E68C] px-5 py-3 text-sm font-semibold text-black">
              Check quota
            </button>
          </form>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            {quota.isFetching ? <p className="text-sm text-white/65">Checking quota...</p> : null}
            {!quota.isFetching && quota.data ? (
              <>
                <p className="text-sm text-white/55">Available quota</p>
                <p className="mt-2 font-['Sora'] text-5xl font-extrabold tracking-[-0.05em]">{quota.data.available_quota}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-white/35">
                  {quota.data.program_id} • {quota.data.academic_year}
                </p>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(4,9,12,0.06)] sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <Icons.FileBadge className="size-5 text-[#f97316]" />
            <h2 className="font-['Sora'] text-2xl font-bold tracking-[-0.03em]">Applicant self-service</h2>
          </div>

          {!isAuthenticated ? (
            <div className="rounded-2xl border border-black/10 bg-[#F7F4EC] p-5">
              <p className="text-sm text-[#04090C]/65">You need to sign in before creating an applicant profile or submitting a PMB application.</p>
              <div className="mt-4 flex gap-3">
                <Link to="/sign-in" className="rounded-2xl bg-[#04090C] px-5 py-3 text-sm font-semibold text-white">Sign In</Link>
                <Link to="/register" className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold text-[#04090C]">Create Account</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid gap-4 lg:grid-cols-3">
                {applicationSteps.map((step, index) => {
                  const isActive = index === activeStep;
                  const isComplete = stepStatus[step.key];

                  return (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      className={`rounded-[1.5rem] border p-5 text-left transition ${
                        isActive
                          ? 'border-[#04090C] bg-[#04090C] text-white shadow-[0_16px_38px_rgba(4,9,12,0.16)]'
                          : 'border-black/10 bg-[#F7F4EC] text-[#04090C] hover:border-black/20'
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span
                          className={`flex size-10 items-center justify-center rounded-full border text-sm font-semibold ${
                            isActive ? 'border-white/15 bg-white/10 text-white' : 'border-black/10 bg-white text-[#04090C]'
                          }`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                            isComplete
                              ? isActive
                                ? 'bg-[#29E68C] text-black'
                                : 'bg-[#29E68C]/12 text-[#0a9e5a]'
                              : isActive
                                ? 'bg-white/10 text-white/70'
                                : 'bg-black/5 text-[#04090C]/45'
                          }`}
                        >
                          {isComplete ? 'Ready' : 'Pending'}
                        </span>
                      </div>
                      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${isActive ? 'text-white/60' : 'text-[#04090C]/45'}`}>{step.label}</p>
                      <h3 className="mt-3 font-['Sora'] text-xl font-bold tracking-[-0.03em]">{step.title}</h3>
                      <p className={`mt-3 text-sm leading-6 ${isActive ? 'text-white/72' : 'text-[#04090C]/58'}`}>{step.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
                <div className="rounded-[1.75rem] border border-black/10 bg-[#F7F4EC] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#04090C]/45">Progress overview</p>
                  <h3 className="mt-3 font-['Sora'] text-2xl font-bold tracking-[-0.03em] text-[#04090C]">Admission checklist</h3>
                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#04090C]/45">Account</p>
                      <p className="mt-2 font-semibold text-[#04090C]">{user?.email || 'No active session'}</p>
                      <p className="mt-1 text-sm text-[#04090C]/55">{isAuthenticated ? 'Authenticated and ready to use PMB self-service.' : 'Please sign in first.'}</p>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#04090C]/45">Applicant profile</p>
                      <p className="mt-2 font-semibold text-[#04090C]">{myApplicantQuery.data?.full_name || 'Profile not created yet'}</p>
                      <p className="mt-1 text-sm text-[#04090C]/55">
                        {myApplicantQuery.data
                          ? 'You can update your saved profile before applying.'
                          : 'Complete your applicant profile once, then continue to the final submission step.'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#04090C]/45">Program source</p>
                      <p className="mt-2 font-semibold text-[#04090C]">
                        {selectedFacultyPrograms.length ? `${selectedFacultyPrograms.length} program options loaded` : 'Load faculty programs first'}
                      </p>
                      <p className="mt-1 text-sm text-[#04090C]/55">The submission step uses the program list loaded from the public faculty section above.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(4,9,12,0.06)]">
                  {activeStep === 0 ? (
                    <div className="space-y-5">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f97316]">Step 1</p>
                        <h3 className="mt-2 font-['Sora'] text-3xl font-bold tracking-[-0.04em] text-[#04090C]">Session check</h3>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#04090C]/60">
                          Your account is already authenticated. Continue to the profile step to store applicant details used for PMB submission.
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] border border-black/10 bg-[#F7F4EC] p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex size-12 items-center justify-center rounded-full bg-[#29E68C]/14 text-[#0a9e5a]">
                            <Icons.ShieldCheck className="size-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#04090C]">{user?.full_name || user?.email || 'Signed-in account'}</p>
                            <p className="mt-1 text-sm leading-6 text-[#04090C]/58">
                              The PMB flow will create your applicant profile under this authenticated session. Move to the next step when you are ready.
                            </p>
                          </div>
                        </div>
                      </div>
                      <button type="button" onClick={() => setActiveStep(1)} className="inline-flex items-center gap-2 rounded-2xl bg-[#04090C] px-5 py-3 text-sm font-semibold text-white">
                        Continue to applicant profile
                        <Icons.ArrowRight className="size-4" />
                      </button>
                    </div>
                  ) : null}

                  {activeStep === 1 ? (
                    <form
                      className="space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const payload = applicantForm;
                        if (myApplicantQuery.data) {
                          updateMyApplicant.mutate(payload, {
                            onSuccess: () => setActiveStep(2),
                          });
                          return;
                        }
                        createMyApplicant.mutate(payload, {
                          onSuccess: () => setActiveStep(2),
                        });
                      }}
                    >
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f97316]">Step 2</p>
                        <h3 className="mt-2 font-['Sora'] text-3xl font-bold tracking-[-0.04em] text-[#04090C]">Applicant profile</h3>
                        <p className="mt-3 text-sm leading-6 text-[#04090C]/60">Save your profile once, then reuse it every time you submit or update a PMB application.</p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <input value={applicantForm.full_name} onChange={(event) => setApplicantForm((current) => ({ ...current, full_name: event.target.value }))} placeholder="Full name" className="w-full rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25" />
                        <input value={applicantForm.national_id} onChange={(event) => setApplicantForm((current) => ({ ...current, national_id: event.target.value }))} placeholder="National ID (16 digits)" className="w-full rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25" />
                        <input value={applicantForm.place_of_birth} onChange={(event) => setApplicantForm((current) => ({ ...current, place_of_birth: event.target.value }))} placeholder="Place of birth" className="w-full rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25" />
                        <input type="date" value={applicantForm.date_of_birth} onChange={(event) => setApplicantForm((current) => ({ ...current, date_of_birth: event.target.value }))} className="w-full rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25" />
                        <select value={applicantForm.gender} onChange={(event) => setApplicantForm((current) => ({ ...current, gender: event.target.value as 'male' | 'female' }))} className="w-full rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25">
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                        <input value={applicantForm.phone_number} onChange={(event) => setApplicantForm((current) => ({ ...current, phone_number: event.target.value }))} placeholder="Phone number" className="w-full rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25" />
                        <input value={applicantForm.school_origin} onChange={(event) => setApplicantForm((current) => ({ ...current, school_origin: event.target.value }))} placeholder="School origin" className="w-full rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25" />
                        <input value={applicantForm.graduation_year} onChange={(event) => setApplicantForm((current) => ({ ...current, graduation_year: event.target.value }))} placeholder="Graduation year" className="w-full rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25" />
                      </div>

                      <textarea value={applicantForm.address} onChange={(event) => setApplicantForm((current) => ({ ...current, address: event.target.value }))} placeholder="Address" className="min-h-28 w-full rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25" />

                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => setActiveStep(0)} className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold text-[#04090C]">
                          Back
                        </button>
                        <button type="submit" className="rounded-2xl bg-[#04090C] px-5 py-3 text-sm font-semibold text-white">
                          {myApplicantQuery.data ? 'Save and continue' : 'Create profile and continue'}
                        </button>
                      </div>
                    </form>
                  ) : null}

                  {activeStep === 2 ? (
                    <form
                      className="space-y-4"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!myApplicantQuery.data) {
                          return;
                        }
                        createApplication.mutate({
                          applicant_id: myApplicantQuery.data.id,
                          track_id: applicationForm.track_id,
                          program_id: applicationForm.program_id,
                          academic_year: applicationForm.academic_year,
                          status: applicationForm.status,
                        });
                      }}
                    >
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f97316]">Step 3</p>
                        <h3 className="mt-2 font-['Sora'] text-3xl font-bold tracking-[-0.04em] text-[#04090C]">Submit your application</h3>
                        <p className="mt-3 text-sm leading-6 text-[#04090C]/60">
                          Choose a track, then select one of the programs already loaded from the faculty section above. After submission, your applicant data is refreshed automatically.
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-black/10 bg-[#F7F4EC] p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#04090C]/45">Applicant ready</p>
                        <p className="mt-2 font-semibold text-[#04090C]">{myApplicantQuery.data?.full_name || 'Applicant profile required'}</p>
                        <p className="mt-1 text-sm text-[#04090C]/55">
                          {selectedFacultyPrograms.length
                            ? `${selectedFacultyPrograms.length} programs are currently available for selection.`
                            : 'Load a faculty in the public section above so the program selector has options.'}
                        </p>
                      </div>

                      <select value={applicationForm.track_id} onChange={(event) => setApplicationForm((current) => ({ ...current, track_id: event.target.value }))} className="w-full rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25">
                        <option value="">Select track</option>
                        {(tracks ?? []).map((track) => (
                          <option key={track.id} value={track.id}>
                            {track.track_name}
                          </option>
                        ))}
                      </select>

                      <select value={applicationForm.program_id} onChange={(event) => setApplicationForm((current) => ({ ...current, program_id: event.target.value }))} className="w-full rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25">
                        <option value="">Select program from loaded faculty list</option>
                        {selectedFacultyPrograms.map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.name}
                          </option>
                        ))}
                      </select>

                      <input value={applicationForm.academic_year} onChange={(event) => setApplicationForm((current) => ({ ...current, academic_year: event.target.value }))} placeholder="Academic year" className="w-full rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25" />

                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => setActiveStep(1)} className="rounded-2xl border border-black/10 px-5 py-3 text-sm font-semibold text-[#04090C]">
                          Back to profile
                        </button>
                        <button type="submit" disabled={!myApplicantQuery.data} className="rounded-2xl bg-[#29E68C] px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50">
                          Submit Application
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(4,9,12,0.06)] sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <Icons.Trophy className="size-5 text-[#f97316]" />
            <h2 className="font-['Sora'] text-2xl font-bold tracking-[-0.03em]">Passed applicants</h2>
          </div>

          <form
            className="mb-8 grid gap-3 md:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              setResultsAcademicYear(resultsAcademicYearInput.trim());
              setResultsProgramId(resultsProgramInput.trim());
            }}
          >
            <input value={resultsAcademicYearInput} onChange={(event) => setResultsAcademicYearInput(event.target.value)} className="rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25" placeholder="Academic year" />
            <input value={resultsProgramInput} onChange={(event) => setResultsProgramInput(event.target.value)} className="rounded-2xl border border-black/10 bg-[#F7F4EC] px-4 py-3 outline-none transition focus:border-black/25" placeholder="Optional program ID" />
            <button type="submit" className="rounded-2xl bg-[#04090C] px-5 py-3 text-sm font-semibold text-white">Load results</button>
          </form>

          {passedApplicants.isFetching ? <p className="text-sm text-[#04090C]/55">Loading passed applicants...</p> : null}
          <div className="grid gap-4 md:grid-cols-2">
            {(passedApplicants.data ?? []).map((result) => (
              <div key={result.id} className="rounded-2xl border border-black/10 bg-[#F7F4EC] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0a9e5a]">{result.result_status}</p>
                <p className="mt-2 font-semibold text-[#04090C]">
                  {result.application?.applicant?.full_name || result.application?.application_number || result.application_id}
                </p>
                <p className="mt-1 text-sm text-[#04090C]/55">{result.application?.program?.name || 'Program unavailable'}</p>
                <p className="mt-3 text-sm text-[#04090C]/60">Academic year {result.application?.academic_year || resultsAcademicYear}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
