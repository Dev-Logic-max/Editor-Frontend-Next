'use client';

import { motion } from 'framer-motion';
import { Loader2, Users, FileText, Zap } from 'lucide-react';

interface EditorLoaderProps {
  message: string;
}

export function EditorLoader({ message }: EditorLoaderProps) {
  const getIcon = () => {
    if (message.includes('user')) return <Users className="h-8 w-8" />;
    if (message.includes('editor')) return <FileText className="h-8 w-8" />;
    if (message.includes('collaboration')) return <Users className="h-8 w-8" />;
    return <Zap className="h-8 w-8" />;
  };

  return (
    <div className="flex flex-col items-center justify-center h-[90vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Loading Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Loader2 className="h-12 w-12 text-purple-600 mx-auto" />
        </motion.div>

        {/* Message */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-800 mb-3"
        >
          {message}
        </motion.h2>

        {/* Animated dots */}
        <motion.div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 bg-purple-600 rounded-full"
            />
          ))}
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-500 mt-4"
        >
          Please wait a moment...
        </motion.p>
      </motion.div>
    </div>
  );
}