import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpenIcon, PencilSquareIcon, MapPinIcon, PhotoIcon, PlusIcon, TrashIcon, 
  AcademicCapIcon, CurrencyRupeeIcon, CheckCircleIcon, PrinterIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid';
import Loader from '../../components/common/Loader';

// Leaflet Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// --- REUSABLE CUSTOM SELECT ---
const CustomSelect = ({ name, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  const handleSelect = (val) => {
    // Fake event for handler compatibility
    onChange(val); 
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex justify-between items-center bg-white border border-gray-200 rounded-xl text-left text-gray-700 font-medium focus:ring-2 focus:ring-indigo-500 transition-all h-[50px]"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fade-in-down">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition-colors border-b last:border-0 border-gray-50 ${value === option.value ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const EditResource = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imageInput, setImageInput] = useState('');
  const [mapCenter, setMapCenter] = useState([22.7196, 75.8577]); 
  
  const [formData, setFormData] = useState(null);
  const [tempPlan, setTempPlan] = useState({ title: '', price: '', duration: 'Monthly' });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await api.get(`/services/${id}`);
            if(res.success) {
                const data = res.data;
                // Init missing nested objects
                if (!data.libraryDetails) data.libraryDetails = { amenities: {} };
                if (!data.coachingDetails) data.coachingDetails = { amenities: {} };
                if (!data.stationeryDetails) data.stationeryDetails = { services: {} };

                setFormData({
                    ...data,
                    lat: data.location?.coordinates[1] || 22.7196,
                    lng: data.location?.coordinates[0] || 75.8577,
                    address: data.location?.addressText || data.address
                });
                
                if(data.location?.coordinates) {
                    setMapCenter([data.location.coordinates[1], data.location.coordinates[0]]);
                }
            }
        } catch(e) { 
            alert("Error loading details"); 
            navigate('/provider/dashboard'); 
        } finally { 
            setLoading(false); 
        }
    };
    fetchData();
  }, [id, navigate]);

  // --- MAP LOGIC ---
  const fetchAddress = async (lat, lng) => {
      try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if(data.display_name) setFormData(prev => ({ ...prev, address: data.display_name }));
      } catch(e) {}
  };

  const LocationMarker = () => {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(() => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setFormData(prev => ({ ...prev, lat, lng }));
          fetchAddress(lat, lng);
        }
      },
    }), []);
    
    if(!formData) return null;
    return <Marker draggable={true} eventHandlers={eventHandlers} position={[formData.lat, formData.lng]} ref={markerRef}><Popup>Location 📍</Popup></Marker>;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        fetchAddress(pos.coords.latitude, pos.coords.longitude);
        alert("Location Detected!");
      });
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleNestedChange = (section, key, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const toggleDeepNested = (section, subSection, key) => {
      setFormData(prev => ({
          ...prev,
          [section]: {
              ...prev[section],
              [subSection]: {
                  ...prev[section][subSection],
                  [key]: !prev[section][subSection]?.[key]
              }
          }
      }));
  };

  const addImage = () => {
    if (imageInput) { setFormData(prev => ({ ...prev, images: [...prev.images, imageInput] })); setImageInput(''); }
  };

  const removeImage = (idx) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const addPlan = () => {
      if(tempPlan.title && tempPlan.price) {
          setFormData(prev => ({ ...prev, plans: [...prev.plans, { ...tempPlan, features: [] }] }));
          setTempPlan({ title: '', price: '', duration: 'Monthly' });
      }
  };

  const removePlan = (idx) => {
      setFormData(prev => ({ ...prev, plans: prev.plans.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const payload = {
              ...formData,
              location: {
                  type: 'Point',
                  coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)],
                  addressText: formData.address
              }
          };
          
          if (payload.category === 'Coaching' && typeof payload.coachingDetails.exams === 'string') {
             payload.coachingDetails.exams = payload.coachingDetails.exams.split(',').map(s => s.trim());
          }

          await api.put(`/services/${id}`, payload);
          alert("Updated Successfully! ✅");
          navigate('/provider/dashboard');
      } catch(e) { alert("Update Failed"); }
  };

  if (loading || !formData) return <Loader text="Loading Details..." />;
  const category = formData.category;

  // --- UI HELPERS ---
  const Checkbox = ({ label, checked, onClick }) => (
      <div onClick={onClick} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${checked ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}>
          <span className="text-sm font-bold">{label}</span>
          {checked && <CheckCircleIcon className="w-5 h-5 text-indigo-600"/>}
      </div>
  );

  const getIcon = () => {
      if(category === 'Library') return <BookOpenIcon className="w-6 h-6 mr-2 text-purple-500"/>;
      if(category === 'Coaching') return <AcademicCapIcon className="w-6 h-6 mr-2 text-blue-500"/>;
      return <PencilSquareIcon className="w-6 h-6 mr-2 text-yellow-600"/>;
  };

  // --- OPTIONS ---
  const foodTypeOptions = [
      { value: 'Pure Veg', label: 'Pure Veg 🥬' },
      { value: 'Veg/Non-Veg', label: 'Veg & Non-Veg 🍗' }
  ];

  const serviceTypeOptions = [
      { value: 'Dine-in Only', label: 'Dine-in Only' },
      { value: 'Delivery Only', label: 'Delivery Only 🚚' },
      { value: 'Both', label: 'Both' }
  ];

  const batchSizeOptions = [
      { value: 'Small (<20)', label: 'Small (<20)' },
      { value: 'Medium (20-50)', label: 'Medium (20-50)' },
      { value: 'Large (50+)', label: 'Large (50+)' }
  ];
  
  const secondHandOptions = [
      { value: false, label: 'No' },
      { value: true, label: 'Yes' }
  ];


  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-30 flex items-center gap-3 shadow-sm">
         <button onClick={() => navigate(-1)} className="text-gray-500 font-bold">← Back</button>
         <h1 className="text-xl font-bold">Edit {category}</h1>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
         <form onSubmit={handleSubmit}>
             
             {/* 1. Basic Info */}
             <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 border border-gray-100">
                 <h3 className="font-bold text-gray-700 flex items-center">{getIcon()} Basic Info</h3>
                 <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="Name" />
                 <textarea name="description" value={formData.description} rows="2" onChange={handleChange} className="w-full p-3 border rounded-xl" />
                 <input name="address" value={formData.address} onChange={handleChange} className="w-full p-3 border rounded-xl" />
             </div>

             {/* 2. Category Specific (FIXED SELECTS) */}
             
             {/* === MESS === */}
             {category === 'Mess' && formData.messDetails && (
                 <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-3">
                     <h3 className="font-bold text-lg text-orange-700">Mess Details</h3>
                     <div className="grid grid-cols-2 gap-3">
                         <CustomSelect 
                             name="type" 
                             value={formData.messDetails.type} 
                             onChange={(val) => handleNestedChange('messDetails', 'type', val)} 
                             options={foodTypeOptions} 
                             placeholder="Food Type"
                         />
                         <CustomSelect 
                             name="serviceType" 
                             value={formData.messDetails.serviceType} 
                             onChange={(val) => handleNestedChange('messDetails', 'serviceType', val)} 
                             options={serviceTypeOptions} 
                             placeholder="Service Type"
                         />
                     </div>
                 </div>
             )}

             {/* === LIBRARY === */}
             {category === 'Library' && formData.libraryDetails && (
                 <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 border border-purple-100">
                     <h3 className="font-bold text-lg text-purple-700">Library Settings</h3>
                     <div className="grid grid-cols-2 gap-4">
                         <input type="number" value={formData.libraryDetails.totalSeats} className="p-3 border rounded-xl" onChange={(e) => handleNestedChange('libraryDetails', 'totalSeats', e.target.value)} placeholder="Total Seats" />
                         <input value={formData.libraryDetails.timings} className="p-3 border rounded-xl" onChange={(e) => handleNestedChange('libraryDetails', 'timings', e.target.value)} placeholder="Timings" />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                         <Checkbox label="AC Available ❄️" checked={formData.libraryDetails.amenities?.ac} onClick={() => toggleDeepNested('libraryDetails', 'amenities', 'ac')} />
                         <Checkbox label="WiFi 📶" checked={formData.libraryDetails.amenities?.wifi} onClick={() => toggleDeepNested('libraryDetails', 'amenities', 'wifi')} />
                     </div>
                 </div>
             )}

             {/* === COACHING === */}
             {category === 'Coaching' && formData.coachingDetails && (
                 <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 border border-blue-100">
                     <h3 className="font-bold text-lg text-blue-700">Coaching Details</h3>
                     <div className="grid grid-cols-2 gap-4">
                         <input value={Array.isArray(formData.coachingDetails.exams) ? formData.coachingDetails.exams.join(', ') : formData.coachingDetails.exams} className="w-full p-3 border rounded-xl" onChange={(e) => handleNestedChange('coachingDetails', 'exams', e.target.value)} placeholder="Exams" />
                         <CustomSelect 
                             name="batchSize" 
                             value={formData.coachingDetails.batchSize} 
                             onChange={(val) => handleNestedChange('coachingDetails', 'batchSize', val)} 
                             options={batchSizeOptions} 
                             placeholder="Batch Size"
                         />
                     </div>
                 </div>
             )}

             {/* === STATIONERY === */}
             {category === 'Stationery' && formData.stationeryDetails && (
                 <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 space-y-3">
                     <div className="grid grid-cols-2 gap-3">
                         <input type="number" value={formData.stationeryDetails.printingRate} className="p-3 border rounded-xl" onChange={(e) => handleNestedChange('stationeryDetails', 'printingRate', e.target.value)} placeholder="Print Rate" />
                         <CustomSelect 
                             name="sellsSecondHand" 
                             value={formData.stationeryDetails.sellsSecondHand} 
                             onChange={(val) => handleNestedChange('stationeryDetails', 'sellsSecondHand', val)} 
                             options={secondHandOptions} 
                             placeholder="Old Books?"
                         />
                     </div>
                 </div>
             )}

             {/* Photos & Map (Standard) */}
             {/* ... Map Code (Same as before) ... */}
             <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 border-2 border-blue-50">
                <h3 className="font-bold text-gray-700 flex items-center"><MapPinIcon className="w-5 h-5 mr-2 text-blue-500"/> Update Location</h3>
                <div className="h-56 w-full rounded-xl overflow-hidden border relative z-0">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker />
                    </MapContainer>
                </div>
             </div>

             {/* Photos */}
             <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                 <h3 className="font-bold text-gray-700 flex items-center"><PhotoIcon className="w-5 h-5 mr-2 text-pink-500"/> Update Photos</h3>
                 <div className="flex gap-2">
                     <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Add Image URL" className="flex-1 p-3 border rounded-xl" />
                     <button type="button" onClick={addImage} className="bg-black text-white p-3 rounded-xl"><PlusIcon className="w-6 h-6"/></button>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                     {formData.images.map((img, i) => (
                         <div key={i} className="relative"><img src={img} className="h-20 w-full object-cover rounded-xl border" alt="prev" /><button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><TrashIcon className="w-3 h-3"/></button></div>
                     ))}
                 </div>
             </div>

             <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Update Service 🔄</button>
         </form>
      </div>
    </div>
  );
};

export default EditResource;