'use client';

import { useState, useCallback, useRef } from 'react';
import { X, Save, Plus, Download, Trash2, Copy, Undo, Redo, ZoomIn, ZoomOut, Maximize2, Grid3x3, Palette, Type, Layout } from 'lucide-react';
import ReactFlow, { Background, Controls, MiniMap, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, NodeChange, EdgeChange, Connection, MarkerType, BackgroundVariant, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import toast from 'react-hot-toast';

interface FlowDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodes: Node[], edges: Edge[]) => void;
  initialNodes?: Node[];
  initialEdges?: Edge[];
}

const nodeColors = [
  { name: 'Blue', value: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { name: 'Purple', value: '#a855f7', gradient: 'linear-gradient(135deg, #a855f7, #9333ea)' },
  { name: 'Green', value: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { name: 'Orange', value: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { name: 'Red', value: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  { name: 'Pink', value: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
];

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
      style: { background: nodeColors[0].gradient, color: 'white', border: '2px solid #2563eb', borderRadius: '8px', padding: '10px' },
    },
  ]);
  
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedColor, setSelectedColor] = useState(nodeColors[0]);
  const [backgroundVariant, setBackgroundVariant] = useState<BackgroundVariant>(BackgroundVariant.Dots);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);
        saveToHistory(newNodes, edges);
        return newNodes;
      });
    },
    [edges]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);
        saveToHistory(nodes, newEdges);
        return newEdges;
      });
    },
    [nodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({
          ...connection,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6366f1',
          },
        }, eds);
        saveToHistory(nodes, newEdges);
        return newEdges;
      });
    },
    [nodes]
  );

  const saveToHistory = (newNodes: Node[], newEdges: Edge[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: newNodes, edges: newEdges });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const addNode = (type: 'default' | 'input' | 'output') => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: { label: `${type === 'input' ? 'Start' : type === 'output' ? 'End' : 'Process'} ${nodes.length + 1}` },
      style: { 
        background: selectedColor.gradient, 
        color: 'white', 
        border: `2px solid ${selectedColor.value}`,
        borderRadius: '8px',
        padding: '10px',
        fontWeight: '500',
      },
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    saveToHistory(newNodes, edges);
    toast.success('Node added!');
  };

  const deleteSelected = () => {
    const selectedNodes = nodes.filter(n => n.selected);
    const selectedEdges = edges.filter(e => e.selected);
    
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      toast.error('Select nodes or edges to delete');
      return;
    }

    const newNodes = nodes.filter(n => !n.selected);
    const newEdges = edges.filter(e => !e.selected && !selectedNodes.find(n => n.id === e.source || n.id === e.target));
    
    setNodes(newNodes);
    setEdges(newEdges);
    saveToHistory(newNodes, newEdges);
    toast.success(`Deleted ${selectedNodes.length} nodes and ${selectedEdges.length} edges`);
  };

  const duplicateSelected = () => {
    const selectedNodes = nodes.filter(n => n.selected);
    if (selectedNodes.length === 0) {
      toast.error('Select nodes to duplicate');
      return;
    }

    const newNodes = selectedNodes.map(node => ({
      ...node,
      id: `${Date.now()}-${Math.random()}`,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      selected: false,
    }));

    const updatedNodes = [...nodes.map(n => ({ ...n, selected: false })), ...newNodes];
    setNodes(updatedNodes);
    saveToHistory(updatedNodes, edges);
    toast.success(`Duplicated ${newNodes.length} nodes`);
  };

  const autoLayout = () => {
    // Simple auto-layout algorithm
    const newNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 3) * 250 + 100,
        y: Math.floor(index / 3) * 150 + 100,
      },
    }));
    setNodes(newNodes);
    saveToHistory(newNodes, edges);
    toast.success('Layout organized!');
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all nodes and edges?')) {
      setNodes([]);
      setEdges([]);
      saveToHistory([], []);
      toast.success('Canvas cleared!');
    }
  };

  const handleSave = () => {
    if (nodes.length === 0) {
      toast.error('Add at least one node before saving!');
      return;
    }
    onSave(nodes, edges);
    toast.success('Flow diagram saved!');
  };

  const exportAsJSON = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-diagram-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as JSON!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[96vw] h-[94vh] flex flex-col overflow-hidden border-4 border-blue-500">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-linear-to-r from-blue-500 to-purple-600">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🎨 Flow Diagram Studio
            </h2>
            <p className="text-sm text-blue-100">Professional visual workflow editor</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b bg-gray-50 flex-wrap">
          {/* Add Nodes */}
          <div className="flex items-center gap-1 border-r pr-2">
            <button
              onClick={() => addNode('input')}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Start
            </button>
            <button
              onClick={() => addNode('default')}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Process
            </button>
            <button
              onClick={() => addNode('output')}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              End
            </button>
          </div>

          {/* Edit Actions */}
          <div className="flex items-center gap-1 border-r pr-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-40 transition"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-40 transition"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={duplicateSelected}
              className="p-2 hover:bg-gray-200 rounded transition"
              title="Duplicate Selected"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={deleteSelected}
              className="p-2 hover:bg-red-100 text-red-600 rounded transition"
              title="Delete Selected"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-1 border-r pr-2">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 hover:bg-gray-200 rounded transition"
              title="Node Color"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showColorPicker && (
              <div className="absolute top-20 left-4 bg-white p-3 rounded-lg shadow-xl border z-10">
                <p className="text-xs font-semibold mb-2">Node Color</p>
                <div className="flex gap-2">
                  {nodeColors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color);
                        setShowColorPicker(false);
                      }}
                      className="w-8 h-8 rounded-full border-2 hover:scale-110 transition"
                      style={{ background: color.gradient, borderColor: selectedColor.name === color.name ? '#000' : 'transparent' }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Layout Actions */}
          <div className="flex items-center gap-1 border-r pr-2">
            <button
              onClick={autoLayout}
              className="p-2 hover:bg-gray-200 rounded transition"
              title="Auto Layout"
            >
              <Layout className="w-4 h-4" />
            </button>
            <button
              onClick={() => setBackgroundVariant(backgroundVariant === BackgroundVariant.Dots ? BackgroundVariant.Lines : BackgroundVariant.Dots)}
              className="p-2 hover:bg-gray-200 rounded transition"
              title="Toggle Grid"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1" />

          {/* Stats */}
          <div className="text-xs text-gray-600 border-l pl-2">
            <span className="font-semibold">{nodes.length}</span> nodes • 
            <span className="font-semibold"> {edges.length}</span> connections
          </div>

          {/* Export & Save */}
          <button
            onClick={exportAsJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition text-sm font-bold shadow-lg"
          >
            <Save className="w-4 h-4" />
            Save & Insert
          </button>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1 bg-gray-100">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            className="rounded-b-2xl"
          >
            <Background 
              color="#aaa" 
              gap={backgroundVariant === BackgroundVariant.Dots ? 16 : 20} 
              variant={backgroundVariant}
            />
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                if (node.type === 'input') return '#10b981';
                if (node.type === 'output') return '#a855f7';
                return '#3b82f6';
              }}
              className="bg-white/90 backdrop-blur border-2 border-gray-300 rounded-lg"
            />
          </ReactFlow>
        </div>

        {/* Instructions Footer */}
        <div className="p-3 border-t bg-linear-to-r from-blue-50 to-purple-50 text-xs text-gray-700">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="font-bold">💡 Quick Tips:</span> 
              <span className="ml-2">Drag nodes • Connect by dragging from edge • Double-click to edit label • Delete key removes selected</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white rounded border text-[10px]">Ctrl+Z</kbd> Undo
              <kbd className="px-2 py-1 bg-white rounded border text-[10px]">Ctrl+D</kbd> Duplicate
              <kbd className="px-2 py-1 bg-white rounded border text-[10px]">Del</kbd> Delete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}