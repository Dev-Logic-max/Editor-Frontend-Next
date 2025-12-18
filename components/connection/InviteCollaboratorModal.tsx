'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { X, Mail, Send, UserPlus, Crown, User, Shield, Trash2, Search, Bell, Copy, Check } from 'lucide-react';
import { ManageCollaboratorIcon } from '@/components/icons/Document';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { getDocument, updateDocument } from '@/lib/api/documents';
import { sendInvite } from '@/lib/api/requests';

interface Collaborator {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
  role: 'owner' | 'editor' | 'viewer';
  addedAt: Date;
  status: 'active' | 'pending' | 'inactive';
}

interface InviteModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

export function InviteModal({ documentId, isOpen, onClose, currentUserId }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'invite' | 'manage'>('invite');

  // Invite options
  const [inviteViaEmail, setInviteViaEmail] = useState(true);
  const [inviteViaInApp, setInviteViaInApp] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor');

  // Collaborators
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [documentOwner, setDocumentOwner] = useState<any>(null);
  const [loadingCollaborators, setLoadingCollaborators] = useState(false);

  // Share link
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setMessage('');
      setSearchQuery('');
    } else {
      loadCollaborators();
    }
  }, [isOpen]);

  const loadCollaborators = async () => {
    setLoadingCollaborators(true);
    try {
      const response = await getDocument(documentId);
      const doc = response.data.data;

      setDocumentOwner(doc.creator);

      // Transform collaborators to match interface
      const collabList: Collaborator[] = doc.collaborators.map((collab: any) => ({
        _id: collab._id,
        firstName: collab.firstName,
        lastName: collab.lastName,
        email: collab.email || 'email@example.com', // Dummy for now
        profilePhoto: collab.profilePhoto,
        role: 'editor', // Dummy role for now
        addedAt: new Date(), // Dummy date
        status: 'active', // Dummy status
      }));

      setCollaborators(collabList);
    } catch (error) {
      console.error('Failed to load collaborators:', error);
      toast.error('Failed to load collaborators');
    } finally {
      setLoadingCollaborators(false);
    }
  };

  const handleSendInvite = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!inviteViaEmail && !inviteViaInApp) {
      toast.error('Please select at least one invite method');
      return;
    }

    setLoading(true);
    try {
      await sendInvite({
        receiverEmail: email,
        documentId,
        message,
        // These are for future backend implementation
        // inviteMethod: inviteViaEmail && inviteViaInApp ? 'both' : inviteViaEmail ? 'email' : 'in-app',
        // role: selectedRole,
      });

      toast.success(
        inviteViaEmail && inviteViaInApp
          ? '✅ Invite sent via email & in-app notification!'
          : inviteViaEmail
            ? '✅ Invite sent via email!'
            : '✅ In-app notification sent!'
      );

      setEmail('');
      setMessage('');
      loadCollaborators(); // Reload to show new pending invite
    } catch (error) {
      toast.error('Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!confirm('Remove this collaborator? They will lose access to this document.')) {
      return;
    }

    try {
      // Remove from collaborators array
      const updatedCollaborators = collaborators
        .filter(c => c._id !== collaboratorId)
        .map(c => c._id);

      await updateDocument(documentId, {
        collaborators: updatedCollaborators
      });

      setCollaborators(prev => prev.filter(c => c._id !== collaboratorId));
      toast.success('✅ Collaborator removed');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove collaborator');
    }
  };

  const handleChangeRole = async (collaboratorId: string, newRole: string) => {
    // TODO: Implement role change in backend
    toast.success(`✅ Role updated to ${newRole} (Coming soon)`);
  };

  const handleCopyShareLink = () => {
    const shareLink = `${window.location.origin}/documents/${documentId}`;
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    toast.success('✅ Share link copied!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const filteredCollaborators = collaborators.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'editor': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'viewer': return <User className="h-4 w-4 text-gray-600" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'editor': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'inactive': return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Inactive</Badge>;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className='flex gap-2'>
            <ManageCollaboratorIcon className="h-8 w-8 mt-1" />
            <div>
              <p className="flex items-center gap-2 text-2xl">
                Manage Collaborators
              </p>
              <p className="text-sm font-normal text-gray-500">
                Invite people to collaborate on this document
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex flex-col overflow-hidden gap-0">
          <div className="p-2 border-b">
            <TabsList className="grid w-full grid-cols-2 content-center">
              <TabsTrigger value="invite" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Send Invite
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Manage Access
                <Badge variant="secondary" className="ml-1">{collaborators.length + 1}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Invite Tab */}
          <TabsContent value="invite" className="flex-1 overflow-y-auto p-6 m-0 space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <Input
                placeholder="colleague@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold w-full text-gray-700">Access Level</label>
              <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <p className="font-medium">Editor</p>
                      <p className="text-xs text-gray-500">Can edit and comment</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <div className="font-medium">Viewer</div>
                      <div className="text-xs text-gray-500">Can only view (Coming soon)</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Invite Method */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Invite Method</label>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <label
                  htmlFor="invite-email"
                  className="flex-1 flex items-center gap-3 cursor-pointer"
                >
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">Send Email Invitation</div>
                    <div className="text-xs text-gray-500">User will receive an email with invitation link</div>
                  </div>
                </label>
                <Checkbox
                  id="invite-email"
                  checked={inviteViaEmail}
                  onCheckedChange={(checked) => setInviteViaEmail(!!checked)}
                />
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <label
                  htmlFor="invite-inapp"
                  className="flex-1 flex items-center gap-3 cursor-pointer"
                >
                  <Bell className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-sm">In-App Notification</div>
                    <div className="text-xs text-gray-500">User will be notified inside the app (Coming soon)</div>
                  </div>
                </label>
                <Checkbox
                  id="invite-inapp"
                  checked={inviteViaInApp}
                  onCheckedChange={(checked) => setInviteViaInApp(!!checked)}
                />
              </div>
            </div>

            {/* Optional Message */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Personal Message (Optional)</label>
              <Textarea
                placeholder="Add a personal message to your invitation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendInvite}
              disabled={loading || !email.trim()}
              className="w-full h-11 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>

            {/* Share Link Section */}
            <div className="p-4 bg-linear-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Copy className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Share Link</h3>
                </div>
                <Badge variant="outline" className="text-xs">Quick Share</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Anyone with this link can view this document
              </p>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/documents/${documentId}`}
                  readOnly
                  className="bg-white"
                />
                <Button
                  onClick={handleCopyShareLink}
                  className="shrink-0"
                  variant={linkCopied ? 'default' : 'outline'}
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="flex-1 flex flex-col overflow-hidden m-0">
            {/* Search */}
            <div className="px-6 py-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search collaborators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Collaborators List */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingCollaborators ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4" />
                    <p className="text-gray-600">Loading collaborators...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Document Owner */}
                  {documentOwner && (
                    <div className="p-4 bg-linear-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-yellow-400">
                          <AvatarImage
                            src={documentOwner.profilePhoto ? `${process.env.NEXT_PUBLIC_API_URL}${documentOwner.profilePhoto}` : ''}
                          />
                          <AvatarFallback className="bg-linear-to-br from-yellow-400 to-orange-400 text-white font-bold">
                            {documentOwner.firstName?.[0]}{documentOwner.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {documentOwner.firstName} {documentOwner.lastName}
                            </span>
                            {documentOwner._id === currentUserId && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{documentOwner.email || 'owner@example.com'}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={getRoleBadgeColor('owner')}>
                            <Crown className="h-3 w-3 mr-1" />
                            Owner
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Collaborators */}
                  {filteredCollaborators.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <UserPlus className="h-16 w-16 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">No collaborators yet</p>
                      <p className="text-sm mt-1">Invite people to start collaborating</p>
                    </div>
                  ) : (
                    filteredCollaborators.map((collab) => (
                      <motion.div
                        key={collab._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-xl hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2">
                            <AvatarImage
                              src={collab.profilePhoto ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/profile/${collab.profilePhoto}` : ''}
                            />
                            <AvatarFallback className="bg-linear-to-br from-purple-400 to-blue-400 text-white font-bold">
                              {collab.firstName?.[0]}{collab.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 truncate">
                                {collab.firstName} {collab.lastName}
                              </span>
                              {collab._id === currentUserId && (
                                <Badge variant="outline" className="text-xs">You</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{collab.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                Added {new Date(collab.addedAt).toLocaleDateString()}
                              </span>
                              {getStatusBadge(collab.status)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Role Selector (Disabled for now) */}
                            <Select
                              value={collab.role}
                              onValueChange={(v) => handleChangeRole(collab._id, v)}
                              disabled
                            >
                              <SelectTrigger className="w-32 h-9">
                                <div className="flex items-center gap-1">
                                  {getRoleIcon(collab.role)}
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>

                            {/* Remove Button */}
                            {collab._id !== currentUserId && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveCollaborator(collab._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-600">
            <span>{collaborators.length + 1} total member(s)</span>
            <span className="text-gray-400">•</span>
            <span>{collaborators.filter(c => c.status === 'active').length} active</span>
          </div>
          <span className="text-xs text-gray-500">
            Role management coming soon
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}