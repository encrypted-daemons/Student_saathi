import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { 
  TruckIcon, MapPinIcon, PhotoIcon, PlusIcon, TrashIcon, 
  CurrencyRupeeIcon, IdentificationIcon, ShieldCheckIcon,
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

const EditTransport = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imageInput, setImageInput] = useState('');
  const [mapCenter, setMapCenter] = useState([22.7196, 75.8577]);

  const [formData, setFormData] = useState(null);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await api.get(`/services/${id}`);
            if(res.success) {
                const data = res.data;
                setFormData({
                    ...data,
                    lat: data.location?.coordinates[1] || 22.7196,
                    lng: data.location?.coordinates[0] || 75.8577,
                    address: data.location?.addressText || data.address,
                    transportDetails: {
                        ...data.transportDetails,
                        amenities: data.transportDetails?.amenities || { ac: false, music: false, wifi: false },
                        routeString: data.transportDetails?.routes?.join(', ') || '',
                        pricePerKm: data.transportDetails?.pricePerKm || '',
                    },
                    monthlyPrice: data.plans?.[0]?.price || '',
                    plans: data.plans || []
                });
                
                if(data.location?.coordinates) {
                    setMapCenter([data.location.coordinates[1], data.location.coordinates[0]]);
                }
            }
        } catch(e) { 
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
    
    if(!formData) return null;
    return <Marker draggable={true} eventHandlers={eventHandlers} position={[formData.lat, formData.lng]} ref={markerRef}><Popup>Update Location 📍</Popup></Marker>;
  };

  // --- HANDLERS ---
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleTransportChange = (key, value) => {
      setFormData(prev => ({
          ...prev,
          transportDetails: { ...prev.transportDetails, [key]: value }
      }));
  };

  const toggleAmenity = (key) => {
      setFormData(prev => ({
          ...prev,
          transportDetails: { 
              ...prev.transportDetails, 
              amenities: { ...prev.transportDetails.amenities, [key]: !prev.transportDetails.amenities?.[key] } 
          }
      }));
  };

  const addImage = () => {
    if (imageInput) { setFormData(prev => ({ ...prev, images: [...prev.images, imageInput] })); setImageInput(''); }
  };

  const removeImage = (idx) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            ...formData,
            transportDetails: {
                ...formData.transportDetails,
                routes: formData.transportDetails.routeString.split(',').map(s => s.trim()),
                pricePerKm: formData.transportDetails.pricePerKm
            },
            plans: [{ title: 'Monthly Pass', price: formData.monthlyPrice || 1500, duration: 'Monthly', features: ['Daily Pick & Drop'] }],
            location: {
                type: 'Point',
                coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)],
                addressText: formData.address
            }
        };
        await api.put(`/services/${id}`, payload);
        alert('Vehicle Updated Successfully! ✅');
        navigate('/provider/dashboard');
    } catch (e) { alert("Update Failed"); } 
  };

  if (loading || !formData) return <Loader text="Loading Garage..." />;

  // --- VEHICLE OPTIONS ---
  const vehicleOptions = [
      { value: 'Auto Rickshaw', label: 'Auto Rickshaw 🛺' },
      { value: 'Magic Van', label: 'Magic Van 🚐' },
      { value: 'Bus', label: 'Bus 🚌' },
      { value: 'Bike Pool', label: 'Bike Pool 🏍️' },
      { value: 'Car Pool', label: 'Car Pool 🚗' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b px-6 py-4 sticky top-0 z-30 flex items-center shadow-sm gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-500 font-bold">← Back</button>
            <h1 className="text-xl font-black text-gray-800">Edit Vehicle Details</h1>
        </div>

        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <form onSubmit={handleSubmit}>
                
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-gray-100">
                    <h3 className="text-lg font-bold text-teal-700 flex items-center"><TruckIcon className="w-6 h-6 mr-2"/> Gadi Info</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} className="p-3 border rounded-xl bg-gray-50" placeholder="Service Name" />
                        
                        {/* CUSTOM VEHICLE SELECT */}
                        <CustomSelect 
                            name="vehicleType"
                            value={formData.transportDetails.vehicleType}
                            onChange={(val) => handleTransportChange('vehicleType', val)}
                            options={vehicleOptions}
                            placeholder="Vehicle Type"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input className="w-full p-3 border rounded-xl bg-gray-50" value={formData.transportDetails.vehicleNumber} placeholder="Plate No." onChange={(e) => handleTransportChange('vehicleNumber', e.target.value)} />
                        <input className="p-3 border rounded-xl bg-gray-50" placeholder="Driver Name" value={formData.transportDetails.driverName} onChange={(e) => handleTransportChange('driverName', e.target.value)} />
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-gray-100 mt-6">
                    <h3 className="text-lg font-bold text-gray-700 flex items-center"><CurrencyRupeeIcon className="w-6 h-6 mr-2 text-green-600"/> Pricing</h3>
                    <div className="grid grid-cols-2 gap-4 bg-green-50 p-4 rounded-xl border border-green-100">
                        <div>
                            <label className="text-[10px] font-bold text-green-800 uppercase">Price Per KM</label>
                            <input type="number" value={formData.transportDetails.pricePerKm} onChange={e=>handleTransportChange('pricePerKm', e.target.value)} className="w-full p-2 rounded-lg border border-green-200" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-green-800 uppercase">Monthly Pass</label>
                            <input type="number" value={formData.monthlyPrice} onChange={e=>setFormData({...formData, monthlyPrice: e.target.value})} className="w-full p-2 rounded-lg border border-green-200" />
                        </div>
                    </div>
                </div>

                {/* Route & Map */}
                <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-gray-100 mt-6">
                    <h3 className="text-lg font-bold text-gray-700 flex items-center"><MapPinIcon className="w-6 h-6 mr-2 text-blue-600"/> Route & Stand</h3>
                    <textarea rows="2" className="w-full p-3 border rounded-xl bg-gray-50" value={formData.transportDetails.routeString} onChange={(e) => handleTransportChange('routeString', e.target.value)} required></textarea>
                    
                    <div className="h-56 rounded-xl overflow-hidden border relative z-0 mt-2">
                        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationMarker />
                        </MapContainer>
                        <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-600 z-[400]">
                            Drag pin to update location
                        </div>
                    </div>
                    <input name="address" value={formData.address} onChange={handleChange} className="w-full p-3 border rounded-xl bg-gray-50" placeholder="Address" />
                </div>

                {/* Amenities */}
                <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-gray-100 mt-6">
                    <h3 className="text-lg font-bold text-gray-700">Amenities</h3>
                    <div className="flex gap-3 pt-2">
                        {['ac', 'music', 'wifi'].map(a => (
                            <div 
                                key={a} 
                                onClick={() => toggleAmenity(a)} 
                                className={`px-4 py-2 rounded-lg cursor-pointer border text-sm font-bold capitalize ${formData.transportDetails.amenities?.[a] ? 'bg-teal-500 text-white' : 'bg-white text-gray-500'}`}
                            >
                                {a} {formData.transportDetails.amenities?.[a] ? '✅' : ''}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Photos */}
                <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-gray-100 mt-6">
                    <h3 className="font-bold text-gray-700 flex items-center"><PhotoIcon className="w-5 h-5 mr-2 text-pink-500"/> Update Photos</h3>
                    <div className="flex gap-2">
                        <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Add new image URL" className="flex-1 p-3 border rounded-xl" />
                        <button type="button" onClick={addImage} className="bg-black text-white p-3 rounded-xl"><PlusIcon className="w-5 h-5"/></button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {formData.images.map((img, i) => (
                            <div key={i} className="relative h-24 rounded-lg overflow-hidden group border border-gray-200">
                                <img src={img} className="w-full h-full object-cover" alt="prop"/>
                                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><TrashIcon className="w-3 h-3"/></button>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 mt-8">
                    Update Vehicle 🔄
                </button>
            </form>
        </div>
    </div>
  );
};

export default EditTransport;