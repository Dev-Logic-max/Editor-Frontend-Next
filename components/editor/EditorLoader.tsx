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
    <div className="flex flex-col items-center justify-center h-[90vh] bg-linear-to-br from-purple-50 via-white to-blue-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Animated Logo/Icon */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative mx-auto mb-8"
        >
          {/* <div className="w-24 h-24 rounded-full bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl">
            <motion.div
              animate={{ scale: [1, 0.9, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-white"
            >
              {getIcon()}
            </motion.div>
          </div> */}
          
          {/* Orbiting dots */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-1/2 w-3 h-3 bg-purple-500 rounded-full -ml-1.5 shadow-lg" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-500 rounded-full -ml-1.5 shadow-lg" />
          </motion.div>
        </motion.div>

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