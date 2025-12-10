import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, AcademicCapIcon, MapPinIcon, 
  ChatBubbleLeftEllipsisIcon, FireIcon, CheckBadgeIcon
} from '@heroicons/react/24/solid';

const RoommateCard = ({ match, onChat }) => {
  const { userProfile, matchPercentage, reasons } = match;

  // Dynamic Match Color
  const getMatchColor = (score) => {
    if (score >= 80) return 'bg-green-500 shadow-green-500/50'; 
    if (score >= 50) return 'bg-yellow-500 shadow-yellow-500/50';
    return 'bg-red-500 shadow-red-500/50';
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100 relative group cursor-pointer transition-all hover:shadow-xl"
    >
      {/* 1. Header Gradient & Avatar */}
      <div className="h-28 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
        
        {/* Match Badge */}
        <div className={`absolute top-3 right-3 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 border border-white/20 ${getMatchColor(matchPercentage)}`}>
           <FireIcon className="w-4 h-4 animate-pulse" />
           {matchPercentage}% Match
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-10 left-6">
          <div className="w-20 h-20 rounded-full border-4 border-white bg-white overflow-hidden shadow-md p-0.5">
            <img 
              src={userProfile.pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`} 
              alt={userProfile.name}
              className="w-full h-full object-cover rounded-full bg-gray-100"
            />
          </div>
          {/* Online Status Dot */}
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
        </div>
      </div>
      
      {/* 2. Body Content */}
      <div className="pt-12 pb-6 px-6">
        
        {/* Name & Verify */}
        <div className="flex items-center gap-1 mb-1">
            <h3 className="text-xl font-black text-gray-900 truncate max-w-[180px]">
              {userProfile.name}
            </h3>
            <CheckBadgeIcon className="w-5 h-5 text-blue-500" title="Verified Student"/>
        </div>
        
        {/* College Info */}
        <div className="flex flex-col gap-1 mb-4">
            <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit flex items-center">
               <AcademicCapIcon className="w-3 h-3 mr-1"/> {userProfile.course} • {userProfile.year}
            </p>
            <p className="text-xs text-gray-500 flex items-center font-medium pl-1">
               <MapPinIcon className="w-3 h-3 mr-1 text-gray-400"/> From {userProfile.hometown}
            </p>
        </div>

        {/* Match Reasons (The Vibe Check) */}
        <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                <SparklesIcon className="w-3 h-3 mr-1 text-yellow-500"/> Why you match
            </p>
            <div className="flex flex-wrap gap-2">
                {reasons.slice(0, 3).map((reason, idx) => (
                    <span key={idx} className="text-[10px] bg-white text-gray-700 px-2 py-1 rounded-md shadow-sm border border-gray-200 font-bold">
                        {reason}
                    </span>
                ))}
                {reasons.length > 3 && <span className="text-[10px] text-gray-400 font-bold">+{reasons.length - 3} more</span>}
            </div>
        </div>

        {/* Connect Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onChat(userProfile); }}
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
        >
           <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-white" />
           Connect Now
        </button>
      </div>
    </motion.div>
  );
};

// Icon Helper for Vibe Section
const SparklesIcon = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 15z" clipRule="evenodd" />
    </svg>
);

export default RoommateCard;