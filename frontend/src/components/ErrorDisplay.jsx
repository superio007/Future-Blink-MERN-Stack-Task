const ErrorDisplay = ({ error, onDismiss, className = "" }) => {
  if (!error) return null;

  const getErrorIcon = () => (
    <svg
      className="h-5 w-5 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  );

  const getDismissIcon = () => (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-md p-3 ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getErrorIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-800 font-medium">Error</p>
          <p className="text-sm text-red-700 mt-1">
            {typeof error === "string"
              ? error
              : error.message || "An unexpected error occurred"}
          </p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex text-red-400 hover:text-red-600 transition-colors"
              aria-label="Dismiss error"
            >
              {getDismissIcon()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
