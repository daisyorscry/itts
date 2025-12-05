"use client";

/**
 * Member Registrations Management Page
 *
 * Admin page for managing member registrations (approve/reject/delete)
 */

import { useMemo, useState } from "react";
import { ProtectedRoute, PERMISSIONS } from "@/feature/auth";
import {
  useListRegistrations,
  useApproveRegistration,
  useRejectRegistration,
  useDeleteRegistration,
} from "@/feature/registration/hooks";
import {
  type Registration,
  type RegistrationStatus,
  type ProgramEnum,
} from "@/feature/registration/index";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table-shadcn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, Check, X, Trash2, Search } from "lucide-react";

export default function AdminRegistrationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "all">(
    "all"
  );
  const [programFilter, setProgramFilter] = useState<ProgramEnum | "all">(
    "all"
  );
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pageSize = 20;

  const { data, isLoading } = useListRegistrations({
    page,
    page_size: pageSize,
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    program: programFilter !== "all" ? programFilter : undefined,
  });

  const approveMutation = useApproveRegistration();
  const rejectMutation = useRejectRegistration();
  const deleteMutation = useDeleteRegistration();

  const handleApprove = async (registration: Registration) => {
    if (
      confirm(
        `Approve registration for "${registration.full_name}"? This will send them an approval email.`
      )
    ) {
      approveMutation.mutate(registration.id);
    }
  };

  const handleRejectClick = (registration: Registration) => {
    setSelectedRegistration(registration);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedRegistration || !rejectReason.trim()) {
      return;
    }

    await rejectMutation.mutateAsync({
      id: selectedRegistration.id,
      reason: rejectReason.trim(),
    });

    setShowRejectModal(false);
    setSelectedRegistration(null);
    setRejectReason("");
  };

  const handleDeleteClick = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedRegistration) {
      deleteMutation.mutate(selectedRegistration.id);
      setShowDeleteDialog(false);
      setSelectedRegistration(null);
    }
  };

  const handleViewDetail = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    const styles = {
      pending:
        "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      approved:
        "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      rejected:
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getProgramBadge = (program: ProgramEnum) => {
    const labels = {
      networking: "Networking",
      devsecops: "DevSecOps",
      programming: "Programming",
    };

    return (
      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {labels[program]}
      </span>
    );
  };

  const registrations = data?.data ?? [];
  const totalPages = data?.total_pages ?? 1;
  const total = data?.total ?? 0;
  const pageStart = useMemo(() => (page - 1) * pageSize + 1, [page, pageSize]);
  const pageEnd = useMemo(() => Math.min(page * pageSize, total), [page, pageSize, total]);

  return (
    <ProtectedRoute
      anyPermissions={[PERMISSIONS.REGISTRATIONS_LIST, PERMISSIONS.REGISTRATIONS_READ]}
    >
      <div className="space-y-6 p-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Member Registrations</h1>
          <p className="mt-1 text-foreground/60">
            Review and manage member registration applications
          </p>
        </header>

        {/* Filters */}
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <Input
                className="pl-9"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as RegistrationStatus | "all");
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={programFilter}
              onValueChange={(value) => {
                setProgramFilter(value as ProgramEnum | "all");
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All programs</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="devsecops">DevSecOps</SelectItem>
                <SelectItem value="programming">Programming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-background">
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-foreground/60">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading registrations...
                    </div>
                  </TableCell>
                </TableRow>
              ) : registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-foreground/60">
                    No registrations found
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{registration.full_name}</p>
                        <p className="text-sm text-foreground/60">{registration.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ProgramBadge program={registration.program} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{registration.student_id}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={registration.status} />
                    </TableCell>
                    <TableCell className="text-sm text-foreground/60">
                      {formatDate(registration.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(registration)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                        {registration.status === "pending" && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(registration)}
                              disabled={approveMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRejectClick(registration)}
                              disabled={rejectMutation.isPending}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(registration)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 text-sm text-foreground/60 md:flex-row md:items-center md:justify-between">
            <p>
              Showing {pageStart} to {pageEnd} of {total} registrations
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        <Dialog open={showRejectModal} onOpenChange={(open) => !open && setShowRejectModal(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Registration</DialogTitle>
              <DialogDescription>
                {selectedRegistration
                  ? `Rejecting ${selectedRegistration.full_name}. Provide a reason below.`
                  : "Provide a rejection reason."}
              </DialogDescription>
            </DialogHeader>

            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason (min. 5 characters)..."
              rows={4}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRejectConfirm}
                disabled={rejectMutation.isPending || rejectReason.trim().length < 5}
              >
                {rejectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDetailModal} onOpenChange={(open) => !open && setShowDetailModal(false)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Registration Details</DialogTitle>
              <DialogDescription>
                {selectedRegistration ? selectedRegistration.full_name : "Registration information"}
              </DialogDescription>
            </DialogHeader>

            {selectedRegistration && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailField label="Full Name" value={selectedRegistration.full_name} />
                  <DetailField label="Email" value={selectedRegistration.email} />
                  <DetailField
                    label="Program"
                    value={<ProgramBadge program={selectedRegistration.program} />}
                  />
                  <DetailField label="Student ID" value={selectedRegistration.student_id} />
                  <DetailField label="Intake Year" value={selectedRegistration.intake_year} />
                  <DetailField
                    label="Status"
                    value={<StatusBadge status={selectedRegistration.status} />}
                  />
                </div>

                <DetailField
                  label="Motivation"
                  value={<p className="text-sm whitespace-pre-wrap">{selectedRegistration.motivation}</p>}
                />

                {selectedRegistration.rejected_reason && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm font-medium text-red-600">Rejection Reason</p>
                    <p className="mt-1 text-sm text-red-600/80">
                      {selectedRegistration.rejected_reason}
                    </p>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <DetailField
                      label="Applied Date"
                      value={formatDateTime(selectedRegistration.created_at)}
                    />
                    {selectedRegistration.approved_at && (
                      <DetailField
                        label="Approved Date"
                        value={formatDateTime(selectedRegistration.approved_at)}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedRegistration(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Registration"
          message={`Are you sure you want to delete the registration from "${selectedRegistration?.full_name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </ProtectedRoute>
  );
}

function StatusBadge({ status }: { status: RegistrationStatus }) {
  const tones: Record<RegistrationStatus, string> = {
    pending: "border-yellow-500/20 bg-yellow-500/10 text-yellow-600",
    approved: "border-green-500/20 bg-green-500/10 text-green-600",
    rejected: "border-red-500/20 bg-red-500/10 text-red-600",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${tones[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ProgramBadge({ program }: { program: ProgramEnum }) {
  const labels: Record<ProgramEnum, string> = {
    networking: "Networking",
    devsecops: "DevSecOps",
    programming: "Programming",
  };

  return (
    <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      {labels[program]}
    </span>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm font-medium text-foreground/60">{label}</Label>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return "—";
  }
}

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}
