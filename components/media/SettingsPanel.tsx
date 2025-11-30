'use client';

import { useState } from 'react';
import { Settings, HardDrive, Image, Video, FileText, Info, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

export function SettingsPanel() {
  const [autoCompress, setAutoCompress] = useState(true);
  const [generateThumbnails, setGenerateThumbnails] = useState(true);

  const plans = {
    free: {
      tier: 'Free',
      color: 'from-gray-500 to-gray-600',
      storage: '1 GB',
      images: { maxSize: '10 MB', maxCount: '100 files' },
      videos: { maxSize: '100 MB', maxCount: '10 files' },
      documents: { maxSize: '25 MB', maxCount: '50 files' },
    },
    pro: {
      tier: 'Pro',
      color: 'from-purple-500 to-blue-500',
      storage: '50 GB',
      images: { maxSize: '50 MB', maxCount: 'Unlimited' },
      videos: { maxSize: '500 MB', maxCount: 'Unlimited' },
      documents: { maxSize: '100 MB', maxCount: 'Unlimited' },
    },
    enterprise: {
      tier: 'Enterprise',
      color: 'from-amber-500 to-orange-500',
      storage: 'Unlimited',
      images: { maxSize: 'Unlimited', maxCount: 'Unlimited' },
      videos: { maxSize: '2 GB', maxCount: 'Unlimited' },
      documents: { maxSize: '500 MB', maxCount: 'Unlimited' },
    },
  };

  // Mock data - replace with real data from your backend
  const storageUsed = 324; // MB
  const storageTotal = 1024; // MB (1 GB)
  const storagePercentage = (storageUsed / storageTotal) * 100;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-6 w-6 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900">Storage & Settings</h3>
        </div>
        <p className="text-gray-600">Manage your media storage, limits, and preferences</p>
      </div>

      {/* Current Plan Card */}
      <div className="p-6 bg-linear-to-br from-purple-50 via-blue-50 to-purple-50 rounded-xl border-2 border-purple-200 shadow-sm">

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Plan</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-900">Free Tier</p>
              <Badge className="bg-linear-to-r from-purple-600 to-blue-600 text-white">
                Active
              </Badge>
            </div>
          </div>
          <Button className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        </div>

        {/* Storage Usage */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600 font-medium">Storage Used</span>
            </div>
            <span className="font-bold text-gray-900">324 MB / 1 GB</span>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-linear-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500" 
              style={{ width: '32%' }} 
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {storagePercentage.toFixed(1)}% of your storage is being used
          </p>
        </div>
      </div>

      {/* Plans Comparison */}
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-purple-600" />
          Available Plans
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(plans).map(([key, plan]) => {
            const isCurrentPlan = key === 'free';
            
            return (
              <div
                key={key}
                className={`
                  p-6 rounded-xl border-2 transition-all hover:shadow-lg
                  ${isCurrentPlan 
                    ? 'border-purple-300 bg-linear-to-br from-purple-50 to-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-purple-200'
                  }
                `}
              >
                {/* Plan Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`
                    inline-flex items-center gap-2 px-3 py-1.5 rounded-full 
                    bg-linear-to-r ${plan.color} text-white text-sm font-semibold shadow-sm
                  `}>
                    {plan.tier}
                  </div>
                  {isCurrentPlan && (
                    <Badge variant="outline" className="bg-white">Current</Badge>
                  )}
                </div>

                {/* Storage */}
                <div className="mb-4">
                  <p className="text-3xl font-bold text-gray-900 mb-1">{plan.storage}</p>
                  <p className="text-xs text-gray-500">Total Storage</p>
                </div>

                {/* Limits */}
                <div className="space-y-3 pt-3 border-t">
                  {/* Images */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Image className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Images</p>
                      <p className="text-xs text-gray-600">Max: {plan.images.maxSize}</p>
                      <p className="text-xs text-gray-600">Limit: {plan.images.maxCount}</p>
                    </div>
                  </div>

                  {/* Videos */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Video className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Videos</p>
                      <p className="text-xs text-gray-600">Max: {plan.videos.maxSize}</p>
                      <p className="text-xs text-gray-600">Limit: {plan.videos.maxCount}</p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Documents</p>
                      <p className="text-xs text-gray-600">Max: {plan.documents.maxSize}</p>
                      <p className="text-xs text-gray-600">Limit: {plan.documents.maxCount}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {!isCurrentPlan && (
                  <Button
                    className={`
                      w-full mt-4 
                      ${key === 'pro' 
                        ? 'bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                        : 'bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700'
                      }
                    `}
                  >
                    Upgrade to {plan.tier}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Preferences */}
      <div className="p-6 bg-white rounded-xl border shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          Preferences
        </h4>
        <div className="space-y-4">
          {/* Auto-compress images */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Image className="h-4 w-4 text-purple-600" />
                <p className="font-medium text-gray-900">Auto-compress images</p>
              </div>
              <p className="text-sm text-gray-500">Automatically optimize images on upload to save storage</p>
            </div>
            <Switch
              checked={autoCompress}
              onCheckedChange={setAutoCompress}
              className="ml-4"
            />
          </div>

          {/* Generate video thumbnails */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Video className="h-4 w-4 text-purple-600" />
                <p className="font-medium text-gray-900">Generate video thumbnails</p>
              </div>
              <p className="text-sm text-gray-500">Create preview thumbnails for uploaded videos</p>
            </div>
            <Switch
              checked={generateThumbnails}
              onCheckedChange={setGenerateThumbnails}
              className="ml-4"
            />
          </div>
        </div>
      </div>

      {/* Storage Tips */}
      <div className="p-5 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          💡 Storage Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span>Enable auto-compression to save up to 60% storage space</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span>Delete unused media from your library to free up space</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span>Use external URLs for large files instead of uploading</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 font-bold">•</span>
            <span>Upgrade to Pro for 50GB storage and higher file size limits</span>
          </li>
        </ul>
      </div>
    </div>
  );
}