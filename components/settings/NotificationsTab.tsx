'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function NotificationsSettings() {
  return (
    <Tabs defaultValue="email" className="w-full">
      <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full rounded-xl border bg-white/80 backdrop-blur-sm shadow-md mb-6">
        <TabsTrigger value="email" className="data-[state=active]:bg-linear-to-br data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white rounded-lg">Email</TabsTrigger>
        <TabsTrigger value="push" className="data-[state=active]:bg-linear-to-br data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg">Push</TabsTrigger>
        <TabsTrigger value="documents" className="data-[state=active]:bg-linear-to-br data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg">Documents</TabsTrigger>
        <TabsTrigger value="profile" className="data-[state=active]:bg-linear-to-br data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-lg">Profile</TabsTrigger>
        <TabsTrigger value="promotions" className="data-[state=active]:bg-linear-to-br data-[state=active]:from-yellow-500 data-[state=active]:to-amber-600 data-[state=active]:text-white rounded-lg">Promotions</TabsTrigger>
      </TabsList>

      <TabsContent value="email" className="space-y-4">
        <h3 className="text-xl font-semibold">Email Notifications</h3>
        <div className="space-y-3">
          <div className="flex justify-between"><Label>Collaboration invites</Label><Switch defaultChecked /></div>
          <div className="flex justify-between"><Label>New comments</Label><Switch defaultChecked /></div>
          <div className="flex justify-between"><Label>Document shared</Label><Switch /></div>
        </div>
      </TabsContent>

      <TabsContent value="push" className="space-y-4">
        <h3 className="text-xl font-semibold">Push Notifications</h3>
        <p className="text-sm text-gray-600">Enable browser push (requires permission)</p>
        <Switch defaultChecked />
      </TabsContent>

      <TabsContent value="documents" className="space-y-4">
        <h3 className="text-xl font-semibold">Document Updates</h3>
        <div className="space-y-3">
          <div className="flex justify-between"><Label>Real-time edits</Label><Switch defaultChecked /></div>
          <div className="flex justify-between"><Label>Version history</Label><Switch /></div>
        </div>
      </TabsContent>

      <TabsContent value="profile" className="space-y-4">
        <h3 className="text-xl font-semibold">Profile Activity</h3>
        <div className="flex justify-between"><Label>Mentions</Label><Switch defaultChecked /></div>
      </TabsContent>

      <TabsContent value="promotions" className="space-y-4">
        <h3 className="text-xl font-semibold">Promotions & Updates</h3>
        <div className="flex justify-between"><Label>New features</Label><Switch /></div>
        <div className="flex justify-between"><Label>Tips & tricks</Label><Switch defaultChecked /></div>
      </TabsContent>
    </Tabs>
  );
}