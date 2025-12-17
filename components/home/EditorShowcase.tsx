'use client';

import { motion } from 'framer-motion';
import { Sparkles, Users, Zap, MessageSquare, Eye } from 'lucide-react';
import { useState } from 'react';

export function EditorShowcase() {
  const [activeTab, setActiveTab] = useState('realtime');

  const tabs = [
    { id: 'realtime', label: 'Real-time Collaboration', icon: Users },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
    { id: 'comments', label: 'Smart Comments', icon: MessageSquare },
  ];

  return (
    <section className="py-24 bg-linear-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              See The Magic In Action
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience features that make collaboration effortless and writing intelligent
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Editor Preview */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Browser Chrome */}
          <div className="bg-gray-800 rounded-t-2xl p-3 flex items-center gap-2 shadow-lg">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 hidden md:flex bg-gray-700 rounded-lg px-4 py-1.5 mx-4 items-center gap-2">
              <Eye className="h-4 w-4 text-gray-400" />
              <span className="text-gray-300 text-sm">editor.yourapp.com/document/collaborative-writing</span>
            </div>
          </div>

          {/* Editor Interface */}
          <div className="bg-white rounded-b-2xl shadow-2xl overflow-hidden border-x border-b border-gray-200">
            {activeTab === 'realtime' && <RealtimeView />}
            {activeTab === 'ai' && <AIAssistantView />}
            {activeTab === 'comments' && <CommentsView />}
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto"
        >
          {[
            { icon: Users, value: '50K+', label: 'Active Users' },
            { icon: Zap, value: '1M+', label: 'AI Suggestions' },
            { icon: MessageSquare, value: '500K+', label: 'Collaborations' },
            { icon: Sparkles, value: '99.9%', label: 'Satisfaction' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-purple-600" />
              <div className="text-3xl font-black bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Real-time Collaboration View
function RealtimeView() {
  return (
    <div className="p-8 min-h-[500px] relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
        <div className="flex gap-1">
          {['B', 'I', 'U'].map((letter) => (
            <div key={letter} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-sm font-bold cursor-pointer transition-colors">
              {letter}
            </div>
          ))}
        </div>
        <div className="w-px h-6 bg-gray-300" />
        <div className="flex gap-1">
          {['H1', 'H2', 'P'].map((text) => (
            <div key={text} className="px-3 h-8 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center text-xs font-semibold cursor-pointer transition-colors">
              {text}
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-green-700">3 editing now</span>
        </div>
      </div>

      {/* Content with Multiple Cursors */}
      <div className="space-y-4 relative">
        <h1 className="text-3xl font-bold text-gray-900">Collaborative Writing Guide</h1>
        
        <div className="relative">
          <p className="text-gray-700 leading-relaxed">
            Real-time collaboration allows multiple team members to work together seamlessly. 
            Each person can see others typing in real-time, with color-coded cursors showing who's where.
          </p>
          
          {/* Animated Cursors */}
          <motion.div
            animate={{ x: [0, 150, 0], y: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-8 left-20"
          >
            <div className="flex items-center gap-1">
              <div className="w-0.5 h-5 bg-blue-500 animate-pulse" />
              <div className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded shadow-lg whitespace-nowrap">
                Alice Johnson
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ x: [0, -100, 50, 0], y: [0, 20, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-16 right-32"
          >
            <div className="flex items-center gap-1">
              <div className="w-0.5 h-5 bg-green-500 animate-pulse" />
              <div className="px-2 py-0.5 bg-green-500 text-white text-xs rounded shadow-lg whitespace-nowrap">
                Bob Smith
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ x: [0, 80, -60, 0], y: [0, -10, 15, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-4 left-40"
          >
            <div className="flex items-center gap-1">
              <div className="w-0.5 h-5 bg-purple-500 animate-pulse" />
              <div className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded shadow-lg whitespace-nowrap">
                Carol Lee
              </div>
            </div>
          </motion.div>
        </div>

        <p className="text-gray-700 leading-relaxed">
          Changes are synchronized instantly across all devices. No more version conflicts or lost work.
        </p>

        {/* Active Users Panel */}
        <div className="absolute bottom-8 right-8 bg-white rounded-xl shadow-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="font-bold text-gray-900">Active Now</span>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Alice Johnson', color: 'bg-blue-500', status: 'Editing' },
              { name: 'Bob Smith', color: 'bg-green-500', status: 'Viewing' },
              { name: 'Carol Lee', color: 'bg-purple-500', status: 'Editing' },
            ].map((user, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-8 h-8 ${user.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                  {user.name[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Assistant View
function AIAssistantView() {
  return (
    <div className="p-8 min-h-[500px] relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-lg">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-bold text-purple-700">AI Assistant Active</span>
        </div>
      </div>

      {/* Content with AI Suggestions */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Product Launch Strategy</h1>
        
        <div className="relative">
          <p className="text-gray-700 leading-relaxed">
            Our new product will revolutionize the market with its innovative features and competitive pricing.
          </p>

          {/* AI Suggestion Popup */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-2 left-0 right-0 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl shadow-2xl p-4 text-white"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold mb-2">AI Suggestion</div>
                <div className="text-sm text-purple-100 mb-3">
                  Consider adding specific metrics to strengthen your claim. How about: "Our new product will revolutionize the market with its innovative features, delivering 40% cost savings and 2x faster performance."
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 bg-white text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors">
                    Apply
                  </button>
                  <button className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="pt-20">
          <p className="text-gray-700 leading-relaxed">
            We'll implement a phased rollout strategy to ensure maximum impact.
          </p>
        </div>

        {/* AI Features Panel */}
        <div className="absolute bottom-8 right-8 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">AI Tools</span>
          </div>
          <div className="space-y-2">
            {[
              'Grammar Check',
              'Tone Adjustment',
              'Content Expansion',
              'Summarization',
            ].map((tool, idx) => (
              <button
                key={idx}
                className="w-full text-left px-3 py-2 bg-linear-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg text-sm font-semibold text-purple-700 transition-all"
              >
                {tool}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Comments View
function CommentsView() {
  return (
    <div className="p-8 min-h-[500px] relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <MessageSquare className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-blue-700">2 Comments</span>
        </div>
      </div>

      {/* Content with Comments */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Quarterly Report Draft</h1>
        
        <div className="relative">
          <p className="text-gray-700 leading-relaxed">
            <span className="bg-yellow-100 px-1 rounded cursor-pointer">Revenue increased by 25% this quarter</span>, 
            driven by strong performance in our enterprise segment.
          </p>

          {/* Comment Thread */}
          <div className="absolute -right-4 top-0 w-80 bg-white rounded-xl shadow-2xl border-2 border-yellow-300 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-yellow-600" />
              <span className="font-bold text-gray-900">Comments</span>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                  M
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-semibold text-sm text-gray-900 mb-1">Mike Chen</div>
                    <div className="text-sm text-gray-700">Can we break this down by region?</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                  S
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-semibold text-sm text-gray-900 mb-1">Sarah Kim</div>
                    <div className="text-sm text-gray-700">Good point! I'll add that data.</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">1 hour ago</div>
                </div>
              </div>
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed mt-16">
          Customer retention rates have improved significantly, indicating strong product-market fit.
        </p>
      </div>
    </div>
  );
}