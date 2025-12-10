import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';

const Loader = ({ text = "Loading..." }) => (
  <div className="flex flex-col justify-center items-center w-full min-h-[300px] p-6">
    
    <div className="relative flex items-center justify-center">
       {/* Static Background Ring */}
       <div className="w-16 h-16 rounded-full border-4 border-gray-100"></div>
       
       {/* Spinning Gradient Ring */}
       <div className="absolute w-16 h-16 rounded-full border-4 border-t-indigo-600 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin"></div>
       
       {/* Center Icon (Branding) */}
       <div className="absolute">
          <SparklesIcon className="w-6 h-6 text-indigo-600 animate-pulse" />
       </div>
    </div>

    {/* Loading Text */}
    <div className="mt-4 text-center">
        <p className="text-sm font-bold text-gray-800 tracking-wider uppercase animate-pulse">
            {text}
        </p>
        <p className="text-[10px] text-gray-400 mt-1 font-medium">
            Please wait a moment...
        </p>
    </div>

  </div>
);

export default Loader;