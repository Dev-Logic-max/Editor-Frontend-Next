import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FlowDiagramComponent from '@/components/links/FlowDiagramComponent';

export const FlowDiagram = Node.create({
  name: 'flowDiagram',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      nodes: {
        default: [],
      },
      edges: {
        default: [],
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="flow-diagram"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'flow-diagram', ...HTMLAttributes }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FlowDiagramComponent);
  },
});