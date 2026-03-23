import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ShieldX, ArrowLeft } from 'lucide-react';

export function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6" style={{ background: '#ECE9DE' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md text-center"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div 
            className="rounded-full p-4 sm:p-6"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <ShieldX className="h-14 w-14 sm:h-16 sm:w-16" style={{ color: '#EF4444' }} />
          </div>
        </div>

        {/* Title */}
        <h1 
          className="mb-4 font-['Sora'] text-3xl font-bold sm:text-4xl"
          style={{ color: '#04090C' }}
        >
          Access Denied
        </h1>

        {/* Description */}
        <p 
          className="mb-8 font-['Outfit'] text-base sm:text-lg"
          style={{ color: 'rgba(4, 9, 12, 0.6)' }}
        >
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-['Outfit'] font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: '#29E68C', color: '#04090C' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/sign-in"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-['Outfit'] font-semibold text-sm transition-all hover:opacity-70"
            style={{ 
              background: 'rgba(4, 9, 12, 0.04)',
              border: '1px solid rgba(4, 9, 12, 0.1)',
              color: '#04090C' 
            }}
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
