import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, TrashIcon, PencilSquareIcon, 
  HomeModernIcon, MapPinIcon, CurrencyRupeeIcon, 
  ChartBarIcon, EyeIcon, CheckBadgeIcon, XCircleIcon, 
  SparklesIcon, BoltIcon
} from '@heroicons/react/24/solid';

const LandlordDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({ views: 0, count: 0, revenue: 0 });

  const businessName = user?.providerDetails?.businessName || user?.name;

  useEffect(() => { fetchProperties(); }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/properties/my-listings');
      if (res.success) {
        setListings(res.data);
        
        const totalViews = res.data.reduce((acc, item) => acc + (item.views || 0), 0);
        const totalRevenue = res.data.reduce((acc, item) => acc + (item.rent || 0), 0); 
        
        setStats({ views: totalViews, count: res.data.length, revenue: totalRevenue });
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // Quick Status Toggle
  const handleToggleStatus = async (id, currentStatus) => {
      try {
          setListings(prev => prev.map(item => item._id === id ? { ...item, isAvailable: !currentStatus } : item));
          await api.put(`/properties/${id}`, { isAvailable: !currentStatus });
      } catch(e) { alert("Update Failed"); fetchProperties(); }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Delete this property permanently?")) return;
      try {
          await api.delete(`/properties/${id}`);
          setListings(prev => prev.filter(item => item._id !== id));
      } catch(e) { alert("Delete Failed"); }
  };

  const getImg = (item) => (item.images && item.images.length > 0) 
    ? item.images[0] 
    : "https://images.unsplash.com/photo-1522771753035-4a58c9529eab?w=500";

  if (loading) return <Loader text="Loading Properties..." />;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans relative overflow-x-hidden">
        
        {/* Animated Background */}
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-blue-900/10 to-transparent -z-10"></div>

        <div className="max-w-6xl mx-auto p-6 space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-blue-100">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center tracking-tight">
                       {businessName} 
                       <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold uppercase border border-blue-100 tracking-wide">Landlord</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Manage your rental business efficiently.</p>
                </div>
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/provider/add-property')}
                    className="bg-black text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-gray-900 transition-all"
                >
                    <PlusIcon className="w-5 h-5 mr-2" /> Add New Room
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={HomeModernIcon} color="text-blue-600 bg-blue-50" title="Total Rooms" value={stats.count} delay={0.1} />
                <StatCard icon={CurrencyRupeeIcon} color="text-green-600 bg-green-50" title="Monthly Potential" value={`₹${stats.revenue.toLocaleString()}`} delay={0.2} />
                <StatCard icon={EyeIcon} color="text-purple-600 bg-purple-50" title="Total Views" value={stats.views} delay={0.3} />
            </div>

            {/* Listings */}
            <div>
                <h3 className="text-lg font-extrabold text-gray-800 mb-5 flex items-center">
                  <SparklesIcon className="w-5 h-5 text-yellow-500 mr-2" /> Your Properties
                </h3>

                {listings.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200"
                    >
                        <HomeModernIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-400 font-medium">You haven't listed any rooms yet.</p>
                        <button onClick={() => navigate('/provider/add-property')} className="text-blue-600 font-bold hover:underline mt-2">+ List First Property</button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                        {listings.map((item, i) => (
                            <motion.div 
                                key={item._id} 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                transition={{ delay: i * 0.1 }}
                                layout
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-300"
                            >
                                {/* Image & Status */}
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    <img 
                                        src={getImg(item)} 
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                    
                                    <button 
                                        onClick={() => handleToggleStatus(item._id, item.isAvailable)}
                                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1 backdrop-blur-md transition-all ${item.isAvailable ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
                                    >
                                        {item.isAvailable ? <><CheckBadgeIcon className="w-3 h-3"/> Available</> : <><XCircleIcon className="w-3 h-3"/> Full</>}
                                    </button>

                                    <div className="absolute bottom-3 left-3 text-white w-full pr-6">
                                        <p className="text-[10px] font-bold bg-white/20 backdrop-blur px-2 py-0.5 rounded mb-1 w-fit border border-white/20">{item.type}</p>
                                        <h4 className="font-bold text-lg leading-tight truncate">{item.title}</h4>
                                    </div>
                                </div>
                                
                                {/* Details */}
                                <div className="p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-xs text-gray-500 flex items-center font-medium">
                                            <MapPinIcon className="w-3.5 h-3.5 mr-1 text-red-400 flex-shrink-0"/> 
                                            <span className="truncate max-w-[140px]">{item.address}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center font-medium bg-yellow-50 px-2 py-0.5 rounded text-yellow-700 border border-yellow-100">
                                            <BoltIcon className="w-3 h-3 mr-1 text-yellow-500"/> {item.electricityBill}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Rent</p>
                                            <span className="font-black text-xl text-green-600">₹{item.rent}</span>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => navigate(`/provider/edit-property/${item._id}`)} 
                                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100" 
                                                title="Edit"
                                            >
                                                <PencilSquareIcon className="w-5 h-5"/>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(item._id)} 
                                                className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100" 
                                                title="Delete"
                                            >
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, color, title, value, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay }}
        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow cursor-default"
    >
        <div className={`p-3.5 rounded-2xl ${color} bg-opacity-10 mr-4 shadow-sm`}><Icon className="w-6 h-6"/></div>
        <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-black text-gray-900 mt-0.5">{value}</h3>
        </div>
    </motion.div>
);

export default LandlordDashboard;