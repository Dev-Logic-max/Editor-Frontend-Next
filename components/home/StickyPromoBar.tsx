'use client';

import { useState } from 'react';
import { X, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StickyPromoBar() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
        >
          <div className="container mx-auto px-4 pb-4 pointer-events-auto">
            <div className="relative bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0">
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1))`,
                    backgroundSize: '40px 40px',
                  }}
                />
              </div>

              <div className="relative flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 flex-1">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="hidden sm:flex w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full items-center justify-center shrink-0"
                  >
                    <Zap className="h-5 w-5 text-yellow-300" fill="currentColor" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm md:text-base">
                      🚀 Start your free trial today!
                    </p>
                    <p className="text-purple-100 text-xs md:text-sm">
                      No credit card required • 14-day free trial
                    </p>
                  </div>

                  <button className="flex items-center gap-2 px-4 md:px-6 py-2.5 bg-white text-purple-600 rounded-xl font-bold text-sm md:text-base hover:bg-purple-50 transition-all hover:scale-105 shadow-lg shrink-0">
                    Try Free
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => setIsVisible(false)}
                  className="shrink-0 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}