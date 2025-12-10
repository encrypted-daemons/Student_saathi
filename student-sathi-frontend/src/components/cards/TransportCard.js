import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, UserGroupIcon, CurrencyRupeeIcon, 
  ClockIcon, TruckIcon, ShieldCheckIcon, ArrowRightIcon
} from '@heroicons/react/24/solid';
import WhatsAppButton from '../common/WhatsAppButton';

const TransportCard = ({ service, onClick }) => {
  const details = service.transportDetails || {};
  
  // Fallback Image
  const imageSrc = service.images?.[0] || (
    details.vehicleType === 'Auto Rickshaw' 
      ? "https://cdn-icons-png.flaticon.com/512/2555/2555013.png" 
      : "https://cdn-icons-png.flaticon.com/512/3066/3066259.png"
  );

  const isFull = details.seatsAvailable === 0;

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100 cursor-pointer group relative hover:shadow-xl transition-all"
      onClick={() => onClick(service._id)}
    >
      <div className="p-5">
        
        {/* 1. Header: Vehicle Info */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl flex items-center justify-center shadow-sm border border-teal-200">
                    <img src={imageSrc} alt="Vehicle" className="w-8 h-8 object-contain" />
                </div>
                <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{service.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center font-medium uppercase tracking-wide mt-0.5">
                        <TruckIcon className="w-3 h-3 mr-1 text-teal-600" /> {details.vehicleType}
                    </p>
                </div>
            </div>
            {details.isLadiesSpecial && (
                <span className="bg-pink-50 text-pink-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-pink-100 shadow-sm">
                    Girls Only 👩
                </span>
            )}
        </div>

        {/* 2. Route Visual (Timeline) */}
        <div className="bg-gray-50/50 rounded-xl p-3 mb-4 border border-gray-100 relative overflow-hidden">
            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
               <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
               <span className="truncate flex-1">{details.routes?.[0] || 'Start'}</span>
               <ArrowRightIcon className="w-3 h-3 text-gray-400 shrink-0"/>
               <span className="truncate flex-1 text-right">{details.routes?.[details.routes?.length - 1] || 'End'}</span>
               <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
            </div>
        </div>

        {/* 3. Info Stats */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
            <div className="flex items-center bg-blue-50 px-2.5 py-1.5 rounded-lg text-blue-700 font-bold border border-blue-100">
                <ClockIcon className="w-3.5 h-3.5 mr-1.5" /> Daily Service
            </div>
            <div className={`flex items-center px-2.5 py-1.5 rounded-lg font-bold border ${isFull ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                <UserGroupIcon className="w-3.5 h-3.5 mr-1.5" /> 
                {isFull ? 'Full' : `${details.seatsAvailable} Seats Left`}
            </div>
        </div>

        <div className="h-px bg-gray-100 mb-4"></div>

        {/* 4. Pricing & Action */}
        <div className="flex items-center justify-between">
            <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Monthly Pass</p>
                <p className="text-xl font-black text-gray-900 flex items-center">
                    <CurrencyRupeeIcon className="w-4 h-4 mr-0.5 text-green-600" />
                    {service.plans?.[0]?.price || 'Ask'}
                </p>
            </div>
            <div onClick={(e) => e.stopPropagation()}> {/* Prevent card click */}
                <WhatsAppButton 
                   phoneNumber={service.contactNumber}
                   message={`Hello, I need transport service for route: ${details.routes?.join(' to ')}. Is seat available?`}
                   label="Chat"
                   small={true}
                   className="shadow-md hover:shadow-lg transition-shadow"
                />
            </div>
        </div>

      </div>
    </motion.div>
  );
};

export default TransportCard;