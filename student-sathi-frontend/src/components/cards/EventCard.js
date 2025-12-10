import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon, CalendarIcon, UserGroupIcon, 
  FireIcon, SignalIcon, ShareIcon, MapIcon,
  CheckBadgeIcon, XCircleIcon
} from '@heroicons/react/24/solid';

const EventCard = ({ event, onJoin, onUpdateStatus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [liked, setLiked] = useState(false);

  // Safe Coordinates
  const lat = event.location?.coordinates?.[1] || 22.7196;
  const lng = event.location?.coordinates?.[0] || 75.8577;

  // Dynamic Colors
  const getFoodColor = (status) => {
    if (!status) return 'bg-gray-400';
    if (status.includes('Bharpur') || status.includes('Full')) return 'bg-green-500';
    if (status.includes('Khatam') || status.includes('Low')) return 'bg-red-500 animate-pulse';
    return 'bg-blue-500';
  };

  const handleShare = () => {
      const text = `🔥 Check this out: "${event.title}" at ${event.venue}. Food Status: ${event.foodStatus || 'Unknown'}. Join me on Student Sathi!`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
  };

  const handleJoinClick = () => {
      setLiked(!liked);
      onJoin(event._id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 relative group mb-6 transition-all hover:shadow-xl"
    >
      {/* 1. Social Header */}
      <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-gray-50">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-500 p-[2px]">
                <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.organizer?.name || 'User'}`} 
                    alt="User"
                    className="w-full h-full rounded-full bg-white object-cover"
                />
            </div>
            <div>
                <h4 className="text-sm font-bold text-gray-900">{event.organizer?.name || 'Student Sathi User'}</h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium flex items-center">
                    {event.category} <span className="mx-1">•</span> {new Date(event.date).toLocaleDateString()}
                </p>
            </div>
         </div>
         <button onClick={handleShare} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
             <ShareIcon className="w-5 h-5" />
         </button>
      </div>

      {/* 2. Main Content (Image) */}
      <div className="h-64 relative bg-gray-900 cursor-pointer group overflow-hidden" onDoubleClick={handleJoinClick}>
        <img 
          src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800"} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3">
             <span className="bg-red-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center backdrop-blur-md animate-pulse">
                <SignalIcon className="w-3 h-3 mr-1" /> LIVE
             </span>
        </div>
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
            {event.isFree ? 'FREE ENTRY 🎉' : `₹${event.entryFee}`}
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-5">
            <h3 className="text-2xl font-black tracking-tight text-white drop-shadow-lg mb-1">{event.title}</h3>
            <div className="flex items-center text-xs font-medium text-gray-300">
                <MapPinIcon className="w-3 h-3 mr-1 text-red-400" /> 
                {event.venue || 'Indore'}
                <span className="mx-2">•</span>
                <CalendarIcon className="w-3 h-3 mr-1 text-yellow-400" /> 
                {event.time || 'Now'}
            </div>
        </div>
      </div>

      {/* 3. Interactive Actions */}
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
            <div className="flex gap-3">
                <button 
                    onClick={handleJoinClick} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${liked ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                    <FireIcon className={`w-5 h-5 ${liked ? 'text-red-600 fill-current' : 'text-gray-500'}`} />
                    {liked ? 'Going!' : 'Join'}
                </button>
                
                <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
                >
                    <MapIcon className="w-5 h-5" />
                </a>
            </div>
            
            <div className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                {event.goingCount || 0} Going
            </div>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
            {event.description}
        </p>

        {/* 4. Community Reporting */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center">
                    <SignalIcon className="w-3 h-3 mr-1 text-green-500" /> Live Status
                </p>
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-[10px] text-indigo-600 font-bold hover:underline transition-colors">
                    {isExpanded ? 'Close' : 'Update Status'}
                </button>
            </div>

            <div className="flex gap-2">
                <div className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold text-white text-center shadow-sm flex items-center justify-center gap-1 ${getFoodColor(event.foodStatus)}`}>
                    🍔 {event.foodStatus || 'Checking...'}
                </div>
                <div className="flex-1 bg-indigo-500 py-1.5 px-3 rounded-lg text-[10px] font-bold text-white text-center shadow-sm flex items-center justify-center gap-1">
                    👥 {event.crowdStatus || 'Normal'}
                </div>
            </div>

            {/* Expandable Updater */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 overflow-hidden"
                    >
                        <button onClick={() => onUpdateStatus(event._id, { foodStatus: 'Khatam ⚠️' })} className="text-[10px] bg-red-50 text-red-600 py-2 rounded-lg font-bold border border-red-100 hover:bg-red-100 transition">🍔 Khatam</button>
                        <button onClick={() => onUpdateStatus(event._id, { foodStatus: 'Bharpur 🍲' })} className="text-[10px] bg-green-50 text-green-600 py-2 rounded-lg font-bold border border-green-100 hover:bg-green-100 transition">🍲 Bharpur</button>
                        <button onClick={() => onUpdateStatus(event._id, { crowdStatus: 'Full 🚫' })} className="text-[10px] bg-gray-100 text-gray-600 py-2 rounded-lg font-bold hover:bg-gray-200 transition">👥 Full</button>
                        <button onClick={() => onUpdateStatus(event._id, { crowdStatus: 'Empty ✅' })} className="text-[10px] bg-blue-50 text-blue-600 py-2 rounded-lg font-bold border border-blue-100 hover:bg-blue-100 transition">✅ Empty</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;