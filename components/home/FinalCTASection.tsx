'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Users } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute bottom-20 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-xl"
      />
      <motion.div
        animate={{ y: [0, -15, 0], x: [0, 15, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 mb-8"
          >
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-white font-bold">Join 50,000+ Happy Users</span>
          </motion.div>

          {/* Main Heading */}
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
            Ready to Transform
            <br />
            <span className="bg-linear-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Your Writing?
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-purple-200 mb-12 max-w-2xl mx-auto">
            Start collaborating with your team today. No credit card required for your 14-day free trial.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-10 py-5 bg-white text-purple-900 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center gap-3"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-white/10 backdrop-blur-lg text-white rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all"
            >
              Watch Demo
            </motion.button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-8 border-t border-white/20">
            {[
              { icon: Users, label: '50K+ Users', value: 'Worldwide' },
              { icon: Zap, label: '99.9%', value: 'Uptime' },
              { icon: Sparkles, label: '4.9/5', value: 'Rating' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-purple-300" />
                <div className="text-2xl font-black text-white mb-1">{stat.label}</div>
                <div className="text-sm text-purple-300">{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Small Print */}
          <p className="text-sm text-purple-300 mt-8">
            💳 No credit card required • ✨ Cancel anytime • 🔒 Your data is secure
          </p>
        </motion.div>
      </div>
    </section>
  );
}