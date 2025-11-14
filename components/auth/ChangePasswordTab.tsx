'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateUser } from '@/lib/api/user';
import { useAuth } from '@/hooks/useAuth';
import { FiKey, FiLogOut } from 'react-icons/fi';
import { IoIosFingerPrint } from "react-icons/io";

export function ChangePasswordTab() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (form.new !== form.confirm) return toast.error('Passwords do not match');
    if (form.new.length < 6) return toast.error('Password too short');

    setSaving(true);
    try {
      await updateUser(user!._id, { password: form.new });
      toast.success('Password changed!');
      setForm({ current: '', new: '', confirm: '' });
    } catch {
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FiKey className="w-6 h-6 text-orange-600" />
        Change Password
      </h4>
      <div className="space-y-4">
        <div>
          <Label>Current Password</Label>
          <Input type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
        </div>
        <div>
          <Label>New Password</Label>
          <Input type="password" value={form.new} onChange={(e) => setForm({ ...form, new: e.target.value })} />
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <Input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Changing...' : 'Change Password'}
      </Button>

      <div className="pt-6 border-t">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <IoIosFingerPrint className="w-7 h-7 text-indigo-600" />
          Two-Factor Authentication
        </h4>
        <p className="text-sm text-gray-600 mb-4">Add an extra layer of security</p>
        <Button variant="outline" className="border-indigo-300 text-indigo-700">
          Enable 2FA
        </Button>
      </div>

      <div className="pt-6 border-t">
        <h4 className="font-semibold mb-4 flex items-center gap-2 text-red-700">
          <FiLogOut className="w-5 h-5" />
          Sign Out Everywhere
        </h4>
        <Button variant="destructive">
          Sign Out All Devices
        </Button>
      </div>
    </div>
  );
}