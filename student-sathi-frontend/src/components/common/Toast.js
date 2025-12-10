import React, { useEffect } from 'react';
import { CheckCircleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Toast = ({ message, type = 'info', onClose }) => {
  
  // Auto-close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
    error: <XCircleIcon className="w-6 h-6 text-red-500" />,
    info: <InformationCircleIcon className="w-6 h-6 text-blue-500" />
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  return (
    <div className={`fixed top-4 right-4 z-[100] flex items-start max-w-sm w-full p-4 rounded-xl shadow-2xl border ${styles[type]} transition-all duration-500 transform translate-y-0 opacity-100`}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[type]}
      </div>
      <div className="ml-3 w-0 flex-1 pt-0.5">
        <p className="text-sm font-bold capitalize">
          {type === 'info' ? 'Update' : type}
        </p>
        <p className="mt-1 text-sm opacity-90">
          {message}
        </p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button
          onClick={onClose}
          className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;