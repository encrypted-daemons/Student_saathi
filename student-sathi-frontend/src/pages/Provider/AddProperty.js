import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import { 
  HomeModernIcon, CurrencyRupeeIcon, MapPinIcon, 
  CheckCircleIcon, PhotoIcon, PlusIcon, TrashIcon, CubeIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';

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
    // Fake event for compatibility
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl text-left text-gray-700 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all h-[50px]"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-fade-in-down">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors border-b last:border-0 border-gray-50 ${value === option.value ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageInput, setImageInput] = useState('');
  const [mapCenter, setMapCenter] = useState([22.7196, 75.8577]);

  const [formData, setFormData] = useState({
    title: '', description: '', type: 'Single Room', genderPreference: 'Any',
    rent: '', deposit: '', electricityBill: 'Excluded',
    address: '', city: 'Indore', lat: 22.7196, lng: 75.8577,
    furnishing: 'Unfurnished',
    inventory: { bed: false, mattress: false, table: false, cupboard: false, fan: true, light: true },
    amenities: { wifi: false, attachedBathroom: false, roWater: false, messAvailable: false, parking: false, cooler: false },
    rules: { gateClosingTime: '10:00 PM', nonVegAllowed: true, guestsAllowed: 'Day Only' },
    images: []
  });

  const LocationMarker = () => {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(() => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          setFormData(prev => ({ ...prev, lat, lng }));
        }
      },
    }), []);

    return (
      <Marker draggable={true} eventHandlers={eventHandlers} position={[formData.lat, formData.lng]} ref={markerRef}>
        <Popup>Drag to exact property location 📍</Popup>
      </Marker>
    );
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const toggleNested = (section, key) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: !prev[section][key] }
    }));
  };

  const handleRuleChange = (key, value) => {
      setFormData(prev => ({ ...prev, rules: { ...prev.rules, [key]: value } }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
        setMapCenter([latitude, longitude]); 
        alert("Location Detected! Adjust pin accurately.");
      });
    } else alert("Geolocation not supported");
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageInput] }));
      setImageInput('');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
          ...formData,
          images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1522771753035-4a58c9529eab?w=500']
      };
      
      const res = await api.post('/properties', payload);
      if (res.success) {
        alert('Room Listed Successfully! 🏠');
        navigate('/provider/dashboard');
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed');
    } finally { 
      setLoading(false); 
    }
  };

  const Chip = ({ label, active, onClick }) => (
    <div onClick={onClick} className={`px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all border flex items-center gap-2 select-none ${active ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
      {label} {active && <CheckCircleIcon className="w-4 h-4 text-white" />}
    </div>
  );

  // --- DROPDOWN OPTIONS ---
  const typeOptions = [
      { value: 'Single Room', label: 'Single Room' },
      { value: 'Double Sharing', label: 'Double Sharing' },
      { value: 'Flat', label: 'Flat (1BHK/2BHK)' },
      { value: 'Hostel', label: 'Hostel' },
      { value: 'PG', label: 'PG' }
  ];

  const genderOptions = [
      { value: 'Any', label: 'Any Gender' },
      { value: 'Boys Only', label: 'Boys Only' },
      { value: 'Girls Only', label: 'Girls Only' },
      { value: 'Family', label: 'Family' }
  ];

  const billOptions = [
      { value: 'Excluded', label: 'Excluded (Meter Reading)' },
      { value: 'Included', label: 'Included in Rent' },
      { value: 'Fixed Amount', label: 'Fixed Amount' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-30 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">List New Property</h1>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <form onSubmit={handleSubmit}>
          
          {/* 1. Basic & Type */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center"><HomeModernIcon className="w-5 h-5 mr-2"/> Basic Info</h3>
              <input required name="title" placeholder="Title (e.g. 1 Room Set near College)" onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomSelect 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange} 
                    options={typeOptions} 
                    placeholder="Property Type"
                />
                <CustomSelect 
                    name="genderPreference" 
                    value={formData.genderPreference} 
                    onChange={handleChange} 
                    options={genderOptions} 
                    placeholder="Gender Preference"
                />
              </div>
              
              <textarea name="description" placeholder="Description..." rows="2" onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>

          {/* 2. Rent & Rules */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-gray-700 flex items-center"><CurrencyRupeeIcon className="w-5 h-5 mr-2"/> Financials</h3>
            <div className="grid grid-cols-2 gap-4">
               <input required name="rent" type="number" placeholder="Rent (₹)" onChange={handleChange} className="p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
               <input name="deposit" type="number" placeholder="Deposit (₹)" onChange={handleChange} className="p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Electricity Bill</label>
                <CustomSelect 
                    name="electricityBill" 
                    value={formData.electricityBill} 
                    onChange={handleChange} 
                    options={billOptions} 
                    placeholder="Select Bill Type"
                />
            </div>
          </div>

          {/* 3. MAP (Same as before) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4 border-2 border-blue-50">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-blue-800 flex items-center"><MapPinIcon className="w-5 h-5 mr-2"/> Set Exact Location</h3>
                <button type="button" onClick={getCurrentLocation} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold hover:bg-blue-200 transition">
                    📍 Auto-Detect
                </button>
            </div>
            
            <input required name="address" placeholder="Full Address (House No, Street)" onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />

            <div className="h-64 w-full rounded-xl overflow-hidden border relative z-0">
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationMarker />
                </MapContainer>
                <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-600 z-[400] shadow-sm">
                    Drag pin to property location
                </div>
            </div>
          </div>

          {/* 4. Inventory */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center"><CubeIcon className="w-5 h-5 mr-2"/> Inventory (Kya milega?)</h3>
              <div className="flex flex-wrap gap-3">
                {Object.keys(formData.inventory).map(key => (
                    <Chip key={key} label={key.toUpperCase()} active={formData.inventory[key]} onClick={() => toggleNested('inventory', key)} />
                ))}
              </div>
          </div>

          {/* 5. Amenities & Rules */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-gray-700">Amenities & Rules</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {Object.keys(formData.amenities).map(key => (
                <Chip key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} active={formData.amenities[key]} onClick={() => toggleNested('amenities', key)} />
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                    <label className="text-xs font-bold text-gray-400">Gate Closing</label>
                    <input name="gateClosingTime" placeholder="10 PM" onChange={(e) => handleRuleChange('gateClosingTime', e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg mt-1 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex items-center mt-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <input type="checkbox" checked={formData.rules.nonVegAllowed} onChange={() => handleRuleChange('nonVegAllowed', !formData.rules.nonVegAllowed)} className="w-5 h-5 mr-2 rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-bold text-gray-700">Non-Veg Allowed?</span>
                </div>
            </div>
          </div>

          {/* 6. Photos */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-gray-700 flex items-center"><PhotoIcon className="w-5 h-5 mr-2"/> Photos</h3>
            <div className="flex gap-2">
              <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Paste Image URL..." className="flex-1 p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={addImage} className="bg-gray-900 text-white p-3 rounded-xl hover:bg-black transition"><PlusIcon className="w-6 h-6" /></button>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {formData.images.map((img, index) => (
                <div key={index} className="relative h-24 rounded-lg overflow-hidden group border border-gray-200 shadow-sm">
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><TrashIcon className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>

          <button disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 transform active:scale-95">
            {loading ? 'Listing...' : 'List Property 🚀'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddProperty;