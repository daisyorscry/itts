"use client";

/**
 * Member Registrations Management Page
 *
 * Admin page for managing member registrations (approve/reject/delete)
 */

import { useState } from "react";
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
import {
  HiCheck,
  HiXMark,
  HiTrash,
  HiMagnifyingGlass,
  HiEye,
} from "react-icons/hi2";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

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

  return (
    <ProtectedRoute
      anyPermissions={[PERMISSIONS.REGISTRATIONS_LIST, PERMISSIONS.REGISTRATIONS_READ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold">Member Registrations</h1>
          <p className="mt-1 text-foreground/60">
            Review and manage member registration applications
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as RegistrationStatus | "all")
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Program Filter */}
          <select
            value={programFilter}
            onChange={(e) =>
              setProgramFilter(e.target.value as ProgramEnum | "all")
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Programs</option>
            <option value="networking">Networking</option>
            <option value="devsecops">DevSecOps</option>
            <option value="programming">Programming</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                    Applicant
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                    Student ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                    Applied Date
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground/80">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-foreground/60"
                    >
                      Loading registrations...
                    </td>
                  </tr>
                ) : data?.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-foreground/60"
                    >
                      No registrations found
                    </td>
                  </tr>
                ) : (
                  data?.data.map((registration) => (
                    <tr key={registration.id} className="hover:bg-surface/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">
                            {registration.full_name}
                          </p>
                          <p className="text-xs text-foreground/60">
                            {registration.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getProgramBadge(registration.program)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">
                          {registration.student_id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(registration.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground/60">
                        {new Date(registration.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(registration)}
                            className="rounded p-1.5 hover:bg-surface"
                            title="View details"
                          >
                            <HiEye className="h-4 w-4" />
                          </button>

                          {registration.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(registration)}
                                disabled={approveMutation.isPending}
                                className="rounded p-1.5 text-green-600 hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Approve"
                              >
                                <HiCheck className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRejectClick(registration)}
                                disabled={rejectMutation.isPending}
                                className="rounded p-1.5 text-red-600 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Reject"
                              >
                                <HiXMark className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDeleteClick(registration)}
                            disabled={deleteMutation.isPending}
                            className="rounded p-1.5 text-red-600 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/60">
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, data.total)} of {data.total}{" "}
              registrations
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm">
                Page {page} of {data.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedRegistration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Reject Registration</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="rounded p-1 hover:bg-surface"
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              </div>

              <p className="mb-4 text-sm text-foreground/60">
                Rejecting registration for <strong>{selectedRegistration.full_name}</strong>. Please provide a reason:
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason (min. 5 characters)..."
                rows={4}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={rejectMutation.isPending || rejectReason.trim().length < 5}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedRegistration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-lg bg-background p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Registration Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="rounded p-1 hover:bg-surface"
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-foreground/60">Full Name</p>
                    <p className="mt-1 text-sm">{selectedRegistration.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/60">Email</p>
                    <p className="mt-1 text-sm">{selectedRegistration.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/60">Program</p>
                    <p className="mt-1">{getProgramBadge(selectedRegistration.program)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/60">Student ID</p>
                    <p className="mt-1 text-sm">{selectedRegistration.student_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/60">Intake Year</p>
                    <p className="mt-1 text-sm">{selectedRegistration.intake_year}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/60">Status</p>
                    <p className="mt-1">{getStatusBadge(selectedRegistration.status)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground/60">Motivation</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedRegistration.motivation}</p>
                </div>

                {selectedRegistration.rejected_reason && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Rejection Reason</p>
                    <p className="mt-1 text-sm text-red-600/80 dark:text-red-400/80">
                      {selectedRegistration.rejected_reason}
                    </p>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-foreground/60">Applied Date</p>
                      <p className="mt-1 text-sm">
                        {new Date(selectedRegistration.created_at).toLocaleString()}
                      </p>
                    </div>
                    {selectedRegistration.approved_at && (
                      <div>
                        <p className="text-sm font-medium text-foreground/60">Approved Date</p>
                        <p className="mt-1 text-sm">
                          {new Date(selectedRegistration.approved_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
