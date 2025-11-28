'use client';

import { useState } from 'react';
import { DocumentTypeSelector } from '@/components/uploads/DocumentTypeSelector';
import { UploadModal } from '@/components/uploads/UploadModal';

export default function UploadsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setModalOpen(true);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Upload Document</h1>
        <p className="text-gray-600 mt-2">Choose a document type to get started</p>
      </div>

      <DocumentTypeSelector onTypeSelect={handleTypeSelect} />

      <UploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        documentType={selectedType}
      />
    </>
  );
}