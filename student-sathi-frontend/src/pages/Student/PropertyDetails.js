import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import propertyService from '../../services/propertyService';
import Loader from '../../components/common/Loader';
import WhatsAppButton from '../../components/common/WhatsAppButton';
import { 
  MapPinIcon, HomeModernIcon, CurrencyRupeeIcon, 
  WifiIcon, BoltIcon, UserGroupIcon, ClockIcon, 
  ShieldCheckIcon, NoSymbolIcon, CheckCircleIcon, 
  ArrowLeftIcon, CalendarDaysIcon, ExclamationTriangleIcon,
  PhoneIcon, SparklesIcon, CubeIcon
} from '@heroicons/react/24/solid';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await propertyService.getById(id);
        if (res.success) setProperty(res.data);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <Loader text="Checking availability..." />;
  if (!property) return <div className="p-10 text-center">Property not found.</div>;

  // Coordinates
  const lat = property.location?.coordinates?.[1] || 22.7196;
  const lng = property.location?.coordinates?.[0] || 75.8577;
  const position = [lat, lng];
  
  // Image Logic
  const images = property.images && property.images.length > 0 
    ? property.images 
    : ["https://images.unsplash.com/photo-1522771753035-4a58c9529eab?w=800"];

  const handleScheduleVisit = () => {
    const phoneNumber = property.owner?.phone;
    if (!phoneNumber) return alert("Owner contact not available");
    const cleanNumber = phoneNumber.replace(/\D/g, '').replace(/^(\d{10})$/, '91$1');
    const message = `Hello Sir/Ma'am, I saw your property "${property.title}" on Student Sathi. I want to visit.`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Verification Check (Real Data)
  const isVerified = property.owner?.providerDetails?.isVerified;

  return (
    <div className="min-h-screen bg-[#f0f4f8] pb-32 font-sans relative safe-padding">
      
      {/* 1. IMMERSIVE HEADER */}
      <div className="relative h-80 bg-gray-900 overflow-hidden group">
         <img 
            src={images[activeImage]} 
            alt="Property" 
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#f0f4f8] via-transparent to-transparent"></div>
         
         <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/40 transition-all z-10">
            <ArrowLeftIcon className="w-6 h-6" />
         </button>

         {/* Status Badge (Dynamic) */}
         <div className="absolute top-4 right-4">
             <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md border border-white/20 ${property.isAvailable ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                 {property.isAvailable ? '🟢 AVAILABLE' : '🔴 FULL'}
             </span>
         </div>

         <div className="absolute bottom-0 left-0 w-full p-6 pb-12">
             <div className="flex gap-2 mb-2">
                <span className="bg-white/90 backdrop-blur text-black text-[10px] font-bold px-2 py-1 rounded uppercase shadow-sm flex items-center">
                    <HomeModernIcon className="w-3 h-3 mr-1"/> {property.type}
                </span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase text-white backdrop-blur shadow-sm ${property.genderPreference === 'Girls Only' ? 'bg-pink-500/80' : 'bg-blue-500/80'}`}>
                    {property.genderPreference}
                </span>
             </div>
             <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1 drop-shadow-sm leading-tight">{property.title}</h1>
             <p className="text-sm font-medium text-gray-600 flex items-center">
                 <MapPinIcon className="w-4 h-4 mr-1 text-red-500"/> {property.address}, {property.city}
             </p>
         </div>

         {/* Thumbnails */}
         <div className="absolute bottom-4 right-4 flex gap-2 z-20">
            {images.map((img, idx) => (
                <div key={idx} onClick={() => setActiveImage(idx)} className={`w-10 h-10 rounded-lg border-2 cursor-pointer bg-gray-300 overflow-hidden ${activeImage === idx ? 'border-blue-500' : 'border-white/50'}`}>
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </div>
            ))}
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-4 relative z-10">
         
         {/* LEFT COLUMN: Details */}
         <div className="lg:col-span-2 space-y-6">
             
             {/* Pricing Card */}
             <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-5 rounded-3xl shadow-lg border border-white flex justify-between items-center">
                 <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Monthly Rent</p>
                    <h2 className="text-3xl font-black text-green-600 flex items-center"><CurrencyRupeeIcon className="w-6 h-6 mr-1"/>{property.rent.toLocaleString()}</h2>
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-lg mb-1">Deposit: ₹{property.deposit}</p>
                    <p className="text-[10px] text-gray-400 flex items-center justify-end"><BoltIcon className="w-3 h-3 mr-1"/> {property.electricityBill}</p>
                 </div>
             </motion.div>

             {/* Description */}
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-yellow-500"/> About
                 </h3>
                 <p className="text-gray-600 text-sm leading-relaxed">{property.description}</p>
             </div>

             {/* Amenities */}
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-lg text-gray-800 mb-4">Facilities</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                     <FeatureBox icon={WifiIcon} label="WiFi" value={property.amenities?.wifi ? 'Yes' : 'No'} color="text-indigo-500" bg="bg-indigo-50"/>
                     <FeatureBox icon={BoltIcon} label="AC" value={property.amenities?.ac ? 'Yes' : 'No'} color="text-yellow-500" bg="bg-yellow-50"/>
                     <FeatureBox icon={HomeModernIcon} label="Bath" value={property.amenities?.attachedBathroom ? 'Attached' : 'Shared'} color="text-blue-500" bg="bg-blue-50"/>
                     <FeatureBox icon={CheckCircleIcon} label="RO Water" value={property.amenities?.roWater ? 'Yes' : 'No'} color="text-cyan-500" bg="bg-cyan-50"/>
                     <FeatureBox icon={UserGroupIcon} label="Mess" value={property.amenities?.messAvailable ? 'In-House' : 'Nearby'} color="text-orange-500" bg="bg-orange-50"/>
                     <FeatureBox icon={UserGroupIcon} label="Sharing" value={property.occupancy} color="text-purple-500" bg="bg-purple-50"/>
                 </div>
             </div>

             {/* Inventory (Dynamic) */}
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center"><CubeIcon className="w-5 h-5 mr-2 text-pink-500"/> Inventory</h3>
                 <div className="flex flex-wrap gap-2">
                     {property.inventory?.bed && <span className="text-xs bg-gray-100 px-3 py-1 rounded-lg font-medium">Bed 🛏️</span>}
                     {property.inventory?.cupboard && <span className="text-xs bg-gray-100 px-3 py-1 rounded-lg font-medium">Cupboard 🚪</span>}
                     {property.inventory?.table && <span className="text-xs bg-gray-100 px-3 py-1 rounded-lg font-medium">Table 📚</span>}
                     {property.inventory?.mattress && <span className="text-xs bg-gray-100 px-3 py-1 rounded-lg font-medium">Mattress 🛌</span>}
                     {(!property.inventory?.bed && !property.inventory?.mattress) && <span className="text-xs text-gray-400">Unfurnished Room</span>}
                 </div>
             </div>

             {/* Rules */}
             <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                 <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center"><NoSymbolIcon className="w-5 h-5 mr-2"/> Rules</h3>
                 <div className="space-y-3">
                     <RuleRow icon={ClockIcon} label="Gate Closing" value={property.rules?.gateClosingTime || 'No Time'} />
                     <RuleRow icon={NoSymbolIcon} label="Non-Veg" value={property.rules?.nonVegAllowed ? "Allowed 🍗" : "Strictly Veg 🥗"} isGood={property.rules?.nonVegAllowed} />
                     <RuleRow icon={UserGroupIcon} label="Guests" value={property.rules?.guestsAllowed || 'Day Only'} />
                 </div>
             </div>
         </div>

         {/* RIGHT COLUMN: Map & Owner (Correct Order) */}
         <div className="space-y-6">
             
             {/* 1. MAP (Top) */}
             <div className="rounded-3xl overflow-hidden shadow-md border border-gray-200 bg-white relative z-0">
                 <div className="p-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase text-center">Exact Location 📍</div>
                 <div className="h-48 relative" style={{ zIndex: 0 }}>
                     <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }} dragging={false} zoomControl={false}>
                         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                         <Marker position={position} />
                     </MapContainer>
                 </div>
                 <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`} target="_blank" rel="noreferrer" className="block text-center bg-blue-600 text-white py-3 font-bold text-xs hover:bg-blue-700">
                     

[Image of Google Maps navigation arrow icon]
 Open Navigation
                 </a>
             </div>

             {/* 2. OWNER (Bottom) */}
             <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 sticky top-24">
                 <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                     <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold text-2xl border-4 border-white shadow-sm">
                         {property.owner?.name?.[0]?.toUpperCase() || 'O'}
                     </div>
                     <div>
                         <p className="text-[10px] text-gray-400 font-bold uppercase">Landlord</p>
                         <h3 className="font-bold text-gray-900 text-lg">{property.owner?.name}</h3>
                         {/* Dynamic Verified Logic */}
                         {isVerified ? (
                            <div className="flex items-center text-green-600 text-xs font-bold mt-0.5 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                                <ShieldCheckIcon className="w-3 h-3 mr-1" /> Verified
                            </div>
                         ) : (
                            <div className="text-xs text-gray-400 mt-1">Not Verified</div>
                         )}
                     </div>
                 </div>

                 <div className="space-y-3 hidden md:block">
                     <WhatsAppButton phoneNumber={property.owner?.phone} message={`Hi, I saw your property "${property.title}".`} label="Chat to Enquire" />
                     <a href={`tel:${property.owner?.phone}`} className="flex items-center justify-center w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"><PhoneIcon className="w-5 h-5 mr-2"/> Call Owner</a>
                     <button onClick={handleScheduleVisit} className="flex items-center justify-center w-full border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"><CalendarDaysIcon className="w-5 h-5 mr-2"/> Schedule Visit</button>
                 </div>

                 <div className="mt-4 bg-yellow-50 p-3 rounded-xl flex gap-2 border border-yellow-100">
                     <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                     <p className="text-[10px] text-yellow-800 leading-tight font-medium"><strong>Safety:</strong> Room visit kiye bina koi bhi advance payment na karein.</p>
                 </div>
             </div>
         </div>
      </div>

      {/* 6. STICKY BOTTOM BAR */}
      <div className="sticky-bottom-bar md:hidden flex gap-3" style={{ zIndex: 9999 }}>
          <a href={`tel:${property.owner?.phone}`} className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-bold flex items-center justify-center active:scale-95 transition-transform"><PhoneIcon className="w-5 h-5 mr-2"/> Call</a>
          <div className="flex-[1.5]"><WhatsAppButton phoneNumber={property.owner?.phone} message="Hi, I want to visit." label="Chat" /></div>
      </div>

    </div>
  );
};

// UI Helpers
const FeatureBox = ({ icon: Icon, label, value, color, bg }) => (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border border-gray-100 ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
        <div className="min-w-0"><p className="text-[10px] text-gray-500 font-bold uppercase">{label}</p><p className="text-sm font-bold text-gray-800 truncate">{value}</p></div>
    </div>
);

const RuleRow = ({ icon: Icon, label, value, isGood }) => (
    <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
        <span className="text-sm text-gray-600 font-medium flex items-center"><Icon className="w-4 h-4 mr-2 text-gray-400" /> {label}</span>
        <span className={`text-sm font-bold ${isGood === undefined ? 'text-gray-900' : isGood ? 'text-green-600' : 'text-red-500'}`}>{value}</span>
    </div>
);

export default PropertyDetails;