import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, WifiIcon, BoltIcon, CurrencyRupeeIcon, 
  UserGroupIcon, HomeModernIcon, ShieldCheckIcon, StarIcon
} from '@heroicons/react/24/solid';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";

const PropertyCard = ({ property, onClick }) => {
  
  // Robust Image Selection
  const getImage = () => {
      if (property.images && property.images.length > 0 && property.images[0].trim() !== "") {
          return property.images[0];
      }
      return DEFAULT_IMAGE;
  };

  const [imgSrc, setImgSrc] = useState(getImage());
  
  // Safe Owner Data
  const ownerName = property.owner?.name || "Landlord";
  const isVerified = property.owner?.providerDetails?.isVerified;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100 cursor-pointer group relative transition-all hover:shadow-xl"
      onClick={() => onClick(property._id)}
    >
      {/* 1. Header Image */}
      <div className="h-56 bg-gray-200 relative overflow-hidden">
        <img 
          src={imgSrc} 
          alt={property.title}
          onError={(e) => { e.target.onerror = null; setImgSrc(DEFAULT_IMAGE); }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase shadow-lg backdrop-blur-md border border-white/20 ${
            property.isAvailable 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
            {property.isAvailable ? 'Available' : 'Booked'}
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
           <span className="bg-white/90 backdrop-blur text-gray-800 text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm uppercase tracking-wider flex items-center">
              <HomeModernIcon className="w-3 h-3 mr-1 text-blue-600"/> {property.type}
           </span>
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-3 left-4 text-white">
             <p className="text-[10px] text-gray-300 uppercase font-bold">Rent</p>
             <div className="flex items-center text-2xl font-black tracking-tight">
                <CurrencyRupeeIcon className="w-5 h-5 mr-0.5" /> 
                {property.rent.toLocaleString()}
                <span className="text-xs font-medium text-gray-300 ml-1">/mo</span>
             </div>
        </div>
      </div>

      {/* 2. Details Body */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 leading-tight group-hover:text-blue-600 transition-colors">
                {property.title}
            </h3>
            <div className="flex items-center bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                4.5 <StarIcon className="w-3 h-3 ml-0.5" />
            </div>
        </div>
        
        <p className="text-xs text-gray-500 flex items-center mb-4 font-medium">
            <MapPinIcon className="w-3.5 h-3.5 mr-1 text-red-400 flex-shrink-0"/> 
            <span className="truncate">{property.address}, {property.city}</span>
        </p>
        
        {/* Feature Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold border ${property.genderPreference === 'Girls Only' ? 'bg-pink-50 text-pink-600 border-pink-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {property.genderPreference}
            </span>
            <span className="text-[10px] bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md font-bold border border-gray-100">
                {property.occupancy || 'Single'}
            </span>
            {property.amenities?.wifi && (
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md font-bold border border-indigo-100 flex items-center">
                    <WifiIcon className="w-3 h-3 mr-1"/> WiFi
                </span>
            )}
        </div>

        <div className="h-px bg-gray-100 mb-3"></div>

        {/* Owner Footer */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                    {ownerName[0]}
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700 leading-none">{ownerName}</span>
                    {isVerified && <span className="text-[8px] text-green-600 flex items-center font-bold"><ShieldCheckIcon className="w-2.5 h-2.5 mr-0.5"/> Verified</span>}
                </div>
            </div>
            <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                View Details
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;