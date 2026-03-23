import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './ui/utils';

interface QueryStatePanelProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  tone?: 'default' | 'error';
  centered?: boolean;
  iconClassName?: string;
  className?: string;
}

export function QueryStatePanel({
  icon: Icon,
  title,
  description,
  tone = 'default',
  centered = true,
  iconClassName,
  className,
}: QueryStatePanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn(
        'rounded-3xl border p-12',
        centered && 'text-center',
        tone === 'error'
          ? 'border-red-500/30 bg-red-500/10 text-[#04090C]'
          : 'border-transparent bg-black/5 text-[#04090C]',
        className
      )}
    >
      {Icon ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.06, duration: 0.18, ease: 'easeOut' }}
        >
          <Icon className={cn('mx-auto mb-4 size-16 text-black/20', iconClassName)} />
        </motion.div>
      ) : null}
      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.18, ease: 'easeOut' }}
        className="font-['Outfit'] text-base font-medium text-[#04090C]"
      >
        {title}
      </motion.h3>
      {description ? (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.18, ease: 'easeOut' }}
          className="mt-2 font-['Outfit'] text-sm text-black/60"
        >
          {description}
        </motion.p>
      ) : null}
    </motion.section>
  );
}
