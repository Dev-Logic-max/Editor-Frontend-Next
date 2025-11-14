'use client';

import { EditorContent } from '@tiptap/react';

interface EditorContentProps {
  editor: any;
}

export function EditorContentComponent({ editor }: EditorContentProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-[500px]">
      <EditorContent editor={editor} className="prose prose-lg max-w-none focus:outline-none dark:prose-invert"/>
    </div>
  );
}