'use client';

import { motion } from 'framer-motion';
import { Play, Users, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function LiveDemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-24 bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            See It In Action
          </h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Watch how teams collaborate in real-time with AI assistance
          </p>
        </motion.div>

        {/* Demo Video/Image Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Browser Chrome */}
          <div className="bg-gray-800 rounded-t-2xl p-3 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 bg-gray-700 rounded-lg px-4 py-1.5 mx-4">
              <span className="text-gray-400 text-sm">yourcompany.com/editor</span>
            </div>
          </div>

          {/* Demo Content */}
          <div className="relative bg-white rounded-b-2xl shadow-2xl overflow-hidden">
            {/* Placeholder for actual demo - Replace with real screenshot/gif */}
            <div className="aspect-video bg-linear-to-br from-purple-100 via-blue-100 to-pink-100 relative">
              {/* Simulated Editor Interface */}
              <div className="absolute inset-0 p-8">
                {/* Toolbar */}
                <div className="bg-white rounded-lg shadow-md p-3 mb-4 flex items-center gap-2">
                  <div className="flex gap-1">
                    {['B', 'I', 'U'].map((letter) => (
                      <div key={letter} className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-semibold">
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className="w-px h-6 bg-gray-300" />
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-lg">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-600">AI</span>
                  </div>
                </div>

                {/* Content Area with Cursors */}
                <div className="bg-white rounded-lg shadow-lg p-6 relative">
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                    
                    {/* Animated Cursors */}
                    <motion.div
                      animate={{ x: [0, 100, 0], y: [0, 20, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute top-8 left-8"
                    >
                      <div className="flex items-center gap-1">
                        <div className="w-0.5 h-5 bg-blue-500" />
                        <div className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded">Alice</div>
                      </div>
                    </motion.div>

                    <motion.div
                      animate={{ x: [0, -80, 0], y: [0, 30, 0] }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="absolute top-16 right-12"
                    >
                      <div className="flex items-center gap-1">
                        <div className="w-0.5 h-5 bg-green-500" />
                        <div className="px-2 py-0.5 bg-green-500 text-white text-xs rounded">Bob</div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Active Users Badge */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-full shadow-lg px-3 py-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">3 editing</span>
                    <div className="flex -space-x-2">
                      {['bg-blue-500', 'bg-green-500', 'bg-purple-500'].map((color, idx) => (
                        <div key={idx} className={`w-6 h-6 ${color} rounded-full border-2 border-white`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Play Button Overlay */}
              {!isPlaying && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                >
                  <div className="w-20 h-20 bg-white/90 backdrop-blur-lg rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="h-10 w-10 text-purple-600 ml-1" fill="currentColor" />
                  </div>
                </button>
              )}
            </div>

            {/* Replace above div with actual screenshot */}
            {/* <img src="/editor-demo.gif" alt="Editor Demo" className="w-full" /> */}
          </div>

          {/* Floating Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="absolute -left-8 top-1/4 hidden lg:block"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-4 w-48">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">AI Suggestion</div>
                  <div className="text-xs text-gray-500">Real-time help</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="absolute -right-8 bottom-1/4 hidden lg:block"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-4 w-48">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Live Collab</div>
                  <div className="text-xs text-gray-500">5 users online</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}