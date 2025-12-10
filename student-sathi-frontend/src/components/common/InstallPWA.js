import React, { useState, useEffect } from 'react';
import { ArrowDownTrayIcon, XMarkIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the UI
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We no longer need the prompt. Clear it and hide UI
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-6 left-0 right-0 flex justify-center z-[9999] pointer-events-none"
        >
          <div className="bg-gray-900/90 backdrop-blur-md text-white p-1.5 pl-4 pr-2 rounded-full shadow-2xl border border-white/10 flex items-center gap-3 pointer-events-auto max-w-xs mx-4">
            
            <div className="flex items-center gap-3" onClick={handleInstall}>
                <div className="bg-gradient-to-tr from-green-400 to-teal-500 p-2 rounded-full animate-pulse">
                    <ArrowDownTrayIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col cursor-pointer">
                    <span className="text-sm font-bold leading-tight">Install App</span>
                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                        <DevicePhoneMobileIcon className="w-3 h-3"/> Better Experience
                    </span>
                </div>
            </div>

            <div className="h-8 w-[1px] bg-white/20 mx-1"></div>

            <button 
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
                <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPWA;