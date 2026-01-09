import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import InputNode from "./components/InputNode";
import ResultNode from "./components/ResultNode";

// Define custom node types
const nodeTypes = {
  inputNode: InputNode,
  resultNode: ResultNode,
};

// Initial nodes configuration
const initialNodes = [
  {
    id: "input-1",
    type: "inputNode",
    position: { x: 100, y: 100 },
    data: {
      label: "User Input",
      value: "",
      onChange: null, // Will be set in component
    },
  },
  {
    id: "result-1",
    type: "resultNode",
    position: { x: 400, y: 100 },
    data: {
      label: "AI Response",
      content: "",
      loading: false,
    },
  },
];

// Initial edges configuration
const initialEdges = [
  {
    id: "input-to-result",
    source: "input-1",
    target: "result-1",
    type: "smoothstep",
    animated: false,
  },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [currentPrompt, setCurrentPrompt] = useState("");

  // Handle input changes from the Input Node
  const handleInputChange = useCallback(
    (value) => {
      setCurrentPrompt(value);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === "input-1") {
            return {
              ...node,
              data: {
                ...node.data,
                value,
                onChange: handleInputChange,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // Initialize the onChange handler for the input node
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "input-1") {
          return {
            ...node,
            data: {
              ...node.data,
              onChange: handleInputChange,
            },
          };
        }
        return node;
      })
    );
  }, [handleInputChange, setNodes]);

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default App;
