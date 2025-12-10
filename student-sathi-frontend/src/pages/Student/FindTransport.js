import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import serviceService from '../../services/serviceService';
import TransportCard from '../../components/cards/TransportCard';
import Loader from '../../components/common/Loader';
import { MagnifyingGlassIcon, TruckIcon, MapIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const FindTransport = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState({
    category: 'Transport',
    route: '', 
    vehicle: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, route: searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchTransport();
  }, [filters]);

  const fetchTransport = async () => {
    setLoading(true);
    try {
      const res = await serviceService.getAll(filters);
      if (res.success) setServices(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans">
      
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-200 px-4 py-4 shadow-sm transition-all">
         <div className="max-w-6xl mx-auto">
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center mb-3">
                <TruckIcon className="w-6 h-6 text-blue-600 mr-2" />
                Find Daily Ride
            </h1>
            
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter your College or Area (e.g. Medicaps, Vijay Nagar)..." 
                    className="w-full pl-10 pr-10 py-3 bg-gray-100 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder-gray-400 text-sm md:text-base"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Quick Filter Pills */}
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
                {['Auto Rickshaw', 'Magic Van', 'Bus', 'Bike Pool'].map(v => (
                    <button
                        key={v}
                        onClick={() => setFilters(prev => ({ ...prev, vehicle: prev.vehicle === v ? '' : v }))}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all transform active:scale-95 ${
                            filters.vehicle === v 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                    >
                        {v}
                    </button>
                ))}
            </div>
         </div>
      </div>

      {/* Transport Grid */}
      <div className="max-w-6xl mx-auto p-4 min-h-[400px]">
        {loading ? <Loader text="Locating vehicles..." /> : (
            services.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <div className="text-6xl mb-4">🚌</div>
                    <h3 className="text-lg font-bold text-gray-700">No vehicles found</h3>
                    <p className="text-sm text-gray-500 mt-1 text-center px-4">No vehicles found on this route. Try searching for a nearby landmark.</p>
                </div>
            ) : (
                <motion.div 
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {services.map((service) => (
                        <TransportCard 
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

export default FindTransport;