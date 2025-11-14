'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { Shield, Lock, Eye, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export function SecuritySettings() {

  // ── Document Security (mock data – replace with real API) ───
  const [docPasswordEnabled, setDocPasswordEnabled] = useState(false);
  const [docPassword, setDocPassword] = useState('');
  const [linkExpiry, setLinkExpiry] = useState('never');
  const [allowEdit, setAllowEdit] = useState(true);
  const [allowExport, setAllowExport] = useState(true);

  const saveDocSecurity = () => {
    if (docPasswordEnabled && docPassword.length < 4) {
      return toast.error('Document password must be at least 4 characters');
    }
    toast.success('Document security settings saved');
  };

  // ── Activity Log (static demo) ─────────────────────────────
  const activityLog = [
    { id: 1, action: 'Document opened', user: 'You', time: '2 min ago' },
    { id: 2, action: 'Shared with alice@example.com', user: 'You', time: '1 hour ago' },
    { id: 3, action: 'Password changed', user: 'You', time: '3 days ago' },
    { id: 4, action: '2FA enabled', user: 'You', time: '1 week ago' },
    { id: 5, action: 'Signed in from new device', user: 'System', time: '2 weeks ago' },
  ];

  return (
    <div className="space-y-10">
      {/* ── Header ── */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-600" />
          Security Center
        </h3>
        <p className="text-gray-600">Manage account & document protection</p>
      </div>

      {/* ── DOCUMENT SECURITY ── */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            Document Protection
          </h4>
          <Switch checked={docPasswordEnabled} onCheckedChange={setDocPasswordEnabled} />
        </div>

        {docPasswordEnabled && (
          <div className="space-y-2">
            <Label htmlFor="doc-pass">Document Password</Label>
            <Input
              id="doc-pass"
              type="password"
              value={docPassword}
              onChange={(e) => setDocPassword(e.target.value)}
              placeholder="••••"
            />
          </div>
        )}

        <div className="grid md:grid-cols-2">
          <div className='space-y-2'>
            <Label htmlFor="link-expiry">Shared Link Expiry</Label>
            <Select value={linkExpiry} onValueChange={setLinkExpiry}>
              <SelectTrigger id="link-expiry">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor="permissions">Default Permission</Label>
            <Select value={allowEdit ? 'edit' : 'view'} onValueChange={(v) => setAllowEdit(v === 'edit')}>
              <SelectTrigger id="permissions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="edit">
                  <Eye className="inline w-4 h-4 mr-2" />
                  Can Edit
                </SelectItem>
                <SelectItem value="view">
                  <Eye className="inline w-4 h-4 mr-2" />
                  View Only
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="export">Allow Export</Label>
          <Switch id="export" checked={allowExport} onCheckedChange={setAllowExport} />
        </div>

        <Button
          onClick={saveDocSecurity}
          className="w-full md:w-auto bg-linear-to-r from-emerald-500 to-teal-600 text-white"
        >
          Save Document Security
        </Button>
      </Card>

      {/* ── ACTIVITY LOG ── */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          Recent Activity
        </h4>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLog.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell className="text-sm text-gray-500">{log.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}