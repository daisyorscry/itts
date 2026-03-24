import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: easeOutExpo },
};

export function PrivacyPolicy() {
  return (
    <div className="overflow-x-clip" style={{ background: '#ECE9DE' }}>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 mb-8 font-['Outfit'] font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#04090C' }}
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOutExpo }}
          >
            <h1 className="font-['Sora'] text-[clamp(36px,6vw,64px)] font-extrabold tracking-tight leading-[1.1] mb-4" style={{ color: '#04090C' }}>
              Privacy Policy
            </h1>
            <p className="font-['Outfit'] text-lg" style={{ color: 'rgba(4, 9, 12, 0.5)' }}>
              Last updated: March 17, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            {...fadeUp}
            className="rounded-3xl p-8 md:p-12 space-y-8"
            style={{ background: '#F7F4EC', border: '1px solid rgba(4, 9, 12, 0.08)' }}
          >
            {/* Introduction */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                1. Introduction
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  At ITTS Community, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
                <p>
                  Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </div>
            </div>

            {/* Information We Collect */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                2. Information We Collect
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p className="font-semibold" style={{ color: '#04090C' }}>
                  Personal Information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Profile information (bio, profile picture, social media links)</li>
                  <li>Learning track preferences and educational background</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                </ul>

                <p className="font-semibold" style={{ color: '#04090C' }}>
                  Automatically Collected Information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Usage data (pages visited, time spent, features used)</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Learning progress and course completion data</li>
                </ul>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                3. How We Use Your Information
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, operate, and maintain our educational services</li>
                  <li>Improve and personalize your learning experience</li>
                  <li>Process your transactions and manage your account</li>
                  <li>Send you course updates, newsletters, and important notifications</li>
                  <li>Respond to your comments, questions, and support requests</li>
                  <li>Analyze usage patterns to improve our platform</li>
                  <li>Prevent fraud and enhance security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </div>

            {/* Sharing Your Information */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                4. Sharing Your Information
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  We may share your information with:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><span className="font-semibold" style={{ color: '#04090C' }}>Service Providers:</span> Third-party vendors who perform services on our behalf (payment processing, email delivery, analytics)</li>
                  <li><span className="font-semibold" style={{ color: '#04090C' }}>Community Members:</span> Your profile information may be visible to other community members</li>
                  <li><span className="font-semibold" style={{ color: '#04090C' }}>Legal Requirements:</span> When required by law or to protect our rights</li>
                  <li><span className="font-semibold" style={{ color: '#04090C' }}>Business Transfers:</span> In connection with a merger, sale, or acquisition</li>
                </ul>
                <p className="font-semibold" style={{ color: '#04090C' }}>
                  We do not sell your personal information to third parties.
                </p>
              </div>
            </div>

            {/* Data Security */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                5. Data Security
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Restricted access to personal information</li>
                  <li>Secure authentication mechanisms</li>
                </ul>
                <p>
                  However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                6. Your Privacy Rights
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to or restrict certain processing activities</li>
                  <li>Withdraw consent at any time</li>
                  <li>Data portability (receive your data in a structured format)</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at privacy@itts.community
                </p>
              </div>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                7. Cookies & Tracking Technologies
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  We use cookies and similar tracking technologies to enhance your experience. You can control cookies through your browser settings.
                </p>
                <p>
                  For more information, please see our <Link to="/cookie-policy" className="font-semibold transition-opacity hover:opacity-80" style={{ color: '#29E68C' }}>Cookie Policy</Link>.
                </p>
              </div>
            </div>

            {/* Data Retention */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                8. Data Retention
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
                </p>
              </div>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                9. Children's Privacy
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  Our services are not intended for individuals under the age of 13. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-6" style={{ borderTop: '1px solid rgba(4, 9, 12, 0.08)' }}>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                10. Contact Us
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="font-semibold" style={{ color: '#29E68C' }}>
                  privacy@itts.community
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
