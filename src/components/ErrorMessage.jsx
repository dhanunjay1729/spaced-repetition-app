import React from 'react';

const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center my-4">
    <span className="block sm:inline">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorMessage;