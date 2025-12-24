// components/analysis/AIAnalysisModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Editor } from '@tiptap/react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { DetectionTab } from './DetectionTab';
import { HumanizationTab } from './HumanizationTab';
import { SettingsTab } from './SettingsTab';

import { Sparkles, ScanSearch, Wand2, Settings, X, Info } from 'lucide-react';
import { FaRobot } from 'react-icons/fa';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
  documentContent: string;
  plan?: 'basic' | 'pro' | 'ultra';
}

export function AIAnalysisModal({
  isOpen,
  onClose,
  editor,
  documentContent,
  plan = 'basic'
}: AIAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState('detection');
  
  // Shared state for model selections
  const [detectionModel, setDetectionModel] = useState('hybrid');
  const [humanizationModel, setHumanizationModel] = useState('llama-3.3-70b-versatile');
  const [humanizationMode, setHumanizationMode] = useState<'natural' | 'formal' | 'casual' | 'creative'>('natural');

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="xl:min-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 bg-linear-to-br from-white via-blue-50/30 to-purple-50/30">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-linear-to-br from-purple-500 to-blue-500">
                <FaRobot className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  AI Content Analysis
                </DialogTitle>
                <p className="text-xs text-gray-600 mt-0.5">
                  Detect AI content, humanize text, and optimize your writing
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-xs font-semibold border-2 ${
                  plan === 'ultra' 
                    ? 'bg-linear-to-r from-purple-100 to-pink-100 border-purple-300 text-purple-700'
                    : plan === 'pro'
                    ? 'bg-linear-to-r from-blue-100 to-indigo-100 border-blue-300 text-blue-700'
                    : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}
              >
                {plan.toUpperCase()} Plan
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Plan Info Banner */}
        <div className="px-6 py-2 bg-linear-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-600">
                <Info className="h-3 w-3" />
                Character Limits:
              </span>
              <span className="font-semibold text-blue-700">
                Detection: {plan === 'basic' ? '5,000' : plan === 'pro' ? '10,000' : '25,000'}
              </span>
              <span className="font-semibold text-purple-700">
                Humanization: {plan === 'basic' ? '2,000' : plan === 'pro' ? '5,000' : '15,000'}
              </span>
            </div>
            <span className="text-gray-500">
              Document: {documentContent.length.toLocaleString()} characters
            </span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start rounded-none border-b bg-white/60 backdrop-blur-sm px-6 py-2 h-auto gap-2">
            <TabsTrigger 
              value="detection" 
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg px-4 py-2"
            >
              <ScanSearch className="h-4 w-4 mr-2" />
              AI Detection
              <Badge variant="secondary" className="ml-2 text-xs">
                Analyze
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="humanize" 
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg px-4 py-2"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Humanize Text
              <Badge variant="secondary" className="ml-2 text-xs">
                Transform
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-linear-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg px-4 py-2 ml-auto"
            >
              <Settings className="h-4 w-4 mr-2" />
              Models & Settings
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <TabsContent value="detection" className="h-full m-0 p-0">
                  <DetectionTab
                    editor={editor}
                    documentContent={documentContent}
                    plan={plan}
                    selectedModel={detectionModel}
                    onModelChange={setDetectionModel}
                  />
                </TabsContent>

                <TabsContent value="humanize" className="h-full m-0 p-0">
                  <HumanizationTab
                    editor={editor}
                    documentContent={documentContent}
                    plan={plan}
                    selectedModel={humanizationModel}
                    selectedMode={humanizationMode}
                    onModelChange={setHumanizationModel}
                    onModeChange={setHumanizationMode}
                  />
                </TabsContent>

                <TabsContent value="settings" className="h-full m-0 p-0">
                  <SettingsTab
                    detectionModel={detectionModel}
                    humanizationModel={humanizationModel}
                    humanizationMode={humanizationMode}
                    onDetectionModelChange={setDetectionModel}
                    onHumanizationModelChange={setHumanizationModel}
                    onHumanizationModeChange={setHumanizationMode}
                    plan={plan}
                  />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-500" />
                Powered by Groq & Sapling AI
              </span>
              <span className="text-gray-400">•</span>
              <span>Privacy-focused analysis</span>
            </div>
            <span className="text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}