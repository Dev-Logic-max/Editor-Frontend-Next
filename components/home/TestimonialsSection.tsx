'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Content Manager',
    company: 'TechCorp',
    image: '/avatars/sarah.jpg', // Replace with real image
    content: 'This editor has completely transformed how our team creates content. The AI suggestions are incredibly accurate and save us hours every week.',
    rating: 5,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Michael Chen',
    role: 'Product Lead',
    company: 'StartupXYZ',
    image: '/avatars/michael.jpg',
    content: 'Real-time collaboration has never been this smooth. We can see each other typing, and the AI helps us maintain consistent tone across all documents.',
    rating: 5,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Director',
    company: 'GrowthCo',
    image: '/avatars/emily.jpg',
    content: 'The media library feature is a game-changer. We can manage all our assets in one place and insert them instantly. Absolutely love it!',
    rating: 5,
    gradient: 'from-pink-500 to-orange-500',
  },
  {
    name: 'David Kim',
    role: 'Technical Writer',
    company: 'DevTools Inc',
    image: '/avatars/david.jpg',
    content: 'As someone who writes technical documentation daily, the AI-powered suggestions help me catch errors and improve clarity instantly.',
    rating: 5,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Lisa Wang',
    role: 'CEO',
    company: 'InnovateLabs',
    image: '/avatars/lisa.jpg',
    content: 'Security and performance are top-notch. Our entire team has switched to this editor and productivity has increased by 40%.',
    rating: 5,
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    name: 'James Miller',
    role: 'Content Creator',
    company: 'MediaHub',
    image: '/avatars/james.jpg',
    content: 'The template library and AI writing assistance make starting new projects so much faster. This is now my go-to tool for all writing.',
    rating: 5,
    gradient: 'from-indigo-500 to-purple-500',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-linear-to-b from-blue-50/30 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loved by Thousands
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy users who have transformed their writing workflow
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                {/* Quote Icon */}
                <div className={`absolute -top-4 -left-4 w-12 h-12 bg-linear-to-br ${testimonial.gradient} rounded-2xl flex items-center justify-center shadow-lg rotate-6 group-hover:rotate-12 transition-transform`}>
                  <Quote className="h-6 w-6 text-white" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-purple-100">
                    <AvatarImage src={testimonial.image} />
                    <AvatarFallback className={`bg-linear-to-br ${testimonial.gradient} text-white font-bold`}>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <p className="text-gray-500 mb-8">Trusted by leading companies worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-40">
            {/* Add company logos here */}
            {['Company 1', 'Company 2', 'Company 3', 'Company 4', 'Company 5'].map((company, idx) => (
              <div key={idx} className="text-2xl font-bold text-gray-400">
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}