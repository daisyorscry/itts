'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMiniMapPin, HiMiniXMark } from 'react-icons/hi2';

export default function LocationModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-start gap-2 opacity-90 hover:underline"
      >
        <HiMiniMapPin className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Institut Teknologi Tangerang Selatan</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="relative w-[90%] max-w-3xl overflow-hidden rounded-xl bg-background shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Tombol Close */}
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 rounded-full bg-background p-1 shadow hover:bg-surface"
                aria-label="Tutup peta"
              >
                <HiMiniXMark className="h-5 w-5" />
              </button>

              {/* Google Maps */}
              <div className="aspect-video w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15863.699348507602!2d106.66450094999999!3d-6.27361375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69e553aeca8d97%3A0xd3e5d04eb554abde!2sInstitut%20Teknologi%20Tangerang%20Selatan!5e0!3m2!1sen!2sid!4v1758313368319!5m2!1sen!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
