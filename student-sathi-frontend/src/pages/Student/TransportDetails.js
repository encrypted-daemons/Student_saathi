import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import serviceService from '../../services/serviceService';
import Loader from '../../components/common/Loader';
import WhatsAppButton from '../../components/common/WhatsAppButton';
import { 
  MapPinIcon, TruckIcon, CurrencyRupeeIcon, 
  UserGroupIcon, ArrowLeftIcon, CheckBadgeIcon, 
  ClockIcon, MusicalNoteIcon, WifiIcon, BoltIcon,
  IdentificationIcon, PhoneIcon, ShieldCheckIcon,
  ShareIcon, HeartIcon
} from '@heroicons/react/24/solid';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const TransportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await serviceService.getById(id);
        if (res.success) setService(res.data);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <Loader text="Locating Vehicle..." />;
  if (!service) return <div className="p-10 text-center text-gray-500">Vehicle not found.</div>;

  const details = service.transportDetails || {};
  
  // Map Position
  const lat = service.location?.coordinates?.[1] || 22.7196;
  const lng = service.location?.coordinates?.[0] || 75.8577;
  const position = [lat, lng];

  // Image
  const imageSrc = service.images?.[0] || "https://cdn-icons-png.flaticon.com/512/2555/2555013.png";

  // Verification
  const isVerified = service.provider?.providerDetails?.isVerified;
  const driverPic = service.provider?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${service.provider?.name}`;

  return (
    <div className="min-h-screen bg-[#f0f4f8] pb-32 font-sans relative safe-padding">
      
      {/* 1. IMMERSIVE HEADER */}
      <div className="relative h-80 bg-gray-900 overflow-hidden group">
         <img 
            src={imageSrc} 
            alt="Vehicle" 
            className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" 
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#f0f4f8] via-transparent to-transparent"></div>
         
         {/* Nav Buttons */}
         <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20">
             <button onClick={() => navigate(-1)} className="bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/40 transition-all">
                <ArrowLeftIcon className="w-6 h-6" />
             </button>
             <div className="flex gap-3">
                 <button className="bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/40 transition-all"><HeartIcon className="w-6 h-6" /></button>
                 <button className="bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/40 transition-all"><ShareIcon className="w-6 h-6" /></button>
             </div>
         </div>

         <div className="absolute top-4 right-4">
             <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border border-white/20 tracking-wider ${service.isActive ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                 {service.isActive ? '🟢 ON DUTY' : '🔴 OFF DUTY'}
             </span>
         </div>

         <div className="absolute bottom-0 left-0 w-full p-6 pb-12">
             <h1 className="text-4xl font-black text-gray-900 mb-2 drop-shadow-sm">{service.name}</h1>
             <div className="flex flex-wrap gap-3 text-sm font-medium">
                 <span className="flex items-center bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm text-gray-800 border border-white/40">
                    <TruckIcon className="w-4 h-4 mr-1.5 text-teal-600"/> {details.vehicleType}
                 </span>
                 <span className="flex items-center bg-white/60 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm text-gray-800 border border-white/40">
                    <IdentificationIcon className="w-4 h-4 mr-1.5 text-gray-600"/> {details.vehicleNumber || 'No Plate Info'}
                 </span>
             </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-6 relative z-10">
         
         {/* LEFT COLUMN: Route */}
         <div className="lg:col-span-2 space-y-8">
             
             <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-white">
                 <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center">
                    <MapPinIcon className="w-6 h-6 mr-2 text-teal-500"/> Daily Route
                 </h3>
                 
                 {details.routes && details.routes.length > 0 ? (
                     <div className="relative pl-6 border-l-2 border-dashed border-gray-200 space-y-8">
                        {details.routes.map((stop, idx) => (
                            <div key={idx} className="relative group">
                                <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125 ${idx === 0 ? 'bg-green-500' : idx === details.routes.length - 1 ? 'bg-red-500' : 'bg-blue-400'}`}></div>
                                <p className={`text-sm ${idx === 0 || idx === details.routes.length - 1 ? 'font-bold text-gray-900 text-base' : 'font-medium text-gray-600'}`}>
                                    {stop}
                                </p>
                                {idx === 0 && details.timingStart && <p className="text-xs text-green-600 font-bold mt-1 flex items-center bg-green-50 w-fit px-2 py-0.5 rounded"><ClockIcon className="w-3 h-3 mr-1"/>Starts {details.timingStart}</p>}
                                {idx === details.routes.length - 1 && details.timingEnd && <p className="text-xs text-red-500 font-bold mt-1 flex items-center bg-red-50 w-fit px-2 py-0.5 rounded"><ClockIcon className="w-3 h-3 mr-1"/>Ends {details.timingEnd}</p>}
                            </div>
                        ))}
                     </div>
                 ) : (
                     <p className="text-gray-400 italic">Route info not provided.</p>
                 )}
             </div>

             <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                 <h3 className="font-bold text-xl text-gray-900 mb-6">Ride Experience</h3>
                 <div className="grid grid-cols-2 gap-4">
                     <FeatureBox icon={UserGroupIcon} label="Seats Left" value={details.seatsAvailable ?? '?'} color="text-blue-600" bg="bg-blue-50"/>
                     <FeatureBox icon={BoltIcon} label="AC" value={details.amenities?.ac ? 'Yes' : 'No'} color="text-yellow-600" bg="bg-yellow-50"/>
                     <FeatureBox icon={MusicalNoteIcon} label="Music" value={details.amenities?.music ? 'Yes 🎵' : 'No'} color="text-pink-600" bg="bg-pink-50"/>
                     <FeatureBox icon={WifiIcon} label="WiFi" value={details.amenities?.wifi ? 'Yes' : 'No'} color="text-indigo-600" bg="bg-indigo-50"/>
                 </div>
             </div>
         </div>

         {/* RIGHT COLUMN: Map & Driver */}
         <div className="space-y-6">
             
             {/* MAP CARD */}
             <div className="rounded-[2rem] overflow-hidden shadow-md border border-gray-200 bg-white relative z-0">
                 <div className="p-4 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase text-center tracking-widest">Current Stand 📍</div>
                 <div className="h-56 relative z-0">
                     <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%', zIndex: 0 }} dragging={false} zoomControl={false}>
                         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                         <Marker position={position} />
                     </MapContainer>
                 </div>
                 <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noreferrer" className="block text-center bg-teal-600 text-white py-4 font-bold text-sm hover:bg-teal-700 transition-colors">
                     Navigate to Stand ↗
                 </a>
             </div>

             {/* DRIVER CARD */}
             <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 sticky top-24">
                 <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                     <img src={driverPic} alt="Driver" className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md" />
                     <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Driver</p>
                         <h3 className="font-bold text-gray-900 text-xl leading-none mt-1">{details.driverName || 'Unknown'}</h3>
                         {isVerified ? (
                             <div className="flex items-center text-green-600 text-[10px] font-bold mt-1.5 bg-green-50 px-2 py-0.5 rounded-md w-fit">
                                 <ShieldCheckIcon className="w-3 h-3 mr-1" /> VERIFIED
                             </div>
                         ) : <div className="text-[10px] text-gray-400 mt-1">Unverified</div>}
                     </div>
                 </div>
                 
                 <div className="space-y-3 border-t border-gray-100 pt-4 mb-6">
                     <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                         <span className="text-sm text-gray-600 font-medium">Monthly Pass</span>
                         <span className="text-xl font-black text-green-600">₹{service.plans?.[0]?.price || '--'}</span>
                     </div>
                     {details.pricePerKm && (
                        <div className="flex justify-between items-center px-3">
                            <span className="text-xs text-gray-500 font-bold uppercase">Per KM Rate</span>
                            <span className="text-sm font-bold text-gray-900">₹{details.pricePerKm}/km</span>
                        </div>
                     )}
                 </div>

                 <div className="space-y-3 hidden md:block">
                     <WhatsAppButton phoneNumber={service.contactNumber} message={`Hi ${details.driverName}, I want to book a ride.`} label="Chat to Book" className="w-full py-3 rounded-xl font-bold shadow-sm"/>
                     <a href={`tel:${service.contactNumber}`} className="flex items-center justify-center w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors border border-gray-200"><PhoneIcon className="w-5 h-5 mr-2"/> Call Driver</a>
                 </div>
             </div>

         </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 md:hidden flex gap-3 z-[9999] safe-area-pb shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <a href={`tel:${service.contactNumber}`} className="flex-1 bg-gray-100 text-gray-900 py-3.5 rounded-xl font-bold flex items-center justify-center active:scale-95 transition-transform"><PhoneIcon className="w-5 h-5 mr-2"/> Call</a>
          <div className="flex-[1.5]"><WhatsAppButton phoneNumber={service.contactNumber} message="Hi, available?" label="Chat" className="h-full rounded-xl font-bold text-lg shadow-lg"/></div>
      </div>

    </div>
  );
};

// UI Helper
const FeatureBox = ({ icon: Icon, label, value, color, bg }) => (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border border-transparent ${bg} transition-all hover:scale-105`}>
        <Icon className={`w-6 h-6 ${color}`} />
        <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
            <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
        </div>
    </div>
);

export default TransportDetails;