'use client'

import { motion } from 'framer-motion';
import { HTMLAttributes } from 'react';

interface MotionDivProps extends HTMLAttributes<HTMLDivElement> {
    initial?: any;
    animate?: any;
    transition?: any;
}

export const MotionDiv = motion.div as React.ComponentType<MotionDivProps>;