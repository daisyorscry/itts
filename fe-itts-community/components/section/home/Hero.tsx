'use client';

import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import heroAnimation from '@/public/Robot-Bot 3D.json';

export default function Hero({ onRegister }: { onRegister: () => void }) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1080px] gap-10 px-5 md:grid-cols-2 md:items-center">
        {/* Kolom teks */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            ITTS Community <br />
            <span className="text-primary">
              Networking · DevSecOps · Programming
            </span>
          </h1>
          <p className="mt-4 max-w-lg text-base opacity-80 md:text-lg">
            Komunitas teknologi Institut Teknologi Tangerang Selatan untuk belajar
            terstruktur, praktik langsung di lab, dan membangun proyek nyata
            bersama mentor berpengalaman.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <motion.button
              onClick={onRegister}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              className="h-11 rounded-md bg-primary px-5 font-medium text-on-primary shadow-md hover:shadow-lg"
            >
              Daftar Anggota
            </motion.button>
            <motion.a
              href="#program"
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              className="h-11 rounded-md border border-border px-5 leading-[44px] hover:bg-surface"
            >
              Lihat Program
            </motion.a>
          </div>
        </motion.div>

        {/* Kolom Lottie animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex justify-center"
        >
          <div className="relative h-[260px] w-[320px] sm:h-[320px] sm:w-[420px]">
            <Lottie
              animationData={heroAnimation}
              loop
              autoplay
              className="h-full w-full"
            />
          </div>
          {/* Background Accent */}
          <div className="absolute -z-10 top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
