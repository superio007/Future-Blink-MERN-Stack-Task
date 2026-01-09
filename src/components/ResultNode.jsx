import { Handle, Position } from "@xyflow/react";

const ResultNode = ({ data }) => {
  const getDisplayContent = () => {
    if (data.loading) {
      return (
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          <span className="ml-2 text-gray-600">Processing...</span>
        </div>
      );
    }

    if (data.content) {
      return (
        <div className="h-24 overflow-y-auto">
          <p className="text-gray-800 whitespace-pre-wrap">{data.content}</p>
        </div>
      );
    }

    return (
      <div className="h-24 flex items-center justify-center">
        <p className="text-gray-500 italic">AI response will appear here...</p>
      </div>
    );
  };

  return (
    <div className="bg-white border-2 border-green-500 rounded-lg p-4 shadow-lg min-w-64">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">
          {data.label || "AI Response"}
        </h3>
      </div>
      <div className="mb-3">{getDisplayContent()}</div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
};

export default ResultNode;
