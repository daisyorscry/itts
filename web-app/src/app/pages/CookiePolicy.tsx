import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

export function CookiePolicy() {
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
              Cookie Policy
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
                1. What Are Cookies?
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
                </p>
                <p>
                  This Cookie Policy explains what cookies are, how we use them, the types of cookies we use, and how you can control your cookie preferences.
                </p>
              </div>
            </div>

            {/* Types of Cookies */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                2. Types of Cookies We Use
              </h2>
              <div className="space-y-6 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                {/* Essential Cookies */}
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#04090C' }}>
                    Essential Cookies
                  </h3>
                  <p>
                    These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and accessibility features.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Session management and user authentication</li>
                    <li>Security and fraud prevention</li>
                    <li>Load balancing and performance optimization</li>
                  </ul>
                  <p className="mt-2 italic">
                    Note: These cookies cannot be disabled as they are essential for the website to work.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#04090C' }}>
                    Analytics & Performance Cookies
                  </h3>
                  <p>
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Page views and navigation patterns</li>
                    <li>Time spent on pages</li>
                    <li>Error messages and technical issues</li>
                    <li>Device and browser information</li>
                  </ul>
                  <p className="mt-2">
                    We use services like Google Analytics to collect this data.
                  </p>
                </div>

                {/* Functional Cookies */}
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#04090C' }}>
                    Functional Cookies
                  </h3>
                  <p>
                    These cookies enable enhanced functionality and personalization.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Remember your preferences (language, region)</li>
                    <li>Store your learning progress</li>
                    <li>Customize content based on your track selection</li>
                    <li>Remember "Remember Me" login preferences</li>
                  </ul>
                </div>

                {/* Targeting Cookies */}
                <div>
                  <h3 className="font-semibold text-lg mb-2" style={{ color: '#04090C' }}>
                    Targeting & Advertising Cookies
                  </h3>
                  <p>
                    These cookies are used to deliver relevant advertisements and track campaign effectiveness.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Show relevant course recommendations</li>
                    <li>Limit the number of times you see an advertisement</li>
                    <li>Measure the effectiveness of marketing campaigns</li>
                  </ul>
                  <p className="mt-2">
                    We may share this information with third-party advertising partners.
                  </p>
                </div>
              </div>
            </div>

            {/* Third-Party Cookies */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                3. Third-Party Cookies
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  We use third-party services that may set cookies on your device:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><span className="font-semibold" style={{ color: '#04090C' }}>Google Analytics:</span> For website analytics and performance monitoring</li>
                  <li><span className="font-semibold" style={{ color: '#04090C' }}>Payment Processors:</span> For secure payment processing</li>
                  <li><span className="font-semibold" style={{ color: '#04090C' }}>Social Media Platforms:</span> For sharing and social features</li>
                  <li><span className="font-semibold" style={{ color: '#04090C' }}>Video Hosting:</span> For embedded educational videos</li>
                </ul>
                <p>
                  These third parties have their own privacy policies, and we have no control over their cookies.
                </p>
              </div>
            </div>

            {/* Managing Cookies */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                4. How to Control Cookies
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p className="font-semibold" style={{ color: '#04090C' }}>
                  Browser Settings:
                </p>
                <p>
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>View what cookies have been set</li>
                  <li>Block or delete cookies</li>
                  <li>Set preferences for specific websites</li>
                  <li>Block third-party cookies</li>
                </ul>
                
                <p className="font-semibold mt-6" style={{ color: '#04090C' }}>
                  Browser-Specific Instructions:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><span className="font-semibold">Chrome:</span> Settings → Privacy and Security → Cookies and other site data</li>
                  <li><span className="font-semibold">Firefox:</span> Settings → Privacy & Security → Cookies and Site Data</li>
                  <li><span className="font-semibold">Safari:</span> Preferences → Privacy → Manage Website Data</li>
                  <li><span className="font-semibold">Edge:</span> Settings → Cookies and site permissions → Manage and delete cookies</li>
                </ul>

                <p className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(41, 230, 140, 0.08)', border: '1px solid rgba(41, 230, 140, 0.15)' }}>
                  <span className="font-semibold" style={{ color: '#04090C' }}>⚠️ Important:</span> Blocking or deleting cookies may impact your user experience and limit certain features of our platform.
                </p>
              </div>
            </div>

            {/* Cookie Duration */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                5. Cookie Duration
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  Cookies can be either:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><span className="font-semibold" style={{ color: '#04090C' }}>Session Cookies:</span> Temporary cookies that expire when you close your browser</li>
                  <li><span className="font-semibold" style={{ color: '#04090C' }}>Persistent Cookies:</span> Remain on your device for a set period or until you delete them</li>
                </ul>
                <p>
                  Most of our cookies are persistent and may remain on your device for up to 12 months unless you delete them earlier.
                </p>
              </div>
            </div>

            {/* Updates */}
            <div>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                6. Updates to This Policy
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons.
                </p>
                <p>
                  We encourage you to review this page periodically for the latest information.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-6" style={{ borderTop: '1px solid rgba(4, 9, 12, 0.08)' }}>
              <h2 className="font-['Sora'] font-extrabold text-2xl mb-4 tracking-tight" style={{ color: '#04090C' }}>
                7. Contact Us
              </h2>
              <div className="space-y-4 font-['Outfit'] text-base leading-relaxed" style={{ color: 'rgba(4, 9, 12, 0.7)' }}>
                <p>
                  If you have any questions about our use of cookies, please contact us at:
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
