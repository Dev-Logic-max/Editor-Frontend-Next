// app/api/collaboration/route.ts
import { Server } from '@hocuspocus/server';
import { TiptapTransformer } from '@hocuspocus/transformer';
import * as Y from 'yjs';
import jwt from 'jsonwebtoken';

// TipTap extensions for schema
import Image from '@tiptap/extension-image';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import HardBreak from '@tiptap/extension-hard-break';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { TableKit } from '@tiptap/extension-table';

// Schema extensions
const SCHEMA_EXTENSIONS = [
  Document,
  Paragraph,
  Text,
  Heading,
  Bold,
  Italic,
  Strike,
  Link,
  Code,
  CodeBlock,
  Blockquote,
  BulletList,
  OrderedList,
  ListItem,
  HardBreak,
  HorizontalRule,
  Image.configure({ inline: false, allowBase64: true }),
  TableKit,
];

// Helper function to clean Tiptap content (same as your cleanTiptapContent util)
function cleanTiptapContent(content: any): any {
  if (!content || typeof content !== 'object') return content;

  if (content.type === 'table') {
    if (content.content) {
      content.content = content.content.map((row: any) => {
        if (row.type === 'tableRow' && row.content) {
          row.content = row.content.filter((cell: any) => 
            cell.type === 'tableCell' || cell.type === 'tableHeader'
          );
        }
        return row;
      });
    }
  }

  if (content.content && Array.isArray(content.content)) {
    content.content = content.content.map((child: any) => cleanTiptapContent(child));
  }

  return content;
}

// API functions to interact with your backend
async function fetchDocument(userId: string, docId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${docId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`, // Use server-side API key
    },
  });
  if (!response.ok) throw new Error('Failed to fetch document');
  return response.json();
}

async function updateDocument(userId: string, docId: string, content: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${docId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Failed to update document');
  return response.json();
}

async function fetchUser(userId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

// Create Hocuspocus server instance (singleton)
let server: Server | null = null;

function getServer() {
  if (server) return server;

  server = new Server({
    port: parseInt(process.env.HOCUSPOCUS_PORT || '1234'),
    debounce: 3000,
    maxDebounce: 10000,
    name: 'AI-Editor-Collab',

    onRequest: async (data) => {
      console.log('📨 [Request] Incoming request received');
      console.log(`📨 [Request] URL: ${data.request?.url}`);
    },

    onConnect: async (data) => {
      const userName = data.context.userName;
      const userId = data.context.userId;
      console.log(`👤 ${userName || userId} connected to document ${data.documentName} 📄`);
    },

    onAuthenticate: async (data) => {
      console.log('🪧 [Auth] Starting authentication...');
      try {
        // Get token from multiple sources
        let token = '';

        // 1. Check token parameter
        if (data.token) {
          token = data.token;
          console.log('1️⃣ [Auth] Token found in data.token');
        }

        // 2. Check request URL
        if (!token) {
          const url = data.request?.url || '';
          console.log('🔍 [Auth] Request URL:', url);
          
          const tokenMatch = url.match(/[?&]token=([^&]+)/);
          if (tokenMatch) {
            token = decodeURIComponent(tokenMatch[1]);
            console.log('2️⃣ [Auth] Token found in URL');
          }
        }

        if (!token) {
          console.error('🚫 [Auth] No token found anywhere! ⚠️');
          throw new Error('No authentication token provided');
        }

        // Verify JWT
        console.log('🔐 [Auth] Verifying JWT...');
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
        console.log('✅ [Auth] JWT verified, payload:', { sub: payload.sub, role: payload.role });

        // Get user from database
        const user = await fetchUser(payload.sub);
        
        if (!user) {
          console.error('❌ [Auth] User not found in database:', payload.sub);
          throw new Error('User not found');
        }

        // Set context
        data.context = { 
          userId: payload.sub, 
          userName: `${user.firstName} ${user?.lastName}`.trim() 
        };

        console.log(`✅ 👤 ${data.context.userName} 🛡️ authenticated for 📄 ${data.documentName}`);

        return data.context;

      } catch (error: any) {
        console.error('❌ [Auth] Error:', error.message);
        console.error('❌ [Auth] Stack:', error.stack);
        throw new Error(`Authentication failed ⚠️: ${error.message}`);
      }
    },

    onLoadDocument: async (data): Promise<Y.Doc> => {
      const docId = data.documentName;
      const userId = data.context.userId;

      if (!userId) {
        console.log(`🚫 No userId in context for document ${docId}`);
        throw new Error('❗User not authenticated❗');
      }

      try {
        const doc = await fetchDocument(userId, docId);
        const yDoc = new Y.Doc();
        
        if (doc && doc.content) {
          let json = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;

          // Clean the content before transforming
          json = cleanTiptapContent(json);
          console.log('🧹 Content cleaned, transforming to Y.Doc...');

          TiptapTransformer.toYdoc(json, 'document', SCHEMA_EXTENSIONS);
          console.log(
            `🔄️ Loaded 📑 document ${docId} for 👤 ${data.context.userName}`,
          );
        } else {
          console.log(`⚠️ No content found for document ${docId}, starting fresh`);
        }
        
        return yDoc;
      } catch (error: any) {
        console.log(`🚫 Failed to load document ${docId}: ${error.message}`);
        throw error;
      }
    },

    onStoreDocument: async (data) => {
      const docId = data.documentName;
      const userId = data.context.userId;
      const userName = data.context.userName;
      
      if (!userId) {
        console.log(`🚫 No userId in context for document ${docId}`);
        throw new Error('❗User not authenticated❗');
      }
      
      try {
        const json = TiptapTransformer.fromYdoc(data.document, 'document');
        await updateDocument(userId, docId, json);
        console.log(`💾 Document ${docId} saved by 👤 ${userName}`);
      } catch (error: any) {
        console.log(`🚫 Failed to persist document ${docId}: ${error.message}`);
        throw error;
      }
    },

    onDisconnect: async (data) => {
      const userName = data.context.userName;
      const userId = data.context.userId;
      console.log(
        `🔌👤 ${userName || userId} disconnected from document ${data.documentName} 📄`,
      );
    },
  });

  return server;
}

// Start server on first request
export async function GET() {
  try {
    const server = getServer();
    
    // Start server if not already listening
    if (!server.webSocketServer) {
      await server.listen();
      console.log(`🗄️ Hocuspocus server started on port ${process.env.HOCUSPOCUS_PORT || 1234} 🛰️`);
    }

    return new Response(
      JSON.stringify({ 
        status: 'running', 
        port: process.env.HOCUSPOCUS_PORT || 1234 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error('Failed to start Hocuspocus server:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle WebSocket upgrade
export async function UPGRADE(request: Request) {
  const server = getServer();
  
  // This triggers Next.js to handle the WebSocket connection
  // The actual WebSocket handling is done by Hocuspocus
  return new Response(null, {
    status: 101,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade',
    },
  });
}