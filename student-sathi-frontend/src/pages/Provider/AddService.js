import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  TruckIcon, BookOpenIcon, CakeIcon, PencilSquareIcon, 
  MapPinIcon, PhotoIcon, PlusIcon, TrashIcon, CheckCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid';

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
    // Fake event to match parent handler structure (for nested updates)
    onChange(val); 
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex justify-between items-center bg-white border border-gray-200 rounded-xl text-left text-gray-700 font-medium focus:ring-2 focus:ring-orange-500 transition-all h-[50px]"
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
              className={`w-full text-left px-4 py-3 text-sm hover:bg-orange-50 transition-colors border-b last:border-0 border-gray-50 ${value === option.value ? 'bg-orange-50 text-orange-700 font-bold' : 'text-gray-600'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AddService = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageInput, setImageInput] = useState('');
  const [mapCenter, setMapCenter] = useState([22.7196, 75.8577]); 

  const providerData = user?.providerDetails || user?.details || {};
  const category = providerData.category;

  const [formData, setFormData] = useState({
    name: providerData.businessName || '',
    description: '', contactNumber: user?.phone || '',
    address: '', city: 'Indore', lat: 22.7196, lng: 75.8577,
    category: category,
    
    // MESS SPECIFIC FIELDS
    messDetails: { 
        type: 'Pure Veg', 
        serviceType: 'Dine-in Only', 
        specialMenu: '', 
        isTrialAvailable: false 
    },
    
    libraryDetails: { totalSeats: '', ac: false, wifi: true, timings: '8 AM - 9 PM' },
    coachingDetails: { exams: '', isDemoAvailable: true, batchSize: 'Medium' },
    stationeryDetails: { printingRate: '', sellsSecondHand: false },
    
    images: [],
    plans: [] 
  });

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
    return <Marker draggable={true} eventHandlers={eventHandlers} position={[formData.lat, formData.lng]} ref={markerRef}><Popup>Business Location 📍</Popup></Marker>;
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleNestedChange = (section, key, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
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

  const addImage = () => {
    if (imageInput) { setFormData(prev => ({ ...prev, images: [...prev.images, imageInput] })); setImageInput(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const payload = { ...formData };
        if (payload.images.length === 0) payload.images = ['https://via.placeholder.com/500'];

        if (category === 'Mess' && payload.plans.length === 0) {
            payload.plans = [{ title: 'Monthly Tiffin', price: 3000, duration: 'Monthly', features: ['Lunch', 'Dinner'] }];
        }

        const res = await api.post('/services', payload);
        if (res.success) {
            alert(`${category} Listed Successfully! 🎉`);
            navigate('/provider/dashboard');
        }
    } catch (e) { alert("Listing Failed"); } 
    finally { setLoading(false); }
  };

  const getIcon = () => {
      if(category === 'Mess') return <CakeIcon className="w-6 h-6 mr-2 text-orange-500"/>;
      if(category === 'Library') return <BookOpenIcon className="w-6 h-6 mr-2 text-purple-500"/>;
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4">
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm p-6">
            <h1 className="text-xl font-black text-gray-800 mb-6 flex items-center">
                {getIcon()} Add {category}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-orange-200 transition" placeholder="Business Name" required />
                <textarea name="description" rows="2" onChange={handleChange} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-200 transition" placeholder="Description (e.g. Best home-made food)" required />
                
                {/* 👇 MESS SPECIFIC FIELDS (Fixed Selects) */}
                {category === 'Mess' && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-3">
                        <p className="text-xs font-bold text-orange-800 uppercase">Mess Details</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            
                            {/* Custom Select: Food Type */}
                            <CustomSelect 
                                name="type"
                                value={formData.messDetails.type}
                                onChange={(val) => handleNestedChange('messDetails', 'type', val)}
                                options={foodTypeOptions}
                                placeholder="Food Type"
                            />

                            {/* Custom Select: Service Type */}
                            <CustomSelect 
                                name="serviceType"
                                value={formData.messDetails.serviceType}
                                onChange={(val) => handleNestedChange('messDetails', 'serviceType', val)}
                                options={serviceTypeOptions}
                                placeholder="Service Type"
                            />

                        </div>
                        
                        <div onClick={() => handleNestedChange('messDetails', 'isTrialAvailable', !formData.messDetails.isTrialAvailable)} className={`p-3 border rounded-xl flex items-center cursor-pointer transition-colors ${formData.messDetails.isTrialAvailable ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white text-gray-500 border-gray-200'}`}>
                            <CheckCircleIcon className={`w-5 h-5 mr-2 transition ${formData.messDetails.isTrialAvailable ? 'text-green-600' : 'text-gray-300'}`}/>
                            <span className="text-sm font-bold">Trial Meal (Demo) Available?</span>
                        </div>
                    </div>
                )}

                {/* Location */}
                <div className="bg-white p-4 rounded-xl border-2 border-blue-50 space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
                        <button type="button" onClick={getCurrentLocation} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">📍 Detect</button>
                    </div>
                    <div className="h-48 rounded-xl overflow-hidden border relative z-0">
                         <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationMarker />
                        </MapContainer>
                    </div>
                    <input name="address" value={formData.address} onChange={handleChange} className="w-full p-3 border rounded-xl text-sm" placeholder="Address" required />
                </div>

                {/* Photos */}
                <div className="flex gap-2">
                    <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Add Image URL" className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-200 transition" />
                    <button type="button" onClick={addImage} className="bg-black text-white p-3 rounded-xl hover:bg-gray-800"><PlusIcon className="w-6 h-6"/></button>
                </div>

                <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg transition transform active:scale-95">
                    {loading ? 'Saving...' : 'List Now 🚀'}
                </button>
            </form>
        </div>
    </div>
  );
};

export default AddService;