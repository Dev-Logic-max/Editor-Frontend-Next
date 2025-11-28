'use client';

import { motion } from 'framer-motion';
import { FileText, FileSpreadsheet, Presentation, FileImage, File, Code } from 'lucide-react';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: any;
  extensions: string[];
  gradient: string;
  status: 'available' | 'coming-soon';
}

const documentTypes: DocumentType[] = [
  {
    id: 'docx',
    name: 'Word Document',
    description: 'Microsoft Word documents with rich formatting',
    icon: FileText,
    extensions: ['.docx', '.doc'],
    gradient: 'from-blue-500 to-cyan-500',
    status: 'available',
  },
  {
    id: 'txt',
    name: 'Text File',
    description: 'Plain text documents without formatting',
    icon: File,
    extensions: ['.txt'],
    gradient: 'from-gray-500 to-slate-500',
    status: 'available',
  },
  {
    id: 'md',
    name: 'Markdown',
    description: 'Markdown formatted text files',
    icon: Code,
    extensions: ['.md', '.markdown'],
    gradient: 'from-purple-500 to-pink-500',
    status: 'available',
  },
  {
    id: 'xlsx',
    name: 'Excel Spreadsheet',
    description: 'Microsoft Excel spreadsheets and tables',
    icon: FileSpreadsheet,
    extensions: ['.xlsx', '.xls'],
    gradient: 'from-green-500 to-emerald-500',
    status: 'coming-soon',
  },
  {
    id: 'pptx',
    name: 'PowerPoint',
    description: 'Microsoft PowerPoint presentations',
    icon: Presentation,
    extensions: ['.pptx', '.ppt'],
    gradient: 'from-orange-500 to-red-500',
    status: 'coming-soon',
  },
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'Portable Document Format files',
    icon: FileImage,
    extensions: ['.pdf'],
    gradient: 'from-red-500 to-rose-500',
    status: 'coming-soon',
  },
];

interface Props {
  onTypeSelect: (type: string) => void;
}

export function DocumentTypeSelector({ onTypeSelect }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documentTypes.map((type, index) => {
        const Icon = type.icon;
        const isAvailable = type.status === 'available';

        return (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => isAvailable && onTypeSelect(type.id)}
            className={`
              relative group rounded-xl border-2 p-6 transition-all duration-300
              ${isAvailable 
                ? 'cursor-pointer hover:shadow-2xl hover:scale-105 hover:border-transparent bg-white' 
                : 'opacity-60 cursor-not-allowed bg-gray-50'
              }
            `}
          >
            {/* Gradient Background on Hover */}
            {isAvailable && (
              <div className={`absolute inset-0 rounded-xl bg-linear-to-br ${type.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            )}

            {/* Coming Soon Badge */}
            {!isAvailable && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 text-xs font-semibold text-white bg-linear-to-r from-purple-500 to-pink-500 rounded-full">
                  Coming Soon
                </span>
              </div>
            )}

            {/* Icon */}
            <div className={`
              relative w-16 h-16 mb-4 rounded-2xl bg-linear-to-br ${type.gradient} 
              flex items-center justify-center shadow-lg
              ${isAvailable ? 'group-hover:scale-110' : ''}
              transition-transform duration-300
            `}>
              <Icon className="w-8 h-8 text-white" />
            </div>

            {/* Content */}
            <div className="relative">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{type.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{type.description}</p>

              {/* File Extensions */}
              <div className="flex flex-wrap gap-2">
                {type.extensions.map((ext) => (
                  <span
                    key={ext}
                    className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded"
                  >
                    {ext}
                  </span>
                ))}
              </div>

              {/* Call to Action */}
              {isAvailable && (
                <div className="mt-4 flex items-center text-sm font-semibold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 group-hover:from-purple-600 group-hover:to-pink-600">
                  Click to upload
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="ml-2"
                  >
                    →
                  </motion.span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}