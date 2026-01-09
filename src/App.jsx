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
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorDisplay from "./components/ErrorDisplay";
import SuccessNotification from "./components/SuccessNotification";
import LoadingSpinner from "./components/LoadingSpinner";
import {
  validatePrompt,
  validatePromptResponsePair,
  sanitizeInput,
} from "./utils/validation";

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
  const [currentResponse, setCurrentResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle input changes from the Input Node
  const handleInputChange = useCallback(
    (value) => {
      // Sanitize input to prevent potential issues
      const sanitizedValue = sanitizeInput(value);
      setCurrentPrompt(sanitizedValue);

      // Clear any existing errors when user starts typing
      if (error) {
        setError(null);
      }

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === "input-1") {
            return {
              ...node,
              data: {
                ...node.data,
                value: sanitizedValue,
                onChange: handleInputChange,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes, error]
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

  // Handle Run Flow button click
  const handleRunFlow = async () => {
    // Validate input before submission
    const validation = validatePrompt(currentPrompt);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Update Result Node to show loading state
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "result-1") {
          return {
            ...node,
            data: {
              ...node.data,
              loading: true,
              content: "",
            },
          };
        }
        return node;
      })
    );

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch("http://localhost:5000/api/ask-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: currentPrompt.trim() }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = "Failed to get AI response";

        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          // Use default error message
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.response) {
        throw new Error("Invalid response format from server");
      }

      setCurrentResponse(data.response);

      // Update Result Node with AI response
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === "result-1") {
            return {
              ...node,
              data: {
                ...node.data,
                loading: false,
                content: data.response,
              },
            };
          }
          return node;
        })
      );
    } catch (err) {
      console.error("Error calling AI API:", err);

      let errorMessage = "Failed to process your request";

      if (err.name === "AbortError") {
        errorMessage = "Request timed out. Please try again.";
      } else if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError")
      ) {
        errorMessage =
          "Unable to connect to the server. Please check your connection and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      // Update Result Node to clear loading state
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === "result-1") {
            return {
              ...node,
              data: {
                ...node.data,
                loading: false,
                content: "",
              },
            };
          }
          return node;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Save button click
  const handleSave = async () => {
    // Validate prompt-response pair before submission
    const validation = validatePromptResponsePair(
      currentPrompt,
      currentResponse
    );
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch("http://localhost:5000/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentPrompt.trim(),
          response: currentResponse.trim(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = "Failed to save prompt-response pair";

        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          // Use default error message
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Save operation failed");
      }

      setSaveSuccess(true);
      // Clear success message after 5 seconds
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      console.error("Error saving data:", err);

      let errorMessage = "Failed to save your data";

      if (err.name === "AbortError") {
        errorMessage = "Save request timed out. Please try again.";
      } else if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError")
      ) {
        errorMessage =
          "Unable to connect to the server. Please check your connection and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Clear error when user dismisses it
  const handleDismissError = () => {
    setError(null);
  };

  // Clear success notification when user dismisses it
  const handleDismissSuccess = () => {
    setSaveSuccess(false);
  };

  return (
    <ErrorBoundary>
      <div className="w-full h-screen flex flex-col">
        {/* Control Panel */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">
              AI Flow Visualizer
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRunFlow}
                disabled={isLoading || !currentPrompt.trim()}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center ${
                  isLoading || !currentPrompt.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" text="" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  "Run Flow"
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={
                  isSaving || !currentPrompt.trim() || !currentResponse.trim()
                }
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center ${
                  isSaving || !currentPrompt.trim() || !currentResponse.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" text="" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>

          {/* Notifications Area */}
          <div className="mt-4 space-y-2">
            {error && (
              <ErrorDisplay error={error} onDismiss={handleDismissError} />
            )}
            {saveSuccess && (
              <SuccessNotification
                message="Prompt-response pair saved successfully!"
                onDismiss={handleDismissSuccess}
              />
            )}
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1">
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
      </div>
    </ErrorBoundary>
  );
}

export default App;
