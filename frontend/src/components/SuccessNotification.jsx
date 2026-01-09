const SuccessNotification = ({ message, onDismiss, className = "" }) => {
  if (!message) return null;

  const getSuccessIcon = () => (
    <svg
      className="h-5 w-5 text-green-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
      className={`bg-green-50 border border-green-200 rounded-md p-3 ${className}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getSuccessIcon()}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-green-800 font-medium">Success</p>
          <p className="text-sm text-green-700 mt-1">{message}</p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex text-green-400 hover:text-green-600 transition-colors"
              aria-label="Dismiss notification"
            >
              {getDismissIcon()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessNotification;
