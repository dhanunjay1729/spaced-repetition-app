import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-surface-50 dark:bg-surface-900 transition-colors">
            <div className="w-12 h-12 border-[3px] border-gray-200 dark:border-white/10 border-t-brand-500 border-r-purple-500 rounded-full animate-spin"></div>
        </div>
    );
};

export default LoadingSpinner;
