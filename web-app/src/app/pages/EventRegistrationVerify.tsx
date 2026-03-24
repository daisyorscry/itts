import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { useCreateEventRegistrationPayment, useVerifyEventRegistration } from '@feature/event/hooks';
import type { EventRegistration } from '@feature/event/types';

function getStatusCopy(registration?: EventRegistration | null) {
  if (!registration) {
    return {
      title: 'Verifying your registration',
      description: 'We are checking your token and updating your seat status.',
    };
  }

  switch (registration.status) {
    case 'approved':
      return {
        title: 'Your seat is confirmed',
        description: 'Your email is verified and your registration is approved.',
      };
    case 'waitlisted':
      return {
        title: 'You are on the waitlist',
        description: 'Your email is verified, but current seats are full.',
      };
    case 'pending_payment':
      return {
        title: 'Verification complete',
        description: 'Your email is verified. Continue to payment to secure your seat.',
      };
    default:
      return {
        title: 'Registration updated',
        description: 'Your registration status has been refreshed.',
      };
  }
}

function getStatusTone(registration?: EventRegistration | null) {
  switch (registration?.status) {
    case 'approved':
      return 'border-[#29E68C]/20 bg-[#29E68C]/10';
    case 'waitlisted':
      return 'border-orange-500/20 bg-orange-500/10';
    case 'pending_payment':
      return 'border-blue-500/20 bg-blue-500/10';
    default:
      return 'border-black/10 bg-black/[0.03]';
  }
}

export function EventRegistrationVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token')?.trim() ?? '';
  const verifyMutation = useVerifyEventRegistration();
  const { mutate: verifyRegistration } = verifyMutation;
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const paymentMutation = useCreateEventRegistrationPayment(registration?.id ?? '');
  const verifiedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token || verifiedTokenRef.current === token) {
      return;
    }

    verifiedTokenRef.current = token;
    verifyRegistration(
      { token },
      {
        onSuccess: (response) => {
          setRegistration(response.data);
          navigate(`/events/payment-resume?token=${encodeURIComponent(token)}`, { replace: true });
        },
      },
    );
  }, [navigate, token, verifyRegistration]);

  const statusCopy = getStatusCopy(registration);
  const canCreatePayment = registration?.status === 'pending_payment';
  const paymentURL = registration?.payment_url;

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
        <div className="absolute left-0 top-0 h-[360px] w-[360px] rounded-full bg-accent/10 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
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
                <span className="font-['Sora'] text-lg font-black tracking-[-0.03em] text-black">EVENT VERIFICATION</span>
              </div>
              <h1 className="font-['Sora'] text-[clamp(32px,5vw,56px)] font-extrabold tracking-[-0.04em]">
                {statusCopy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#04090C]/65">
                {statusCopy.description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className={`rounded-[1.25rem] border p-6 sm:p-8 ${getStatusTone(registration)}`}
            >
              {!token ? (
                <p className="text-sm leading-6 text-[#04090C]/70">Verification token is missing from the URL.</p>
              ) : null}

              {token && verifyMutation.isPending ? (
                <div className="flex items-center gap-3 text-sm text-[#04090C]/70">
                  <Icons.LoaderCircle className="size-5 animate-spin" />
                  Verifying your registration...
                </div>
              ) : null}

              {token && verifyMutation.isError ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[#04090C]/70">
                    <Icons.CircleAlert className="size-5" />
                    This verification link is invalid, expired, or already used.
                  </div>
                  <p className="text-sm leading-6 text-[#04090C]/58">
                    Please register again from the event page if you still want to reserve a seat.
                  </p>
                </div>
              ) : null}

              {registration ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-black/10 bg-black/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#04090C]/45">Registrant</p>
                      <p className="mt-2 font-medium text-[#04090C]">{registration.full_name}</p>
                      <p className="mt-1 text-sm text-[#04090C]/58">{registration.email}</p>
                    </div>
                    <div className="rounded-[1rem] border border-black/10 bg-black/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#04090C]/45">Current status</p>
                      <p className="mt-2 font-medium capitalize text-[#04090C]">{registration.status.replaceAll('_', ' ')}</p>
                      <p className="mt-1 text-sm capitalize text-[#04090C]/58">
                        Payment: {registration.payment_status.replaceAll('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {paymentURL ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={paymentURL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent/90"
                      >
                        Continue to payment
                        <Icons.ArrowUpRight className="size-4" />
                      </a>
                      <Link
                        to={`/events/payment-resume?registration_id=${registration.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#04090C] transition hover:bg-black/[0.04]"
                      >
                        Track payment status
                        <Icons.ReceiptText className="size-4" />
                      </Link>
                    </div>
                  ) : canCreatePayment ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          paymentMutation.mutate(
                            { provider: 'midtrans' },
                            {
                              onSuccess: (response) => {
                                setRegistration(response.data);
                              },
                            },
                          );
                        }}
                        disabled={paymentMutation.isPending}
                        className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {paymentMutation.isPending ? 'Preparing payment...' : 'Generate payment link'}
                        <Icons.CreditCard className="size-4" />
                      </button>
                      <Link
                        to={`/events/payment-resume?registration_id=${registration.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#04090C] transition hover:bg-black/[0.04]"
                      >
                        Open payment resume
                        <Icons.ReceiptText className="size-4" />
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
