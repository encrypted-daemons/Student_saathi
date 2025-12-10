import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import roommateService from '../../services/roommateService';
import { 
  HomeIcon, UserGroupIcon, CurrencyRupeeIcon, 
  MapPinIcon, SparklesIcon, ChevronDownIcon 
} from '@heroicons/react/24/solid';

// --- REUSABLE CUSTOM SELECT ---
const CustomSelect = ({ value, onChange, options, placeholder }) => {
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
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg text-left text-sm font-medium focus:ring-2 focus:ring-purple-500 transition-all h-[42px]"
      >
        <span className="truncate text-gray-700">{selectedLabel}</span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden animate-fade-in-down">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 transition-colors border-b last:border-0 border-gray-50 ${value === option.value ? 'bg-purple-50 text-purple-700 font-bold' : 'text-gray-600'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PostRoommateAd = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    lookingFor: 'Roommate', 
    city: 'Indore',
    preferredArea: '',
    budget: { min: 2000, max: 5000 },
    preferences: {
      gender: 'Male',
      diet: 'Any',
      smoking: 'Strictly No',
      sameCollege: false
    },
    description: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrefChange = (key, value) => {
    setFormData(prev => ({
       ...prev, 
       preferences: { ...prev.preferences, [key]: value }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await roommateService.postAd(formData);
      if (res.success) {
        alert("Ad Posted! Now showing you matches... 🔍");
        onComplete(); 
      }
    } catch (error) {
      alert("Failed to post ad");
    } finally {
      setLoading(false);
    }
  };

  // UI Helpers
  const SelectionBtn = ({ label, active, onClick, icon }) => (
    <button 
      onClick={onClick}
      className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
        active ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {icon} {label}
    </button>
  );

  // Options
  const dietOptions = [
      { value: 'Any', label: 'Any Diet 🥘' },
      { value: 'Veg Only', label: 'Pure Veg 🥬' },
      { value: 'Non-Veg', label: 'Non-Veg Allowed 🍗' },
      { value: 'Jain', label: 'Jain Food Only 🥗' }
  ];

  const smokingOptions = [
      { value: 'Strictly No', label: 'Strictly No 🚭' },
      { value: 'Okay', label: 'Smoking Okay 🚬' },
      { value: 'Outside Only', label: 'Outside Only 🌳' }
  ];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">Find Your Squad 🤟</h2>
        <p className="text-gray-500 text-sm">Tell us what you are looking for.</p>
      </div>

      {/* Step 1: What & Where */}
      {step === 1 && (
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-5">
           <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">I am looking for</label>
              <div className="flex gap-3">
                 <SelectionBtn 
                    label="Roommate" 
                    icon={<UserGroupIcon className="w-4 h-4"/>}
                    active={formData.lookingFor === 'Roommate'} 
                    onClick={() => handleChange('lookingFor', 'Roommate')} 
                 />
                 <SelectionBtn 
                    label="Flatmate" 
                    icon={<HomeIcon className="w-4 h-4"/>}
                    active={formData.lookingFor === 'Flatmate'} 
                    onClick={() => handleChange('lookingFor', 'Flatmate')} 
                 />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 ml-1 italic">
                *Roommate = Same Room | Flatmate = Separate Room
              </p>
           </div>

           <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Location Preference</label>
              <div className="flex items-center bg-gray-50 rounded-xl p-3 border border-gray-200 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
                  <MapPinIcon className="w-5 h-5 text-purple-500 mr-2" />
                  <input 
                    placeholder="Area (e.g. Bhanwarkuan)" 
                    className="bg-transparent outline-none w-full font-medium text-gray-700 text-sm"
                    value={formData.preferredArea}
                    onChange={(e) => handleChange('preferredArea', e.target.value)}
                  />
              </div>
           </div>

           <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Budget Range (₹)</label>
              <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                      <input type="number" className="w-full pl-6 p-2.5 bg-gray-50 rounded-lg border border-gray-200 outline-none font-bold text-gray-700 focus:border-purple-500 transition-colors" value={formData.budget.min} onChange={(e) => setFormData({...formData, budget: {...formData.budget, min: e.target.value}})} />
                  </div>
                  <span className="text-gray-300 font-bold">-</span>
                  <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-sm">₹</span>
                      <input type="number" className="w-full pl-6 p-2.5 bg-gray-50 rounded-lg border border-gray-200 outline-none font-bold text-gray-700 focus:border-purple-500 transition-colors" value={formData.budget.max} onChange={(e) => setFormData({...formData, budget: {...formData.budget, max: e.target.value}})} />
                  </div>
              </div>
           </div>

           <button onClick={() => setStep(2)} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold mt-4 hover:bg-black transition-transform active:scale-95 shadow-lg">Next ➝</button>
        </motion.div>
      )}

      {/* Step 2: Preferences */}
      {step === 2 && (
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Gender Preference</label>
              <div className="flex gap-2">
                 {['Male', 'Female', 'Any'].map(g => (
                    <button key={g} onClick={() => handlePrefChange('gender', g)} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${formData.preferences.gender === g ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{g}</button>
                 ))}
              </div>
           </div>

           <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Habits (Deal Breakers)</label>
              <div className="grid grid-cols-2 gap-3">
                  {/* Custom Select for Diet */}
                  <CustomSelect 
                      value={formData.preferences.diet} 
                      onChange={(val) => handlePrefChange('diet', val)} 
                      options={dietOptions} 
                      placeholder="Diet Preference"
                  />
                  
                  {/* Custom Select for Smoking */}
                  <CustomSelect 
                      value={formData.preferences.smoking} 
                      onChange={(val) => handlePrefChange('smoking', val)} 
                      options={smokingOptions} 
                      placeholder="Smoking Habits"
                  />
              </div>
           </div>

           <div 
             className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.preferences.sameCollege ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`} 
             onClick={() => handlePrefChange('sameCollege', !formData.preferences.sameCollege)}
           >
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${formData.preferences.sameCollege ? 'bg-yellow-400 border-yellow-400' : 'bg-white border-gray-300'}`}>
                  {formData.preferences.sameCollege && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <span className={`text-sm font-bold ${formData.preferences.sameCollege ? 'text-yellow-800' : 'text-gray-600'}`}>Only from my College 🎓</span>
           </div>
           
           <textarea 
              placeholder="Any specific note? (e.g. I study late night...)" 
              rows="2"
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm resize-none focus:ring-2 focus:ring-purple-200 transition-all"
              onChange={(e) => handleChange('description', e.target.value)}
           ></textarea>

           <div className="flex gap-3 pt-2">
             <button onClick={() => setStep(1)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Back</button>
             <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all active:scale-95">
                {loading ? 'Posting...' : 'Find Matches ✨'}
             </button>
           </div>
        </motion.div>
      )}
    </div>
  );
};

export default PostRoommateAd;