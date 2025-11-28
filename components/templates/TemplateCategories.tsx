'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  Heart,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Newspaper,
  LayoutTemplate,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: any;
  count: number;
  gradient: string;
}

const categories: Category[] = [
  { id: 'all', name: 'All Templates', icon: LayoutTemplate, count: 50, gradient: 'from-gray-500 to-gray-600' },
  { id: 'business', name: 'Business', icon: Briefcase, count: 12, gradient: 'from-blue-500 to-cyan-500' },
  { id: 'education', name: 'Education', icon: GraduationCap, count: 8, gradient: 'from-green-500 to-emerald-500' },
  { id: 'personal', name: 'Personal', icon: Heart, count: 10, gradient: 'from-pink-500 to-rose-500' },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp, count: 7, gradient: 'from-purple-500 to-indigo-500' },
  { id: 'hr', name: 'HR & Admin', icon: Users, count: 6, gradient: 'from-orange-500 to-red-500' },
  { id: 'events', name: 'Events', icon: Calendar, count: 4, gradient: 'from-yellow-500 to-amber-500' },
  { id: 'reports', name: 'Reports', icon: FileText, count: 5, gradient: 'from-teal-500 to-cyan-500' },
  { id: 'blog', name: 'Blog & Content', icon: Newspaper, count: 3, gradient: 'from-indigo-500 to-purple-500' },
];

interface Props {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function TemplateCategories({ selectedCategory, onSelectCategory }: Props) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category, index) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectCategory(category.id)}
              className={`
                relative group p-4 rounded-xl border-2 transition-all duration-300
                ${isSelected
                  ? 'bg-white border-transparent shadow-lg scale-105'
                  : 'bg-white/50 border-gray-200 hover:border-transparent hover:shadow-md hover:scale-105'
                }
              `}
            >
              {/* Gradient Background on Active */}
              {isSelected && (
                <motion.div
                  layoutId="activeCategory"
                  className={`absolute inset-0 rounded-xl bg-linear-to-br ${category.gradient} opacity-10`}
                  transition={{ type: 'spring', duration: 0.6 }}
                />
              )}

              <div className="relative">
                {/* Icon */}
                <div className={`
                  w-12 h-12 mx-auto mb-3 rounded-xl bg-linear-to-br ${category.gradient}
                  flex items-center justify-center shadow-md
                  ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
                  transition-transform duration-300
                `}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Name */}
                <p className={`
                  font-semibold text-sm mb-1
                  ${isSelected ? 'text-gray-900' : 'text-gray-700'}
                `}>
                  {category.name}
                </p>

                {/* Count */}
                <p className="text-xs text-gray-500">
                  {category.count} templates
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}