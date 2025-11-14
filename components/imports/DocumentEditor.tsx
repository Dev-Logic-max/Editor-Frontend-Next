'use client';

export function DocumentEditor({ documentId }: { documentId: string }) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-center">Editor for Document {documentId}</h2>
            <p>TODO: Implement Tiptap editor with Hocuspocus for real-time collaboration.</p>
            <p>TODO: Implement Editor with sync of imported content.</p>
        </div>
    );
}