import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, TrashIcon, PencilSquareIcon, 
  TruckIcon, MapPinIcon, CurrencyRupeeIcon, 
  ChartBarIcon, EyeIcon, SparklesIcon, CheckBadgeIcon, XCircleIcon,
  UserGroupIcon, ArrowRightIcon
} from '@heroicons/react/24/solid';

const TransportDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  
  const businessName = user?.providerDetails?.businessName || user?.name;
  const [stats, setStats] = useState({ views: 0, count: 0, revenue: 0 });

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services/my-services');
      if (res.success) {
        const data = res.data;
        setVehicles(data);
        
        const totalViews = data.reduce((acc, item) => acc + (item.views || 0), 0);
        const totalRevenue = data.reduce((acc, item) => {
            const monthly = item.plans?.[0]?.price || 0;
            const seats = item.transportDetails?.seatsAvailable || 3; 
            return acc + (monthly * seats);
        }, 0);

        setStats({ views: totalViews, count: data.length, revenue: totalRevenue });
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // Quick Seat Update
  const updateSeatCount = async (id, currentSeats, change) => {
      const newCount = Math.max(0, currentSeats + change);
      
      setVehicles(prev => prev.map(v => 
          v._id === id 
          ? { ...v, transportDetails: { ...v.transportDetails, seatsAvailable: newCount } } 
          : v
      ));

      try {
          await api.put(`/services/${id}`, { details: { seatsAvailable: newCount } });
      } catch(e) { 
          alert("Update failed"); 
          fetchVehicles(); 
      }
  };

  // Status Toggle
  const toggleStatus = async (id, currentStatus, name) => {
      const newStatus = !currentStatus;
      try {
          setVehicles(prev => prev.map(v => v._id === id ? { ...v, isActive: newStatus } : v));
          await api.put(`/services/${id}`, { isActive: newStatus });
      } catch(e) { alert("Status Update Failed"); }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Delete this vehicle permanently?")) return;
      try {
          await api.delete(`/services/${id}`);
          setVehicles(prev => prev.filter(v => v._id !== id));
      } catch(e) { alert("Delete Failed"); }
  };

  const handleEdit = (id) => {
      navigate(`/provider/edit-transport/${id}`);
  };

  if (loading) return <Loader text="Loading Fleet..." />;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans relative overflow-x-hidden">
      
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-900/10 to-transparent -z-10"></div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 sticky top-0 z-30 flex justify-between items-center shadow-sm transition-all">
        <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
               {businessName} 
               <span className="ml-2 text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-teal-100">Transport Partner</span>
            </h1>
        </div>
        <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/provider/add-transport')}
            className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-black transition-all"
        >
            <PlusIcon className="w-4 h-4 mr-2" /> Add Vehicle
        </motion.button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={TruckIcon} color="text-teal-600 bg-teal-50" title="Total Vehicles" value={stats.count} delay={0.1} />
            <StatCard icon={CurrencyRupeeIcon} color="text-green-600 bg-green-50" title="Potential Revenue" value={`₹${stats.revenue.toLocaleString()}`} delay={0.2} />
            <StatCard icon={EyeIcon} color="text-purple-600 bg-purple-50" title="Total Views" value={stats.views} delay={0.3} />
        </div>

        {/* Listings */}
        <div>
            <h3 className="text-lg font-extrabold text-gray-800 mb-5 flex items-center">
              <SparklesIcon className="w-5 h-5 text-yellow-500 mr-2" /> Manage Fleet
            </h3>
            
            {vehicles.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200"
                >
                    <TruckIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400 font-medium">No vehicles listed yet.</p>
                    <button onClick={() => navigate('/provider/add-transport')} className="text-teal-600 font-bold hover:underline mt-2">
                      + Add Your First Vehicle
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                    {vehicles.map((item, i) => {
                        const details = item.transportDetails || {};
                        const isFull = details.seatsAvailable === 0;

                        return (
                            <motion.div 
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                layout
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-300"
                            >
                                {/* Status Header */}
                                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center tracking-wider">
                                        <TruckIcon className="w-3 h-3 mr-1.5 text-teal-500"/> {details.vehicleType}
                                    </span>
                                    <button 
                                        onClick={() => toggleStatus(item._id, item.isActive, item.name)}
                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shadow-sm ${item.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}
                                    >
                                        {item.isActive ? <><CheckBadgeIcon className="w-3 h-3"/> ACTIVE</> : <><XCircleIcon className="w-3 h-3"/> OFF DUTY</>}
                                    </button>
                                </div>
                                
                                <div className="p-5 space-y-4">
                                    {/* Name & Loc */}
                                    <div>
                                        <h4 className="font-black text-gray-900 text-lg truncate leading-tight">{item.name}</h4>
                                        <p className="text-xs text-gray-500 flex items-center mt-1.5 font-medium">
                                            <MapPinIcon className="w-3.5 h-3.5 mr-1 text-red-400 flex-shrink-0"/> 
                                            <span className="truncate">{item.address || 'Stand Not Set'}</span>
                                        </p>
                                    </div>

                                    {/* Route Chip */}
                                    <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-100/50">
                                        <p className="text-[10px] font-bold text-teal-800 uppercase mb-1">Route Stops</p>
                                        <div className="flex items-center gap-1 overflow-hidden text-xs font-medium text-gray-600 flex-wrap">
                                            {details.routes?.slice(0, 3).map((stop, i) => (
                                                <span key={i} className="bg-white px-2 py-1 rounded border border-teal-100 shadow-sm flex items-center">
                                                    {stop}
                                                    {i < Math.min(details.routes.length, 3) - 1 && <ArrowRightIcon className="w-3 h-3 text-gray-300 ml-1"/>}
                                                </span>
                                            ))}
                                            {details.routes?.length > 3 && <span className="text-[10px] text-gray-400">+{details.routes.length - 3} more</span>}
                                        </div>
                                    </div>

                                    {/* Seats Counter */}
                                    <div className="flex justify-between items-end bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Seats Left</p>
                                            <p className={`text-2xl font-black ${isFull ? 'text-red-500' : 'text-teal-600'}`}>
                                                {details.seatsAvailable}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                                            <button onClick={() => updateSeatCount(item._id, details.seatsAvailable, -1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 font-bold transition">-</button>
                                            <div className="w-[1px] h-4 bg-gray-200"></div>
                                            <button onClick={() => updateSeatCount(item._id, details.seatsAvailable, 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 font-bold transition">+</button>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-100"></div>

                                    {/* Footer Actions */}
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900 text-sm flex flex-col">
                                            <span>₹{item.plans?.[0]?.price || 'N/A'}<span className="text-xs font-normal text-gray-400">/mo</span></span>
                                        </span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(item._id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100" title="Edit">
                                                <PencilSquareIcon className="w-4 h-4"/>
                                            </button>
                                            <button onClick={() => handleDelete(item._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100" title="Delete">
                                                <TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
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
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-all cursor-default"
    >
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 mr-4 shadow-sm`}><Icon className="w-6 h-6"/></div>
        <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{value}</h3>
        </div>
    </motion.div>
);

export default TransportDashboard;