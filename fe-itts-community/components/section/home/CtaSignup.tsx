'use client';

import { motion } from 'framer-motion';
import { HiMiniRocketLaunch } from 'react-icons/hi2';
import Link from 'next/link';

export default function CtaSignup({ onRegister }: { onRegister: () => void }) {
  return (
    <section
      className="
        relative overflow-hidden py-20 md:py-28
        bg-surface
      "
    >
      <div
        className="
          pointer-events-none absolute inset-0 -z-10
          flex items-center justify-center
        "
        aria-hidden
      >
        <div
          className="
            h-[70vmin] w-[70vmin] rounded-full
            bg-primary/10 blur-3xl
          "
        />
      </div>

      <motion.div
        className="container mx-auto max-w-3xl px-5 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Pill */}
        <span
          className="
            inline-flex items-center gap-2 rounded-full
            border border-border bg-background/80 px-3 py-1
            text-xs shadow-sm backdrop-blur
          "
        >
          <HiMiniRocketLaunch className="h-4 w-4 text-primary" />
          Ayo bergabung
        </span>

        {/* Heading */}
        <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
          Siap bergabung dan membangun masa depan teknologi?
        </h2>

        {/* Subheading */}
        <p className="mx-auto mt-3 max-w-2xl text-base opacity-80 md:text-lg">
          Bergabunglah dengan ITTS Community dan mulai perjalananmu menjadi
          praktisi — Networking, DevSecOps, hingga Programming.
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <motion.button
            onClick={onRegister}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="btn btn-primary h-12 px-6 text-base"
          >
            Daftar Sekarang
          </motion.button>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/program"
              className="
                inline-flex h-12 items-center justify-center rounded-md
                border border-border px-6 text-base hover:bg-surface
              "
            >
              Lihat Kurikulum
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="
            mx-auto mt-8 grid w-full max-w-2xl grid-cols-1 gap-3
            text-sm opacity-80 sm:grid-cols-3
          "
        >
        </motion.div>
      </motion.div>
    </section>
  );
}
