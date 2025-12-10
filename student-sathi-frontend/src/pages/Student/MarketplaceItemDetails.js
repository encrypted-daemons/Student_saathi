import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import marketplaceService from '../../services/marketplaceService';
import Loader from '../../components/common/Loader';
import WhatsAppButton from '../../components/common/WhatsAppButton';
import { 
  CurrencyRupeeIcon, MapPinIcon, ArrowLeftIcon, 
  TagIcon, CheckBadgeIcon, ClockIcon, ShieldCheckIcon, 
  ShareIcon, HeartIcon
} from '@heroicons/react/24/solid';
import 'leaflet/dist/leaflet.css';

// Leaflet Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MarketplaceItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await marketplaceService.getItemById(id);
        if (res.success) setItem(res.data);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <Loader text="Loading Item..." />;
  if (!item) return <div className="p-10 text-center text-gray-500">Item not found or removed.</div>;

  // Map Coords (Safe Fallback)
  const lat = item.location?.coordinates?.[1] || 22.7196;
  const lng = item.location?.coordinates?.[0] || 75.8577;
  const position = [lat, lng];

  const discount = item.originalPrice 
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      
      {/* 1. HERO IMAGE HEADER */}
      <div className="relative h-96 bg-gray-100 group">
         <img 
            src={item.images?.[0] || 'https://via.placeholder.com/500'} 
            alt={item.title}
            className="w-full h-full object-contain mix-blend-multiply p-4"
         />
         
         {/* Navigation & Actions */}
         <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center">
             <button onClick={() => navigate(-1)} className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-105">
                <ArrowLeftIcon className="w-6 h-6 text-gray-800" />
             </button>
             <div className="flex gap-2">
                 <button className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition text-gray-600 hover:text-red-500">
                    <HeartIcon className="w-6 h-6" />
                 </button>
                 <button className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition text-gray-600 hover:text-blue-500">
                    <ShareIcon className="w-6 h-6" />
                 </button>
             </div>
         </div>
         
         {/* Condition Badge */}
         <div className="absolute bottom-6 left-6">
           <span className="bg-black/80 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-lg border border-white/10">
             Condition: {item.condition}
           </span>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             
             {/* LEFT: DETAILS */}
             <div className="md:col-span-2 space-y-6">
                 
                 {/* Title & Price Card */}
                 <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                     <div className="flex justify-between items-start">
                         <div>
                            <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest bg-pink-50 px-2 py-1 rounded-md">{item.category}</span>
                            <h1 className="text-3xl font-black text-gray-900 mt-2 leading-tight">{item.title}</h1>
                            <p className="text-xs text-gray-400 mt-2 flex items-center font-medium">
                                <ClockIcon className="w-3.5 h-3.5 mr-1"/> Posted on {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                         </div>
                         <div className="text-right">
                             <div className="flex items-center justify-end text-4xl font-black text-green-600 tracking-tight">
                                <CurrencyRupeeIcon className="w-7 h-7 mt-1" />{item.price}
                             </div>
                             {item.originalPrice && (
                                 <div className="text-sm text-gray-400 line-through font-medium">MRP: ₹{item.originalPrice}</div>
                             )}
                             {discount > 0 && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">{discount}% OFF</span>}
                         </div>
                     </div>

                     {/* Tags */}
                     <div className="flex gap-2 mt-6 overflow-x-auto scrollbar-hide pb-2">
                         {item.isNegotiable && (
                             <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 flex items-center shrink-0">
                                 🤝 Negotiable
                             </span>
                         )}
                         {item.billAvailable && (
                             <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100 flex items-center shrink-0">
                                 <CheckBadgeIcon className="w-3.5 h-3.5 mr-1"/> Bill Available
                             </span>
                         )}
                         {item.usageDuration && (
                             <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 shrink-0">
                                 ⏳ Used: {item.usageDuration}
                             </span>
                         )}
                     </div>
                 </div>

                 {/* Description */}
                 <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{item.description}</p>
                 </div>

                 {/* Map Location */}
                 <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1 text-gray-400"/> Pickup Location
                        </span>
                        <span className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
                            {item.location?.addressText || 'On Campus'}
                        </span>
                    </div>
                    <div className="h-48 relative z-0">
                        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} dragging={false} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={position}></Marker>
                        </MapContainer>
                    </div>
                 </div>
             </div>

             {/* RIGHT: SELLER CARD (Sticky) */}
             <div className="space-y-6">
                 <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-50 sticky top-24">
                     <div className="flex items-center gap-4 mb-6">
                         <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-100 p-0.5">
                            <img 
                                src={item.seller?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seller?.name}`} 
                                alt="Seller" 
                                className="w-full h-full object-cover rounded-full"
                            />
                         </div>
                         <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sold By</p>
                             <h3 className="font-bold text-gray-900 text-xl leading-none">{item.seller?.name}</h3>
                             <p className="text-xs text-gray-500 mt-1 font-medium">
                                 {item.seller?.studentProfile?.college || 'Student'} • {item.seller?.studentProfile?.year || ''}
                             </p>
                         </div>
                     </div>

                     <div className="space-y-3">
                        <WhatsAppButton 
                            phoneNumber={item.seller?.phone}
                            message={`Hi ${item.seller?.name}, I'm interested in buying your "${item.title}". Is it still available?`}
                            label="Chat to Buy"
                            className="w-full py-3 rounded-xl font-bold shadow-md"
                        />
                        <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                            Save for Later
                        </button>
                     </div>
                     
                     <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-medium">
                        <ShieldCheckIcon className="w-4 h-4 mr-1 text-green-500" /> Verified Student Deal
                     </div>
                 </div>
             </div>

         </div>
      </div>
    </div>
  );
};

export default MarketplaceItemDetails;