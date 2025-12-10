import React from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon, TruckIcon, CurrencyRupeeIcon, 
  FireIcon, CheckBadgeIcon, MapPinIcon 
} from '@heroicons/react/24/solid';

const MessCard = ({ service, onClick }) => {
  // Fallback Image
  const imageSrc = service.images?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";

  // Helper to safely check service type
  const isDelivery = service.messDetails?.serviceType?.includes('Delivery');

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100 cursor-pointer group relative transition-all hover:shadow-xl"
      onClick={() => onClick(service._id)}
    >
      {/* 1. Header Image */}
      <div className="h-48 relative overflow-hidden">
        <img 
          src={imageSrc} 
          alt={service.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90"></div>

        {/* Veg/Non-Veg Badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase shadow-lg backdrop-blur-md border border-white/20 flex items-center ${
            service.messDetails?.type === 'Pure Veg' 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
            <div className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-white`}></div>
            {service.messDetails?.type || 'Veg/Non-Veg'}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-yellow-400 text-black px-2 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center">
            {service.rating || 4.5} <StarIcon className="w-3 h-3 ml-1" />
        </div>

        {/* Name & Area */}
        <div className="absolute bottom-3 left-4 text-white w-full pr-6">
            <h3 className="text-xl font-black leading-tight drop-shadow-sm truncate">{service.name}</h3>
            <p className="text-xs text-gray-300 mt-1 flex items-center font-medium">
               <MapPinIcon className="w-3 h-3 mr-1 text-red-400"/>
               <span className="truncate max-w-[200px]">{service.address}, {service.city}</span>
            </p>
        </div>
      </div>

      {/* 2. Body Content */}
      <div className="p-5">
        
        {/* Today's Special (Hero Feature) */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4 relative overflow-hidden">
            <div className="absolute -right-2 -top-2 opacity-10"><FireIcon className="w-12 h-12 text-orange-500"/></div>
            <p className="text-[10px] text-orange-600 font-bold uppercase flex items-center mb-1">
                <FireIcon className="w-3 h-3 mr-1" /> Today's Special
            </p>
            <p className="text-sm font-bold text-gray-800 line-clamp-1">
                {service.messDetails?.specialMenu || "Dal Tadka, Jeera Rice, 4 Roti, Salad"}
            </p>
        </div>

        {/* Quick Info */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4 font-medium">
             <span className="flex items-center bg-gray-50 px-2 py-1 rounded border border-gray-100">
                {/* ✅ FIX: Safe check using variable above */}
                {isDelivery ? (
                    <><TruckIcon className="w-3 h-3 text-blue-500 mr-1" /> Home Delivery</>
                ) : (
                    "Dine-in Only"
                )}
             </span>
             {service.messDetails?.isTrialAvailable && (
                 <span className="text-green-600 font-bold flex items-center bg-green-50 px-2 py-1 rounded border border-green-100">
                    <CheckBadgeIcon className="w-3 h-3 mr-1" /> Free Trial
                 </span>
             )}
        </div>

        <div className="h-px bg-gray-100 mb-3"></div>

        {/* Pricing Footer */}
        <div className="flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Starting</span>
                <div className="text-gray-900 font-black text-xl flex items-center">
                    <CurrencyRupeeIcon className="w-4 h-4 mr-0.5 text-green-600" />
                    {service.plans?.[0]?.price || 2500}
                    <span className="text-xs text-gray-400 font-normal ml-1">/mo</span>
                </div>
            </div>
            <button className="bg-orange-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-md hover:shadow-orange-200">
                View Menu
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MessCard;