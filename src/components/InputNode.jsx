import { Handle, Position } from "@xyflow/react";

const InputNode = ({ data }) => {
  const handleInputChange = (event) => {
    if (data.onChange) {
      data.onChange(event.target.value);
    }
  };

  return (
    <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg min-w-64">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">
          {data.label || "User Input"}
        </h3>
      </div>
      <div className="mb-3">
        <textarea
          value={data.value || ""}
          onChange={handleInputChange}
          placeholder="Enter your prompt here..."
          className="w-full h-24 p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
};

export default InputNode;
