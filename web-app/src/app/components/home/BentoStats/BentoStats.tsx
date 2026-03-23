import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Users, GitBranch, Trophy, Zap, Star, Clock, Globe } from 'lucide-react';
import { CounterDisplay } from './CounterDisplay';
import { trackData, recentMembers, trackColor, weekActivity, dayLabels } from './data';

export function BentoStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      className="bento-stats-section pt-[140px] pb-[160px] max-md:pt-[80px] max-md:pb-[100px]"
      style={{
        background: '#ECE9DE',
        position: 'relative',
      }}
    >
      <div className="mx-auto px-6 sm:px-8 lg:px-12 relative" style={{ maxWidth: '1600px' }} ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 'clamp(52px, 7vw, 90px)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 0.95,
                textTransform: 'uppercase',
              }}
            >
              <span style={{ display: 'block', color: '#04090C' }}>NUMBERS THAT</span>
              <span style={{ display: 'block', color: '#29E68C' }}>DON'T LIE.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="text-foreground/50 text-sm max-w-xs leading-relaxed"
            >
              An active community learning, coding, and deploying together every day.
            </motion.p>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-auto">

          {/* Card 1 — Big stat: Total Members (col-span 4, row 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0 }}
            className="lg:col-span-4 bg-[#04090C] rounded-3xl p-7 flex flex-col justify-between min-h-[200px]"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-accent" />
              <span className="text-white/40 text-xs uppercase tracking-widest">Total Members</span>
            </div>
            <CounterDisplay value={377} suffix="+" label="registered across all tracks" started={inView} duration={2200} />
            <div className="mt-4 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-accent text-xs">+12 joined this week</span>
            </div>
          </motion.div>

          {/* Card 2 — Track Distribution (col-span 5, row 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="lg:col-span-5 bg-[#04090C] rounded-3xl p-7 min-h-[200px]"
          >
            <div className="flex items-center gap-2 mb-5">
              <Globe size={16} className="text-white/40" />
              <span className="text-white/40 text-xs uppercase tracking-widest">Track Distribution</span>
            </div>
            <div className="flex flex-col gap-3">
              {trackData.map((t) => (
                <div key={t.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/70 text-sm">{t.label}</span>
                    <span className="text-white/40 text-xs font-mono">{t.members} members</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: t.color }}
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${t.pct}%` } : {}}
                      transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3 — Weekly Activity Chart (col-span 3, row 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="lg:col-span-3 bg-accent rounded-3xl p-7 min-h-[200px] flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-black/60" />
              <span className="text-black/60 text-xs uppercase tracking-widest">Activity</span>
            </div>
            <div className="text-black font-bold text-3xl">+24%</div>
            <div className="text-black/60 text-xs mb-4">vs last week</div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1 h-10">
              {weekActivity.map((val, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-sm"
                  initial={{ scaleY: 0 }}
                  animate={inView ? { scaleY: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.06, ease: 'easeOut' }}
                  style={{ transformOrigin: 'bottom', height: `${(val / 100) * 100}%`, backgroundColor: 'rgba(0,0,0,0.25)' }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {dayLabels.map(d => (
                <span key={d} className="text-black/40 text-[9px] flex-1 text-center">{d}</span>
              ))}
            </div>
          </motion.div>

          {/* Card 4 — Commits stat (col-span 3, row 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3 bg-[#04090C] rounded-3xl p-7 min-h-[180px] flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-4">
              <GitBranch size={16} className="text-white/40" />
              <span className="text-white/40 text-xs uppercase tracking-widest">Commits</span>
            </div>
            <CounterDisplay value={2841} label="total commits from all members" started={inView} duration={2500} />
          </motion.div>

          {/* Card 5 — Recent Members (col-span 5, row 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="lg:col-span-5 bg-[#04090C] rounded-3xl p-7 min-h-[180px]"
          >
            <div className="flex items-center gap-2 mb-5">
              <Clock size={16} className="text-white/40" />
              <span className="text-white/40 text-xs uppercase tracking-widest">Recent Members</span>
            </div>
            <div className="flex flex-col gap-3">
              {recentMembers.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                    style={{ backgroundColor: trackColor[m.track] ?? '#29E68C' }}
                  >
                    {m.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{m.name}</div>
                    <div className="text-white/30 text-xs">{m.track}</div>
                  </div>
                  <span className="text-white/25 text-xs flex-shrink-0">{m.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Card 6 — Projects Shipped (col-span 2, row 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 bg-[#04090C] rounded-3xl p-7 min-h-[180px] flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-white/40 text-xs uppercase tracking-widest">Projects</span>
            </div>
            <CounterDisplay value={94} label="capstones completed" started={inView} duration={1800} />
          </motion.div>

          {/* Card 7 — Satisfaction / Wide banner (col-span 2, row 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="lg:col-span-2 bg-white border border-black/10 rounded-3xl p-7 min-h-[180px] flex flex-col justify-between"
          >
            <div className="flex items-center gap-2 mb-4">
              <Star size={16} className="text-foreground/40" />
              <span className="text-foreground/40 text-xs uppercase tracking-widest">Rating</span>
            </div>
            <div>
              <div className="text-5xl font-bold text-foreground tracking-tighter">4.9<span className="text-accent text-3xl">/5</span></div>
              <div className="text-foreground/40 text-xs mt-1">from active members</div>
            </div>
            <div className="flex gap-0.5 mt-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={12} className={s <= 5 ? 'text-accent fill-accent' : 'text-foreground/20'} />
              ))}
            </div>
          </motion.div>

        </div>
      </div>

    </section>
  );
}
