import { Link, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import {
  useCreateEventRegistrationPayment,
  usePublicEventRegistration,
  usePublicEventRegistrationByToken,
  useResendEventRegistrationInvoice,
  useResendEventRegistrationVerification,
} from '@feature/event/hooks';
import type { EventRegistration } from '@feature/event/types';
import { BASE_URL } from '@utility/api';
import { resolveAssetUrl } from '@utility/asset';

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start) {
    return 'Schedule will be announced';
  }

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;

  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (!endDate) {
    return formatter.format(startDate);
  }

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

function formatMoney(currency?: string, amount?: number) {
  if (!amount) {
    return currency ? `${currency} 0` : 'Free';
  }

  return `${currency || 'IDR'} ${new Intl.NumberFormat('id-ID').format(amount)}`;
}

function getRedirectCopy(midtransStatus?: string | null) {
  switch (midtransStatus) {
    case 'finish':
      return {
        icon: Icons.BadgeCheck,
        title: 'Payment flow completed',
        description: 'We are validating your payment result. This page refreshes automatically while the payment webhook is processed.',
      };
    case 'unfinish':
      return {
        icon: Icons.Clock3,
        title: 'Payment is not finished yet',
        description: 'You left the payment flow before it was completed. You can continue with the active payment link below.',
      };
    case 'error':
      return {
        icon: Icons.CircleAlert,
        title: 'Payment returned an error',
        description: 'Midtrans reported an error during payment. You can regenerate a payment link if needed.',
      };
    default:
      return null;
  }
}

function getResumeCopy(registration?: EventRegistration) {
  switch (registration?.status) {
    case 'approved':
      return {
        title: 'Your ticket is confirmed',
        description: registration.event_is_paid
          ? 'Payment has been received and your seat is secured.'
          : 'This is a free event and your seat is already secured.',
      };
    case 'waitlisted':
      return {
        title: 'You are currently on the waitlist',
        description: 'Your registration is valid, but all confirmed seats are full for now.',
      };
    case 'pending_payment':
      return {
        title: 'Complete your payment',
        description: 'Finish payment to secure your registration before the payment window expires.',
      };
    case 'pending_verification':
      return {
        title: 'Verify your email first',
        description: 'Your registration is saved, but email verification is still required before we can continue.',
      };
    case 'expired':
      return {
        title: 'Registration expired',
        description: 'Your previous payment or registration window has expired.',
      };
    case 'cancelled':
      return {
        title: 'Registration cancelled',
        description: 'This registration is no longer active.',
      };
    case 'rejected':
      return {
        title: 'Registration rejected',
        description: 'This registration cannot continue to payment.',
      };
    default:
      return {
        title: 'Your event ticket center',
        description: 'Keep this page to track registration, payment, and invoice status without logging in.',
      };
  }
}

function getStatusBadge(registration?: EventRegistration) {
  switch (registration?.status) {
    case 'approved':
      return 'bg-[#29E68C] text-black';
    case 'waitlisted':
      return 'bg-orange-400 text-black';
    case 'pending_payment':
      return 'bg-blue-200 text-[#04090C]';
    case 'pending_verification':
      return 'bg-black/10 text-[#04090C]';
    case 'rejected':
    case 'cancelled':
    case 'expired':
      return 'bg-red-200 text-[#04090C]';
    default:
      return 'bg-black/10 text-[#04090C]';
  }
}

