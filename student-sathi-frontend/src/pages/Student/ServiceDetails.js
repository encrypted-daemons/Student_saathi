import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import serviceService from '../../services/serviceService';
import Loader from '../../components/common/Loader';
import WhatsAppButton from '../../components/common/WhatsAppButton';
import { 
  MapPinIcon, PhoneIcon, StarIcon, ArrowLeftIcon, 
  FireIcon, BookOpenIcon, AcademicCapIcon, TruckIcon, 
  CheckCircleIcon, ClockIcon, UserGroupIcon, BoltIcon,
  CheckBadgeIcon, ShieldCheckIcon, 
  SparklesIcon, WifiIcon, PrinterIcon, DocumentTextIcon, 
  NewspaperIcon, LockClosedIcon, ChatBubbleLeftRightIcon,
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

const ServiceDetails = () => {
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

  if (loading) return <Loader text="Loading details..." />;
  if (!service) return <div className="p-10 text-center text-gray-500">Service not found.</div>;

  // Coordinates
  const lat = service.location?.coordinates?.[1] || 22.7196;
  const lng = service.location?.coordinates?.[0] || 75.8577;
  const position = [lat, lng];
  
  // Dynamic Image
  let defaultImg = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"; // Mess default
  if (service.category === 'Library') defaultImg = "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800";
  if (service.category === 'Coaching') defaultImg = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800";
  if (service.category === 'Stationery') defaultImg = "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800";
  if (service.category === 'Transport') defaultImg = "https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800";

  const imageSrc = service.images?.[0] || defaultImg;
  const isVerified = service.provider?.providerDetails?.isVerified || false;

  // Action Text Logic
  const getActionText = () => {
      if (service.category === 'Mess') return "I want to request a Trial Meal 🍛.";
      if (service.category === 'Library') return "I want to check seat availability 📚.";
      if (service.category === 'Coaching') return "I want to book a Demo Class 🎓.";
      if (service.category === 'Stationery') return "I want to ask about Books/Printing rates 🖨️.";
      return "I am interested in your service.";
  };

  // --- 🎨 RENDER HIGHLIGHTS ---
  const renderHighlights = () => {
      
      if (service.category === 'Mess') {
          return (
              <div className="grid grid-cols-2 gap-3">
                  <FeatureBox icon={FireIcon} label="Food Type" value={service.messDetails?.type || 'N/A'} color="text-orange-500" bg="bg-orange-50"/>
                  <FeatureBox icon={TruckIcon} label="Service" value={service.messDetails?.serviceType || 'Dine-in'} color="text-blue-500" bg="bg-blue-50"/>
                  <FeatureBox icon={CheckBadgeIcon} label="Trial Meal" value={service.messDetails?.isTrialAvailable ? 'Available ✅' : 'Paid Only'} color="text-green-600" bg="bg-green-50"/>
                  <FeatureBox icon={StarIcon} label="Sunday Special" value={service.messDetails?.specialMenu || 'Standard'} color="text-yellow-500" bg="bg-yellow-50"/>
              </div>
          );
      }

      if (service.category === 'Library') {
          return (
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                      <FeatureBox icon={UserGroupIcon} label="Seats" value={`${service.libraryDetails?.totalSeats} Total`} color="text-purple-500" bg="bg-purple-50"/>
                      <FeatureBox icon={BoltIcon} label="AC / Cooling" value={service.libraryDetails?.amenities?.ac ? 'AC Available ❄️' : 'Cooler/Fans'} color="text-cyan-500" bg="bg-cyan-50"/>
                      <FeatureBox icon={ClockIcon} label="Timings" value={service.libraryDetails?.timings} color="text-blue-500" bg="bg-blue-50"/>
                      <FeatureBox icon={WifiIcon} label="Internet" value={service.libraryDetails?.amenities?.wifi ? 'High Speed' : 'No WiFi'} color="text-indigo-500" bg="bg-indigo-50"/>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                      {service.libraryDetails?.amenities?.locker && <Badge icon={LockClosedIcon} label="Locker" color="teal"/>}
                      {service.libraryDetails?.amenities?.newspaper && <Badge icon={NewspaperIcon} label="Newspapers" color="gray"/>}
                      {service.libraryDetails?.amenities?.discussionRoom && <Badge icon={ChatBubbleLeftRightIcon} label="Discussion Zone" color="pink"/>}
                      {service.libraryDetails?.amenities?.roWater && <Badge icon={CheckCircleIcon} label="RO Water" color="blue"/>}
                  </div>
              </div>
          );
      }

      if (service.category === 'Coaching') {
          return (
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                      <FeatureBox icon={AcademicCapIcon} label="Exams" value={service.coachingDetails?.exams?.join(', ')} color="text-red-500" bg="bg-red-50"/>
                      <FeatureBox icon={UserGroupIcon} label="Batch" value={service.coachingDetails?.batchSize} color="text-blue-500" bg="bg-blue-50"/>
                      <FeatureBox icon={CheckCircleIcon} label="Demo" value={service.coachingDetails?.isDemoAvailable ? 'Free ✅' : 'Paid'} color="text-green-600" bg="bg-green-50"/>
                      <FeatureBox icon={DocumentTextIcon} label="Materials" value={service.coachingDetails?.amenities?.printedNotes ? 'Printed Notes' : 'Digital'} color="text-yellow-600" bg="bg-yellow-50"/>
                  </div>
              </div>
          );
      }

      if (service.category === 'Stationery') {
        return (
            <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-yellow-800 uppercase">Print Rate</p>
                        <p className="text-sm font-medium text-yellow-900">B&W / Page</p>
                    </div>
                    <span className="text-3xl font-black text-yellow-600">₹{service.stationeryDetails?.printingRate}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <FeatureBox icon={BookOpenIcon} label="Old Books" value={service.stationeryDetails?.sellsSecondHand ? 'Yes 📚' : 'No'} color="text-pink-500" bg="bg-pink-50"/>
                    {service.stationeryDetails?.services?.spiralBinding && <FeatureBox icon={CheckCircleIcon} label="Binding" value="Available" color="text-blue-500" bg="bg-blue-50"/>}
                </div>

                <WhatsAppButton 
                    phoneNumber={service.contactNumber}
                    message={`Hi, I want to send a PDF for printing at ${service.name}.`}
                    label="Send PDF for Print 🖨️"
                    className="w-full py-3 font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md"
                />
            </div>
        );
    }
      return <p className="text-gray-500 text-sm italic">Standard amenities available.</p>;
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] pb-32 font-sans relative safe-padding">
      
      {/* 1. IMMERSIVE HEADER */}
      <div className="relative h-80 bg-gray-900 overflow-hidden group">
         <img src={imageSrc} alt="Service" className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
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
             <span className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md border border-white/20 ${service.isActive ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                 {service.isActive ? '🟢 OPEN' : '🔴 CLOSED'}
             </span>
         </div>

         <div className="absolute bottom-0 left-0 w-full p-6 pb-12">
             <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/90 backdrop-blur text-black text-[10px] font-bold px-3 py-1 rounded-lg uppercase shadow-sm">
                    {service.category}
                </span>
                <div className="flex items-center bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                    <StarIcon className="w-3 h-3 mr-1"/> {service.rating || '4.5'}
                </div>
             </div>
             <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 drop-shadow-sm leading-tight">{service.name}</h1>
             <p className="text-sm font-bold text-gray-600 flex items-center bg-white/50 w-fit px-3 py-1 rounded-lg backdrop-blur-sm">
                 <MapPinIcon className="w-4 h-4 mr-1.5 text-red-500"/> {service.address}, {service.city}
             </p>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-6 relative z-10">
         
         {/* LEFT COLUMN */}
         <div className="lg:col-span-2 space-y-6">
             
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                 <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-yellow-500"/> About
                 </h3>
                 <p className="text-gray-600 text-sm leading-relaxed">{service.description || "Best services in town."}</p>
             </div>

             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                 <h3 className="font-bold text-lg text-gray-900 mb-4">Highlights</h3>
                 {renderHighlights()}
             </div>

             {/* Pricing Plans */}
             {service.plans && service.plans.length > 0 && (
                 <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                     <h3 className="font-bold text-lg text-gray-900 mb-4">Pricing Plans</h3>
                     <div className="space-y-3">
                         {service.plans.map((plan, idx) => (
                             <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all">
                                 <div>
                                     <h4 className="font-bold text-gray-900">{plan.title}</h4>
                                     <p className="text-xs text-gray-500 uppercase font-bold">{plan.duration}</p>
                                     <div className="flex gap-2 mt-1 flex-wrap">
                                         {plan.features.map((f, i) => (
                                             <span key={i} className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{f}</span>
                                         ))}
                                     </div>
                                 </div>
                                 <div className="text-xl font-black text-green-600">₹{plan.price}</div>
                             </div>
                         ))}
                     </div>
                 </div>
             )}
         </div>

         {/* RIGHT COLUMN: Map & Contact */}
         <div className="space-y-6">
             
             <div className="rounded-[2rem] overflow-hidden shadow-md border border-gray-200 bg-white relative z-0">
                 <div className="p-4 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase text-center tracking-widest">Location 📍</div>
                 <div className="h-56 relative z-0">
                     <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%', zIndex: 0 }} dragging={false} zoomControl={false} scrollWheelZoom={false}>
                         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                         <Marker position={position} />
                     </MapContainer>
                 </div>
                 <a href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} target="_blank" rel="noreferrer" className="block text-center bg-blue-600 text-white py-4 font-bold text-sm hover:bg-blue-700 transition-colors">
                     Start Navigation ↗
                 </a>
             </div>

             <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 sticky top-24">
                 <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                     <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl border-4 border-white shadow-md">
                         {service.provider?.name?.[0] || 'S'}
                     </div>
                     <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Provider</p>
                         <h3 className="font-bold text-gray-900 text-lg leading-none mt-1">{service.provider?.name}</h3>
                         {isVerified ? (
                            <div className="flex items-center text-green-600 text-[10px] font-bold mt-1.5 bg-green-50 px-2 py-0.5 rounded-md w-fit">
                                <ShieldCheckIcon className="w-3 h-3 mr-1" /> VERIFIED
                            </div>
                         ) : <div className="text-[10px] text-gray-400 mt-1">Unverified</div>}
                     </div>
                 </div>

                 <div className="space-y-3 hidden md:block">
                     <WhatsAppButton phoneNumber={service.contactNumber} message={`Hi, I saw "${service.name}" on Student Sathi. ${getActionText()}`} label="Chat Now" className="w-full py-3 rounded-xl font-bold shadow-sm"/>
                     <a href={`tel:${service.contactNumber}`} className="flex items-center justify-center w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors border border-gray-200"><PhoneIcon className="w-5 h-5 mr-2"/> Call Now</a>
                 </div>
             </div>
         </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 md:hidden flex gap-3 z-[9999] safe-area-pb shadow-lg">
          <a href={`tel:${service.contactNumber}`} className="flex-1 bg-gray-100 text-gray-900 py-3.5 rounded-xl font-bold flex items-center justify-center active:scale-95 transition-transform"><PhoneIcon className="w-5 h-5 mr-2"/> Call</a>
          <div className="flex-[1.5]">
              <WhatsAppButton phoneNumber={service.contactNumber} message={`Hi, I saw "${service.name}". ${getActionText()}`} label="Chat" className="h-full rounded-xl font-bold text-lg shadow-lg"/>
          </div>
      </div>

    </div>
  );
};

// UI Helpers
const FeatureBox = ({ icon: Icon, label, value, color, bg }) => (
    <div className={`flex items-center gap-3 p-3.5 rounded-2xl border border-transparent ${bg} transition-all hover:scale-105`}>
        <Icon className={`w-5 h-5 ${color}`} />
        <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
            <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
        </div>
    </div>
);

const Badge = ({ icon: Icon, label, color }) => {
    const colors = {
        teal: 'bg-teal-50 text-teal-700 border-teal-200',
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        pink: 'bg-pink-50 text-pink-700 border-pink-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return (
        <span className={`px-3 py-1 ${colors[color]} border rounded-lg text-xs font-bold flex items-center`}>
            <Icon className="w-3 h-3 mr-1"/> {label}
        </span>
    );
};

export default ServiceDetails;