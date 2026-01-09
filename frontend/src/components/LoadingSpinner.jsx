const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}
      ></div>
      {text && <span className="ml-2 text-gray-600 text-sm">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
