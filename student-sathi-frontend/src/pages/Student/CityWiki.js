import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import wikiService from '../../services/wikiService';
import serviceService from '../../services/serviceService';
import Loader from '../../components/common/Loader';
import { 
  MapIcon, TruckIcon, ShieldCheckIcon, 
  ShoppingBagIcon, ChevronDownIcon, PhoneIcon,
  BanknotesIcon, ClockIcon, TicketIcon, BookOpenIcon,
  AcademicCapIcon, PencilSquareIcon, MagnifyingGlassIcon, XMarkIcon,
  MapPinIcon
} from '@heroicons/react/24/solid';

const CityWiki = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Transport');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'Transport', label: 'Bus/Metro', icon: TruckIcon, color: 'bg-blue-500' },
    { id: 'Emergency', label: 'Emergency', icon: ShieldCheckIcon, color: 'bg-red-500' },
    { id: 'Cheap Markets', label: 'Markets', icon: ShoppingBagIcon, color: 'bg-pink-500' },
    { id: 'Library', label: 'Libraries', icon: BookOpenIcon, color: 'bg-purple-500' },
    { id: 'Stationery', label: 'Stationery', icon: PencilSquareIcon, color: 'bg-yellow-500' },
    { id: 'Coaching', label: 'Coaching', icon: AcademicCapIcon, color: 'bg-indigo-500' },
    { id: 'Govt Schemes', label: 'Schemes', icon: BanknotesIcon, color: 'bg-green-500' },
  ];

  useEffect(() => {
    fetchData();
    setSearchTerm(''); 
  }, [activeTab]);

  useEffect(() => {
      if (!searchTerm) {
          setFilteredData(data);
      } else {
          const lower = searchTerm.toLowerCase();
          const filtered = data.filter(item => 
             (item.title || item.name || '').toLowerCase().includes(lower) || 
             (item.description || item.address || '').toLowerCase().includes(lower)
          );
          setFilteredData(filtered);
      }
  }, [searchTerm, data]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const isService = ['Library', 'Stationery', 'Coaching'].includes(activeTab);
      
      if (isService) {
          const res = await serviceService.getAll({ category: activeTab });
          if (res.success) setData(res.data);
      } else {
          const res = await wikiService.getInfo(activeTab);
          if (res.success && res.data.length > 0) setData(res.data);
          else setData(getMockData(activeTab));
      }
    } catch (error) {
      console.error("Wiki Error:", error);
      setData(getMockData(activeTab));
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (item) => {
      if (['Library', 'Stationery', 'Coaching'].includes(activeTab)) {
          navigate(`/student/service/${item._id}`);
      } else {
          setExpandedId(expandedId === item._id ? null : item._id);
      }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 p-4 font-sans">
      
      {/* 1. Header & Search */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-4">
            <h1 className="text-2xl font-black flex items-center text-gray-900 mb-4">
                <MapIcon className="w-8 h-8 mr-2 text-teal-600" />
                City Guide
            </h1>
            
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder={`Search in ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-gray-100 border-none rounded-xl font-medium text-gray-700 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>

        {/* Tabs (Scrollable) */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setExpandedId(null); }}
                        className={`snap-center flex items-center px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap border ${
                            isActive 
                            ? `${tab.color} text-white border-transparent shadow-md transform scale-105` 
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <tab.icon className={`w-4 h-4 mr-1.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        {tab.label}
                    </button>
                );
            })}
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="max-w-4xl mx-auto min-h-[300px]">
        {loading ? <Loader text={`Loading ${activeTab}...`} /> : (
          <motion.div layout className="space-y-4">
            {filteredData.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border-2 border-dashed">
                    <p>No information found.</p>
                </div>
            ) : (
                filteredData.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    key={item._id} 
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div 
                      className="p-5 flex justify-between items-center cursor-pointer select-none"
                      onClick={() => handleCardClick(item)}
                    >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className={`p-3 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0`}>
                             {activeTab === 'Transport' ? <TruckIcon className="w-6 h-6 text-blue-500"/> : 
                              activeTab === 'Emergency' ? <ShieldCheckIcon className="w-6 h-6 text-red-500"/> :
                              activeTab === 'Cheap Markets' ? <ShoppingBagIcon className="w-6 h-6 text-pink-500"/> :
                              activeTab === 'Govt Schemes' ? <BanknotesIcon className="w-6 h-6 text-green-500"/> :
                              <MapIcon className="w-6 h-6 text-gray-400"/>}
                          </div>
                          <div className="min-w-0">
                              <h3 className="font-bold text-gray-900 text-lg truncate">{item.title || item.name}</h3>
                              <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">
                                  {item.description || item.address || 'Tap for details'}
                              </p>
                          </div>
                        </div>
                        
                        {/* Arrow only for static wiki items */}
                        {!['Library', 'Stationery', 'Coaching'].includes(activeTab) && (
                            <div className={`bg-gray-50 p-2 rounded-full transition-transform duration-300 flex-shrink-0 ${expandedId === item._id ? 'rotate-180' : ''}`}>
                               <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        )}
                     </div>

                    {/* Expanded Content (Wiki) */}
                    <AnimatePresence>
                      {expandedId === item._id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-100 bg-gray-50/50 overflow-hidden"
                        >
                          <div className="p-5 space-y-4">
                            
                            {activeTab === 'Transport' && (
                                <>
                                    <div className="flex justify-between items-center mb-4 text-sm font-medium text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                                        <span className="text-blue-600 flex items-center"><ClockIcon className="w-4 h-4 mr-1"/> {item.data?.timings}</span>
                                        <span className="text-green-600 flex items-center"><TicketIcon className="w-4 h-4 mr-1"/> {item.data?.fare}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Stops</p>
                                        <div className="flex flex-wrap gap-2">
                                            {item.data?.stops?.map((stop, i) => (
                                                <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-lg font-bold">{stop}</span>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'Emergency' && (
                                <div className="flex flex-col gap-3">
                                    <a href={`tel:${item.data?.contactNumber}`} className="w-full bg-red-500 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center hover:bg-red-600 active:scale-95 transition-transform">
                                        <PhoneIcon className="w-5 h-5 mr-2" /> Call Now: {item.data?.contactNumber}
                                    </a>
                                    <p className="text-xs text-gray-500 mt-3 flex items-center justify-center">
                                        <MapPinIcon className="w-3 h-3 mr-1" /> {item.data?.location?.address}
                                    </p>
                                </div>
                            )}

                            {activeTab === 'Cheap Markets' && (
                                <>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-lg font-bold">Sasta Samaan ✅</span>
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-lg font-bold">Bargaining ✅</span>
                                    </div>
                                    <p className="text-sm text-gray-600 bg-white p-3 rounded-xl border border-gray-200">
                                        <strong>Open:</strong> {item.data?.timings}
                                    </p>
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.title + " Indore")}`} target="_blank" rel="noreferrer" className="block text-center w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
                                        Navigate to Market ↗
                                    </a>
                                </>
                            )}

                            {activeTab === 'Govt Schemes' && (
                                <div className="space-y-3">
                                    <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                        <p className="text-xs text-green-800 font-bold uppercase mb-1">Eligibility</p>
                                        <p className="text-sm text-gray-700">{item.data?.eligibility}</p>
                                    </div>
                                    <a href={item.data?.websiteLink} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black">
                                        Visit Official Portal ↗
                                    </a>
                                </div>
                            )}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const getMockData = (category) => {
    if(category === 'Transport') return [{ _id: '1', title: 'iBus Route: M1', description: 'Rajiv Gandhi - Niranjanpur', data: { stops: ['Rajiv Gandhi', 'Bhanwarkuan', 'GPO', 'Palasia', 'LIG', 'Niranjanpur'], timings: '6 AM - 11 PM', fare: '₹10-30' } }];
    if(category === 'Emergency') return [{ _id: '3', title: 'Bhanwarkuan Police Station', description: 'Near University', data: { contactNumber: '100', location: { address: 'Bhanwarkuan Main Road, Indore' } } }];
    if(category === 'Cheap Markets') return [{ _id: '5', title: 'Khajuri Bazar', description: 'Books & Stationery Wholesale', data: { timings: '11 AM - 9 PM' } }];
    if(category === 'Govt Schemes') return [{ _id: '7', title: 'Medhavi Chatra Yojna', description: 'MP Govt Scholarship', data: { eligibility: 'MP Domicile + 70% in 12th', websiteLink: 'http://scholarshipportal.mp.nic.in' } }];
    return [];
}

export default CityWiki;