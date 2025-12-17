'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Zap, Crown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ModalPromotion() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show modal after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    'Unlimited AI-powered suggestions',
    'Advanced collaboration tools',
    'Priority support 24/7',
    'Custom branding & templates',
    '100GB cloud storage',
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVisible(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 z-10 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>

              {/* Header with Gradient */}
              <div className="relative bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 p-6 text-white">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20px 20px, white 2px, transparent 0)`,
                      backgroundSize: '60px 60px',
                    }}
                  />
                </div>

                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs bg-white/20 backdrop-blur-lg rounded-full mb-4"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="font-bold">Limited Time Offer!</span>
                  </motion.div>

                  <h2 className="text-3xl lg:text-4xl font-black mb-3">
                    Upgrade to Pro
                  </h2>
                  <p className="text-purple-100">
                    Unlock the full potential of AI-powered writing
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-black bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    $19
                  </span>
                  <span className="text-2xl text-gray-400 line-through">$39</span>
                  <span className="text-gray-600">/month</span>
                  <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 border rounded-full text-sm font-bold">50% OFF</span>
                </div>

                {/* Features List */}
                <div className="space-y-2 mb-8">
                  {features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="shrink-0 w-6 h-6 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <button className="w-full py-3 px-6 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group">
                    <Crown className="h-5 w-5" />
                    Upgrade Now
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </button>
                  
                  <button
                    onClick={() => setIsVisible(false)}
                    className="w-full py-3 px-6 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
                  >
                    Maybe later
                  </button>
                </div>

                {/* Trust Badge */}
                <div className="pt-4 border-t border-gray-200 text-center">
                  <p className="text-xs lg:text-sm text-gray-500">
                    ✨ Join 10,000+ happy Pro users • Cancel anytime
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}