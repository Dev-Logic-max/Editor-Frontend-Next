'use client';

import { motion } from 'framer-motion';
import { Plug, ArrowRight } from 'lucide-react';

const integrations = [
  { name: 'Slack', logo: '💬', color: 'from-purple-500 to-pink-500' },
  { name: 'Google Drive', logo: '📁', color: 'from-blue-500 to-cyan-500' },
  { name: 'Notion', logo: '📝', color: 'from-gray-700 to-gray-900' },
  { name: 'Dropbox', logo: '📦', color: 'from-blue-600 to-blue-400' },
  { name: 'Microsoft Teams', logo: '👥', color: 'from-purple-600 to-blue-600' },
  { name: 'GitHub', logo: '🐙', color: 'from-gray-800 to-gray-600' },
  { name: 'Trello', logo: '📋', color: 'from-blue-500 to-blue-600' },
  { name: 'Asana', logo: '✅', color: 'from-pink-500 to-red-500' },
];

export function IntegrationSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, #8B5CF6 1px, transparent 1px), linear-gradient(to bottom, #8B5CF6 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-6">
            <Plug className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-bold text-purple-700">Seamless Integrations</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Works With Your Tools
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with the apps you already use. More integrations added every month.
          </p>
        </motion.div>

        {/* Integration Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
          {integrations.map((integration, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="group"
            >
              <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all cursor-pointer">
                {/* Gradient Glow on Hover */}
                <div className={`absolute inset-0 bg-linear-to-br ${integration.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />
                
                <div className="relative text-center">
                  <div className="text-5xl mb-3">{integration.logo}</div>
                  <div className="font-bold text-gray-900">{integration.name}</div>
                  <div className={`mt-2 text-xs font-semibold bg-linear-to-r ${integration.color} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Connected
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
            View All Integrations
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Can't find your tool? <a href="#" className="text-purple-600 font-semibold hover:underline">Request an integration</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}