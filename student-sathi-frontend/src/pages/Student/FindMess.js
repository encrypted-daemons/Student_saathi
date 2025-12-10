import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import serviceService from '../../services/serviceService';
import MessCard from '../../components/cards/MessCard';
import Loader from '../../components/common/Loader';
import { 
  MagnifyingGlassIcon, FunnelIcon, 
  CakeIcon, XMarkIcon, CheckBadgeIcon, AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const FindMess = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    category: 'Mess',
    messType: '', 
    delivery: '', 
    isTrialAvailable: '', 
    city: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, city: searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchMess();
  }, [filters]);

  const fetchMess = async () => {
    setLoading(true);
    try {
      const res = await serviceService.getAll(filters);
      if (res.success) {
        setServices(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterToggle = (key, value) => {
    setFilters(prev => ({ 
        ...prev, 
        [key]: prev[key] === value ? '' : value 
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans">
      
      {/* Sticky Header */}
      <div className="bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 px-4 py-3 shadow-sm transition-all">
         <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-extrabold text-gray-800 flex items-center">
                    <CakeIcon className="w-6 h-6 text-orange-500 mr-2" />
                    Find Best Mess
                </h1>
            </div>
            
            <div className="flex gap-2">
                <div className="flex-1 bg-gray-100 rounded-xl flex items-center px-3 border border-gray-200 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all group">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 group-focus-within:text-orange-500" />
                    <input 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search Area (e.g. Vijay Nagar)..." 
                        className="w-full bg-transparent border-none focus:ring-0 p-2.5 text-sm outline-none text-gray-700 placeholder-gray-400"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-red-500 transition">
                            <XMarkIcon className="w-4 h-4"/>
                        </button>
                    )}
                </div>
                
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2.5 rounded-xl border transition-all relative ${showFilters ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    <AdjustmentsHorizontalIcon className="w-6 h-6" />
                    {(filters.messType || filters.delivery || filters.isTrialAvailable) && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3 pt-2 border-t border-gray-100"
                    >
                        <div className="flex flex-wrap gap-2 pb-2">
                            <FilterChip 
                                label="🥬 Pure Veg" 
                                active={filters.messType === 'Pure Veg'} 
                                onClick={() => handleFilterToggle('messType', 'Pure Veg')} 
                            />
                            <FilterChip 
                                label="🚚 Home Delivery" 
                                active={filters.delivery === 'true'} 
                                onClick={() => handleFilterToggle('delivery', 'true')} 
                            />
                            <FilterChip 
                                label="🥘 Trial Available" 
                                active={filters.isTrialAvailable === 'true'}
                                onClick={() => handleFilterToggle('isTrialAvailable', 'true')} 
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
         </div>
      </div>

      {/* Mess Grid */}
      <div className="max-w-6xl mx-auto p-4 min-h-[300px]">
        {loading ? <Loader text="Searching for food..." /> : (
            services.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-lg font-bold text-gray-700">No mess found</h3>
                    <p className="text-sm text-gray-500">Try changing your location or filters.</p>
                </div>
            ) : (
                <motion.div 
                    layout 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {services.map((service) => (
                        <MessCard 
                            key={service._id} 
                            service={service} 
                            onClick={(id) => navigate(`/student/service/${id}`)}
                        />
                    ))}
                </motion.div>
            )
        )}
      </div>
    </div>
  );
};

const FilterChip = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center h-[36px] ${
            active ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
        }`}
    >
        {active && <CheckBadgeIcon className="w-3 h-3 mr-1.5" />}
        {label}
    </button>
);

export default FindMess;