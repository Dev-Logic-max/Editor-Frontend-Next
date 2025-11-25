'use client';

import { EditorContent } from '@tiptap/react';

interface EditorContentProps {
  editor: any;
}

export function EditorContentComponent({ editor }: EditorContentProps) {
  return (
    <div className="p-2 sm:px-4 h-fit">
      <EditorContent editor={editor} className="prose prose-lg max-w-none focus:outline-none dark:prose-invert"/>
    </div>
  );
}