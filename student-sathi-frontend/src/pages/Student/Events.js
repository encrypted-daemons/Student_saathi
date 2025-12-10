import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import eventService from '../../services/eventService';
import EventCard from '../../components/cards/EventCard';
import Loader from '../../components/common/Loader';
import { 
  PlusIcon, MapPinIcon, XMarkIcon, SparklesIcon, 
  CalendarIcon, ClockIcon, FireIcon, ArrowRightIcon
} from '@heroicons/react/24/solid';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '', category: 'Bhandara', description: '', 
    date: new Date().toISOString().split('T')[0], time: '',
    venue: '', lat: '', lng: ''
  });

  useEffect(() => { fetchEvents(); }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getAll({ category: filter });
      if (res.success) setEvents(res.data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleJoin = async (id) => { try { await eventService.join(id); fetchEvents(); } catch(e) {} };
  const handleStatusUpdate = async (id, status) => { try { await eventService.updateStatus(id, status); fetchEvents(); } catch(e) {} };

  const getLocation = () => {
      if(navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
              setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
              alert("📍 Location Locked!");
          });
      } else alert("Geo not supported");
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      if(!formData.lat) { alert("Please attach location"); return; }
      try {
          const res = await eventService.create(formData);
          if(res.success) {
              alert("Buzz Created! 🔥");
              setShowModal(false);
              fetchEvents();
          }
      } catch(e) { alert("Failed"); }
  };

  const categories = [
      { name: 'All', emoji: '🔥' },
      { name: 'Bhandara', emoji: '🍲' },
      { name: 'Concert', emoji: '🎵' },
      { name: 'College Fest', emoji: '🎉' },
      { name: 'Sports', emoji: '🏏' },
      { name: 'Meetup', emoji: '🤝' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans relative">
      
      {/* 1. Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3 border-b border-gray-200 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
              <SparklesIcon className="w-6 h-6 text-yellow-500 mr-2" /> Chill Zone
          </h1>
      </div>

      {/* 2. Filters */}
      <div className="pt-4 px-4 flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((cat) => (
              <div key={cat.name} className="flex flex-col items-center gap-1 cursor-pointer min-w-[60px]" onClick={() => setFilter(cat.name === 'All' ? '' : cat.name)}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${filter === cat.name || (filter === '' && cat.name === 'All') ? 'border-purple-500 bg-purple-50 scale-110' : 'border-gray-200 bg-white'}`}>
                      {cat.emoji}
                  </div>
                  <span className="text-[10px] font-bold text-gray-600">{cat.name}</span>
              </div>
          ))}
      </div>

      {/* 3. Feed */}
      <div className="max-w-xl mx-auto p-4 mt-2">
         {loading ? <Loader text="Loading Buzz..." /> : (
             <div className="space-y-6">
                 {events.length === 0 ? (
                     <div className="text-center py-20 text-gray-400 bg-white rounded-3xl border-2 border-dashed">
                        <div className="text-6xl mb-2 opacity-50">🐢</div>
                        <p>No events right now.</p>
                     </div>
                 ) : (
                    events.map(event => (
                        <EventCard key={event._id} event={event} onJoin={handleJoin} onUpdateStatus={handleStatusUpdate} />
                    ))
                 )}
             </div>
         )}
      </div>

      {/* Floating Post Button */}
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-32 md:bottom-10 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform"
      >
          <PlusIcon className="w-8 h-8" />
      </motion.button>

      {/* --- 🔥 FULL SCREEN "STORY MODE" OVERLAY --- */}
      <AnimatePresence>
        {showModal && (
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                // ✅ FIX: Full height dynamic viewport (100dvh) solves mobile browser bar issue
                className="fixed inset-0 z-[200] bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white h-[100dvh] flex flex-col"
            >
                {/* Header */}
                <div className="p-6 flex justify-between items-center">
                    <button onClick={() => setShowModal(false)} className="bg-white/10 p-3 rounded-full backdrop-blur-md hover:bg-white/20">
                        <XMarkIcon className="w-6 h-6 text-white"/>
                    </button>
                    <span className="text-sm font-bold tracking-widest uppercase opacity-70">New Buzz</span>
                    <div className="w-10"></div>
                </div>
                
                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Title Input (Huge) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">What's Happening?</label>
                        <input 
                            required 
                            placeholder="Ex: Late Night Maggi Party" 
                            className="w-full bg-transparent border-b-2 border-white/20 text-3xl font-black text-white placeholder-white/30 py-2 outline-none focus:border-purple-400 transition-all"
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    {/* Categories (Neon Pills) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">Vibe Check</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {['Bhandara 🍲', 'Concert 🎵', 'Sports 🏏', 'Meetup 🤝', 'Fest 🎉'].map(c => {
                                const rawCat = c.split(' ')[0];
                                return (
                                    <button 
                                        type="button" 
                                        key={rawCat} 
                                        onClick={() => setFormData({...formData, category: rawCat})} 
                                        className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${formData.category === rawCat ? 'bg-white text-purple-900 shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                    >
                                        {c}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <label className="flex items-center text-xs font-bold text-purple-300 mb-2"><CalendarIcon className="w-4 h-4 mr-1"/> Date</label>
                            <input type="date" className="w-full bg-transparent text-white outline-none font-bold text-lg calendar-invert" onChange={e => setFormData({...formData, date: e.target.value})} />
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <label className="flex items-center text-xs font-bold text-purple-300 mb-2"><ClockIcon className="w-4 h-4 mr-1"/> Time</label>
                            <input placeholder="8:00 PM" className="w-full bg-transparent text-white outline-none font-bold text-lg placeholder-white/30" onChange={e => setFormData({...formData, time: e.target.value})} />
                        </div>
                    </div>

                    {/* Venue & Desc */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">Where?</label>
                             <div className="flex items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                                <MapPinIcon className="w-6 h-6 text-pink-400 mr-3"/>
                                <input placeholder="Location Name" className="flex-1 bg-transparent text-white outline-none font-medium placeholder-white/30" onChange={e => setFormData({...formData, venue: e.target.value})} />
                             </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">Deets</label>
                             <textarea rows="3" placeholder="Add details..." className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-white outline-none resize-none placeholder-white/30" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                        </div>
                    </div>

                    {/* Location Button */}
                    <button 
                        type="button" 
                        onClick={getLocation} 
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center transition-all border ${formData.lat ? 'bg-green-500/20 border-green-500 text-green-300' : 'border-white/20 text-white hover:bg-white/10'}`}
                    >
                        {formData.lat ? "✅ GPS Locked" : "📍 Attach GPS Location"}
                    </button>

                    <div className="h-24"></div> {/* Extra Space for scrolling */}
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-black/20 backdrop-blur-lg border-t border-white/10">
                    <button onClick={handleSubmit} className="w-full py-4 bg-white text-black rounded-2xl font-black text-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                        Post it <ArrowRightIcon className="w-6 h-6"/>
                    </button>
                </div>

            </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .calendar-invert { color-scheme: dark; }
      `}</style>
    </div>
  );
};

export default Events;