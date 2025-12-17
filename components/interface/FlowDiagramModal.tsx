'use client';

import { useState, useCallback } from 'react';
import { X, Save, Plus, Download } from 'lucide-react';
import ReactFlow, { Background, Controls, MiniMap, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, NodeChange, EdgeChange, Connection, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

interface FlowDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodes: Node[], edges: Edge[]) => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

export function FlowDiagramModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialNodes = [],
  initialEdges = []
}: FlowDiagramModalProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes.length > 0 ? initialNodes : [
    {
      id: '1',
      type: 'input',
      position: { x: 250, y: 50 },
      data: { label: 'Start' },
    },
  ]);
  
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      }, eds));
    },
    []
  );

  const addNode = (type: 'default' | 'input' | 'output') => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: { label: `Node ${nodes.length + 1}` },
    };
    setNodes([...nodes, newNode]);
  };

  const handleSave = () => {
    onSave(nodes, edges);
    onClose();
  };

  const exportAsImage = () => {
    // Simple implementation - you can enhance this
    alert('Export feature coming soon! For now, use screenshot tools.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-linear-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Flow Diagram Editor</h2>
            <p className="text-sm text-gray-600">Create nodes, connect them, and build your workflow</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
          <button
            onClick={() => addNode('input')}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            Start Node
          </button>
          <button
            onClick={() => addNode('default')}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            Process Node
          </button>
          <button
            onClick={() => addNode('output')}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            End Node
          </button>
          
          <div className="flex-1" />
          
          <button
            onClick={exportAsImage}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Save & Insert
          </button>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1 bg-gray-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="rounded-b-2xl"
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                if (node.type === 'input') return '#10b981';
                if (node.type === 'output') return '#a855f7';
                return '#3b82f6';
              }}
              className="bg-white/80 backdrop-blur"
            />
          </ReactFlow>
        </div>

        {/* Instructions */}
        <div className="p-3 border-t bg-linear-to-r from-blue-50 to-purple-50 text-xs text-gray-600">
          <span className="font-semibold">💡 Tips:</span> 
          Drag nodes to move • Click and drag from a node's edge to create connections • 
          Double-click nodes to edit labels • Use mouse wheel to zoom
        </div>
      </div>
    </div>
  );
}