import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roommateService from '../../services/roommateService';
import RoommateCard from '../../components/cards/RoommateCard';
import PostRoommateAd from '../../components/forms/PostRoommateAd';
import Loader from '../../components/common/Loader';
import { 
    UserGroupIcon, PlusIcon, FunnelIcon, XMarkIcon 
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const FindRoommate = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('browse'); // browse | post
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({ gender: '', diet: '', college: '' });

  useEffect(() => {
    fetchMatches();
  }, [filters]); 

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await roommateService.findMatches(filters);
      if (res.success) setMatches(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleFilterToggle = (key, value) => {
      setFilters(prev => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  };

  const handleConnect = (profile) => {
      // Real app mein ye chat route par le jayega
      alert(`Connecting with ${profile.name}...`);
  };

  const handleCardClick = (id) => {
       navigate(`/student/roommate/${id}`); 
  };

  if (loading) return <Loader text="Finding your squad..." />;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans">
      
      {/* Sticky Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="bg-purple-100 p-2 rounded-xl">
                 <UserGroupIcon className="w-6 h-6 text-purple-600" />
               </div>
               <div>
                   <h1 className="text-xl font-black text-gray-900 leading-tight">Roommate Match</h1>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Find your vibe</p>
               </div>
            </div>

            <button 
               onClick={() => setViewMode(viewMode === 'browse' ? 'post' : 'browse')}
               className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm shadow-md flex items-center gap-2 transition-transform active:scale-95 ${viewMode === 'browse' ? 'bg-black text-white hover:bg-gray-900' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
               {viewMode === 'browse' ? <><PlusIcon className="w-4 h-4"/> Post Ad</> : <><XMarkIcon className="w-4 h-4"/> Cancel</>}
            </button>
        </div>

        {/* Filters Bar (Only in Browse Mode) */}
        <AnimatePresence>
            {viewMode === 'browse' && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="max-w-6xl mx-auto mt-3 overflow-hidden"
                >
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                        <button onClick={() => setShowFilters(!showFilters)} className={`p-2 border rounded-lg transition-colors ${showFilters ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white text-gray-500 border-gray-200'}`}>
                            <FunnelIcon className="w-5 h-5"/>
                        </button>
                        <FilterChip label="Boys Only 👨" active={filters.gender === 'Male'} onClick={() => handleFilterToggle('gender', 'Male')} />
                        <FilterChip label="Girls Only 👩" active={filters.gender === 'Female'} onClick={() => handleFilterToggle('gender', 'Female')} />
                        <FilterChip label="Veg Only 🥬" active={filters.diet === 'Veg'} onClick={() => handleFilterToggle('diet', 'Veg')} />
                        <FilterChip label="Same College 🎓" active={filters.college === 'true'} onClick={() => handleFilterToggle('college', 'true')} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <AnimatePresence mode='wait'>
            {viewMode === 'post' ? (
                <motion.div 
                    key="post"
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    exit={{ y: -20, opacity: 0 }}
                >
                    <PostRoommateAd onComplete={() => { setViewMode('browse'); fetchMatches(); }} />
                </motion.div>
            ) : (
                <motion.div 
                    key="browse"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                >
                    {matches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 mt-6">
                            <div className="text-6xl mb-4 opacity-50">👻</div>
                            <h3 className="text-lg font-bold text-gray-700">No matches found</h3>
                            <p className="text-gray-500 text-sm mt-1">Try changing your filters or post your own ad.</p>
                            <button onClick={() => setFilters({ gender: '', diet: '', college: '' })} className="mt-4 text-purple-600 font-bold hover:underline text-sm">Clear Filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                            {matches.map((match) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={match._id} 
                                    onClick={() => handleCardClick(match._id)}
                                    className="cursor-pointer"
                                >
                                    <RoommateCard match={match} onChat={() => handleConnect(match.userProfile)} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FilterChip = ({ label, active, onClick }) => (
    <button 
        onClick={onClick} 
        className={`px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap transition-all shadow-sm flex items-center ${
            active 
            ? 'bg-purple-600 text-white border-purple-600 shadow-purple-200' 
            : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
        }`}
    >
        {label}
    </button>
);

export default FindRoommate;