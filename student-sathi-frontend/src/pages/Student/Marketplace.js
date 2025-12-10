import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import marketplaceService from '../../services/marketplaceService';
import MarketplaceCard from '../../components/cards/MarketplaceCard';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBagIcon, CurrencyRupeeIcon, MapPinIcon, TagIcon, PhotoIcon, MagnifyingGlassIcon,
  ArchiveBoxIcon, CheckCircleIcon, ChevronDownIcon
} from '@heroicons/react/24/solid';

// --- REUSABLE CUSTOM SELECT ---
const CustomSelect = ({ name, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl text-left text-gray-700 font-medium focus:ring-2 focus:ring-pink-500 transition-all h-[50px]"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fade-in-down">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-pink-50 transition-colors border-b last:border-0 border-gray-50 ${value === option.value ? 'bg-pink-50 text-pink-700 font-bold' : 'text-gray-600'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Marketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('buy'); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sell Form State
  const [sellForm, setSellForm] = useState({
    title: '', description: '', price: '', category: 'Books', 
    condition: 'Good', image: '', address: '', lat: '', lng: ''
  });

  useEffect(() => {
    fetchItems();
  }, [activeTab, filter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let query = { category: filter };
      if (activeTab === 'my_ads') {
          query = { seller: user._id };
      }
      const res = await marketplaceService.getItems(query);
      if (res.success) setItems(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleMarkSold = async (id) => {
      if(!window.confirm("Did you sell this item? It will be hidden.")) return;
      try {
          await marketplaceService.markSold(id);
          fetchItems(); 
          alert("Congrats on the sale! 🎉");
      } catch(e) { alert("Action Failed"); }
  };

  const filteredItems = items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    try {
      if(!sellForm.lat) { alert("Please click 'Detect Location'"); return; }

      const payload = { ...sellForm, images: [sellForm.image] }; 
      const res = await marketplaceService.sellItem(payload);
      if (res.success) {
        alert('Item Listed Successfully! 🚀');
        setSellForm({ title: '', description: '', price: '', category: 'Books', condition: 'Good', image: '', address: '', lat: '', lng: '' });
        setActiveTab('my_ads');
      }
    } catch (error) { alert('Failed to list item'); }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setSellForm(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        alert("Location Captured!");
      });
    } else alert("Geo not supported");
  };

  const handleFormChange = (e) => {
      setSellForm(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  // --- OPTIONS ---
  const categoryOptions = [
      { value: 'Books', label: '📚 Books' },
      { value: 'Electronics', label: '📱 Electronics' },
      { value: 'Furniture', label: '🪑 Furniture' },
      { value: 'Stationery', label: '🖊️ Stationery' },
      { value: 'Vehicles', label: '🚲 Vehicles' },
      { value: 'Other', label: '📦 Other' }
  ];

  const conditionOptions = [
      { value: 'Good', label: 'Good Condition' },
      { value: 'Like New', label: 'Like New ✨' },
      { value: 'Fair', label: 'Fair / Used' }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans relative">
      
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-pink-50 to-transparent pointer-events-none"></div>

      <div className="max-w-6xl mx-auto p-4 relative z-10">
        
        {/* 1. HEADER & TABS */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 mt-4 gap-4">
          <div className="text-center md:text-left">
             <h1 className="text-3xl font-black text-gray-900 flex items-center justify-center md:justify-start tracking-tight">
                <span className="bg-pink-100 p-2 rounded-xl mr-3 text-pink-600"><ShoppingBagIcon className="w-8 h-8" /></span>
                Student Bazaar
             </h1>
          </div>

          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 flex">
             {['buy', 'sell', 'my_ads'].map((tab) => (
                 <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                        activeTab === tab ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                 >
                   {tab === 'buy' ? 'Buy Items' : tab === 'sell' ? 'Sell Now' : 'My Ads'}
                 </button>
             ))}
          </div>
        </div>

        {/* 2. MAIN CONTENT */}
        <AnimatePresence mode='wait'>
            
            {/* === BUY & MY ADS MODE === */}
            {(activeTab === 'buy' || activeTab === 'my_ads') && (
                <motion.div 
                    key="list"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                >
                    {/* Search & Filters */}
                    <div className="mb-6 space-y-4">
                        <div className="relative">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400"/>
                            <input 
                                placeholder={activeTab === 'buy' ? "Search books, cooler, notes..." : "Search in your ads..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-100 outline-none"
                            />
                        </div>
                        
                        {activeTab === 'buy' && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {['', 'Books', 'Electronics', 'Furniture', 'Stationery', 'Vehicles'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilter(cat)}
                                        className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all active:scale-95 ${
                                            filter === cat ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200'
                                        }`}
                                    >
                                        {cat || '🔥 All'}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {loading ? <Loader text="Loading Bazaar..." /> : (
                        filteredItems.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <ArchiveBoxIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">
                                    {activeTab === 'buy' ? "No items found." : "You haven't listed anything yet."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredItems.map((item) => (
                                    <div key={item._id} className="relative group">
                                        <MarketplaceCard 
                                            item={item} 
                                            onContact={() => navigate(`/student/marketplace/${item._id}`)} 
                                        />
                                        
                                        {/* MY ADS CONTROLS */}
                                        {activeTab === 'my_ads' && (
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleMarkSold(item._id); }}
                                                    className="bg-green-500 text-white p-1.5 rounded-lg shadow-md hover:bg-green-600 text-xs font-bold flex items-center gap-1"
                                                    title="Mark as Sold"
                                                >
                                                    <CheckCircleIcon className="w-4 h-4" /> Sold?
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </motion.div>
            )}

            {/* === SELL MODE (Form) === */}
            {activeTab === 'sell' && (
                <motion.div 
                    key="sell"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden"
                >
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 to-purple-600"></div>
                      <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center"><TagIcon className="w-6 h-6 mr-2 text-pink-500"/> Sell Item</h3>
                      
                      <form onSubmit={handleSellSubmit} className="space-y-5">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input required placeholder="Title (e.g. RD Sharma)" name="title" value={sellForm.title} className="p-3 bg-gray-50 rounded-xl border outline-none font-bold" onChange={handleFormChange} />
                            
                            {/* Custom Category Select */}
                            <CustomSelect 
                                name="category" 
                                value={sellForm.category} 
                                onChange={handleFormChange} 
                                options={categoryOptions} 
                                placeholder="Select Category"
                            />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <CurrencyRupeeIcon className="w-5 h-5 absolute top-3.5 left-3 text-green-600" />
                                <input required type="number" name="price" value={sellForm.price} placeholder="Price" className="w-full pl-10 p-3 bg-gray-50 rounded-xl border outline-none font-bold text-green-700" onChange={handleFormChange} />
                            </div>
                            
                            {/* Custom Condition Select */}
                            <CustomSelect 
                                name="condition" 
                                value={sellForm.condition} 
                                onChange={handleFormChange} 
                                options={conditionOptions} 
                                placeholder="Condition"
                            />
                         </div>

                         <div className="flex gap-2">
                            <input required name="image" value={sellForm.image} placeholder="Image URL" className="flex-1 p-3 bg-gray-50 rounded-xl border outline-none text-sm" onChange={handleFormChange} />
                            <div className="p-3 bg-gray-100 rounded-xl"><PhotoIcon className="w-6 h-6 text-gray-400"/></div>
                         </div>
                         
                         <div className="flex gap-2">
                            <input name="address" value={sellForm.address} placeholder="Pickup Location" className="flex-1 p-3 bg-gray-50 rounded-xl border outline-none" onChange={handleFormChange} />
                            <button type="button" onClick={getCurrentLocation} className={`p-3 rounded-xl border-2 border-dashed ${sellForm.lat ? 'border-green-500 bg-green-50 text-green-600' : 'border-pink-300 text-pink-500'}`}>
                                {sellForm.lat ? '📍' : <MapPinIcon className="w-6 h-6" />}
                            </button>
                         </div>

                         <textarea required name="description" value={sellForm.description} placeholder="Description..." rows="3" className="w-full p-3 bg-gray-50 rounded-xl border outline-none resize-none" onChange={handleFormChange}></textarea>

                         <button className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-black transition-all active:scale-95">
                            List for Sale 🚀
                         </button>
                      </form>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Marketplace;