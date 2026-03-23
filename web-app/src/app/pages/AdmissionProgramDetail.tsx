import { useParams } from 'react-router';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { useListPublicPMBPassedApplicants, usePublicPMBProgram, usePublicPMBQuota } from '@feature/pmb/hooks';

export function AdmissionProgramDetail() {
  const { id = '' } = useParams();
  const academicYear = '2026/2027';
  const { data: program, isLoading, isError } = usePublicPMBProgram(id, !!id);
  const quota = usePublicPMBQuota(id, academicYear, !!id);
  const passedApplicants = useListPublicPMBPassedApplicants({ academic_year: academicYear, program_id: id }, !!id);

  return (
    <div className="min-h-screen bg-[#04090C] px-4 py-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {isLoading ? <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white/65">Loading program detail...</div> : null}
        {!isLoading && isError ? <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-8 text-red-100">Failed to load program detail.</div> : null}

        {program ? (
          <>
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <p className="mb-3 text-sm uppercase tracking-[0.24em] text-[#29E68C]">{program.code}</p>
              <h1 className="font-['Sora'] text-5xl font-extrabold tracking-[-0.05em]">{program.name}</h1>
              <p className="mt-4 max-w-2xl text-white/68">
                Public program detail page combining the new `/pmb/programs/{'{id}'}` endpoint with public quota and passed-result data.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-white/10 px-3 py-1 text-white/70">{program.degree_level}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-white/70">Faculty {program.faculty?.name || program.faculty_id}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-white/70">Quota {program.quota}</span>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <div className="mb-4 flex items-center gap-3">
                  <Icons.BadgeCheck className="size-5 text-[#29E68C]" />
                  <h2 className="font-['Sora'] text-2xl font-bold">Available quota</h2>
                </div>
                <p className="font-['Sora'] text-6xl font-extrabold tracking-[-0.05em]">{quota.data?.available_quota ?? '-'}</p>
                <p className="mt-3 text-sm text-white/50">Academic year {academicYear}</p>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
                <div className="mb-4 flex items-center gap-3">
                  <Icons.Trophy className="size-5 text-[#f59e0b]" />
                  <h2 className="font-['Sora'] text-2xl font-bold">Passed applicants</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {(passedApplicants.data ?? []).map((result) => (
                    <div key={result.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#29E68C]">{result.result_status}</p>
                      <p className="mt-2 font-semibold text-white">
                        {result.application?.applicant?.full_name || result.application?.application_number || result.application_id}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
