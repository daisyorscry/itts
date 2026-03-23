import { motion } from 'motion/react';
import { Network, Shield, Code, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@components/ui/accordion';

export function Program() {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const tracks = [
    {
      id: 'networking',
      icon: Network,
      title: 'Networking',
      subtitle: 'Infrastructure & System Administration',
      color: 'from-blue-500 to-cyan-500',
      modules: [
        'Network Fundamentals & OSI Model',
        'Routing & Switching (Cisco/MikroTik)',
        'Network Security & Firewalls',
        'Cloud Networking (AWS/GCP)',
        'Wireless Networks & IoT',
        'Network Monitoring & Troubleshooting',
      ],
    },
    {
      id: 'devsecops',
      icon: Shield,
      title: 'DevSecOps',
      subtitle: 'Security-First Development & Operations',
      color: 'from-purple-500 to-pink-500',
      modules: [
        'Linux System Administration',
        'CI/CD Pipelines (Jenkins/GitLab)',
        'Containerization (Docker & Kubernetes)',
        'Infrastructure as Code (Terraform)',
        'Security Automation & SAST/DAST',
        'Cloud Security Best Practices',
      ],
    },
    {
      id: 'programming',
      icon: Code,
      title: 'Programming',
      subtitle: 'Full-Stack Development',
      color: 'from-green-500 to-emerald-500',
      modules: [
        'Programming Fundamentals (Python/JS)',
        'Web Development (HTML/CSS/JavaScript)',
        'Frontend Frameworks (React/Vue)',
        'Backend Development (Node.js/Django)',
        'Database Design & Management',
        'RESTful APIs & GraphQL',
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Choose Your <span className="text-accent">Learning Track</span>
            </h1>
            <p className="text-xl text-white/70">
              Three comprehensive programs designed to take you from beginner to job-ready professional. Pick your path and start building your future.
            </p>
          </div>
        </div>
      </section>

      {/* Track Cards */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tracks.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-3xl border border-border hover:border-accent/50 transition-all overflow-hidden group"
              >
                <div className={`h-2 bg-gradient-to-r ${track.color}`} />
                <div className="p-6 sm:p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${track.color} flex items-center justify-center mb-6`}>
                    <track.icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{track.title}</h3>
                  <p className="text-foreground/60 mb-6">{track.subtitle}</p>
                  
                  <div className="space-y-2 mb-8">
                    <div className="text-sm font-semibold text-foreground/70 mb-3">What You'll Learn:</div>
                    {track.modules.slice(0, 3).map((module, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="text-accent flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-foreground/70">{module}</span>
                      </div>
                    ))}
                    <div className="text-sm text-accent">+ {track.modules.length - 3} more modules</div>
                  </div>

                  <Link
                    to="/login"
                    className="block w-full px-6 py-3 bg-accent text-black text-center rounded-full font-semibold hover:bg-accent/90 transition-colors"
                  >
                    Enroll Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Learning Journey</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              A structured path from fundamentals to advanced mastery
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  step: '01',
                  title: 'Foundation',
                  duration: 'Weeks 1-4',
                  description: 'Learn the fundamentals and core concepts. Build a strong base.',
                },
                {
                  step: '02',
                  title: 'Practice',
                  duration: 'Weeks 5-8',
                  description: "Hands-on projects and exercises. Apply what you've learned.",
                },
                {
                  step: '03',
                  title: 'Build',
                  duration: 'Weeks 9-12',
                  description: 'Work on real-world projects. Start building your portfolio.',
                },
                {
                  step: '04',
                  title: 'Master',
                  duration: 'Weeks 13+',
                  description: 'Advanced topics, specialization, and career preparation.',
                },
              ].map((phase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:gap-6 sm:p-6"
                >
                  <div className="text-5xl font-bold leading-none text-accent/20 sm:text-6xl">{phase.step}</div>
                  <div className="flex-1">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-2xl font-bold">{phase.title}</h3>
                      <span className="w-fit rounded-full bg-white/5 px-3 py-1 text-sm text-white/60">
                        {phase.duration}
                      </span>
                    </div>
                    <p className="text-white/70">{phase.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-card border border-border rounded-2xl px-4 sm:px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Do I need prior experience?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70">
                No! Our programs are designed for all levels. We start with fundamentals and progressively build up to advanced topics.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-card border border-border rounded-2xl px-4 sm:px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                How long does each program take?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70">
                Each track is designed to be completed in 3-6 months, depending on your pace and commitment. We offer flexible learning schedules.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-card border border-border rounded-2xl px-4 sm:px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Can I switch tracks?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70">
                Yes! Many members explore multiple tracks. You're welcome to switch or pursue multiple paths simultaneously.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-card border border-border rounded-2xl px-4 sm:px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">
                Is there a certificate?
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70">
                Yes, you'll receive a certificate of completion for each track, plus digital badges for milestone achievements.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-lg text-foreground/70 mb-8">
            Choose your track and begin your journey to becoming a tech professional.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-10 py-4 bg-accent text-black rounded-full font-semibold hover:bg-accent/90 transition-colors"
          >
            <span>Enroll Now</span>
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
