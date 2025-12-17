'use client';

import { useState, useCallback } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import ReactFlow, { Background, Controls, MiniMap,addEdge, applyNodeChanges, applyEdgeChanges, Node, Edge, NodeChange, EdgeChange, Connection } from 'reactflow';
import 'reactflow/dist/style.css';

export default function FlowDiagramComponent({ node, updateAttributes }: any) {
  const [nodes, setNodes] = useState<Node[]>(node.attrs.nodes || []);
  const [edges, setEdges] = useState<Edge[]>(node.attrs.edges || []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);
      updateAttributes({ nodes: newNodes });
    },
    [nodes, updateAttributes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
      updateAttributes({ edges: newEdges });
    },
    [edges, updateAttributes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge(connection, edges);
      setEdges(newEdges);
      updateAttributes({ edges: newEdges });
    },
    [edges, updateAttributes]
  );

  const addNode = () => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: 'default',
      position: {
        x: Math.random() * 400,
        y: Math.random() * 300,
      },
      data: { label: `Node ${nodes.length + 1}` },
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    updateAttributes({ nodes: newNodes });
  };

  return (
    <NodeViewWrapper className="flow-diagram-wrapper my-4">
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
          <span className="text-sm font-medium text-gray-700">Flow Diagram</span>
          <button
            onClick={addNode}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            + Add Node
          </button>
        </div>
        <div style={{ width: '100%', height: '500px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </NodeViewWrapper>
  );
}