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

const ResourceDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  
  const providerData = user?.providerDetails || user?.details || {};
  const category = providerData.category || 'Library';
  const businessName = providerData.businessName || user?.name;

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services/my-services');
      if (res.success) setServices(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const updateSeats = async (id, current, total, change) => {
      const newSeats = Math.min(total, Math.max(0, current + change));
      setServices(prev => prev.map(s => s._id === id ? { ...s, libraryDetails: { ...s.libraryDetails, availableSeats: newSeats } } : s));
      try { await api.put(`/services/${id}`, { details: { availableSeats: newSeats } }); } catch(e) {}
  };

  const toggleStatus = async (id, currentStatus) => {
      try {
          setServices(prev => prev.map(s => s._id === id ? { ...s, isActive: !currentStatus } : s));
          await api.put(`/services/${id}`, { isActive: !currentStatus });
      } catch(e) { alert("Failed"); }
  };
  
  const handleEdit = (id) => navigate(`/provider/edit-resource/${id}`);

  const handleDelete = async (id) => {
      if(!window.confirm("Delete Service?")) return;
      try { await api.delete(`/services/${id}`); setServices(prev => prev.filter(s => s._id !== id)); } 
      catch(e) { alert("Failed"); }
  };
  
  const handleAdd = () => {
      navigate('/provider/add-resource');
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
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans relative overflow-x-hidden">
      
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-indigo-900/10 to-transparent -z-10"></div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 py-4 sticky top-0 z-30 flex justify-between items-center shadow-sm transition-all">
        <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
               {businessName} 
               <span className="ml-2 text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-indigo-100">
                 {category} Partner
               </span>
            </h1>
        </div>
        <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd} 
            className="bg-black text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center shadow-lg hover:bg-gray-800 transition-all"
        >
            <PlusIcon className="w-4 h-4 mr-2" /> Add Branch
        </motion.button>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon={MainIcon} color="text-indigo-600 bg-indigo-50" title="Total Centers" value={services.length} delay={0.1} />
            <StatCard icon={ChartBarIcon} color="text-purple-600 bg-purple-50" title="Total Views" value={services.reduce((a,b)=>a+(b.views||0),0)} delay={0.2} />
            
            {/* Dynamic 3rd Stat */}
            {category === 'Library' && <StatCard icon={UserGroupIcon} color="text-green-600 bg-green-50" title="Total Seats" value={services.reduce((a,b)=>a+(b.libraryDetails?.totalSeats||0),0)} delay={0.3} />}
            {category === 'Stationery' && <StatCard icon={CurrencyRupeeIcon} color="text-green-600 bg-green-50" title="Print Rate" value="₹1 - ₹5" delay={0.3} />}
            {category === 'Coaching' && <StatCard icon={CheckBadgeIcon} color="text-green-600 bg-green-50" title="Active Batches" value="Live" delay={0.3} />}
            {category === 'Mess' && <StatCard icon={CakeIcon} color="text-orange-600 bg-orange-50" title="Meal Plans" value="Active" delay={0.3} />}
        </div>

        {/* Listings */}
        <div>
            <h3 className="text-lg font-extrabold text-gray-800 mb-5 flex items-center">
              <SparklesIcon className="w-5 h-5 text-yellow-500 mr-2" /> Manage {category}
            </h3>

            {services.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200"
                >
                    <MainIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-400 font-medium">No services listed.</p>
                    <button onClick={handleAdd} className="text-indigo-600 font-bold hover:underline mt-2">+ Add Now</button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                    {services.map((item, i) => (
                        <motion.div 
                            key={item._id} 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            layout
                            whileHover={{ y: -5 }} 
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                        >
                            
                            {/* Header Image */}
                            <div className="h-32 bg-gray-100 relative overflow-hidden">
                                <img 
                                    src={item.images?.[0] || "https://via.placeholder.com/400"} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <button 
                                    onClick={() => toggleStatus(item._id, item.isActive)}
                                    className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1 backdrop-blur-md transition-all ${item.isActive ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
                                >
                                    {item.isActive ? 'OPEN' : 'CLOSED'}
                                </button>
                                <h4 className="absolute bottom-3 left-4 font-bold text-white text-lg truncate w-3/4 drop-shadow-md">{item.name}</h4>
                            </div>

                            <div className="p-5 space-y-4">
                                {/* LIBRARY UI */}
                                {category === 'Library' && (
                                    <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                                        <p className="text-[10px] font-bold text-blue-500 uppercase mb-2">Seats Available</p>
                                        <div className="flex items-center justify-center gap-4">
                                            <button onClick={() => updateSeats(item._id, item.libraryDetails.availableSeats, item.libraryDetails.totalSeats, -1)} className="w-8 h-8 rounded-full bg-white shadow text-gray-600 font-bold hover:bg-gray-50">-</button>
                                            <div className="text-2xl font-black text-gray-800">
                                                {item.libraryDetails?.availableSeats}
                                                <span className="text-xs text-gray-400 font-medium ml-1">/ {item.libraryDetails?.totalSeats}</span>
                                            </div>
                                            <button onClick={() => updateSeats(item._id, item.libraryDetails.availableSeats, item.libraryDetails.totalSeats, 1)} className="w-8 h-8 rounded-full bg-white shadow text-gray-600 font-bold hover:bg-gray-50">+</button>
                                        </div>
                                    </div>
                                )}

                                {/* STATIONERY UI */}
                                {category === 'Stationery' && (
                                    <div className="flex justify-between items-center bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                                        <span className="text-xs font-bold text-yellow-800 uppercase">Print Rate</span>
                                        <span className="font-black text-lg text-gray-800">₹{item.stationeryDetails?.printingRate}<span className="text-xs font-normal text-gray-500">/page</span></span>
                                    </div>
                                )}

                                {/* COACHING UI */}
                                {category === 'Coaching' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center bg-purple-50 p-2 rounded-lg border border-purple-100">
                                            <span className="text-xs font-bold text-purple-800">Demo Class</span>
                                            <span className={`text-xs font-bold ${item.coachingDetails?.isDemoAvailable ? 'text-green-600' : 'text-red-500'}`}>
                                                {item.coachingDetails?.isDemoAvailable ? 'Available ✅' : 'Not Available ❌'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {item.coachingDetails?.exams?.slice(0, 3).map((ex, i) => (
                                                <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{ex}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* MESS UI */}
                                {category === 'Mess' && (
                                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-start gap-3">
                                        <div className="bg-orange-100 p-1.5 rounded-lg"><FireIcon className="w-4 h-4 text-orange-600"/></div>
                                        <div>
                                            <p className="text-[10px] text-orange-600 font-bold uppercase">Today's Special</p>
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.messDetails?.specialMenu || 'Not Updated'}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2 border-t border-gray-100">
                                    <button onClick={handleManage} className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black flex items-center justify-center shadow-md transition-all">
                                        Manage Daily ⚡
                                    </button>
                                    <button onClick={() => handleEdit(item._id)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 border border-indigo-100 transition-colors">
                                        <PencilSquareIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={() => handleDelete(item._id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border border-red-100 transition-colors">
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
    </div>
  );
};

const StatCard = ({ icon: Icon, color, title, value, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow cursor-default"
    >
        <div className={`p-3.5 rounded-2xl ${color} bg-opacity-10 mr-4 shadow-sm`}><Icon className="w-6 h-6"/></div>
        <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-black text-gray-900 mt-0.5">{value}</h3>
        </div>
    </motion.div>
);

export default ResourceDashboard;