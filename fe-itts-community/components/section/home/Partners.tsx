'use client';

import { motion, type Variants } from 'framer-motion';
import { HiMiniBuildingOffice2 } from 'react-icons/hi2';

const containerVar: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3, staggerChildren: 0.06, delayChildren: 0.08 }
  },
};

const cardVar: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
};

const partners = [
  {
    name: 'Cisco',
    desc: 'Networking & Security Solutions',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Cisco_logo.svg',
  },
  {
    name: 'AMD',
    desc: 'High-Performance Computing & GPU',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg',
  },
  {
    name: 'IDCloudHost',
    desc: 'Indonesian Cloud Provider',
    logo: 'https://idcloudhost.com/wp-content/uploads/2018/12/Logo-IDcloudhost.png',
  },
  {
    name: 'Ubuntu',
    desc: 'Open Source Linux OS',
    logo: 'https://assets.ubuntu.com/v1/29985a98-ubuntu-logo32.png',
  },
];


export default function Partners() {
  return (
    <section id="partners" className="section">
      <motion.div
        className="container space-y-6"
        variants={containerVar}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <HiMiniBuildingOffice2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold md:text-3xl">Partner & Laboratorium</h2>
        </div>
        <p className="max-w-2xl opacity-80">
          Kami berkolaborasi dengan laboratorium kampus dan mitra industri untuk memastikan
          pengalaman praktik mendekati dunia kerja nyata.
        </p>

        <motion.div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          variants={containerVar}
        >
          {partners.map((p) => (
            <motion.div
              key={p.name}
              variants={cardVar}
              className="
                flex flex-col items-center justify-center gap-2 rounded-xl border border-border
                bg-background p-4 shadow-sm transition hover:shadow-md
              "
              whileHover={{ y: -3, scale: 1.03 }}
            >
              <div className="h-16 w-16 overflow-hidden rounded-full border border-border bg-surface">
                <img
                  src={p.logo}
                  alt={p.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-center">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs opacity-70">{p.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
