import React from 'react';

const UpdateToast = ({ onRefresh, onClose }) => (
  <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-xl border border-gray-200 z-50 flex items-center gap-4 animate-fade-in-up">
    <div>
      <h4 className="font-bold text-sm">Update Available</h4>
      <p className="text-xs text-gray-500">New features added!</p>
    </div>
    <button onClick={onRefresh} className="bg-primary-600 text-white px-3 py-1 rounded text-xs">Update</button>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
  </div>
);

export default UpdateToast;