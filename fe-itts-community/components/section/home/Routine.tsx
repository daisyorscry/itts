'use client';

import { months } from '@/lib/section/routine';
import { motion, type Variants } from 'framer-motion';
import {
  HiMiniCalendarDays,
  HiMiniCheckCircle,
  HiMiniRocketLaunch,
} from 'react-icons/hi2';

const containerVar: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.06, delayChildren: 0.08 } },
};

const cardVar: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.26 } },
};

export default function Routine() {
  return (
    <section id="routine" className="section">
      <div className="container space-y-6">
        <div className="flex items-center gap-2">
          <HiMiniCalendarDays className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold md:text-3xl">
            Kegiatan Rutin (Roadmap 6 Bulan)
          </h2>
        </div>

        {/* Grid 3x2 */}
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVar}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ ease: [0.16, 1, 0.3, 1] }}
        >
          {months.slice(0, 6).map((m, idx) => (
            <motion.article
              key={m.month}
              variants={cardVar}
              transition={{ ease: [0.16, 1, 0.3, 1] }}
              className="
                rounded-2xl border border-border bg-background p-5 shadow-sm
                transition will-change-transform
                focus-within:ring-2 focus-within:ring-primary/30
              "
              whileHover={{ y: -4, rotateX: 1.5, boxShadow: '0 8px 28px rgba(0,0,0,0.08)' }}
            >
              <div className="mb-3 flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-on-primary">
                  {idx + 1}
                </span>
                {m.month}
              </div>

              <ul className="grid gap-2">
                {m.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm">
                    <HiMiniCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="opacity-80">{it}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </motion.div>

        {/* CTA capstone */}
        <motion.div
          className="rounded-xl border border-dashed border-border p-4 md:flex md:items-center md:justify-between"
          variants={cardVar}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border">
              <HiMiniRocketLaunch className="h-5 w-5" />
            </span>
            <div>
              <div className="font-medium">Capstone: Production-Ready App</div>
              <p className="text-sm opacity-80">
                Target akhir: satu aplikasi siap produksi dengan pipeline CI/CD, observability lengkap,
                kebijakan keamanan dasar, dan dokumentasi runbook/DR yang tervalidasi.
              </p>
            </div>
          </div>
          {/* <button className="btn btn-primary mt-3 md:mt-0">Lihat Template Capstone</button> */}
        </motion.div>
      </div>
    </section>
  );
}
