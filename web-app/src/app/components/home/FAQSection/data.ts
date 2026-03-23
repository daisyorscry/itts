export interface FAQItem {
  q: string;
  a: string;
  tag: string;
}

export const faqs: FAQItem[] = [
  {
    tag: 'General',
    q: 'What exactly is ITTS Community?',
    a: 'ITTS Community is a community-based technology learning platform. Not just another online course — you learn together, code together, and deploy together with people who share the same goals. There are 3 tracks: Networking, DevSecOps, and Programming.',
  },
  {
    tag: 'General',
    q: 'Do I need an IT background to join?',
    a: 'Not necessarily. Each track starts from fundamentals — you can start from zero as long as you have the intention and consistency. The important thing is being able to use a computer and willing to learn.',
  },
  {
    tag: 'Program',
    q: 'What\'s the difference between the 3 tracks? Which one suits me?',
    a: 'Networking: great if you\'re interested in infrastructure, networks, sysadmin. DevSecOps: if you like automation, CI/CD, containers, cloud + security. Programming: if you want to become a developer — backend, frontend, or full-stack. If still confused, start with Programming because the skills are most transferable.',
  },
  {
    tag: 'Program',
    q: 'How long does it take to complete one track?',
    a: 'Average 4–6 months if you\'re consistent with 1–2 hours per day. But there\'s no deadline — you can learn at your own pace. The important thing is to complete the capstone project and make it production-ready.',
  },
  {
    tag: 'Community',
    q: 'How does the learning work? Live classes or on-demand?',
    a: 'Both. There are on-demand modules you can access anytime, plus weekly live sessions, weekly code reviews from mentors, and an active Discord group. You won\'t be learning alone.',
  },
  {
    tag: 'Community',
    q: 'Who are the mentors? Are they qualified?',
    a: 'Our mentors are active practitioners — not just teachers who only teach theory. Some work at Tokopedia, Gojek, Telkom, SaaS startups, and cloud companies. They review your code, give real feedback, and share real industry experience.',
  },
  {
    tag: 'Pricing',
    q: 'Free or paid?',
    a: 'There\'s a free tier for basic content access and Discord community. For full access — live sessions, 1-on-1 mentor, code reviews, and capstone certificate — there\'s an affordable paid tier. Check the Program page for pricing details.',
  },
  {
    tag: 'Pricing',
    q: 'What do I get after completion?',
    a: 'You get: a capstone project you can showcase on GitHub/portfolio, track completion certificate, access to internal community job board, and network with alumni already working in the industry. The most valuable? Skills and connections you build during the process.',
  },
];

export const TAG_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  General:   { color: '#ECE9DE',   bg: 'rgba(236,233,222,0.06)', border: 'rgba(236,233,222,0.14)' },
  Program:   { color: '#38BDF8',   bg: 'rgba(56,189,248,0.08)',  border: 'rgba(56,189,248,0.22)'  },
  Community: { color: '#F472B6',   bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.22)' },
  Pricing:     { color: '#29E68C',   bg: 'rgba(41,230,140,0.08)',  border: 'rgba(41,230,140,0.22)'  },
};
