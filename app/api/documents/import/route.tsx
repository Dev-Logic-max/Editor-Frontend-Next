// app/api/documents/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { JSDOM } from 'jsdom';
import mammoth from 'mammoth';
import TurndownService from 'turndown';

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export async function POST(request: NextRequest) {
  console.log('📤 [Import API] Request received');

  try {
    // Get authentication token
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      console.error('❌ [Import API] No auth token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    console.log('📦 [Import API] File:', file?.name, 'Type:', type, 'Size:', file?.size);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('🔄 [Import API] File converted to buffer');

    let content: any;
    let title = file.name.replace(/\.[^/.]+$/, ''); // Remove extension

    // Process based on file type
    switch (type) {
      case 'docx':
        console.log('📝 [Import API] Processing DOCX file...');
        content = await processDocx(buffer);
        break;

      case 'txt':
        console.log('📄 [Import API] Processing TXT file...');
        content = await processTxt(buffer);
        break;

      case 'md':
        console.log('📋 [Import API] Processing Markdown file...');
        content = await processMarkdown(buffer);
        break;

      default:
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    console.log('✅ [Import API] Content processed, creating document...');

    // Create document in database
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        // content: JSON.stringify(content),
        content,
        type: 'imported',
        importedFrom: type,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ [Import API] Failed to create document:', errorData);
      throw new Error(errorData.message || 'Failed to create document');
    }
    
    const document = await response.json();
    
    // Add detailed logging to see response structure
    console.log("Response api", response, document)
    console.log('📦 [Import API] Full response:', JSON.stringify(document, null, 2));
    console.log('🔑 [Import API] Document ID:', document.data._id || document._id || document.id);

    const documentId = document?.data?._id || document?._id || document?.id;

    if (!documentId) {
      console.error('❌ [Import API] No document ID in response:', document);
      throw new Error('Document created but no ID returned');
    }

    console.log('🎉 [Import API] Document created:', document.data._id);

    return NextResponse.json({
      success: true,
      documentId: document.data._id,
      title: document.title,
      message: 'File imported successfully',
    });

  } catch (error: any) {
    console.error('💥 [Import API] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to import file',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}

// ==================== DOCX PROCESSOR ====================
async function processDocx(buffer: Buffer): Promise<any> {
  console.log('🔄 [DOCX] Converting to HTML...');
  
  const result = await mammoth.convertToHtml({ buffer });
  const html = result.value;
  
  console.log('📊 [DOCX] HTML length:', html.length);
  
  if (result.messages.length > 0) {
    console.warn('⚠️ [DOCX] Conversion warnings:', result.messages);
  }

  // Convert HTML to Tiptap JSON format
  const tiptapContent = htmlToTiptapJSON(html);
  
  console.log('✅ [DOCX] Converted to Tiptap JSON');
  return tiptapContent;
}

// ==================== TXT PROCESSOR ====================
async function processTxt(buffer: Buffer): Promise<any> {
  console.log('🔄 [TXT] Reading plain text...');
  
  const text = buffer.toString('utf-8');
  console.log('📊 [TXT] Text length:', text.length);

  // Split into paragraphs and create Tiptap JSON
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  
  const tiptapContent = {
    type: 'doc',
    content: paragraphs.map(paragraph => ({
      type: 'paragraph',
      content: [{ type: 'text', text: paragraph.trim() }]
    }))
  };

  console.log('✅ [TXT] Converted to Tiptap JSON');
  return tiptapContent;
}

// ==================== MARKDOWN PROCESSOR ====================
async function processMarkdown(buffer: Buffer): Promise<any> {
  console.log('🔄 [Markdown] Reading markdown text...');
  
  const markdown = buffer.toString('utf-8');
  console.log('📊 [Markdown] Text length:', markdown.length);

  // Convert Markdown to HTML first (simple conversion)
  const html = markdownToHtml(markdown);
  
  // Then convert HTML to Tiptap JSON
  const tiptapContent = htmlToTiptapJSON(html);
  
  console.log('✅ [Markdown] Converted to Tiptap JSON');
  return tiptapContent;
}

// ==================== HTML TO TIPTAP JSON ====================
function htmlToTiptapJSONV0(html: string): any {
  console.log('🔄 [HTML→JSON] Converting HTML to Tiptap format...');

  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Create a temporary DOM parser
//   const doc = new DOMParser().parseFromString(html, 'text/html');
  
  const content: any[] = [];

  function processNode(node: Node): any {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      return text ? { type: 'text', text } : null;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tag = element.tagName.toLowerCase();

      // Map HTML tags to Tiptap nodes
      switch (tag) {
        case 'p':
          return {
            type: 'paragraph',
            content: Array.from(element.childNodes)
              .map(processNode)
              .filter(Boolean)
          };

        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          return {
            type: 'heading',
            attrs: { level: parseInt(tag[1]) },
            content: Array.from(element.childNodes)
              .map(processNode)
              .filter(Boolean)
          };

        case 'strong':
        case 'b':
          return {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: element.textContent || ''
          };

        case 'em':
        case 'i':
          return {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: element.textContent || ''
          };

        case 'u':
          return {
            type: 'text',
            marks: [{ type: 'underline' }],
            text: element.textContent || ''
          };

        case 'ul':
          return {
            type: 'bulletList',
            content: Array.from(element.children)
              .map(processNode)
              .filter(Boolean)
          };

        case 'ol':
          return {
            type: 'orderedList',
            content: Array.from(element.children)
              .map(processNode)
              .filter(Boolean)
          };

        case 'li':
          return {
            type: 'listItem',
            content: Array.from(element.childNodes)
              .map(processNode)
              .filter(Boolean)
          };

        case 'img':
          return {
            type: 'image',
            attrs: {
              src: element.getAttribute('src') || '',
              alt: element.getAttribute('alt') || '',
            }
          };

        case 'a':
          return {
            type: 'text',
            marks: [{ type: 'link', attrs: { href: element.getAttribute('href') } }],
            text: element.textContent || ''
          };

        case 'code':
          return {
            type: 'text',
            marks: [{ type: 'code' }],
            text: element.textContent || ''
          };

        case 'pre':
          return {
            type: 'codeBlock',
            content: [{ type: 'text', text: element.textContent || '' }]
          };

        case 'blockquote':
          return {
            type: 'blockquote',
            content: Array.from(element.childNodes)
              .map(processNode)
              .filter(Boolean)
          };

        case 'br':
          return { type: 'hardBreak' };

        default:
          // For unknown tags, process children
          return Array.from(element.childNodes)
            .map(processNode)
            .filter(Boolean);
      }
    }

    return null;
  }

  // Process all body children
  Array.from(doc.body.childNodes).forEach(node => {
    const result = processNode(node);
    if (result) {
      if (Array.isArray(result)) {
        content.push(...result);
      } else {
        content.push(result);
      }
    }
  });

  // Ensure we have at least one paragraph
  if (content.length === 0) {
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: '' }]
    });
  }

  console.log('✅ [HTML→JSON] Conversion complete, nodes:', content.length);

  return {
    type: 'doc',
    content
  };
}

