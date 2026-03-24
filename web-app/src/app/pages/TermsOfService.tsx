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

export function TermsOfService() {
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
              Terms of Service
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
                  Welcome to ITTS Community ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our website, services, and educational programs.
                </p>
                <p>
                  By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access our services.
                </p>
              </div>
            </div>

            {/* Acceptance */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                2. Acceptance of Terms
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  By creating an account, participating in our programs, or accessing our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                </p>
                <p>
                  We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the service after any such changes constitutes your acceptance of the new Terms.
                </p>
              </div>
            </div>

            {/* User Accounts */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                3. User Accounts
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.
                </p>
                <p>
                  You are responsible for safeguarding your password and for all activities that occur under your account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Not share your account with others</li>
                  <li>Be fully responsible for all activities under your account</li>
                </ul>
              </div>
            </div>

            {/* Educational Content */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                4. Educational Content & Intellectual Property
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  All course materials, documentation, videos, and other content provided through ITTS Community are owned by us or our licensors and are protected by intellectual property laws.
                </p>
                <p>
                  You are granted a limited, non-exclusive, non-transferable license to access and use our educational materials for personal, non-commercial learning purposes only.
                </p>
                <p className="font-semibold" style={{ color: '#04090C' }}>
                  You may not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Reproduce, distribute, or sell our content</li>
                  <li>Create derivative works from our materials</li>
                  <li>Remove copyright or proprietary notices</li>
                  <li>Share access credentials with unauthorized users</li>
                </ul>
              </div>
            </div>

            {/* Code of Conduct */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                5. Community Code of Conduct
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  We are committed to providing a welcoming and inclusive environment. All users must:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Treat others with respect and professionalism</li>
                  <li>Refrain from harassment, discrimination, or hate speech</li>
                  <li>Not post spam, malicious content, or illegal materials</li>
                  <li>Respect the privacy of other community members</li>
                  <li>Follow applicable laws and regulations</li>
                </ul>
                <p>
                  Violation of this code may result in suspension or termination of your account.
                </p>
              </div>
            </div>

            {/* Payments & Refunds */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                6. Payments & Refunds
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  Certain features or programs may require payment. All fees are stated in Indonesian Rupiah (IDR) unless otherwise specified.
                </p>
                <p>
                  Refund requests must be submitted within 7 days of purchase. We reserve the right to approve or deny refund requests on a case-by-case basis.
                </p>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                7. Limitation of Liability
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  ITTS Community is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free.
                </p>
                <p>
                  To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
                </p>
              </div>
            </div>

            {/* Termination */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                8. Termination
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms.
                </p>
                <p>
                  Upon termination, your right to use the service will cease immediately. All provisions of the Terms which by their nature should survive termination shall survive.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-6" style={{ borderTop: '1px solid rgba(4, 9, 12, 0.08)' }}>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                9. Contact Us
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  If you have any questions about these Terms, please contact us at:
                </p>
                <p className="font-semibold" style={{ color: '#29E68C' }}>
                  legal@itts.community
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
