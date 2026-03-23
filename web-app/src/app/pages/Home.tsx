import { motion } from "motion/react";
import { SuperhumanSection } from "@components/home/SuperhumanSection";
import { HeroSection } from "@components/home/HeroSection";
import { WhatYoullMaster } from "@components/home/WhatYoullMaster";
import { BentoStats } from "@components/home/BentoStats";
import { HowItWorksSection } from "@components/home/HowItWorksSection";
import { CTASection } from "@components/home/CTASection";
import { FAQSection } from "@components/home/FAQSection";
import { useNavigate } from "react-router";

export function Home() {
  const navigate = useNavigate();

  const handleRegisterOpen = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen border max-w-[1536px] mx-auto">
      {/* Decorative top bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.3,
        }}
        className="fixed top-0 left-0 right-0 h-1 flex z-50 max-w-[1536px] mx-auto origin-left"
      >
        <div className="flex-1 bg-blue-500" />
        <div className="flex-1 bg-purple-500" />
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-accent" />
        <div className="flex-1 bg-orange-500" />
      </motion.div>

      <HeroSection onRegisterOpen={handleRegisterOpen} />

      {/* Colorful separator */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="h-2 flex origin-left"
      >
        <div className="flex-1 bg-blue-500" />
        <div className="flex-1 bg-cyan-500" />
        <div className="flex-1 bg-purple-500" />
        <div className="flex-1 bg-pink-500" />
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-emerald-500" />
        <div className="flex-1 bg-accent" />
      </motion.div>

      <WhatYoullMaster />

      {/* Green gradient divider */}
      <div className="bg-[#04090C] py-10 max-md:py-6 flex flex-col items-center gap-2">
        <div className="relative w-full max-w-3xl mx-auto h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#29E68C] to-transparent" />
          <div className="absolute inset-0 blur-md bg-gradient-to-r from-transparent via-[#29E68C] to-transparent opacity-60" />
        </div>
        <div className="relative w-1/2 max-w-xs mx-auto h-px mt-1.5 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#29E68C] to-transparent" />
        </div>
      </div>
      <HowItWorksSection />
      <BentoStats />

      <SuperhumanSection />
      <FAQSection />
      <CTASection onRegisterOpen={handleRegisterOpen} />
    </div>
  );
}