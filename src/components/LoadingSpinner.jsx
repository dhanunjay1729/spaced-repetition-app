import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-12 h-12 border-[3px] border-gray-300 border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
        </div>
    );
};

export default LoadingSpinner;
