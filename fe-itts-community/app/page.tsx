"use client";

import { useState } from "react";
import RegisterDialog from "@/components/ui/RegisterDialog";
import Hero from "@/components/section/home/Hero";
import HighlightCta from "@/components/section/home/HighlightCta";
import About from "@/components/section/home/About";
import VisionMission from "@/components/section/home/VisionMission";
import Programs from "@/components/section/home/Programs";
import Routine from "@/components/section/home/Routine";
import UpcomingEvents from "@/components/section/home/UpcomingEvents";
import Mentors from "@/components/section/home/Mentors";
import CtaSignup from "@/components/section/home/CtaSignup";
import SiteFooter from "@/components/section/home/SiteFooter";
import Partners from "@/components/section/home/Partners";
import ThemeToggle from "@/components/button/ThemeButton";

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const openRegister = () => setOpen(true);
  const closeRegister = () => setOpen(false);

  return (
    <main>
      <Hero onRegister={openRegister} />
      <HighlightCta onRegister={openRegister} />
      <About />
      <VisionMission />
      <Programs />
      <Routine />
      <UpcomingEvents onRegister={openRegister} />
      <Mentors />
      <Partners />
      <CtaSignup onRegister={openRegister} />
      <SiteFooter onRegister={openRegister} />
      <RegisterDialog open={open} onClose={closeRegister} />
    </main>
  );
}
