'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { deleteProfilePhoto, uploadProfilePhoto } from '@/lib/api/uploads';
import { IoCameraOutline, IoCameraReverseOutline, IoTrashOutline } from 'react-icons/io5';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export function ProfileSidebar() {
  const { user, refreshAccessToken } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadProfilePhoto(formData);
      toast.success('Profile photo updated!');
      await refreshAccessToken?.(); // refresh user in context
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remove profile photo?')) return;
    setUploading(true);
    try {
      const res = await deleteProfilePhoto();
      toast.success('Profile photo removed');
      await refreshAccessToken?.();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName?.[0]}`.toUpperCase();
  const photoUrl = user.profilePhoto ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${user.profilePhoto}` : undefined;

  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 text-center space-y-4 border rounded-2xl shadow md:shadow-lg">
      <Avatar className="w-32 h-32 mx-auto ring-2 ring-white shadow-xl overflow-visible relative group">
        <AvatarImage src={photoUrl} alt={initials} className='rounded-full'/>
        <AvatarFallback className="text-3xl font-bold bg-linear-to-br from-purple-500/80 to-pink-600/80 text-white">
          {initials}
        </AvatarFallback>

        <label className="absolute flex items-center justify-center p-1 bg-blue-200 hover:bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer right-0 bottom-1">
          {user.profilePhoto ? <IoCameraReverseOutline className="w-6 h-6 text-white" /> : <IoCameraOutline className="w-6 h-6 text-white" />}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {user.profilePhoto && (
          <button
            onClick={handleDelete}
            disabled={uploading}
            className="absolute left-0 bottom-1 flex items-center justify-center p-1 bg-red-300 hover:bg-red-400 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
          >
            <IoTrashOutline className="w-5 h-5 text-white" />
          </button>
        )}
      </Avatar>

      <h2 className="text-2xl font-bold text-gray-900">
        {user.firstName} {user.lastName}
      </h2>
      <p className="text-sm text-gray-500">{user.email}</p>

      <div className="pt-4 border-t">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Member since</p>
        <p className="text-sm font-medium">
          {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          })}
        </p>
      </div>
    </div>
  );
}