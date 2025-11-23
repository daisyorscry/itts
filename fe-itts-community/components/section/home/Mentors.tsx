'use client';

import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';
import { HiMiniUserPlus } from 'react-icons/hi2';

const containerVar: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.08 } },
};

const cardVar: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
};

const mentors = [
  {
    name: 'Networking Lead',
    role: 'CCNA track & lab',
    image: '/mentors/networking.jpg',
  },
  {
    name: 'DevSecOps Lead',
    role: 'CI/CD & Kubernetes',
    image: '/mentors/devsecops.jpg',
  },
  {
    name: 'Programming Lead',
    role: 'Go & Web Development',
    image: '/mentors/programming.jpg',
  },
];

export default function Mentors() {
  return (
    <section id="mentors" className="section">
      <motion.div
        className="container space-y-6"
        variants={containerVar}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <h2 className="text-2xl font-semibold md:text-3xl">Mentor</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {mentors.map((m) => (
            <motion.div
              key={m.name}
              variants={cardVar}
              whileHover={{
                y: -4,
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              }}
              className="rounded-xl border border-border bg-background shadow-sm transition"
            >
              <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4">
                <strong className="block text-lg">{m.name}</strong>
                <div className="text-sm opacity-80">{m.role}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action untuk jadi mentor */}
        <motion.div
          variants={cardVar}
          className="rounded-xl border border-dashed border-border bg-surface p-5 text-center"
        >
          <div className="flex flex-col items-center gap-3">
            <HiMiniUserPlus className="h-8 w-8 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Ingin Jadi Mentor?</h3>
              <p className="mt-1 text-sm opacity-80">
                Kamu bisa mendaftar sebagai mentor dengan menggunakan email <b>@itts.ac.id</b>.
              </p>
            </div>
            <button className="btn btn-primary mt-3">Daftar Sebagai Mentor</button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
