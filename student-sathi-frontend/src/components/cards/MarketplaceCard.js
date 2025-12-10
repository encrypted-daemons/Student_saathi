import React from 'react';
import { motion } from 'framer-motion';
import { 
  TagIcon, CurrencyRupeeIcon, 
  ChatBubbleLeftRightIcon, MapPinIcon 
} from '@heroicons/react/24/solid';

const MarketplaceCard = ({ item, onContact }) => {
  
  // Calculate Discount
  const discount = item.originalPrice 
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
    : 0;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group cursor-pointer transition-all hover:shadow-xl"
      onClick={() => onContact(item)} // Make whole card clickable
    >
      {/* --- SOLD OUT OVERLAY --- */}
      {item.isSold && (
        <div className="absolute inset-0 bg-gray-900/60 z-20 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-red-600 text-white px-6 py-2 rounded-xl font-black text-xl -rotate-12 border-4 border-white shadow-2xl tracking-widest">
                SOLD
            </span>
        </div>
      )}

      {/* Image Section */}
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        <img 
          src={item.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm text-gray-700 uppercase tracking-wider">
              {item.condition}
            </span>
            {discount > 0 && (
                <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                  {discount}% OFF
                </span>
            )}
        </div>
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      {/* Content */}
      <div className="p-5">
        
        {/* Header */}
        <div className="mb-2">
           <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded uppercase tracking-wider">
             {item.category}
           </span>
        </div>

        <h3 className="text-lg font-black text-gray-900 line-clamp-1 leading-tight group-hover:text-pink-600 transition-colors">
            {item.title}
        </h3>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-xl font-black text-green-600 flex items-center">
            <CurrencyRupeeIcon className="w-4 h-4 mr-0.5" />{item.price}
          </p>
          {item.originalPrice && (
            <p className="text-xs text-gray-400 line-through font-medium">₹{item.originalPrice}</p>
          )}
        </div>

        {/* Location (If available) */}
        {item.location?.addressText && (
            <p className="text-xs text-gray-400 mt-2 flex items-center truncate">
                <MapPinIcon className="w-3 h-3 mr-1"/> {item.location.addressText}
            </p>
        )}

        <div className="h-px bg-gray-100 my-3"></div>

        {/* Seller Footer */}
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <img 
                src={item.seller?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seller?.name || 'User'}`} 
                alt="Seller"
                className="w-7 h-7 rounded-full bg-gray-100 border border-white shadow-sm"
              />
              <p className="text-xs font-bold text-gray-600 truncate w-20">
                 {item.seller?.name || 'Student'}
              </p>
           </div>
           
           <button 
             onClick={(e) => { e.stopPropagation(); onContact(item); }}
             className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg font-bold flex items-center hover:bg-black transition-colors shadow-md hover:shadow-lg active:scale-95"
           >
             <ChatBubbleLeftRightIcon className="w-3 h-3 mr-1.5" /> Chat
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketplaceCard;