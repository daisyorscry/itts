'use client';

import { motion, type Variants } from 'framer-motion';
import {
  HiMiniEye,
  HiMiniCheckCircle,
  HiMiniBolt,
  HiMiniUsers,
  HiMiniBeaker,
} from 'react-icons/hi2';

const cardVar: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } }, // jangan taruh ease di sini
};

export default function VisionMission() {
  return (
    <section className="section">
      <motion.div
        className="container grid gap-6"
        variants={cardVar}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -120px 0px' }}
        transition={{ ease: [0.16, 1, 0.3, 1] }} // easing dipindah ke prop transition
      >
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold md:text-3xl">Visi &amp; Misi</h2>
          <p className="mt-2 opacity-80">
            Arah jangka panjang dan langkah taktis untuk membangun talenta teknologi dari ITTS.
          </p>
        </div>

        {/* Visi */}
        <motion.div
          className="rounded-xl border border-border p-5"
          variants={cardVar}
          transition={{ ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border">
              <HiMiniEye className="h-5 w-5" />
            </span>
            <div>
              <div className="font-medium">Visi</div>
              <p className="opacity-80">
                Mencetak talenta siap industri dengan kultur kolaboratif, etika profesi,
                dan kemampuan problem solving end-to-end.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Misi */}
        <motion.div
          className="grid gap-3 sm:grid-cols-2"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {[
            'Kurikulum berbasis praktik yang bertahap dan terukur.',
            'Lab produksi: CI/CD, container, observability, security baseline.',
            'Rutin sharing, mentoring, dan code review lintas angkatan.',
            'Kolaborasi industri & kontribusi proyek open source.',
          ].map((m, i) => (
            <motion.div
              key={m}
              className="flex items-start gap-3 rounded-lg border border-border p-4 hover:bg-surface transition"
              variants={cardVar}
              transition={{ ease: [0.16, 1, 0.3, 1], delay: 0.08 + i * 0.04 }}
            >
              <HiMiniCheckCircle className="mt-0.5 h-5 w-5" />
              <p className="text-sm">{m}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Nilai operasional ringkas */}
        <motion.ul
          className="grid gap-3 sm:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.li
            className="rounded-lg border border-border p-4"
            variants={cardVar}
            transition={{ ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          >
            <div className="mb-2 flex items-center gap-2 font-medium">
              <HiMiniBolt className="h-5 w-5" />
              Hands-on First
            </div>
            <p className="text-sm opacity-80">
              Belajar lewat praktik langsung: lab, simulasi, dan proyek riil.
            </p>
          </motion.li>

          <motion.li
            className="rounded-lg border border-border p-4"
            variants={cardVar}
            transition={{ ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          >
            <div className="mb-2 flex items-center gap-2 font-medium">
              <HiMiniUsers className="h-5 w-5" />
              Kolaborasi
            </div>
            <p className="text-sm opacity-80">
              Pairing, review, dan knowledge sharing lintas program.
            </p>
          </motion.li>

          <motion.li
            className="rounded-lg border border-border p-4"
            variants={cardVar}
            transition={{ ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
          >
            <div className="mb-2 flex items-center gap-2 font-medium">
              <HiMiniBeaker className="h-5 w-5" />
              Eksperimen Aman
            </div>
            <p className="text-sm opacity-80">
              Coba, ukur, ulangi—dengan rambu keamanan & praktik baik.
            </p>
          </motion.li>
        </motion.ul>
      </motion.div>
    </section>
  );
}
