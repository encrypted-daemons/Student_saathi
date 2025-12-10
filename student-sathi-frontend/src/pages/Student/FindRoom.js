import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import propertyService from '../../services/propertyService';
import PropertyCard from '../../components/cards/PropertyCard'; 
import Loader from '../../components/common/Loader';
import { 
  FunnelIcon, MagnifyingGlassIcon, XMarkIcon, 
  HomeModernIcon, AdjustmentsHorizontalIcon,
  ChevronDownIcon
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

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 flex justify-between items-center bg-white border border-gray-200 rounded-lg text-left text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all h-[42px]"
      >
        <span className="truncate text-gray-700">{selectedLabel}</span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-fade-in-down">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 transition-colors border-b last:border-0 border-gray-50 ${value === option.value ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-600'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FindRoom = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    gender: '',
    maxRent: '',
    amenities: [] 
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, city: searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const apiFilters = {
        ...filters,
        amenities: filters.amenities.join(',')
      };
      
      const res = await propertyService.getAll(apiFilters);
      if (res.success) {
        setProperties(res.data);
      }
    } catch (error) {
      console.error("Error fetching properties", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => {
      const newAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities: newAmenities };
    });
  };

  const resetFilters = () => {
    setFilters({ city: '', type: '', gender: '', maxRent: '', amenities: [] });
    setSearchTerm('');
  };

  const handleCardClick = (id) => {
      navigate(`/student/property/${id}`);
  };

  // --- OPTIONS ---
  const genderOptions = [
      { value: '', label: 'Any Gender' },
      { value: 'Boys Only', label: 'Boys Only' },
      { value: 'Girls Only', label: 'Girls Only' },
      { value: 'Family', label: 'Family' }
  ];

  const typeOptions = [
      { value: '', label: 'Any Room Type' },
      { value: 'Single Room', label: 'Single Room' },
      { value: 'Double Sharing', label: 'Double Sharing' },
      { value: 'Flat', label: 'Flat / Apartment' },
      { value: 'Hostel', label: 'Hostel / PG' }
  ];

  const budgetOptions = [
      { value: '', label: 'Any Budget' },
      { value: '3000', label: 'Under ₹3,000' },
      { value: '5000', label: 'Under ₹5,000' },
      { value: '8000', label: 'Under ₹8,000' },
      { value: '15000', label: 'Under ₹15,000' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans">
      
      {/* 1. Sticky Header & Search */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto flex gap-3 items-center">
          
          {/* Search Bar */}
          <div className="flex-1 bg-gray-50 rounded-xl flex items-center px-3 border border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 transition-all group hover:bg-white">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Area (e.g. Vijay Nagar)..." 
              className="w-full bg-transparent border-none focus:ring-0 p-2.5 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition">
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-all relative ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-600 shadow-inner' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:shadow-sm'}`}
          >
            <AdjustmentsHorizontalIcon className="w-6 h-6" />
            {(filters.type || filters.gender || filters.maxRent || filters.amenities.length > 0) && (
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>
        </div>

        {/* 2. Collapsible Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-w-6xl mx-auto mt-3 overflow-visible border-t border-gray-100 pt-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                
                {/* Gender Filter (Fixed) */}
                <CustomSelect 
                    name="gender" 
                    value={filters.gender} 
                    onChange={handleFilterChange} 
                    options={genderOptions} 
                    placeholder="Gender"
                />

                {/* Type Filter (Fixed) */}
                <CustomSelect 
                    name="type" 
                    value={filters.type} 
                    onChange={handleFilterChange} 
                    options={typeOptions} 
                    placeholder="Room Type"
                />

                {/* Budget Filter (Fixed) */}
                <CustomSelect 
                    name="maxRent" 
                    value={filters.maxRent} 
                    onChange={handleFilterChange} 
                    options={budgetOptions} 
                    placeholder="Max Budget"
                />

                {/* Amenities Toggles */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide col-span-2 md:col-span-1">
                   {['wifi', 'ac', 'mess'].map(item => (
                       <button 
                         key={item}
                         onClick={() => handleAmenityToggle(item)}
                         className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border transition-all whitespace-nowrap h-[42px] flex items-center ${filters.amenities.includes(item) ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                       >
                         {item}
                       </button>
                   ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center pb-2">
                  <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">{properties.length} Results found</span>
                  <button onClick={resetFilters} className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1">
                    <XMarkIcon className="w-3 h-3"/> Clear All
                  </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Property Grid */}
      <div className="max-w-6xl mx-auto p-4">
        {loading ? (
          <Loader text="Finding best rooms for you..." />
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
                <HomeModernIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">No rooms found</h3>
            <p className="text-sm text-gray-500 mt-1">Try changing your filters or search area.</p>
            <button onClick={resetFilters} className="mt-6 text-primary-600 font-bold hover:underline text-sm border border-primary-200 px-4 py-2 rounded-lg hover:bg-primary-50 transition">
                View All Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => (
              <PropertyCard 
                key={prop._id} 
                property={prop} 
                onClick={handleCardClick} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindRoom;