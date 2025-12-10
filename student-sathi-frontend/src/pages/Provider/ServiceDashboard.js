import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, PencilSquareIcon, TrashIcon, 
  BookOpenIcon, PrinterIcon, AcademicCapIcon, 
  ChartBarIcon, CheckBadgeIcon, XCircleIcon, 
  CurrencyRupeeIcon, UserGroupIcon, CakeIcon,
  MapPinIcon, FireIcon, SparklesIcon
} from '@heroicons/react/24/solid';

const ServiceDashboard = ({ user, category }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services/my-services');
      if (res.success) setServices(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const toggleStatus = async (id, currentStatus) => {
      try {
          setServices(prev => prev.map(s => s._id === id ? { ...s, isActive: !currentStatus } : s));
          await api.put(`/services/${id}`, { isActive: !currentStatus });
      } catch(e) { alert("Failed"); }
  };

  const handleManage = () => navigate('/provider/manage-service');
  const handleEdit = (id) => navigate(`/provider/edit-resource/${id}`);
  
  const handleDelete = async (id) => {
      if(!window.confirm("Delete Service?")) return;
      try { await api.delete(`/services/${id}`); setServices(prev => prev.filter(s => s._id !== id)); } 
      catch(e) { alert("Failed"); }
  };

  const handleAdd = () => {
      navigate('/provider/add-resource'); // Note: Fixed Path to AddResource
  };

  const getIcon = () => {
      if(category === 'Library') return BookOpenIcon;
      if(category === 'Mess') return CakeIcon;
      if(category === 'Stationery') return PrinterIcon;
      if(category === 'Coaching') return AcademicCapIcon;
      return BookOpenIcon;
  };
  const MainIcon = getIcon();

  if (loading) return <Loader text="Loading Dashboard..." />;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans relative overflow-x-hidden">
        
        {/* Animated Background */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/5 to-transparent -z-10"></div>

        <div className="max-w-6xl mx-auto p-6 space-y-8">
            
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={MainIcon} color="text-indigo-600 bg-indigo-50" title="Total Centers" value={services.length} delay={0.1} />
                <StatCard icon={ChartBarIcon} color="text-purple-600 bg-purple-50" title="Total Views" value={services.reduce((a,b)=>a+(b.views||0),0)} delay={0.2} />
                {category === 'Mess' && <StatCard icon={CurrencyRupeeIcon} color="text-green-600 bg-green-50" title="Monthly Plan" value="₹2500+" delay={0.3} />}
                {category === 'Library' && <StatCard icon={UserGroupIcon} color="text-green-600 bg-green-50" title="Total Seats" value={services.reduce((a,b)=>a+(b.libraryDetails?.totalSeats||0),0)} delay={0.3} />}
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-extrabold text-gray-800 flex items-center tracking-tight">
                    <SparklesIcon className="w-6 h-6 text-yellow-500 mr-2" /> Your {category} Centers
                </h3>
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAdd} 
                    className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-gray-900 transition-all"
                >
                    <PlusIcon className="w-5 h-5 mr-2" /> Add New
                </motion.button>
            </div>

            {/* Listings Grid */}
            {services.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200"
                >
                    <MainIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400 font-medium">No services listed yet.</p>
                    <button onClick={handleAdd} className="text-indigo-600 font-bold hover:underline mt-2">+ List Your First Service</button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                    {services.map((item, i) => (
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
                                    src={item.images?.[0] || "https://via.placeholder.com/400"} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                                
                                <button 
                                    onClick={() => toggleStatus(item._id, item.isActive)}
                                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1 backdrop-blur-md transition-all ${item.isActive ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
                                >
                                    {item.isActive ? <><CheckBadgeIcon className="w-3 h-3"/> OPEN</> : <><XCircleIcon className="w-3 h-3"/> CLOSED</>}
                                </button>

                                <div className="absolute bottom-3 left-4 text-white">
                                    <h4 className="font-bold text-lg truncate drop-shadow-md">{item.name}</h4>
                                    <p className="text-xs flex items-center opacity-90 mt-0.5">
                                        <MapPinIcon className="w-3 h-3 mr-1"/> {item.address}
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                {category === 'Mess' && (
                                    <div className="bg-orange-50 p-3 rounded-xl mb-4 border border-orange-100 flex items-start gap-3">
                                        <div className="bg-orange-100 p-1.5 rounded-lg"><FireIcon className="w-4 h-4 text-orange-600"/></div>
                                        <div>
                                            <p className="text-[10px] text-orange-600 font-bold uppercase">Today's Special</p>
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.messDetails?.specialMenu || 'Not Updated'}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <button onClick={handleManage} className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition shadow-md">
                                        Manage Daily ⚡
                                    </button>
                                    <button onClick={() => handleEdit(item._id)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 border border-indigo-100 transition">
                                        <PencilSquareIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={() => handleDelete(item._id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border border-red-100 transition">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            )}
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

export default ServiceDashboard;