"use client";

import LocationModal from "@/components/ui/LocationModal";
import { useMemo } from "react";
import {
  HiMiniEnvelope,
  HiMiniArrowUpRight,
  HiMiniUserPlus,
} from "react-icons/hi2";

export default function SiteFooter({ onRegister }: { onRegister: () => void }) {
  const year = useMemo(() => new Date().getFullYear(), []);

  const quickLinks = [
    { label: "Tentang", href: "#about" },
    { label: "Program", href: "#program" },
    { label: "Event", href: "#events" },
    { label: "Mentor", href: "#mentors" },
    { label: "Partner", href: "#partners" },
  ];

  return (
    <footer className="border-t border-border bg-background text-sm">
      <div className="container grid gap-8 px-5 py-10 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <span className="inline-block rounded-md border border-border px-2 py-1">
              ITTS
            </span>
            <span>Community</span>
          </div>
          <p className="opacity-80">
            Komunitas Networking, DevSecOps, dan Programming — Institut
            Teknologi Tangerang Selatan.
          </p>

          <button
            onClick={onRegister}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 font-medium text-on-primary"
          >
            <HiMiniUserPlus className="h-4 w-4" />
            Daftar Anggota
          </button>
        </div>

        {/* Quick links */}
        <nav className="grid grid-cols-2 gap-3 md:grid-cols-1">
          {quickLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="inline-flex items-center gap-1 opacity-90 hover:opacity-100"
            >
              <HiMiniArrowUpRight className="h-4 w-4" />
              {l.label}
            </a>
          ))}
          <a
            href="/docs"
            className="inline-flex items-center gap-1 opacity-90 hover:opacity-100"
          >
            <HiMiniArrowUpRight className="h-4 w-4" />
            Dokumentasi
          </a>
          <a
            href="/blog"
            className="inline-flex items-center gap-1 opacity-90 hover:opacity-100"
          >
            <HiMiniArrowUpRight className="h-4 w-4" />
            Blog
          </a>
        </nav>

        {/* Contact */}
        <div className="space-y-2">
          <div className="font-medium">Kontak</div>
          <div className="flex items-start gap-2 opacity-90">
            <HiMiniEnvelope className="mt-0.5 h-4 w-4 shrink-0" />
            <a href="mailto:community@itts.ac.id" className="hover:underline">
              ittscommunity@itts.ac.id
            </a>
          </div>
          <LocationModal />
        </div>
      </div>

      {/* Lower bar */}
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-3 px-5 py-4 md:flex-row">
          <span className="opacity-80">© {year} ITTS Community</span>
          <div className="flex items-center gap-3">
            <a href="/privacy" className="opacity-80 hover:opacity-100">
              Kebijakan Privasi
            </a>
            <span className="opacity-30">•</span>
            <a href="/terms" className="opacity-80 hover:opacity-100">
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
