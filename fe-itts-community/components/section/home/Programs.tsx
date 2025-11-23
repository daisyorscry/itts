'use client';

import { motion, type Variants } from 'framer-motion';
import { HiMiniDevicePhoneMobile, HiMiniCloud, HiMiniCodeBracketSquare } from 'react-icons/hi2';

const containerVar: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardVar: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
};

export default function Programs() {
  const data = [
    {
      title: 'Networking',
      desc: 'Routing & switching, subnetting, VLAN, Mikrotik/Cisco lab.',
      icon: <HiMiniDevicePhoneMobile className="h-6 w-6 text-primary" />,
    },
    {
      title: 'DevSecOps',
      desc: 'CI/CD, container, Kubernetes, observability, security hardening.',
      icon: <HiMiniCloud className="h-6 w-6 text-primary" />,
    },
    {
      title: 'Programming',
      desc: 'Go, JS/TS, backend API, frontend app, clean code & testing.',
      icon: <HiMiniCodeBracketSquare className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <section id="program" className="section">
      <motion.div
        className="container space-y-6"
        variants={containerVar}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-2xl font-semibold md:text-3xl">Program</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.map((p) => (
            <motion.article
              key={p.title}
              variants={cardVar}
              whileHover={{ y: -4, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}
              className="rounded-xl border border-border bg-background p-5 shadow-sm transition"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface">
                  {p.icon}
                </span>
                <h3 className="font-semibold text-lg">{p.title}</h3>
              </div>
              <p className="text-sm opacity-80">{p.desc}</p>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
