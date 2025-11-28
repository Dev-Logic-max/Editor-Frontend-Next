'use client';

import { motion } from 'framer-motion';
import { Eye, Download, Star, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  rating: number;
  downloads: number;
  isPremium: boolean;
  isNew: boolean;
  tags: string[];
}

// Sample templates data
const templates: Template[] = [
  {
    id: '1',
    title: 'Business Proposal',
    description: 'Professional business proposal template with financials',
    category: 'business',
    thumbnail: 'https://image.pollinations.ai/prompt/professional%20business%20proposal%20document%20template%20modern%20design?width=400&height=300&nologo=true',
    rating: 4.8,
    downloads: 1234,
    isPremium: false,
    isNew: true,
    tags: ['Proposal', 'Business', 'Finance'],
  },
  {
    id: '2',
    title: 'Resume - Modern',
    description: 'Clean and modern resume template for professionals',
    category: 'personal',
    thumbnail: 'https://image.pollinations.ai/prompt/modern%20professional%20resume%20template%20clean%20design?width=400&height=300&nologo=true',
    rating: 4.9,
    downloads: 3456,
    isPremium: false,
    isNew: true,
    tags: ['Resume', 'CV', 'Professional'],
  },
  {
    id: '3',
    title: 'Marketing Plan',
    description: 'Comprehensive marketing strategy and plan template',
    category: 'marketing',
    thumbnail: 'https://image.pollinations.ai/prompt/marketing%20strategy%20plan%20document%20template%20colorful?width=400&height=300&nologo=true',
    rating: 4.7,
    downloads: 892,
    isPremium: false,
    isNew: false,
    tags: ['Marketing', 'Strategy', 'Plan'],
  },
  {
    id: '4',
    title: 'Meeting Minutes',
    description: 'Track meeting notes, decisions, and action items',
    category: 'business',
    thumbnail: 'https://image.pollinations.ai/prompt/meeting%20minutes%20document%20template%20professional?width=400&height=300&nologo=true',
    rating: 4.6,
    downloads: 2134,
    isPremium: false,
    isNew: false,
    tags: ['Meetings', 'Notes', 'Business'],
  },
  {
    id: '5',
    title: 'Research Paper',
    description: 'Academic research paper with proper citations',
    category: 'education',
    thumbnail: 'https://image.pollinations.ai/prompt/academic%20research%20paper%20template%20professional%20layout?width=400&height=300&nologo=true',
    rating: 4.8,
    downloads: 1567,
    isPremium: false,
    isNew: true,
    tags: ['Academic', 'Research', 'Education'],
  },
  {
    id: '6',
    title: 'Project Report',
    description: 'Detailed project status and progress report',
    category: 'reports',
    thumbnail: 'https://image.pollinations.ai/prompt/project%20report%20document%20template%20charts%20graphs?width=400&height=300&nologo=true',
    rating: 4.7,
    downloads: 1890,
    isPremium: false,
    isNew: false,
    tags: ['Project', 'Report', 'Analysis'],
  },
];

interface Props {
  selectedCategory: string;
  onPreview: (template: Template) => void;
}

export function TemplateGrid({ selectedCategory, onPreview }: Props) {
  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div>
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {filteredTemplates.length} Templates Found
          </h3>
          <p className="text-sm text-gray-600">
            {selectedCategory === 'all' ? 'Showing all templates' : `Filtered by ${selectedCategory}`}
          </p>
        </div>

        {/* Sort Dropdown */}
        <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Most Popular</option>
          <option>Newest First</option>
          <option>Highest Rated</option>
          <option>Most Downloaded</option>
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
          >
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex gap-2">
              {template.isNew && (
                <Badge className="bg-linear-to-r from-green-500 to-emerald-500 text-white border-0">
                  New
                </Badge>
              )}
              {template.isPremium && (
                <Badge className="bg-linear-to-r from-yellow-500 to-orange-500 text-white border-0">
                  Premium
                </Badge>
              )}
            </div>

            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden bg-gray-100">
              <img
                src={template.thumbnail}
                alt={template.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <Button
                    onClick={() => onPreview(template)}
                    size="sm"
                    className="flex-1 bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Title */}
              <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                {template.title}
              </h4>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{template.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{template.downloads.toLocaleString()}</span>
                  </div>
                </div>

                <FileText className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {filteredTemplates.length > 0 && (
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            className="px-8"
          >
            <Clock className="w-4 h-4 mr-2" />
            Load More Templates
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No templates found
          </h3>
          <p className="text-gray-500">
            Try selecting a different category or check back soon for new templates.
          </p>
        </div>
      )}
    </div>
  );
}