import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export function DMCAPolicy() {
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
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-['Sora'] text-[clamp(36px,6vw,64px)] font-extrabold tracking-tight leading-[1.1] mb-4" style={{ color: '#04090C' }}>
              DMCA Policy
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
                1. Overview
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  ITTS Community respects the intellectual property rights of others and expects its users to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and similar international copyright laws.
                </p>
                <p>
                  This policy outlines our procedures for addressing claims of copyright infringement and our response to valid takedown notices.
                </p>
              </div>
            </div>

            {/* Copyright Infringement */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                2. Reporting Copyright Infringement
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement and is accessible on our platform, please notify our Copyright Agent with the following information:
                </p>
                
                <div className="p-6 rounded-xl space-y-3" style={{ background: '#e5e4d8', border: '1px solid rgba(4, 9, 12, 0.08)' }}>
                  <p className="font-semibold" style={{ color: '#04090C' }}>
                    Required Information for DMCA Notice:
                  </p>
                  <ul className="list-decimal pl-6 space-y-2">
                    <li>A physical or electronic signature of the copyright owner or authorized representative</li>
                    <li>Identification of the copyrighted work claimed to have been infringed</li>
                    <li>Identification of the material that is claimed to be infringing, including its location on our platform</li>
                    <li>Your contact information (address, telephone number, and email address)</li>
                    <li>A statement that you have a good faith belief that the disputed use is not authorized</li>
                    <li>A statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* DMCA Agent */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                3. DMCA Designated Agent
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  All DMCA notices should be sent to our designated Copyright Agent:
                </p>
                
                <div className="p-6 rounded-xl" style={{ background: 'rgba(41, 230, 140, 0.08)', border: '1px solid rgba(41, 230, 140, 0.15)' }}>
                  <p className="font-semibold mb-3" style={{ color: '#04090C' }}>
                    Copyright Agent Contact Information:
                  </p>
                  <div className="space-y-1">
                    <p><span className="font-semibold">Name:</span> ITTS Community Legal Team</p>
                    <p><span className="font-semibold">Email:</span> <span style={{ color: '#29E68C' }}>dmca@itts.community</span></p>
                    <p><span className="font-semibold">Subject Line:</span> DMCA Takedown Notice</p>
                  </div>
                </div>

                <p className="italic">
                  Please allow up to 5-7 business days for a response to your DMCA notice.
                </p>
              </div>
            </div>

            {/* Counter-Notice */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                4. Counter-Notice Procedure
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  If you believe that your content was removed by mistake or misidentification, you may file a counter-notice with the following information:
                </p>
                
                <ul className="list-decimal pl-6 space-y-2">
                  <li>Your physical or electronic signature</li>
                  <li>Identification of the material that was removed and its location before removal</li>
                  <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake or misidentification</li>
                  <li>Your name, address, telephone number, and email address</li>
                  <li>A statement that you consent to the jurisdiction of the Federal District Court for your judicial district</li>
                  <li>A statement that you will accept service of process from the person who filed the original DMCA notice</li>
                </ul>

                <p>
                  Upon receipt of a valid counter-notice, we will forward it to the original complainant. If the original complainant does not file a court action within 10 business days, we may restore the removed content.
                </p>
              </div>
            </div>

            {/* Repeat Infringers */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                5. Repeat Infringer Policy
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  ITTS Community maintains a policy of terminating, in appropriate circumstances, accounts of users who are repeat infringers of intellectual property rights.
                </p>
                <p>
                  We reserve the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remove allegedly infringing content expeditiously</li>
                  <li>Disable access to content that is the subject of repeated infringement claims</li>
                  <li>Terminate accounts of users who repeatedly infringe copyrights</li>
                  <li>Take any other action we deem appropriate to protect intellectual property rights</li>
                </ul>
              </div>
            </div>

            {/* False Claims */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                6. False Claims & Misrepresentation
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  Under the DMCA, any person who knowingly materially misrepresents:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>That material is infringing, or</li>
                  <li>That material was removed or blocked by mistake or misidentification</li>
                </ul>
                <p>
                  shall be liable for any damages, including costs and attorneys' fees, incurred by the alleged infringer or copyright owner as a result of such misrepresentation.
                </p>
                
                <p className="p-4 rounded-xl font-semibold" style={{ background: 'rgba(212, 24, 61, 0.08)', border: '1px solid rgba(212, 24, 61, 0.15)', color: '#04090C' }}>
                  ⚠️ Warning: Filing a false DMCA notice may result in legal consequences and account termination.
                </p>
              </div>
            </div>

            {/* Our Rights */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                7. Our Rights & Limitations
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  We reserve the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remove content without prior notice if we believe it violates copyright law</li>
                  <li>Refuse to process incomplete or invalid DMCA notices</li>
                  <li>Forward notices and counter-notices to the parties involved</li>
                  <li>Publicly post DMCA notices and counter-notices (with personal information redacted)</li>
                  <li>Modify this policy at any time</li>
                </ul>
              </div>
            </div>

            {/* Educational Use */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                8. Educational Fair Use
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  As an educational platform, we encourage the fair use of copyrighted materials for purposes such as:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Teaching and learning</li>
                  <li>Research and scholarship</li>
                  <li>Criticism and commentary</li>
                  <li>News reporting</li>
                </ul>
                <p>
                  However, fair use is determined on a case-by-case basis and does not excuse all unauthorized use of copyrighted materials.
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
                  For DMCA-related inquiries, please contact:
                </p>
                <p className="font-semibold" style={{ color: '#29E68C' }}>
                  dmca@itts.community
                </p>
                <p className="mt-4">
                  For general legal questions, contact:
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
