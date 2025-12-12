'use client';

import { useState } from 'react';
import { X, Sparkles, ArrowRight, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TopBannerPromotion() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative overflow-hidden bg-linear-to-r from-purple-600 via-pink-600 to-orange-500"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="container mx-auto px-4 py-3 relative z-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 flex items-center justify-center gap-3 text-white">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Gift className="h-5 w-5" />
                </motion.div>
                <p className="text-sm md:text-base font-semibold">
                  <span className="hidden sm:inline">🎉 Limited Offer: </span>
                  Get 50% OFF Pro Plan - Use code <span className="px-2 py-0.5 bg-white/20 rounded font-mono">LAUNCH50</span>
                </p>
                <button className="flex items-center gap-1 px-4 py-1.5 bg-white text-purple-600 rounded-full text-sm font-bold hover:bg-purple-50 transition-all hover:scale-105">
                  Claim Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={() => setIsVisible(false)}
                className="text-white/80 hover:text-white transition-colors p-1"
                aria-label="Close banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}