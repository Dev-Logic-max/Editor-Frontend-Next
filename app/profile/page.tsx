'use client';

import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditInformationIcon, ChangePasswordIcon, SettingsIcon } from '@/components/icons/ProfileIcons';

import { EditInfoTab } from '@/components/design/EditInfoTab';
import { ChangePasswordTab } from '@/components/auth/ChangePasswordTab';
import { PreferencesTab } from '@/components/design/PreferencesTab';
import { ProfileSidebar } from '@/components/layout/ProfileSidebar';


export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
                <ProfileSidebar />
            </div>

            <div className="lg:col-span-3">
                <Tabs defaultValue="info" className="w-full gap-6">
                    <TabsList className="grid grid-cols-3 w-full rounded-xl border bg-white/80 backdrop-blur-sm shadow-md">
                        <TabsTrigger
                            value="info"
                            className="data-[state=active]:bg-linear-to-br data-[state=active]:from-indigo-500/40 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all border-none"
                        >
                            <EditInformationIcon /><span className='hidden sm:block'>Edit</span> Info
                        </TabsTrigger>
                        <TabsTrigger
                            value="password"
                            className="data-[state=active]:bg-linear-to-br data-[state=active]:from-pink-500/40 data-[state=active]:to-rose-600 data-[state=active]:text-white rounded-lg transition-all border-none"
                        >
                            <ChangePasswordIcon /><span className='hidden sm:block'>Change</span> Password
                        </TabsTrigger>
                        <TabsTrigger
                            value="settings"
                            className="data-[state=active]:bg-linear-to-br data-[state=active]:from-emerald-500/40 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg transition-all border-none"
                        >
                            <SettingsIcon /><span>Settings</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 md:p-8 border">
                        <TabsContent value="info">
                            <EditInfoTab user={user} />
                        </TabsContent>
                        <TabsContent value="password">
                            <ChangePasswordTab />
                        </TabsContent>
                        <TabsContent value="settings">
                            <PreferencesTab />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}