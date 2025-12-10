import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { 
  HomeModernIcon, CurrencyRupeeIcon, PhotoIcon, 
  TrashIcon, PlusIcon, ChevronDownIcon 
} from '@heroicons/react/24/outline';

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

  // Convert boolean value to string for comparison if needed
  const selectedLabel = options.find(opt => String(opt.value) === String(value))?.label || placeholder;

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
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fade-in-down">
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors border-b last:border-0 border-gray-50 ${String(value) === String(option.value) ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imageInput, setImageInput] = useState('');
  
  const [formData, setFormData] = useState(null);

  // Fetch Existing Data
  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await api.get(`/properties/${id}`);
            if(res.success) setFormData(res.data);
        } catch(e) { alert("Error loading property"); navigate(-1); }
        finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  // Handlers
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const addImage = () => { 
      if(imageInput) { 
          setFormData(prev => ({...prev, images: [...prev.images, imageInput]})); 
          setImageInput(''); 
      }
  };
  
  const removeImage = (idx) => setFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}));

  const handleUpdate = async (e) => {
      e.preventDefault();
      try {
          const res = await api.put(`/properties/${id}`, formData);
          if(res.success) {
              alert("Property Updated! ✅");
              navigate('/provider/dashboard');
          }
      } catch(e) { alert("Update Failed"); }
  };

  // Status Options
  const statusOptions = [
      { value: 'true', label: 'Available ✅' },
      { value: 'false', label: 'Booked ❌' }
  ];

  if(loading || !formData) return <Loader text="Loading Property..." />;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
       <div className="bg-white border-b px-6 py-4 sticky top-0 z-30 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">Edit Property</h1>
       </div>
       
       <div className="max-w-3xl mx-auto p-6">
           <form onSubmit={handleUpdate} className="space-y-6">
               
               {/* Basic Details */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                   <h3 className="font-bold text-gray-700 flex items-center"><HomeModernIcon className="w-5 h-5 mr-2"/> Edit Info</h3>
                   
                   <input 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                        placeholder="Property Title"
                   />
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input 
                            name="rent" 
                            type="number" 
                            value={formData.rent} 
                            onChange={handleChange} 
                            className="p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="Rent Amount" 
                        />
                       
                       {/* CUSTOM STATUS SELECT */}
                       <CustomSelect 
                            name="isAvailable" 
                            value={String(formData.isAvailable)} // Convert bool to string for select
                            onChange={(e) => setFormData({...formData, isAvailable: e.target.value === 'true'})} 
                            options={statusOptions} 
                            placeholder="Select Status"
                       />
                   </div>
               </div>

               {/* Photos Update */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                   <h3 className="font-bold text-gray-700 flex items-center"><PhotoIcon className="w-5 h-5 mr-2"/> Update Photos</h3>
                   <div className="flex gap-2">
                       <input 
                            value={imageInput} 
                            onChange={(e)=>setImageInput(e.target.value)} 
                            className="flex-1 p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="Add new image URL" 
                        />
                       <button type="button" onClick={addImage} className="bg-gray-900 text-white p-3 rounded-xl hover:bg-black transition"><PlusIcon className="w-5 h-5"/></button>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                       {formData.images.map((img, i) => (
                           <div key={i} className="relative h-24 rounded-lg overflow-hidden border border-gray-200 group">
                               <img src={img} className="w-full h-full object-cover" alt="prop"/>
                               <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><TrashIcon className="w-3 h-3"/></button>
                           </div>
                       ))}
                   </div>
               </div>

               <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition transform active:scale-95">
                   Update Property
               </button>
           </form>
       </div>
    </div>
  );
};

export default EditProperty;