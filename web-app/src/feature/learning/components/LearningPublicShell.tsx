import { type ReactNode } from 'react';
import { motion } from 'motion/react';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';

interface LearningPublicShellProps {
  eyebrow: string;
  title: string;
  description: string;
  leftMeta?: ReactNode;
  rightPanel?: ReactNode;
  children: ReactNode;
}

export function LearningPublicShell({
  eyebrow,
  title,
  description,
  leftMeta,
  rightPanel,
  children,
}: LearningPublicShellProps) {
  return (
    <div className="min-h-screen max-w-[1536px] mx-auto border border-black/10 bg-[#F7F4EC]">
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="fixed top-0 left-0 right-0 z-50 flex h-1 max-w-[1536px] mx-auto origin-left"
      >
        <div className="flex-1 bg-blue-500" />
        <div className="flex-1 bg-cyan-500" />
        <div className="flex-1 bg-purple-500" />
        <div className="flex-1 bg-pink-500" />
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-accent" />
        <div className="flex-1 bg-orange-500" />
      </motion.div>

      <section className="grid min-h-[42vh] grid-cols-1 overflow-hidden border-b border-black/10 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden bg-[#F7F4EC] px-4 py-16 md:px-8 lg:px-12 lg:py-20">
          <div className="absolute inset-y-0 right-0 hidden w-px bg-gradient-to-b from-transparent via-black/10 to-transparent xl:block" />
          <div className="absolute left-[-8%] top-[-12%] h-64 w-64 rounded-full bg-[#29E68C]/10 blur-3xl" />
          <div className="absolute bottom-[-18%] right-[8%] h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <LayoutUI.Column gap="gap-6" className="relative z-10 max-w-4xl">
            <LayoutUI.Column gap="gap-3">
              <Text className="font-['Outfit'] text-xs font-semibold uppercase tracking-[0.32em] text-[#29E68C]">
                {eyebrow}
              </Text>
              <Text as="h1" className="max-w-4xl font-['Sora'] text-4xl font-bold leading-tight text-[#04090C] md:text-5xl xl:text-6xl">
                {title}
              </Text>
              <Text className="max-w-2xl text-base leading-7 text-black/65 md:text-lg">
                {description}
              </Text>
            </LayoutUI.Column>
            {leftMeta}
          </LayoutUI.Column>
        </div>

        <div
          className="relative flex items-center overflow-hidden px-4 py-10 md:px-8 lg:px-12"
          style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1A0B2E 100%)' }}
        >
          <motion.div
            animate={{
              opacity: [0.55, 0.8, 0.55],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 20% 20%, rgba(41, 230, 140, 0.18), transparent 35%), radial-gradient(circle at 80% 30%, rgba(56, 189, 248, 0.16), transparent 30%), radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.12), transparent 32%)',
            }}
          />
          <div className="relative z-10 w-full">
            {rightPanel}
          </div>
        </div>
      </section>

      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-2 origin-left"
      >
        <div className="flex-1 bg-blue-500" />
        <div className="flex-1 bg-cyan-500" />
        <div className="flex-1 bg-purple-500" />
        <div className="flex-1 bg-pink-500" />
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-emerald-500" />
        <div className="flex-1 bg-accent" />
      </motion.div>

      <div className="bg-[#04090C] py-8 max-md:py-6 flex flex-col items-center gap-2">
        <div className="relative w-full max-w-3xl mx-auto h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#29E68C] to-transparent" />
          <div className="absolute inset-0 blur-md bg-gradient-to-r from-transparent via-[#29E68C] to-transparent opacity-60" />
        </div>
        <div className="relative w-1/2 max-w-xs mx-auto h-px mt-1.5 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#29E68C] to-transparent" />
        </div>
      </div>

      <div className="px-4 py-10 md:px-8 lg:px-12">
        {children}
      </div>
    </div>
  );
}
