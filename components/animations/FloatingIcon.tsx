'use client';

import { motion } from 'framer-motion';
import * as RiIcons from 'react-icons/ri';
import * as PiIcons from 'react-icons/pi';
import * as FiIcons from 'react-icons/fi';
import * as FaIcons from 'react-icons/fa';
import * as FcIcons from 'react-icons/fc';

type IconLibrary = 'ri' | 'pi' | 'fi' | 'fa' | 'fc';

interface FloatingIconProps {
  lib: IconLibrary;
  name: string;
  left: string;
  top: string;
  delay: number;
  size?: number;
}

export function FloatingIcon({ lib, name, left, top, delay, size = 48 }: FloatingIconProps) {
  const iconSet = {
    ri: RiIcons,
    pi: PiIcons,
    fi: FiIcons,
    fa: FaIcons,
    fc: FcIcons,
  }[lib];
  
  if (!iconSet) return null;

  const prefix = lib === 'pi' ? 'Pi' : lib === 'fi' ? 'Fi' : lib === 'fa' ? 'Fa' : lib === 'fc' ? 'Fc' : 'Ri';
  const iconName = `${prefix}${name}`;
  const IconComponent = (iconSet as any)[iconName];

  if (!IconComponent) { return null }

  const iconSize = size / 4;

  return (
    <motion.div
      className="absolute text-white/20"
      style={{ left, top }}
      initial={{ y: 0, rotate: 0 }}
      animate={{ y: [-20, 20, -20], rotate: [0, 10, -10, 0] }}
      transition={{
        y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay },
        rotate: { duration: 8, repeat: Infinity, ease: 'linear', delay },
      }}
    >
      <IconComponent className={`w-${iconSize} h-${iconSize} drop-shadow-lg delay`} />
    </motion.div>
  );
}