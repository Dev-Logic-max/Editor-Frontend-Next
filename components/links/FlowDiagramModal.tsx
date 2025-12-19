'use client';

import { useState, useCallback, useRef } from 'react';
import { X, Save, Plus, Download, Trash2, Copy, Undo, Redo, Type, Palette, Workflow } from 'lucide-react';
import ReactFlow, { Background, Controls, MiniMap, addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, NodeChange, EdgeChange, Connection, MarkerType, BackgroundVariant, EdgeMarker } from 'reactflow';
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
  { name: 'Sky Blue', value: '#e0f2fe', border: '#0ea5e9', text: '#0c4a6e' },
  { name: 'Purple', value: '#f3e8ff', border: '#a855f7', text: '#581c87' },
  { name: 'Green', value: '#d1fae5', border: '#10b981', text: '#064e3b' },
  { name: 'Orange', value: '#fed7aa', border: '#f59e0b', text: '#7c2d12' },
  { name: 'Pink', value: '#fce7f3', border: '#ec4899', text: '#831843' },
  { name: 'Indigo', value: '#e0e7ff', border: '#6366f1', text: '#312e81' },
];

const edgeStyles = [
  { name: 'Smooth', value: 'smoothstep', animated: false },
  { name: 'Animated', value: 'smoothstep', animated: true },
  { name: 'Straight', value: 'default', animated: false },
  { name: 'Bezier', value: 'default', animated: true },
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
      style: { 
        background: nodeColors[0].value, 
        color: nodeColors[0].text, 
        border: `3px solid ${nodeColors[0].border}`,
        borderRadius: '12px',
        padding: '12px 20px',
        fontWeight: '600',
        fontSize: '14px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
    },
  ]);
  
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedColor, setSelectedColor] = useState(nodeColors[0]);
  const [selectedEdgeStyle, setSelectedEdgeStyle] = useState(edgeStyles[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEdgeStylePicker, setShowEdgeStylePicker] = useState(false);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [nodeText, setNodeText] = useState('');
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);
        return newNodes;
      });
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);
        return newEdges;
      });
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({
          ...connection,
          type: selectedEdgeStyle.value,
          animated: selectedEdgeStyle.animated,
          style: { stroke: '#6366f1', strokeWidth: 2.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#6366f1',
            width: 20,
            height: 20,
          },
        }, eds);
        saveToHistory(nodes, newEdges);
        return newEdges;
      });
    },
    [nodes, selectedEdgeStyle]
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
      id: `${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
      },
      data: { label: `${type === 'input' ? 'Start' : type === 'output' ? 'End' : 'Step'} ${nodes.length + 1}` },
      style: { 
        background: selectedColor.value, 
        color: selectedColor.text, 
        border: `3px solid ${selectedColor.border}`,
        borderRadius: '12px',
        padding: '12px 20px',
        fontWeight: '600',
        fontSize: '14px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      },
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    saveToHistory(newNodes, edges);
    toast.success('Node added!');
  };

  const onNodeClick = (event: any, node: Node) => {
    setEditingNode(node.id);
    setNodeText(node.data.label);
  };

  const updateNodeText = () => {
    if (!editingNode || !nodeText.trim()) return;
    
    const newNodes = nodes.map(node => 
      node.id === editingNode 
        ? { ...node, data: { ...node.data, label: nodeText } }
        : node
    );
    setNodes(newNodes);
    saveToHistory(newNodes, edges);
    setEditingNode(null);
    setNodeText('');
    toast.success('Node updated!');
  };

  const changeNodeColor = (nodeId: string) => {
    const newNodes = nodes.map(node => 
      node.id === nodeId 
        ? { 
            ...node, 
            style: { 
              ...node.style,
              background: selectedColor.value, 
              color: selectedColor.text, 
              border: `3px solid ${selectedColor.border}`,
            }
          }
        : node
    );
    setNodes(newNodes);
    saveToHistory(newNodes, edges);
    toast.success('Color updated!');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[96vw] h-[94vh] flex flex-col overflow-hidden border-2 border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-linear-to-r from-blue-50 via-purple-50 to-pink-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🎨 Flow Diagram Studio
            </h2>
            <p className="text-sm text-gray-600">Create beautiful visual workflows</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/60 rounded-full transition text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b bg-gray-50/80 flex-wrap">
          {/* Add Nodes */}
          <div className="flex items-center gap-1.5 border-r pr-3">
            <button
              onClick={() => addNode('input')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 text-emerald-700 border-2 border-emerald-300 rounded-lg hover:bg-emerald-200 transition text-sm font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Start
            </button>
            <button
              onClick={() => addNode('default')}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-700 border-2 border-blue-300 rounded-lg hover:bg-blue-200 transition text-sm font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Step
            </button>
            <button
              onClick={() => addNode('output')}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-100 text-purple-700 border-2 border-purple-300 rounded-lg hover:bg-purple-200 transition text-sm font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              End
            </button>
          </div>

          {/* Edit Actions */}
          <div className="flex items-center gap-1 border-r pr-3">
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
          <div className="flex items-center gap-1 border-r pr-3 relative">
            <button
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowEdgeStylePicker(false);
              }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 rounded-lg transition"
              title="Node Color"
            >
              <Palette className="w-4 h-4" />
              <span className="text-sm font-medium">Color</span>
            </button>
            {showColorPicker && (
              <div className="absolute top-12 left-0 bg-white p-3 rounded-xl shadow-2xl border-2 border-gray-200 z-20">
                <p className="text-xs font-semibold mb-2 text-gray-700">Node Color</p>
                <div className="grid grid-cols-3 gap-2">
                  {nodeColors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color);
                        const selectedNodes = nodes.filter(n => n.selected);
                        if (selectedNodes.length > 0) {
                          selectedNodes.forEach(node => changeNodeColor(node.id));
                        }
                        setShowColorPicker(false);
                      }}
                      className="group relative"
                      title={color.name}
                    >
                      <div 
                        className="w-12 h-12 rounded-lg border-3 hover:scale-110 transition shadow-md"
                        style={{ 
                          background: color.value,
                          borderColor: selectedColor.name === color.name ? '#000' : color.border,
                          borderWidth: selectedColor.name === color.name ? '3px' : '2px',
                        }}
                      />
                      <span className="absolute -bottom-5 left-0 right-0 text-[9px] text-gray-600 opacity-0 group-hover:opacity-100 transition text-center">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Edge Style Picker */}
          <div className="flex items-center gap-1 border-r pr-3 relative">
            <button
              onClick={() => {
                setShowEdgeStylePicker(!showEdgeStylePicker);
                setShowColorPicker(false);
              }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 rounded-lg transition"
              title="Arrow Style"
            >
              <Workflow className="w-4 h-4" />
              <span className="text-sm font-medium">Arrow</span>
            </button>
            {showEdgeStylePicker && (
              <div className="absolute top-12 left-0 bg-white p-3 rounded-xl shadow-2xl border-2 border-gray-200 z-20">
                <p className="text-xs font-semibold mb-2 text-gray-700">Connection Style</p>
                <div className="space-y-1">
                  {edgeStyles.map(style => (
                    <button
                      key={style.name}
                      onClick={() => {
                        setSelectedEdgeStyle(style);
                        setShowEdgeStylePicker(false);
                        toast.success(`Arrow style: ${style.name}`);
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left hover:bg-blue-50 transition ${
                        selectedEdgeStyle.name === style.name ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Stats */}
          <div className="text-xs font-semibold text-gray-700 border-l pl-3">
            <span className="text-blue-600">{nodes.length}</span> nodes • 
            <span className="text-purple-600"> {edges.length}</span> connections
          </div>

          {/* Export & Save */}
          <button
            onClick={exportAsJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition text-sm font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 border-2 border-red-300 rounded-lg hover:bg-red-200 transition text-sm font-semibold"
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
        <div className="flex-1 bg-linear-to-br from-blue-50/30 via-purple-50/30 to-pink-50/30">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            className="rounded-b-2xl"
          >
            <Background 
              color="#cbd5e1" 
              gap={20} 
              variant={BackgroundVariant.Dots}
            />
            <Controls className="bg-white/90 border-2 border-gray-300 rounded-lg" />
            <MiniMap 
              nodeColor={(node) => {
                if (node.type === 'input') return '#d1fae5';
                if (node.type === 'output') return '#f3e8ff';
                return '#e0f2fe';
              }}
              className="bg-white/90 border-2 border-gray-300 rounded-lg"
            />
          </ReactFlow>
        </div>

        {/* Edit Node Modal */}
        {editingNode && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-30">
            <div className="bg-white p-6 rounded-2xl shadow-2xl border-2 border-blue-300 w-96">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Type className="w-5 h-5 text-blue-600" />
                Edit Node Text
              </h3>
              <input
                type="text"
                value={nodeText}
                onChange={(e) => setNodeText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateNodeText();
                  if (e.key === 'Escape') {
                    setEditingNode(null);
                    setNodeText('');
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                placeholder="Enter node text..."
                autoFocus
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={updateNodeText}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setEditingNode(null);
                    setNodeText('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Footer */}
        <div className="p-3 border-t bg-linear-to-r from-blue-50 via-purple-50 to-pink-50 text-xs text-gray-700">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="font-bold">💡 Tips:</span> 
              <span className="ml-2">Click node to edit text • Drag nodes to move • Connect by dragging from edge • Select & press Delete to remove</span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span><kbd className="px-2 py-1 bg-white rounded border font-mono">Ctrl+Z</kbd> Undo</span>
              <span><kbd className="px-2 py-1 bg-white rounded border font-mono">Ctrl+D</kbd> Duplicate</span>
              <span><kbd className="px-2 py-1 bg-white rounded border font-mono">Del</kbd> Delete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}