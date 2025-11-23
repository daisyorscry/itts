'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { HiMiniCheckCircle, HiMiniArrowRight } from 'react-icons/hi2';

const container: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};


const list = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

export default function HighlightCta({ onRegister }: { onRegister: () => void }) {
  return (
    <section className="section border-b border-border">
      <motion.div
        className="container grid items-center gap-6 md:grid-cols-[1.3fr_1fr]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -120px 0px' }}
        variants={container}
      >
        {/* Kiri: copy utama */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs">
            <span className="font-medium">Akses Akun Kampus</span>
            <span className="opacity-70">@itts.ac.id</span>
          </div>

          <h2 className="text-xl font-semibold md:text-2xl">
            Materi eksklusif, lab akses, dan mentoring—khusus email kampus
          </h2>

          <p className="max-w-prose opacity-80">
            Gunakan alamat email institusi untuk membuka modul premium, rekaman sesi,
            serta environment lab terukur yang selaras dengan kurikulum Networking,
            DevSecOps, dan Programming.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <motion.button
              onClick={onRegister}
              className="btn btn-primary"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
            >
              Gabung Sekarang
            </motion.button>

            <Link
              href="/program"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-surface"
            >
              Lihat Kurikulum
              <HiMiniArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Kanan: benefit list + metrik */}
        <motion.div variants={list} className="grid gap-4">
          <motion.ul variants={list} className="grid gap-3">
            {[
              'Repos materi & catatan praktikum terstruktur',
              'Rekaman workshop dan pembahasan soal',
              'Template proyek & starter kit stack kampus',
            ].map((text) => (
              <motion.li
                key={text}
                variants={item}
                className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-surface"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center">
                  <HiMiniCheckCircle className="h-5 w-5" />
                </span>
                <span className="text-sm">{text}</span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Metrik ringkas */}
          <motion.div
            variants={item}
            className="grid grid-cols-3 gap-3 rounded-xl border border-border p-4"
          >
            <div className="text-center">
              <div className="text-lg font-semibold">30+</div>
              <div className="text-xs opacity-70">Modul</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">12</div>
              <div className="text-xs opacity-70">Workshop/Triwulan</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">24/7</div>
              <div className="text-xs opacity-70">Lab Access</div>
            </div>
          </motion.div>

          {/* Info email domain */}
          <motion.div
            variants={item}
            className="rounded-lg border border-dashed border-border p-3 text-xs opacity-80"
          >
            Gunakan format email kampus: <span className="font-mono">nama@itts.ac.id</span>.
            Jika belum memiliki akun, hubungi admin prodi untuk aktivasi akses.
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
