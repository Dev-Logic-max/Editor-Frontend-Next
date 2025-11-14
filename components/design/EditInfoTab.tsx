'use client';

import { useAuth } from '@/hooks/useAuth';
import { updateUser } from '@/lib/api/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function EditInfoTab({ user }: { user: any }) {
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName || '',
    email: user.email,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(user._id, form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}