'use client';

import { motion } from 'framer-motion';
import { 
  Brain, Users, Zap, Shield, Globe, Sparkles, 
  MessageSquare, Image, Video, FileText, Lock, Cloud 
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Writing',
    description: 'Get intelligent suggestions, grammar fixes, and content improvements in real-time.',
    gradient: 'from-purple-500 to-pink-500',
    delay: 0.1,
  },
  {
    icon: Users,
    title: 'Real-time Collaboration',
    description: 'See your team editing live with cursors, selections, and instant updates.',
    gradient: 'from-blue-500 to-cyan-500',
    delay: 0.2,
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Experience blazing-fast performance with optimized real-time sync technology.',
    gradient: 'from-yellow-500 to-orange-500',
    delay: 0.3,
  },
  {
    icon: MessageSquare,
    title: 'Built-in Chat',
    description: 'Discuss changes without leaving the editor. Comment and collaborate seamlessly.',
    gradient: 'from-green-500 to-emerald-500',
    delay: 0.4,
  },
  {
    icon: Image,
    title: 'Rich Media Library',
    description: 'Upload images, videos, and manage your media assets across all documents.',
    gradient: 'from-pink-500 to-rose-500',
    delay: 0.5,
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and security. Your data is always safe and private.',
    gradient: 'from-indigo-500 to-purple-500',
    delay: 0.6,
  },
  {
    icon: Globe,
    title: 'Access Anywhere',
    description: 'Work from any device, anywhere. Your documents sync automatically.',
    gradient: 'from-cyan-500 to-blue-500',
    delay: 0.7,
  },
  {
    icon: FileText,
    title: 'Smart Templates',
    description: 'Start quickly with AI-generated templates for any type of document.',
    gradient: 'from-amber-500 to-yellow-500',
    delay: 0.8,
  },
  {
    icon: Lock,
    title: 'Version Control',
    description: 'Track every change with automatic versioning and restore any previous version.',
    gradient: 'from-red-500 to-pink-500',
    delay: 0.9,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-linear-to-b from-white via-purple-50/30 to-blue-50/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Everything You Need
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed for modern teams and individuals who demand the best.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`relative w-14 h-14 rounded-2xl bg-linear-to-br ${feature.gradient} p-3 mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Element */}
                <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-linear-to-br ${feature.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}