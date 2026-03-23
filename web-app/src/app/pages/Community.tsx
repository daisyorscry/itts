import { motion } from 'motion/react';
import { MessageSquare, Rocket, Calendar, Code, Users, Star } from 'lucide-react';
import { Link } from 'react-router';

export function Community() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-black text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Join Our <span className="text-accent">Growing Community</span>
            </h1>
            <p className="text-xl text-white/70">
              Connect with fellow learners, share knowledge, and build amazing projects together. This is where your tech journey becomes collaborative.
            </p>
          </div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: 'Join Discord',
                description: 'Chat, collaborate, and get real-time help from mentors and peers.',
                action: 'Join Server',
                color: 'from-blue-500 to-purple-500',
              },
              {
                icon: Calendar,
                title: 'Attend Events',
                description: 'Workshops, meetups, and hackathons happening every month.',
                action: 'View Events',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: Code,
                title: 'Contribute',
                description: 'Build open-source projects and contribute to community resources.',
                action: 'Get Started',
                color: 'from-orange-500 to-red-500',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card p-8 rounded-3xl border border-border hover:border-accent/50 transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6`}>
                  <card.icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                <p className="text-foreground/70 mb-6">{card.description}</p>
                <button className="px-6 py-2.5 bg-accent text-black rounded-full hover:bg-accent/90 transition-colors font-medium">
                  {card.action}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Join ITTS Community?</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              More than just learning—it's about belonging to something bigger.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Access to industry mentors',
              'Collaborative project opportunities',
              'Regular workshops and bootcamps',
              'Networking with like-minded peers',
              'Career guidance and support',
              'Free learning resources',
            ].map((reason, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center space-x-3 bg-white/5 border border-white/10 p-4 rounded-xl"
              >
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black font-bold">✓</span>
                </div>
                <span>{reason}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Highlights */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Offer</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-8 md:p-12 rounded-3xl border border-border">
              <Rocket className="text-accent mb-6" size={48} />
              <h3 className="text-2xl font-bold mb-4">Structured Learning Paths</h3>
              <p className="text-foreground/70">
                Three comprehensive tracks designed by industry experts: Networking, DevSecOps, and Programming.
              </p>
            </div>
            <div className="bg-card p-8 md:p-12 rounded-3xl border border-border">
              <Users className="text-accent mb-6" size={48} />
              <h3 className="text-2xl font-bold mb-4">Peer-to-Peer Support</h3>
              <p className="text-foreground/70">
                Learn from each other, work on group projects, and build lasting connections in the tech industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Member Stories</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Andi Setiawan',
                role: 'DevOps Engineer at Gojek',
                quote: 'ITTS Community gave me the practical skills and confidence to land my dream job.',
              },
              {
                name: 'Rina Kusuma',
                role: 'Full-Stack Developer',
                quote: 'The mentorship and hands-on projects here are unmatched. Best decision I made!',
              },
              {
                name: 'Budi Hartono',
                role: 'Network Administrator',
                quote: 'From zero to hero. The community support made all the difference in my journey.',
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background p-6 rounded-2xl border border-border"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-accent fill-accent" size={16} />
                  ))}
                </div>
                <p className="text-foreground/80 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-foreground/60">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Be Part of Something Big?</h2>
          <p className="text-xl text-white/70 mb-8">
            Join our Discord community and start connecting today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-4 bg-accent text-black rounded-full font-semibold hover:bg-accent/90 transition-colors">
              Join Discord
            </button>
            <Link
              to="/program"
              className="px-10 py-4 bg-white/10 border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition-colors inline-flex items-center justify-center"
            >
              View Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
