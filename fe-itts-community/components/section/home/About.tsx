'use client';

import { motion, type Variants } from 'framer-motion';
import { HiMiniUsers, HiMiniAcademicCap, HiMiniComputerDesktop } from 'react-icons/hi2';

const container: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }, // tanpa ease
};

export default function About() {
  return (
    <section id="about" className="section">
      <motion.div
        className="container space-y-6"
        variants={container}
        transition={{ ease: [0.16, 1, 0.3, 1] }} // ease dipindah ke sini
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -100px 0px' }}
      >
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Apa itu ITTS Community?
          </h2>
          <p className="mt-3 opacity-80">
            ITTS Community adalah wadah mahasiswa Institut Teknologi Tangerang
            Selatan untuk mendalami dunia teknologi secara terstruktur. Fokus
            utama kami adalah:
          </p>
        </div>

        {/* highlight fokus */}
        <motion.ul
          className="grid gap-3 sm:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.li
            className="flex flex-col items-start gap-2 rounded-lg border border-border p-4 hover:bg-surface transition"
            variants={container}
            transition={{ ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          >
            <HiMiniUsers className="h-6 w-6 text-primary" />
            <span className="font-medium">Jaringan & Infrastruktur</span>
            <p className="text-sm opacity-70">
              Belajar routing, switching, subnetting, dan praktik lab mikrotik/cisco.
            </p>
          </motion.li>

          <motion.li
            className="flex flex-col items-start gap-2 rounded-lg border border-border p-4 hover:bg-surface transition"
            variants={container}
            transition={{ ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <HiMiniComputerDesktop className="h-6 w-6 text-primary" />
            <span className="font-medium">DevSecOps & Cloud</span>
            <p className="text-sm opacity-70">
              CI/CD, container, Kubernetes, observability, dan security hardening.
            </p>
          </motion.li>

          <motion.li
            className="flex flex-col items-start gap-2 rounded-lg border border-border p-4 hover:bg-surface transition"
            variants={container}
            transition={{ ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <HiMiniAcademicCap className="h-6 w-6 text-primary" />
            <span className="font-medium">Programming & Software</span>
            <p className="text-sm opacity-70">
              Go, JavaScript/TypeScript, API backend, frontend modern, dan testing.
            </p>
          </motion.li>
        </motion.ul>
      </motion.div>
    </section>
  );
}
