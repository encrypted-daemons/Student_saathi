import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  TruckIcon, MapPinIcon, PhotoIcon, PlusIcon, TrashIcon, 
  CurrencyRupeeIcon, IdentificationIcon, ShieldCheckIcon, ChevronDownIcon
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
    // Fake event to match parent handler structure
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl text-left text-gray-700 font-medium focus:ring-2 focus:ring-teal-500 transition-all h-[50px]"
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
              className={`w-full text-left px-4 py-3 text-sm hover:bg-teal-50 transition-colors border-b last:border-0 border-gray-50 ${value === option.value ? 'bg-teal-50 text-teal-700 font-bold' : 'text-gray-600'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AddTransport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageInput, setImageInput] = useState('');
  const [mapCenter, setMapCenter] = useState([22.7196, 75.8577]); 

  const [formData, setFormData] = useState({
    name: user?.providerDetails?.businessName || '',
    description: '', 
    contactNumber: user?.phone || '',
    category: 'Transport',
    address: '', city: 'Indore', lat: 22.7196, lng: 75.8577,
    transportDetails: {
        vehicleType: 'Auto Rickshaw',
        vehicleNumber: '',
        driverName: user?.name || '',
        seatsAvailable: 3,
        genderPreference: 'Any',
        amenities: { ac: false, music: false, wifi: false },
        routeString: '',
        timingStart: '08:00 AM',
        timingEnd: '08:00 PM',
        pricePerKm: ''
    },
    plans: [], 
    monthlyPrice: '',
    images: []
  });

  // Toggle Amenity (Safe Update)
  const toggleAmenity = (key) => {
      setFormData(prev => ({
          ...prev,
          transportDetails: {
              ...prev.transportDetails,
              amenities: {
                  ...prev.transportDetails.amenities,
                  [key]: !prev.transportDetails.amenities?.[key]
              }
          }
      }));
  };

  const fetchAddress = async (lat, lng) => {
      try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if(data.display_name) {
              setFormData(prev => ({ ...prev, address: data.display_name }));
          }
      } catch(e) { console.error("Address fetch failed"); }
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
    return <Marker draggable={true} eventHandlers={eventHandlers} position={[formData.lat, formData.lng]} ref={markerRef}><Popup>Stand Location 📍</Popup></Marker>;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
        setMapCenter([latitude, longitude]);
        fetchAddress(latitude, longitude);
        alert("Location Detected!");
      });
    } else alert("GPS on karein.");
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleTransportChange = (key, value) => {
      setFormData(prev => ({
          ...prev,
          transportDetails: { ...prev.transportDetails, [key]: value }
      }));
  };

  const addImage = () => {
    if (imageInput) { setFormData(prev => ({ ...prev, images: [...prev.images, imageInput] })); setImageInput(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const payload = {
            ...formData,
            transportDetails: {
                ...formData.transportDetails,
                routes: formData.transportDetails.routeString.split(',').map(s => s.trim()),
                pricePerKm: formData.transportDetails.pricePerKm
            },
            plans: [{ 
                title: 'Monthly Pass', 
                price: formData.monthlyPrice || 1500, 
                duration: 'Monthly', 
                features: ['Daily Pick & Drop'] 
            }]
        };
        
        if (payload.images.length === 0) payload.images = ['https://cdn-icons-png.flaticon.com/512/2555/2555013.png'];

        const res = await api.post('/services', payload);
        if (res.success) {
            alert('Gadi List Ho Gayi! 🛺');
            navigate('/provider/dashboard');
        }
    } catch (e) { alert("Listing Failed"); } 
    finally { setLoading(false); }
  };

  // --- VEHICLE OPTIONS ---
  const vehicleOptions = [
      { value: 'Auto Rickshaw', label: 'Auto Rickshaw 🛺' },
      { value: 'Magic Van', label: 'Magic Van 🚐' },
      { value: 'Bus', label: 'Bus 🚌' },
      { value: 'Bike Pool', label: 'Bike Pool 🏍️' },
      { value: 'Car Pool', label: 'Car Pool 🚗' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 p-4 font-sans">
        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm p-6">
            <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
                <TruckIcon className="w-8 h-8 text-teal-600 mr-2"/> Add Vehicle
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Fields */}
                <input value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border mt-1 outline-none focus:ring-2 focus:ring-teal-500 transition" placeholder="Service Name (e.g. Raju Magic Van)" required />
                
                <div className="grid grid-cols-2 gap-4">
                    
                    {/* CUSTOM VEHICLE SELECT */}
                    <CustomSelect 
                        name="vehicleType"
                        value={formData.transportDetails.vehicleType}
                        onChange={(val) => handleTransportChange('vehicleType', val)}
                        options={vehicleOptions}
                        placeholder="Vehicle Type"
                    />

                    <input type="number" value={formData.transportDetails.seatsAvailable} onChange={e=>handleTransportChange('seatsAvailable', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border mt-1 outline-none focus:ring-2 focus:ring-teal-500" placeholder="Seats" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                         <IdentificationIcon className="absolute left-3 top-4 w-5 h-5 text-gray-400"/>
                         <input className="w-full pl-10 p-3 bg-gray-50 rounded-xl border mt-1 outline-none focus:ring-2 focus:ring-teal-500" placeholder="Plate No." onChange={(e) => handleTransportChange('vehicleNumber', e.target.value)} />
                    </div>
                    <input className="w-full p-3 bg-gray-50 rounded-xl border mt-1 outline-none focus:ring-2 focus:ring-teal-500" placeholder="Driver Name" value={formData.transportDetails.driverName} onChange={(e) => handleTransportChange('driverName', e.target.value)} />
                </div>

                <textarea rows="2" value={formData.transportDetails.routeString} onChange={e=>handleTransportChange('routeString', e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border mt-1 outline-none focus:ring-2 focus:ring-teal-500" placeholder="Route (e.g. Vijay Nagar, Palasia...)" required></textarea>

                <div className="grid grid-cols-2 gap-4 bg-teal-50 p-3 rounded-xl border border-teal-100">
                    <div>
                        <label className="text-[10px] font-bold text-teal-800 uppercase">Price Per KM</label>
                        <input type="number" value={formData.transportDetails.pricePerKm} onChange={e=>handleTransportChange('pricePerKm', e.target.value)} className="w-full p-2 rounded-lg border outline-none" placeholder="15" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-teal-800 uppercase">Monthly Pass</label>
                        <input type="number" value={formData.monthlyPrice} onChange={e=>setFormData({...formData, monthlyPrice: e.target.value})} className="w-full p-2 rounded-lg border outline-none" placeholder="1500" />
                    </div>
                </div>

                {/* Amenities */}
                <div className="flex gap-3">
                    {['ac', 'music', 'wifi'].map(a => (
                        <div 
                            key={a} 
                            onClick={() => toggleAmenity(a)} 
                            className={`px-3 py-2 rounded-lg cursor-pointer border text-xs font-bold capitalize flex items-center gap-1 transition-all ${formData.transportDetails.amenities?.[a] ? 'bg-teal-600 text-white border-teal-600 shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}
                        >
                            {a} {formData.transportDetails.amenities?.[a] && <CheckCircleIcon className="w-3 h-3"/>}
                        </div>
                    ))}
                </div>

                {/* Location & Map */}
                <div className="bg-white p-4 rounded-xl border-2 border-blue-50 space-y-2">
                    <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Stand Location</label>
                        <button type="button" onClick={getCurrentLocation} className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">📍 Auto Detect</button>
                    </div>
                    <div className="h-48 rounded-xl overflow-hidden border relative z-0">
                         <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationMarker />
                        </MapContainer>
                    </div>
                    <input value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full p-3 bg-gray-50 rounded-xl border mt-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Address" required />
                </div>

                {/* Photos */}
                <div className="flex gap-2">
                    <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Add Image URL" className="flex-1 p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-teal-500" />
                    <button type="button" onClick={addImage} className="bg-black text-white p-3 rounded-xl hover:bg-gray-800"><PlusIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((img, i) => (
                        <div key={i} className="relative h-20 rounded-lg overflow-hidden group">
                            <img src={img} className="w-full h-full object-cover" alt="prev"/>
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><TrashIcon className="w-3 h-3"/></button>
                        </div>
                    ))}
                </div>

                <button disabled={loading} className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 transition transform active:scale-95">
                    {loading ? 'Adding...' : 'Start Service 🚀'}
                </button>
            </form>
        </div>
    </div>
  );
};

export default AddTransport;