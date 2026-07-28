import React from 'react';

const ErrorMessage = ({ message, onRetry }) => (
  <div className="glass border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-5 py-4 rounded-xl text-center my-4 animate-fade-in">
    <span className="block sm:inline">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="ml-4 px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorMessage;