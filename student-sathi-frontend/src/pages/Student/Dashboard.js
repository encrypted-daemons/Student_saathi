import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeModernIcon, UserGroupIcon, BuildingStorefrontIcon, 
  BookOpenIcon, SparklesIcon, MapIcon, MagnifyingGlassIcon,
  CalendarIcon, ShoppingBagIcon, XMarkIcon, FireIcon, TruckIcon,
  SunIcon, CloudIcon, ChevronRightIcon
} from '@heroicons/react/24/solid';

import eventService from '../../services/eventService';
import marketplaceService from '../../services/marketplaceService';
import searchService from '../../services/searchService';
import Loader from '../../components/common/Loader';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({ eventsCount: 0, itemsSelling: 0 });
  const [trendingEvents, setTrendingEvents] = useState([]);
  
  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [weather, setWeather] = useState({ temp: '--', condition: 'Loading...' });

  useEffect(() => {
    // ✅ CRITICAL FIX: Wait for user to load before fetching data
    if (!user) return;

    const fetchData = async () => {
      try {
        // 1. Events
        const eventRes = await eventService.getAll({ limit: 5 });
        if (eventRes.success) {
            setTrendingEvents(eventRes.data);
            setStats(prev => ({ ...prev, eventsCount: eventRes.data.length }));
        }
        
        // 2. Market Items (Safe User ID access)
        const marketRes = await marketplaceService.getItems({ seller: user._id }); 
        if (marketRes.success) {
            setStats(prev => ({ ...prev, itemsSelling: marketRes.data.length }));
        }
      } catch (error) { console.error("Data Error:", error); } 
      finally { setLoading(false); }
    };

    fetchData();

    // Weather (Indore Default)
    fetch('https://api.open-meteo.com/v1/forecast?latitude=22.7196&longitude=75.8577&current_weather=true')
      .then(res => res.json())
      .then(data => setWeather({ temp: Math.round(data.current_weather.temperature), condition: 'Clear Sky' }))
      .catch(() => setWeather({ temp: 28, condition: 'Sunny' }));

  }, [user]); // ✅ Dependency fixed

  // Live Search Logic
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const res = await searchService.query(query);
          if (res.success) setResults(res.data);
        } catch (e) { console.error("Search failed", e); }
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleResultClick = (item) => {
      navigate(item.link); 
      setQuery('');
      setResults([]);
  };
  
  const features = [
    { title: 'Find Room', desc: 'No Broker', icon: HomeModernIcon, color: 'bg-blue-500', path: '/student/find-room' },
    { title: 'Roommate', desc: 'Vibe Check', icon: UserGroupIcon, color: 'bg-purple-500', path: '/student/find-roommate' },
    { title: 'Mess & Food', desc: 'Tiffin Service', icon: BuildingStorefrontIcon, color: 'bg-orange-500', path: '/student/find-mess' },
    { title: 'Transport', desc: 'Auto/Van', icon: TruckIcon, color: 'bg-teal-500', path: '/student/find-transport' },
    { title: 'City Wiki', desc: 'Guide & Info', icon: MapIcon, color: 'bg-green-500', path: '/student/wiki' },
    { title: 'Bazaar', desc: 'Buy/Sell', icon: BookOpenIcon, color: 'bg-pink-500', path: '/student/marketplace' },
    { title: 'Chill Zone', desc: 'Events', icon: SparklesIcon, color: 'bg-yellow-500', path: '/student/events' },
  ];

  // Show loader only if initial loading AND user is not yet ready
  if (loading && !user) return <Loader text="Loading Campus..." />;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-10 font-sans overflow-x-hidden relative">
      
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50 via-white to-transparent -z-10"></div>

      {/* Header Area */}
      <div className="px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                Hey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{user?.name?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-gray-500 font-medium mt-1">Ready to explore your campus?</p>
        </motion.div>
      </div>

      <div className="px-6 space-y-8 max-w-6xl mx-auto">

        {/* 1. HERO SEARCH (Fixed Z-Index & UI) */}
        <div className="relative z-30"> 
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
            
            <div className="relative bg-white rounded-2xl flex items-center p-2 shadow-lg border border-gray-100">
                <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                    <MagnifyingGlassIcon className="w-6 h-6" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search 'Hostel', 'Auto', 'Mess', 'Books'..." 
                  className="flex-1 bg-transparent outline-none text-gray-800 px-4 placeholder-gray-400 text-base h-12 font-medium"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                    <button onClick={() => {setQuery(''); setResults([]);}} className="p-3 text-gray-400 hover:text-red-500 transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Search Dropdown */}
            <AnimatePresence>
                {query.length >= 2 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 mt-2"
                    >
                        {isSearching ? (
                            <div className="p-6 text-center text-gray-400 text-sm font-medium flex flex-col items-center">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
                                Searching...
                            </div>
                        ) : results.length > 0 ? (
                            <ul className="py-2 max-h-80 overflow-y-auto custom-scrollbar">
                                {results.map((item, idx) => (
                                    <li 
                                        key={idx} 
                                        onClick={() => handleResultClick(item)} 
                                        className="px-5 py-3.5 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-none flex justify-between items-center group transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-white transition-colors text-gray-500">
                                                {item.type === 'Room' ? <HomeModernIcon className="w-5 h-5"/> : 
                                                 item.type === 'Transport' ? <TruckIcon className="w-5 h-5"/> :
                                                 <MagnifyingGlassIcon className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-800 group-hover:text-indigo-700">{item.title}</p>
                                                <p className="text-[10px] text-gray-500">{item.subtitle}</p>
                                            </div>
                                        </div>
                                        <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-indigo-500"/>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                No results found for "{query}" 🐢
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>

        {/* 2. BENTO GRID STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Weather Card */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-[2rem] p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden flex justify-between items-center group">
                <div className="z-10">
                    <div className="flex items-center gap-2 mb-1"><SunIcon className="w-5 h-5 text-yellow-300"/> <span className="text-sm font-medium opacity-90">Indore</span></div>
                    <h2 className="text-5xl font-black">{weather.temp}°</h2>
                    <p className="text-xs opacity-80 font-medium mt-1">{weather.condition}</p>
                </div>
                <CloudIcon className="w-24 h-24 text-white opacity-20 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-110 transition-transform duration-700" />
            </motion.div>
            
            {/* Quick Stats */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <StatButton 
                    icon={CalendarIcon} color="bg-yellow-100 text-yellow-600" 
                    count={stats.eventsCount} label="Events Active" 
                    onClick={() => navigate('/student/events')}
                />
                <StatButton 
                    icon={ShoppingBagIcon} color="bg-pink-100 text-pink-600" 
                    count={stats.itemsSelling} label="Items Selling" 
                    onClick={() => navigate('/student/marketplace')}
                />
            </div>
        </div>

        {/* 3. EXPLORE GRID */}
        <div>
            <h3 className="text-lg font-extrabold text-gray-800 mb-5 flex items-center">
              <span className="bg-indigo-100 p-1.5 rounded-lg mr-3">⚡</span> Explore Campus
            </h3>
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
                {features.map((feature, idx) => (
                <motion.div 
                    key={idx} 
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(feature.path)}
                    className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 cursor-pointer relative overflow-hidden group hover:shadow-md transition-all"
                >
                    <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-3 shadow-md transform group-hover:rotate-6 transition-transform`}>
                        <feature.icon className="w-6 h-6" /> 
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm">{feature.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold uppercase">{feature.desc}</p>
                </motion.div>
                ))}
            </motion.div>
        </div>

        {/* 4. TRENDING EVENTS */}
        <div className="pb-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-extrabold text-gray-800 flex items-center">
                <FireIcon className="w-5 h-5 text-orange-500 mr-2" /> Trending Now
            </h3>
            <button onClick={() => navigate('/student/events')} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">View All</button>
          </div>
          
          {trendingEvents.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                 <div className="text-4xl mb-2 opacity-50">🐢</div>
                 <p className="text-gray-400 text-sm font-medium">City is quiet today.</p>
             </div>
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar snap-x px-1">
                {trendingEvents.map((event) => (
                <motion.div 
                    key={event._id} 
                    whileHover={{ scale: 1.02 }} 
                    onClick={() => navigate('/student/events')} 
                    className="min-w-[260px] bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 snap-center cursor-pointer hover:shadow-xl transition-all group"
                >
                    <div className="h-36 bg-gray-800 relative overflow-hidden">
                        <img src={event.image || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500"} alt={event.title} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
                        <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-bold border border-white/30 uppercase">{event.category}</span>
                    </div>
                    <div className="p-4">
                        <h4 className="font-bold text-gray-900 truncate text-sm">{event.title}</h4>
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-500 font-medium flex items-center"><CalendarIcon className="w-3 h-3 mr-1 text-gray-400"/> {new Date(event.date).toLocaleDateString()}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${event.isFree ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{event.isFree ? 'FREE' : `₹${event.entryFee}`}</span>
                        </div>
                    </div>
                </motion.div>
                ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Helper for Stats
const StatButton = ({ icon: Icon, color, count, label, onClick }) => (
    <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick} 
        className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center items-center cursor-pointer hover:shadow-md transition-all"
    >
        <div className={`${color} p-3 rounded-2xl mb-2 shadow-sm`}><Icon className="w-6 h-6"/></div>
        <h3 className="text-3xl font-black text-gray-900">{count}</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
    </motion.div>
);

// Helper for Loader
const Loader2 = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default Dashboard;