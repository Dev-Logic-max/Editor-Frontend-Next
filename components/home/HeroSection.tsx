'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Users, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 py-10">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            borderRadius: ["30%", "50%", "30%"],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-linear-to-r from-blue-400 to-purple-400 opacity-20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            borderRadius: ["40%", "60%", "40%"],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-linear-to-r from-pink-400 to-orange-400 opacity-20 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -30, 0],
            x: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-linear-to-r from-cyan-400 to-blue-400 opacity-20 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-full shadow-lg border border-purple-200"
          >
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Powered by AI & Real-time Collaboration
            </span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
            <span className="block bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Write Together
            </span>
            <span className="block mt-2 bg-linear-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Think Smarter
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Experience the future of collaborative writing with{' '}
            <span className="font-bold text-purple-600">AI-powered suggestions</span>,{' '}
            <span className="font-bold text-blue-600">real-time editing</span>, and{' '}
            <span className="font-bold text-pink-600">seamless teamwork</span>.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Zap, text: 'AI-Powered', color: 'from-yellow-400 to-orange-500' },
              { icon: Users, text: 'Real-time Collab', color: 'from-blue-400 to-cyan-500' },
              { icon: Sparkles, text: 'Smart Suggestions', color: 'from-purple-400 to-pink-500' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-lg rounded-full shadow-md"
              >
                <item.icon className={`h-4 w-4 bg-linear-to-r ${item.color} bg-clip-text text-transparent`} />
                <span className="text-sm font-semibold text-gray-700">{item.text}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/register">
              <Button
                size="lg"
                className="group relative px-8 py-6 text-lg font-bold bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 rounded-2xl"
              >
                Start Writing Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-bold border-2 border-purple-600 text-purple-600 hover:bg-purple-50 shadow-lg rounded-2xl"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto"
          >
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '50K+', label: 'Documents Created' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl font-black bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-purple-400 rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-purple-600 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}