'use client';

import { motion } from 'framer-motion';

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-gray-700 font-semibold text-lg">Loading media...</p>
        <p className="text-sm text-gray-500 mt-1">Please wait</p>
      </div>
    </div>
  );
}