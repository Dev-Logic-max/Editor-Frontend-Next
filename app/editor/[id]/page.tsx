'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
// import { Editor } from '@/components/editor/Editor';
import Editor from '@/components/test/Editor';
import { getDocument } from '@/lib/api/documents';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { EditorLayout, useEditorSettings } from '@/hooks/useEditorSettings';

export default function EditorPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const { settings } = useEditorSettings();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState<any>(null);
  const layout = settings.appearance?.layout ?? EditorLayout.Document;

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await getDocument(id as string);
        if (res.data.data) {
          setDocument(res.data.data);
        } else {
          toast.error('Document not found or access denied');
          router.push('/dashboard');
        }
      } catch (error) {
        toast.error('Failed to load document');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    if (user && id) fetchDoc();
  }, [id, user, router]);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!document) return null;

  return (
      <Card className={`p-0 ${layout === EditorLayout.Document ? 'border-none shadow-none' : 'rounded-lg'}`}>
        <CardContent className={`p-0`}>
          <Editor
            key={id as string}
            // document={document}
            docData={document}
            userId={user!._id}
            onUpdateTitle={(title: any) => {/* Optional: Update title via API */}}
          />
        </CardContent>
      </Card>
  );
}