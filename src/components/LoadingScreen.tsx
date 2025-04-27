import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-700">Loading...</h3>
        <p className="text-sm text-gray-500 mt-1">Please wait while we set things up</p>
      </div>
    </div>
  );
};

export default LoadingScreen;