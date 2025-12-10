import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Animation Library

const Splash = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 flex flex-col items-center justify-center text-white p-6 relative overflow-hidden font-sans">
      
      {/* Background Circles Animation (Responsive Sizes) */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-20 -right-20 w-72 h-72 md:w-96 md:h-96 bg-white opacity-10 rounded-full blur-3xl"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], x: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-20 -left-20 w-64 h-64 md:w-80 md:h-80 bg-pink-500 opacity-20 rounded-full blur-3xl"
      />

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-md w-full"
      >
        {/* Floating Emoji */}
        <motion.div 
          className="text-7xl md:text-8xl mb-6"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🎓
        </motion.div>
        
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2 drop-shadow-lg">
          Student <span className="text-yellow-300">Sathi</span>
        </h1>
        
        {/* Tagline */}
        <p className="text-base md:text-lg text-indigo-100 mb-10 font-medium leading-relaxed">
          Shehar naya, par Sathi purana. <br/>
          <span className="opacity-80 font-light text-sm">Room • Mess • Dost • Transport</span>
        </p>

        {/* Buttons */}
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-bold shadow-xl text-lg transition-shadow hover:shadow-2xl"
          >
            Login
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="w-full py-4 bg-white/10 border border-white/30 text-white rounded-2xl font-bold text-lg backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            Create Account
          </motion.button>
        </div>
      </motion.div>

      {/* Footer Version */}
      <div className="absolute bottom-6 text-white/40 text-xs font-medium">
         v1.0 • Made for Students
      </div>
    </div>
  );
};

export default Splash;