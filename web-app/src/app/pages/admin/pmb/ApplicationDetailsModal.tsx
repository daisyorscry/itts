import { useEffect, useState } from 'react';
import * as CardUI from '@components/ui/card';
import * as DialogUI from '@components/ui/dialog';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { useDeletePMBEvaluation, usePMBApplicationDetails, useUpdatePMBDocumentVerification } from '@feature/pmb/hooks';
import type { PMBDocumentVerificationStatus, PMBEvaluation } from '@feature/pmb/types';
import { EvaluationFormModal } from '@pages/admin/pmb/EvaluationFormModal';
import { FinalResultFormModal } from '@pages/admin/pmb/FinalResultFormModal';
import { ReRegistrationFormModal } from '@pages/admin/pmb/ReRegistrationFormModal';
import { useAuthStore } from '@store/auth.store';
import { formatDate, formatDateTime } from '@utility/date';

interface ApplicationDetailsModalProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'default' | 'evaluation' | 'result' | 'payment';
}

export function ApplicationDetailsModal({ applicationId, isOpen, onClose, initialMode = 'default' }: ApplicationDetailsModalProps) {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = usePMBApplicationDetails(applicationId, isOpen);
  const { mutate: updateDocumentVerification, isPending: updatingDocument } = useUpdatePMBDocumentVerification(applicationId);
  const { mutate: deleteEvaluation, isPending: deletingEvaluation } = useDeletePMBEvaluation(applicationId);
  const [editingEvaluation, setEditingEvaluation] = useState<PMBEvaluation | null>(null);
  const [isCreatingEvaluation, setIsCreatingEvaluation] = useState(false);
  const [isEditingFinalResult, setIsEditingFinalResult] = useState(false);
  const [isEditingReRegistration, setIsEditingReRegistration] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialMode === 'evaluation') {
      setIsCreatingEvaluation(true);
      return;
    }
    if (initialMode === 'result') {
      setIsEditingFinalResult(true);
      return;
    }
    if (initialMode === 'payment') {
      setIsEditingReRegistration(true);
    }
  }, [initialMode, isOpen]);

  const handleClose = () => {
    setEditingEvaluation(null);
    setIsCreatingEvaluation(false);
    setIsEditingFinalResult(false);
    setIsEditingReRegistration(false);
    onClose();
  };

  const handleDocumentStatusChange = (documentId: string, status: PMBDocumentVerificationStatus) => {
    if (!user?.id) return;
    updateDocumentVerification({
      id: documentId,
      payload: {
        status,
        verified_by: user.id,
      },
    });
  };

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogUI.DialogContent className="max-w-4xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]" style={{ maxHeight: '90vh' }}>
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Column gap="gap-1">
              <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                Application Details
              </DialogUI.DialogTitle>
              <DialogUI.DialogDescription className="text-sm text-black/60">
                Review applicant, document, and final result information.
              </DialogUI.DialogDescription>
            </LayoutUI.Column>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            {isLoading ? (
              <LayoutUI.Container className="rounded-2xl border border-dashed border-black/10 p-8 text-center">
                <Text variant="muted-inverse">Loading application details...</Text>
              </LayoutUI.Container>
            ) : null}

            {!isLoading && error ? (
              <LayoutUI.Container className="rounded-2xl border border-dashed border-black/10 p-8 text-center">
                <Text variant="muted-inverse">Failed to load application details.</Text>
              </LayoutUI.Container>
            ) : null}

            {!isLoading && !error && data ? (
              <LayoutUI.Column gap="gap-4">
                <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <CardUI.Card tone="inverse">
                    <CardUI.CardContent className="py-4">
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">Application Number</Text>
                        <Text variant="inverse">{data.application_number}</Text>
                      </LayoutUI.Column>
                    </CardUI.CardContent>
                  </CardUI.Card>
                  <CardUI.Card tone="inverse">
                    <CardUI.CardContent className="py-4">
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">Status</Text>
                        <Text variant="inverse" className="capitalize">{data.status.replace('_', ' ')}</Text>
                      </LayoutUI.Column>
                    </CardUI.CardContent>
                  </CardUI.Card>
                  <CardUI.Card tone="inverse">
                    <CardUI.CardContent className="py-4">
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">Track</Text>
                        <Text variant="inverse">{data.track?.track_name || '-'}</Text>
                      </LayoutUI.Column>
                    </CardUI.CardContent>
                  </CardUI.Card>
                  <CardUI.Card tone="inverse">
                    <CardUI.CardContent className="py-4">
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">Submitted</Text>
                        <Text variant="inverse">{formatDateTime(data.created_at)}</Text>
                      </LayoutUI.Column>
                    </CardUI.CardContent>
                  </CardUI.Card>
                </LayoutUI.Container>

                <CardUI.Card tone="inverse">
                  <CardUI.CardContent padding="auth" spacing="lg">
                    <LayoutUI.Row className="border-b border-black/10 pb-4">
                      <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Applicant</Text>
                    </LayoutUI.Row>
                    <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">Full Name</Text>
                        <Text variant="inverse">{data.applicant?.full_name || '-'}</Text>
                      </LayoutUI.Column>
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">Phone Number</Text>
                        <Text variant="inverse">{data.applicant?.phone_number || '-'}</Text>
                      </LayoutUI.Column>
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">School Origin</Text>
                        <Text variant="inverse">{data.applicant?.school_origin || '-'}</Text>
                      </LayoutUI.Column>
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">Graduation Year</Text>
                        <Text variant="inverse">{data.applicant?.graduation_year || '-'}</Text>
                      </LayoutUI.Column>
                    </LayoutUI.Container>
                  </CardUI.CardContent>
                </CardUI.Card>

                <CardUI.Card tone="inverse">
                  <CardUI.CardContent padding="auth" spacing="lg">
                    <LayoutUI.Row className="border-b border-black/10 pb-4">
                      <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Program Choice</Text>
                    </LayoutUI.Row>
                    <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">Program</Text>
                        <Text variant="inverse">{data.program?.name || '-'}</Text>
                      </LayoutUI.Column>
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">Faculty</Text>
                        <Text variant="inverse">{data.program?.faculty?.name || '-'}</Text>
                      </LayoutUI.Column>
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">Degree Level</Text>
                        <Text variant="inverse">{data.program?.degree_level || '-'}</Text>
                      </LayoutUI.Column>
                      <LayoutUI.Column gap="gap-1">
                        <Text variant="muted-inverse" size="sm">Academic Year</Text>
                        <Text variant="inverse">{data.academic_year}</Text>
                      </LayoutUI.Column>
                    </LayoutUI.Container>
                  </CardUI.CardContent>
                </CardUI.Card>

                <CardUI.Card tone="inverse">
                  <CardUI.CardContent padding="auth" spacing="lg">
                    <LayoutUI.Row className="border-b border-black/10 pb-4">
                      <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Documents</Text>
                    </LayoutUI.Row>
                    {(data.applicant?.documents ?? []).length === 0 ? (
                      <Text variant="muted-inverse">No applicant documents yet.</Text>
                    ) : (
                      <LayoutUI.Column gap="gap-3">
                        {(data.applicant?.documents ?? []).map((document) => (
                          <LayoutUI.Row key={document.id} justify="justify-between" align="items-start" className="gap-4 rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3 max-md:flex-col">
                            <LayoutUI.Column gap="gap-1" className="min-w-0 flex-1">
                              <Text variant="inverse">{document.document_type}</Text>
                              <Text variant="muted-inverse" size="xs" className="break-all">{document.file_path}</Text>
                            </LayoutUI.Column>
                            <SelectUI.Select
                              value={document.verification_status}
                              onValueChange={(value) => handleDocumentStatusChange(document.id, value as PMBDocumentVerificationStatus)}
                              disabled={updatingDocument || !user?.id}
                            >
                              <SelectUI.SelectTrigger appearance="admin" className="min-w-36">
                                <SelectUI.SelectValue placeholder="Verification status" />
                              </SelectUI.SelectTrigger>
                              <SelectUI.SelectContent appearance="admin">
                                <SelectUI.SelectItem value="pending">Pending</SelectUI.SelectItem>
                                <SelectUI.SelectItem value="valid">Valid</SelectUI.SelectItem>
                                <SelectUI.SelectItem value="invalid">Invalid</SelectUI.SelectItem>
                              </SelectUI.SelectContent>
                            </SelectUI.Select>
                          </LayoutUI.Row>
                        ))}
                      </LayoutUI.Column>
                    )}
                  </CardUI.CardContent>
                </CardUI.Card>

                <LayoutUI.Container className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <CardUI.Card tone="inverse">
                    <CardUI.CardContent padding="auth" spacing="lg">
                      <LayoutUI.Row className="border-b border-black/10 pb-4" justify="justify-between" align="items-center">
                        <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Evaluations</Text>
                        <Button type="button" onClick={() => setIsCreatingEvaluation(true)} variant="accent" size="sm">
                          Add Evaluation
                        </Button>
                      </LayoutUI.Row>
                      {(data.evaluations ?? []).length === 0 ? (
                        <Text variant="muted-inverse">No evaluations yet.</Text>
                      ) : (
                        <LayoutUI.Column gap="gap-3">
                          {(data.evaluations ?? []).map((evaluation) => (
                            <LayoutUI.Container key={evaluation.id} className="rounded-2xl border border-black/10 bg-black/[0.03] px-4 py-3">
                              <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
                                <LayoutUI.Column gap="gap-1" className="min-w-0 flex-1">
                                  <Text variant="inverse" className="capitalize">{evaluation.evaluation_type.replace('_', ' ')}</Text>
                                  <Text variant="muted-inverse" size="xs">Score: {evaluation.score ?? '-'}</Text>
                                  <Text variant="muted-inverse" size="xs">{evaluation.notes || 'No notes provided.'}</Text>
                                </LayoutUI.Column>
                                <LayoutUI.Row gap="gap-2" className="shrink-0">
                                  <Button type="button" onClick={() => setEditingEvaluation(evaluation)} variant="soft-action" size="sm">Edit</Button>
                                  <Button
                                    type="button"
                                    onClick={() => deleteEvaluation(evaluation.id)}
                                    disabled={deletingEvaluation}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    Delete
                                  </Button>
                                </LayoutUI.Row>
                              </LayoutUI.Row>
                            </LayoutUI.Container>
                          ))}
                        </LayoutUI.Column>
                      )}
                    </CardUI.CardContent>
                  </CardUI.Card>

                  <CardUI.Card tone="inverse">
                    <CardUI.CardContent padding="auth" spacing="lg">
                      <LayoutUI.Row className="border-b border-black/10 pb-4" justify="justify-between" align="items-center">
                        <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Decision</Text>
                        <LayoutUI.Row gap="gap-2" className="max-sm:w-full max-sm:flex-col">
                          <Button
                            type="button"
                            onClick={() => setIsEditingFinalResult(true)}
                            variant="soft-action"
                            size="sm"
                            className="max-sm:w-full"
                          >
                            {data.final_result ? 'Edit Result' : 'Add Result'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setIsEditingReRegistration(true)}
                            variant="soft-action"
                            size="sm"
                            className="max-sm:w-full"
                          >
                            {data.re_registration ? 'Update Payment' : 'Add Re-registration'}
                          </Button>
                        </LayoutUI.Row>
                      </LayoutUI.Row>
                      <LayoutUI.Column gap="gap-3">
                        <LayoutUI.Column gap="gap-1">
                          <Text variant="muted-inverse" size="sm">Final Result</Text>
                          <Text variant="inverse" className="capitalize">{data.final_result?.result_status || 'Not decided yet'}</Text>
                        </LayoutUI.Column>
                        <LayoutUI.Column gap="gap-1">
                          <Text variant="muted-inverse" size="sm">Final Score</Text>
                          <Text variant="inverse">{data.final_result?.final_score ?? '-'}</Text>
                        </LayoutUI.Column>
                        <LayoutUI.Column gap="gap-1">
                          <Text variant="muted-inverse" size="sm">Re-registration</Text>
                          <Text variant="inverse">{data.re_registration ? formatDate(data.re_registration.re_registration_date) : 'Not started'}</Text>
                        </LayoutUI.Column>
                        <LayoutUI.Column gap="gap-1">
                          <Text variant="muted-inverse" size="sm">Payment Status</Text>
                          <Text variant="inverse" className="capitalize">{data.re_registration?.payment_status || '-'}</Text>
                        </LayoutUI.Column>
                        <LayoutUI.Column gap="gap-1">
                          <Text variant="muted-inverse" size="sm">Payment Proof</Text>
                          <Text variant="inverse" className="break-all">{data.re_registration?.payment_proof || '-'}</Text>
                        </LayoutUI.Column>
                      </LayoutUI.Column>
                    </CardUI.CardContent>
                  </CardUI.Card>
                </LayoutUI.Container>
              </LayoutUI.Column>
            ) : null}
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>

      <EvaluationFormModal
        applicationId={applicationId}
        evaluation={editingEvaluation}
        isOpen={isCreatingEvaluation || Boolean(editingEvaluation)}
        onClose={() => {
          setIsCreatingEvaluation(false);
          setEditingEvaluation(null);
        }}
      />

      <FinalResultFormModal
        applicationId={applicationId}
        finalResult={data?.final_result ?? null}
        isOpen={isEditingFinalResult}
        onClose={() => setIsEditingFinalResult(false)}
      />

      <ReRegistrationFormModal
        applicationId={applicationId}
        reRegistration={data?.re_registration ?? null}
        isOpen={isEditingReRegistration}
        onClose={() => setIsEditingReRegistration(false)}
      />
    </DialogUI.Dialog>
  );
}
