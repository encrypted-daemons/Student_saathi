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
  AcademicCapIcon, ChevronDownIcon
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
    onChange(val); // Direct value for nested handler
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

const AddResource = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageInput, setImageInput] = useState('');
  const [mapCenter, setMapCenter] = useState([22.7196, 75.8577]); 

  const providerData = user?.providerDetails || user?.details || {};
  const category = providerData.category || 'Library';

  const [tempPlan, setTempPlan] = useState({ title: '', price: '', duration: 'Monthly' });

  const [formData, setFormData] = useState({
    name: providerData.businessName || '',
    description: '', contactNumber: user?.phone || '',
    address: '', city: 'Indore', lat: 22.7196, lng: 75.8577,
    category: category,
    
    libraryDetails: { 
        totalSeats: '', availableSeats: '', timings: '8 AM - 9 PM',
        amenities: { ac: false, wifi: true, locker: false, discussionRoom: false, newspaper: false, roWater: true } 
    },
    coachingDetails: { 
        exams: '', batchSize: 'Medium (20-50)', isDemoAvailable: true,
        amenities: { ac: false, printedNotes: true, onlineBackup: false, testSeries: true }
    },
    stationeryDetails: { 
        printingRate: '', sellsSecondHand: false,
        services: { spiralBinding: false, lamination: false, colorPrint: false, projectMaking: false } 
    },

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
                  [key]: !prev[section][subSection][key]
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
    setLoading(true);
    try {
        const payload = { ...formData };
        if (payload.images.length === 0) payload.images = ['https://via.placeholder.com/500'];

        const res = await api.post('/services', payload);
        if (res.success) {
            alert(`${category} Listed Successfully! 🎉`);
            navigate('/provider/dashboard');
        }
    } catch (e) { alert("Listing Failed"); } 
    finally { setLoading(false); }
  };

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
        <div className="bg-white border-b px-6 py-4 sticky top-0 z-30 flex items-center shadow-sm gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-500 font-bold">← Back</button>
            <h1 className="text-xl font-black text-gray-800">Add New {category}</h1>
        </div>

        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <form onSubmit={handleSubmit}>
                
                <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-700 flex items-center">{getIcon()} Basic Info</h3>
                    <input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-xl bg-gray-50 outline-none font-bold" placeholder="Center/Shop Name" required />
                    <textarea name="description" rows="3" onChange={handleChange} className="w-full p-3 border rounded-xl bg-gray-50 outline-none" placeholder="Describe your services..." required />
                    <input name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="w-full p-3 border rounded-xl bg-gray-50 outline-none" placeholder="Contact Number" required />
                </div>

                {/* === COACHING === */}
                {category === 'Coaching' && (
                    <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-blue-100">
                        <h3 className="font-bold text-lg text-blue-700">Batch & Faculty</h3>
                        <input placeholder="Exams (e.g. JEE, NEET)" className="w-full p-3 border rounded-xl" onChange={(e) => handleNestedChange('coachingDetails', 'exams', e.target.value)} required />
                        
                        <div className="grid grid-cols-2 gap-4">
                            
                            {/* Custom Batch Size */}
                            <CustomSelect 
                                name="batchSize"
                                value={formData.coachingDetails.batchSize}
                                onChange={(val) => handleNestedChange('coachingDetails', 'batchSize', val)}
                                options={batchSizeOptions}
                                placeholder="Batch Size"
                            />

                            <div onClick={() => handleNestedChange('coachingDetails', 'isDemoAvailable', !formData.coachingDetails.isDemoAvailable)} className={`p-3 border rounded-xl flex items-center justify-center cursor-pointer ${formData.coachingDetails.isDemoAvailable ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50'}`}>
                                Demo Class? {formData.coachingDetails.isDemoAvailable ? 'Yes ✅' : 'No'}
                            </div>
                        </div>
                        
                        {/* Amenities Checkboxes */}
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <Checkbox label="Printed Notes 📚" checked={formData.coachingDetails.amenities.printedNotes} onClick={() => toggleDeepNested('coachingDetails', 'amenities', 'printedNotes')} />
                            <Checkbox label="AC Classrooms ❄️" checked={formData.coachingDetails.amenities.ac} onClick={() => toggleDeepNested('coachingDetails', 'amenities', 'ac')} />
                        </div>
                    </div>
                )}

                {/* === STATIONERY === */}
                {category === 'Stationery' && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                             <div>
                                 <label className="text-[10px] font-bold text-gray-400 uppercase">B&W Print Rate</label>
                                 <input type="number" placeholder="₹/page" className="w-full p-2 border rounded-lg mt-1" onChange={(e) => handleNestedChange('stationeryDetails', 'printingRate', e.target.value)} />
                             </div>
                             <div>
                                 <label className="text-[10px] font-bold text-gray-400 uppercase">Old Books</label>
                                 <CustomSelect 
                                    name="sellsSecondHand"
                                    value={formData.stationeryDetails.sellsSecondHand}
                                    onChange={(val) => handleNestedChange('stationeryDetails', 'sellsSecondHand', val)}
                                    options={secondHandOptions}
                                    placeholder="Select"
                                 />
                             </div>
                        </div>
                    </div>
                )}

                {/* Location & Photos (Standard) */}
                <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border-2 border-blue-50">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-700 flex items-center"><MapPinIcon className="w-5 h-5 mr-2 text-blue-500"/> Location</h3>
                        <button type="button" onClick={getCurrentLocation} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold">📍 Detect</button>
                    </div>
                    <input name="address" value={formData.address} onChange={handleChange} className="w-full p-3 border rounded-xl bg-gray-50" placeholder="Full Address" required />
                    <div className="h-56 w-full rounded-xl overflow-hidden border relative z-0">
                        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationMarker />
                        </MapContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm space-y-4 border border-gray-100">
                    <h3 className="font-bold text-gray-700 flex items-center"><PhotoIcon className="w-5 h-5 mr-2 text-pink-500"/> Photos</h3>
                    <div className="flex gap-2">
                        <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Paste Image URL..." className="flex-1 p-3 border rounded-xl bg-gray-50" />
                        <button type="button" onClick={addImage} className="bg-black text-white p-3 rounded-xl"><PlusIcon className="w-6 h-6"/></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {formData.images.map((img, i) => (
                            <div key={i} className="relative"><img src={img} className="h-20 w-full object-cover rounded-xl border" alt="prev" /><button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><TrashIcon className="w-3 h-3"/></button></div>
                        ))}
                    </div>
                </div>

                <button disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
                    {loading ? 'Publishing...' : 'Go Live 🚀'}
                </button>
            </form>
        </div>
    </div>
  );
};

export default AddResource;