import { Outlet } from 'react-router';
import { useState } from 'react';
import { Github, Linkedin, Twitter, Mail, Instagram, MessageCircle } from 'lucide-react';
import { ScrollToTop } from '../ScrollToTop';
import { Navbar } from '../navbar/Navbar';
import { NavbarLogo } from '../navbar/NavbarLogo';
import { NavbarLinks } from '../navbar/NavbarLinks';
import { NavbarCTA } from '../navbar/NavbarCTA';
import { NavbarMobileToggle } from '../navbar/NavbarMobileToggle';
import { NavbarMobileMenu } from '../navbar/NavbarMobileMenu';
import { Footer } from '../footer/Footer';
import { FooterLinksGrid } from '../footer/FooterLinksGrid';
import { FooterLinkGroup } from '../footer/FooterLinkGroup';
import { FooterBottom } from '../footer/FooterBottom';
import { FooterLogo } from '../footer/FooterLogo';
import { FooterSocial } from '../footer/FooterSocial';
import { FooterCopyright } from '../footer/FooterCopyright';
import { FooterLegal } from '../footer/FooterLegal';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Events', path: '/events' },
  { name: 'Docs', path: '/docs' },
];

const footerLinks = {
  PLATFORM: [
    { label: 'About Us', to: '/about' },
    { label: 'Community', to: '/community' },
    { label: 'Programs', to: '/program' },
    { label: 'Events', to: '/events' },
    { label: 'Mentors', to: '#' },
    { label: 'Partners', to: '#' },
  ],
  RESOURCES: [
    { label: 'Documentation', to: '/docs' },
    { label: 'Blog', to: '/blog' },
    { label: 'FAQ', to: '#' },
    { label: 'Support', to: '#' },
    { label: 'Changelog', to: '#' },
    { label: 'API Reference', to: '#' },
  ],
  COMMUNITY: [
    { label: 'Discord Server', to: 'https://discord.gg/itts', external: true },
    { label: 'GitHub', to: '#' },
    { label: 'Code of Conduct', to: '#' },
    { label: 'Join Us', to: '#' },
    { label: 'Newsletter', to: '#' },
  ],
};

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: MessageCircle, href: 'https://discord.gg/itts', label: 'Discord' },
  { icon: Mail, href: '#', label: 'Email' },
];

const legalLinks = [
  { label: 'Terms of Service', to: '#' },
  { label: 'Privacy Policy', to: '#' },
  { label: 'Cookie Policy', to: '#' },
  { label: 'DMCA Policy', to: '#' },
];

export function RootLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col overflow-x-clip">
      <ScrollToTop />
      
      <Navbar>
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <NavbarLogo />
            <NavbarLinks links={navLinks} />
            <NavbarCTA />
            <NavbarMobileToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          </div>
        </div>
        <NavbarMobileMenu
          isOpen={isMobileMenuOpen}
          links={navLinks}
          onLinkClick={() => setIsMobileMenuOpen(false)}
        />
      </Navbar>

      <main className="flex-1 overflow-x-clip">
        <Outlet />
      </main>

      <Footer>
        <FooterLinksGrid>
          {Object.entries(footerLinks).map(([category, links], idx) => (
            <FooterLinkGroup
              key={category}
              title={category}
              links={links}
              delay={idx * 0.1}
            />
          ))}
        </FooterLinksGrid>

        <FooterBottom>
          <FooterLogo />
          <FooterSocial socialLinks={socialLinks} />
        </FooterBottom>

        <FooterCopyright />

        <FooterLegal links={legalLinks} />
      </Footer>
    </div>
  );
}
