'use client';

import { useState } from 'react';
import { TemplateHero } from '@/components/templates/TemplateHero';
import { TemplateCategories } from '@/components/templates/TemplateCategories';
import { TemplateGrid } from '@/components/templates/TemplateGrid';
import { TemplatePreviewModal } from '@/components/templates/TemplatePreviewModal';
import { useSocket } from '@/hooks/useSocket';

export default function TemplatesPage() {
  useSocket();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Hero Section */}
        <TemplateHero />

        {/* Category Filter */}
        <div className="container mx-auto px-4 py-8">
          <TemplateCategories
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Templates Grid */}
          <TemplateGrid
            selectedCategory={selectedCategory}
            onPreview={setPreviewTemplate}
          />
        </div>
      </div>

      {/* <>
        <h1 className="text-3xl font-bold mb-4">Create Templates</h1>
        <CreateNewTemplate />
      </> */}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </>
  );
}