export function EventRegistrationPaymentResume() {
  const [searchParams] = useSearchParams();
  const registrationId = searchParams.get('registration_id')?.trim() ?? '';
  const accessToken = searchParams.get('token')?.trim() ?? '';
  const midtransStatus = searchParams.get('midtrans_status');

  const byTokenQuery = usePublicEventRegistrationByToken(accessToken, !!accessToken, 8000);
  const byIdQuery = usePublicEventRegistration(registrationId, !accessToken && !!registrationId, 8000);
  const registration = byTokenQuery.data ?? byIdQuery.data;
  const isLoading = accessToken ? byTokenQuery.isLoading : byIdQuery.isLoading;
  const isError = accessToken ? byTokenQuery.isError : byIdQuery.isError;

  const paymentMutation = useCreateEventRegistrationPayment(registration?.id ?? '');
  const resendVerificationMutation = useResendEventRegistrationVerification(accessToken);
  const resendInvoiceMutation = useResendEventRegistrationInvoice(accessToken);

  const copy = getResumeCopy(registration);
  const redirectCopy = getRedirectCopy(midtransStatus);
  const canCreatePayment =
    registration?.status === 'pending_payment' &&
    (registration.payment_status === 'pending' || registration.payment_status === 'expired' || registration.payment_status === 'failed');
  const canResendVerification = Boolean(accessToken) && registration?.status === 'pending_verification';
  const canResendInvoice = Boolean(accessToken) && registration?.payment_status === 'paid';
  const invoicePDFURL = accessToken ? `${BASE_URL}/events/registrations/invoice.pdf?token=${encodeURIComponent(accessToken)}` : '';
  const qrImageURL = accessToken ? `${BASE_URL}/events/registrations/ticket-qr.svg?token=${encodeURIComponent(accessToken)}` : '';

  return (
    <div className="min-h-screen bg-[#ECE9DE] text-[#04090C]">
      <section className="relative overflow-hidden border-b border-black/10 bg-[#ECE9DE]">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.45) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute right-0 top-0 h-[360px] w-[360px] rounded-full bg-accent/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <Link to="/events" className="mb-8 inline-flex items-center gap-2 text-sm text-[#04090C]/60 transition hover:text-[#04090C]">
            <Icons.ArrowLeft className="size-4" />
            Back to events
          </Link>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="rounded-[1.25rem] border border-black/10 bg-[#ECE9DE] p-6 sm:p-8"
            >
              <div className="mb-5 inline-block rounded-sm bg-accent px-4 py-2">
                <span className="font-['Sora'] text-lg font-black tracking-[-0.03em] text-black">EVENT TICKET</span>
              </div>
              <h1 className="font-['Sora'] text-[clamp(32px,5vw,56px)] font-extrabold tracking-[-0.04em]">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#04090C]/65">
                {copy.description}
              </p>
            </motion.div>

            {redirectCopy ? (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.03 }}
                className="rounded-[1.25rem] border border-black/10 bg-black/[0.03] p-5 sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <redirectCopy.icon className="mt-0.5 size-5 text-[#04090C]" />
                  <div className="space-y-1">
                    <h2 className="font-['Sora'] text-lg font-bold tracking-[-0.03em] text-[#04090C]">
                      {redirectCopy.title}
                    </h2>
                    <p className="text-sm leading-6 text-[#04090C]/65">
                      {redirectCopy.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"
            >
              <div className="overflow-hidden rounded-[1.25rem] border border-black/10 bg-[#ECE9DE]">
                {registration?.event_image_url ? (
                  <div className="relative aspect-[16/9] bg-black/[0.04]">
                    <img src={resolveAssetUrl(registration.event_image_url)} alt={registration.event_title || 'Event banner'} className="absolute inset-0 h-full w-full object-cover object-center" />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-black/[0.04]">
                    <Icons.Image className="size-10 text-[#04090C]/25" />
                  </div>
                )}

                <div className="space-y-6 p-6 sm:p-8">
                  {!registrationId && !accessToken ? (
                    <p className="text-sm leading-6 text-[#04090C]/70">Registration token or ID is missing from the URL.</p>
                  ) : null}

                  {(registrationId || accessToken) && isLoading ? (
                    <div className="flex items-center gap-3 text-sm text-[#04090C]/70">
                      <Icons.LoaderCircle className="size-5 animate-spin" />
                      Refreshing your ticket details...
                    </div>
                  ) : null}

                  {(registrationId || accessToken) && isError ? (
                    <div className="space-y-3 rounded-[1rem] border border-black/10 bg-black/[0.03] p-5">
                      <div className="flex items-center gap-3 text-sm text-[#04090C]/70">
                        <Icons.CircleAlert className="size-5" />
                        We could not load this registration.
                      </div>
                      <p className="text-sm leading-6 text-[#04090C]/58">
                        Open the latest email link again or contact the event organizer if the issue continues.
                      </p>
                    </div>
                  ) : null}

                  {registration ? (
                    <>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusBadge(registration)}`}>
                          {registration.status.replace(/_/g, ' ')}
                        </span>
                        <span className="rounded-full bg-black/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#04090C]/70">
                          Payment {registration.payment_status.replace(/_/g, ' ')}
                        </span>
                        {registration.payment_reference ? (
                          <span className="rounded-full bg-black/[0.05] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#04090C]/70">
                            Ref {registration.payment_reference}
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-3">
                        {registration.ticket_code ? (
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#04090C]/45">
                            {registration.ticket_code}
                          </p>
                        ) : null}
                        <h2 className="font-['Sora'] text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-0.04em] text-[#04090C]">
                          {registration.event_title || 'Event registration'}
                        </h2>
                        {registration.event_summary ? (
                          <p className="max-w-3xl text-base leading-7 text-[#04090C]/65">
                            {registration.event_summary}
                          </p>
                        ) : null}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-[1rem] border border-black/10 bg-black/[0.03] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#04090C]/45">Schedule</p>
                          <p className="mt-2 font-medium text-[#04090C]">
                            {formatDateRange(registration.event_starts_at, registration.event_ends_at)}
                          </p>
                        </div>
                        <div className="rounded-[1rem] border border-black/10 bg-black/[0.03] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#04090C]/45">Venue</p>
                          <p className="mt-2 font-medium text-[#04090C]">{registration.event_venue || 'To be announced'}</p>
                        </div>
                        <div className="rounded-[1rem] border border-black/10 bg-black/[0.03] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#04090C]/45">Attendee</p>
                          <p className="mt-2 font-medium text-[#04090C]">{registration.full_name}</p>
                          <p className="mt-1 text-sm text-[#04090C]/58">{registration.email}</p>
                          {registration.phone_number ? <p className="mt-1 text-sm text-[#04090C]/58">{registration.phone_number}</p> : null}
                          {registration.institution ? <p className="mt-1 text-sm text-[#04090C]/58">{registration.institution}</p> : null}
                        </div>
                        <div className="rounded-[1rem] border border-black/10 bg-black/[0.03] p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#04090C]/45">Payment</p>
                          <p className="mt-2 font-medium text-[#04090C]">
                            {registration.event_is_paid ? formatMoney(registration.event_currency, registration.event_price) : 'Free event'}
                          </p>
                          <p className="mt-1 text-sm text-[#04090C]/58">
                            {registration.event_is_paid
                              ? registration.payment_status === 'paid'
                                ? 'Payment completed'
                                : 'Payment still required'
                              : 'No payment required'}
                          </p>
                        </div>
                      </div>

                      {registration.status === 'approved' ? (
                        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                          <div className="rounded-[1rem] border border-black/10 bg-black/[0.03] p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#04090C]/45">QR Ticket</p>
                            <div className="mt-4 overflow-hidden rounded-[0.75rem] bg-white p-3">
                              {qrImageURL ? (
                                <img src={qrImageURL} alt="Event ticket QR" className="mx-auto h-full w-full object-contain" />
                              ) : (
                                <div className="flex aspect-square items-center justify-center text-[#04090C]/30">
                                  <Icons.QrCode className="size-12" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="rounded-[1rem] border border-black/10 bg-black/[0.03] p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#04090C]/45">Ticket access</p>
                            <p className="mt-2 text-sm leading-6 text-[#04090C]/65">
                              Show this QR code and ticket code at check-in. The same page can be reopened anytime from your email link.
                            </p>
                            {registration.ticket_code ? (
                              <div className="mt-4 rounded-[0.75rem] bg-white/70 px-4 py-3 font-['Sora'] text-lg font-bold tracking-[0.08em] text-[#04090C]">
                                {registration.ticket_code}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-3">
                        {registration.payment_url && registration.status === 'pending_payment' ? (
                          <a
                            href={registration.payment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent/90"
                          >
                            Continue payment
                            <Icons.ArrowUpRight className="size-4" />
                          </a>
                        ) : null}

                        {canCreatePayment ? (
                          <button
                            type="button"
                            onClick={() => paymentMutation.mutate({ provider: 'midtrans' })}
                            disabled={paymentMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#04090C] transition hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {paymentMutation.isPending ? 'Preparing payment...' : 'Generate new payment link'}
                            <Icons.CreditCard className="size-4" />
                          </button>
                        ) : null}

                        {canResendVerification ? (
                          <button
                            type="button"
                            onClick={() => resendVerificationMutation.mutate()}
                            disabled={resendVerificationMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#04090C] transition hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {resendVerificationMutation.isPending ? 'Sending email...' : 'Resend verification'}
                            <Icons.Mail className="size-4" />
                          </button>
                        ) : null}

                        {canResendInvoice ? (
                          <button
                            type="button"
                            onClick={() => resendInvoiceMutation.mutate()}
                            disabled={resendInvoiceMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#04090C] transition hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {resendInvoiceMutation.isPending ? 'Sending invoice...' : 'Resend invoice'}
                            <Icons.MailCheck className="size-4" />
                          </button>
                        ) : null}

                        {registration.payment_status === 'paid' ? (
                          <>
                            {invoicePDFURL ? (
                              <a
                                href={invoicePDFURL}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#04090C] transition hover:bg-black/[0.04]"
                              >
                                Download invoice PDF
                                <Icons.FileDown className="size-4" />
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#04090C] transition hover:bg-black/[0.04]"
                            >
                              Print page
                              <Icons.Printer className="size-4" />
                            </button>
                          </>
                        ) : null}
                      </div>

                      {registration.rejected_reason ? (
                        <div className="rounded-[1rem] border border-orange-300/60 bg-orange-100/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-orange-900/60">Registration note</p>
                          <p className="mt-2 text-sm leading-6 text-orange-950">{registration.rejected_reason}</p>
                        </div>
                      ) : null}

                      <p className="text-sm leading-6 text-[#04090C]/58">
                        Keep this page or email link. It refreshes automatically while payment status changes, and you can reopen it later without creating an account.
                      </p>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[1.25rem] border border-black/10 bg-[#ECE9DE] p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#04090C]/45">Ticket access</p>
                  <h3 className="mt-3 font-['Sora'] text-2xl font-bold tracking-[-0.04em] text-[#04090C]">
                    This page is your public event pass
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#04090C]/65">
                    You do not need to sign in to continue payment, reopen the invoice, or review your registration status.
                  </p>
                </div>

                <div className="rounded-[1.25rem] border border-black/10 bg-[#ECE9DE] p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#04090C]/45">What happens next</p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-[1rem] bg-black/[0.03] p-4">
                      <p className="font-semibold text-[#04090C]">1. Verify or continue</p>
                      <p className="mt-1 text-sm leading-6 text-[#04090C]/60">
                        Your email link can be reopened again later and still bring you back to this ticket center.
                      </p>
                    </div>
                    <div className="rounded-[1rem] bg-black/[0.03] p-4">
                      <p className="font-semibold text-[#04090C]">2. Complete payment if needed</p>
                      <p className="mt-1 text-sm leading-6 text-[#04090C]/60">
                        Paid events require Midtrans payment before your seat is fully secured.
                      </p>
                    </div>
                    <div className="rounded-[1rem] bg-black/[0.03] p-4">
                      <p className="font-semibold text-[#04090C]">3. Receive confirmation</p>
                      <p className="mt-1 text-sm leading-6 text-[#04090C]/60">
                        After payment succeeds, we send invoice and confirmation details to your email automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