// ==================== HTML TO TIPTAP JSON ====================
function htmlToTiptapJSON(html: string): any {
  console.log('🔄 [HTML→JSON] Converting HTML to Tiptap format...');

  const dom = new JSDOM(html);
  const doc = dom.window.document;
  
  // Use jsdom's Node constants
  const TEXT_NODE = dom.window.Node.TEXT_NODE;
  const ELEMENT_NODE = dom.window.Node.ELEMENT_NODE;
  
  const content: any[] = [];

  function processNode(node: any): any {
    if (node.nodeType === TEXT_NODE) {
      const text = node.textContent?.trim();
      return text ? { type: 'text', text } : null;
    }

    if (node.nodeType === ELEMENT_NODE) {
      const element = node as any;
      const tag = element.tagName.toLowerCase();

      // Map HTML tags to Tiptap nodes
      switch (tag) {
        case 'p':
          const paragraphContent = Array.from(element.childNodes)
            .map((n: any) => processNode(n))
            .filter(Boolean);
          
          return {
            type: 'paragraph',
            content: paragraphContent.length > 0 ? paragraphContent : [{ type: 'text', text: '' }]
          };

        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          const headingContent = Array.from(element.childNodes)
            .map((n: any) => processNode(n))
            .filter(Boolean);
          
          return {
            type: 'heading',
            attrs: { level: parseInt(tag[1]) },
            content: headingContent.length > 0 ? headingContent : [{ type: 'text', text: '' }]
          };

        case 'strong':
        case 'b':
          const boldText = element.textContent || '';
          return boldText ? {
            type: 'text',
            marks: [{ type: 'bold' }],
            text: boldText
          } : null;

        case 'em':
        case 'i':
          const italicText = element.textContent || '';
          return italicText ? {
            type: 'text',
            marks: [{ type: 'italic' }],
            text: italicText
          } : null;

        case 'u':
          const underlineText = element.textContent || '';
          return underlineText ? {
            type: 'text',
            marks: [{ type: 'underline' }],
            text: underlineText
          } : null;

        case 'ul':
          const bulletItems = Array.from(element.children)
            .map((n: any) => processNode(n))
            .filter(Boolean);
          
          return bulletItems.length > 0 ? {
            type: 'bulletList',
            content: bulletItems
          } : null;

        case 'ol':
          const orderedItems = Array.from(element.children)
            .map((n: any) => processNode(n))
            .filter(Boolean);
          
          return orderedItems.length > 0 ? {
            type: 'orderedList',
            content: orderedItems
          } : null;

        case 'li':
          const listItemContent = Array.from(element.childNodes)
            .map((n: any) => processNode(n))
            .filter(Boolean);
          
          return {
            type: 'listItem',
            content: listItemContent.length > 0 ? listItemContent : [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: element.textContent || '' }]
              }
            ]
          };

        case 'img':
          const src = element.getAttribute('src') || '';
          return src ? {
            type: 'image',
            attrs: {
              src,
              alt: element.getAttribute('alt') || '',
            }
          } : null;

        case 'a':
          const linkText = element.textContent || '';
          const href = element.getAttribute('href');
          return linkText && href ? {
            type: 'text',
            marks: [{ type: 'link', attrs: { href } }],
            text: linkText
          } : null;

        case 'code':
          const codeText = element.textContent || '';
          return codeText ? {
            type: 'text',
            marks: [{ type: 'code' }],
            text: codeText
          } : null;

        case 'pre':
          const preText = element.textContent || '';
          return preText ? {
            type: 'codeBlock',
            content: [{ type: 'text', text: preText }]
          } : null;

        case 'blockquote':
          const quoteContent = Array.from(element.childNodes)
            .map((n: any) => processNode(n))
            .filter(Boolean);
          
          return quoteContent.length > 0 ? {
            type: 'blockquote',
            content: quoteContent
          } : null;

        case 'br':
          return { type: 'hardBreak' };

        case 'div':
        case 'span':
          // For container elements, process children
          const children = Array.from(element.childNodes)
            .map((n: any) => processNode(n))
            .filter(Boolean);
          
          return children.length > 0 ? children : null;

        default:
          // For unknown tags, try to extract text
          const unknownText = element.textContent?.trim();
          if (unknownText) {
            return { type: 'text', text: unknownText };
          }
          return null;
      }
    }

    return null;
  }

  // Process all body children
  Array.from(doc.body.childNodes).forEach((node: any) => {
    const result = processNode(node);
    if (result) {
      if (Array.isArray(result)) {
        content.push(...result);
      } else {
        content.push(result);
      }
    }
  });

  // Ensure we have at least one paragraph
  if (content.length === 0) {
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: '' }]
    });
  }

  console.log('✅ [HTML→JSON] Conversion complete, nodes:', content.length);

  return {
    type: 'doc',
    content
  };
}

// ==================== SIMPLE MARKDOWN TO HTML ====================
function markdownToHtml(markdown: string): string {
  console.log('🔄 [MD→HTML] Converting Markdown to HTML...');

  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/__(.*?)__/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/_(.*?)_/gim, '<em>$1</em>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Wrap in paragraph
    .replace(/^(?!<[hlu]|<\/[hlu])(.+)$/gim, '<p>$1</p>');

  // Wrap lists
  html = html.replace(/(<li>.*<\/li>)/, '<ul>$1</ul>');

  console.log('✅ [MD→HTML] Conversion complete');
  return html;
}