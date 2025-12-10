import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { MegaphoneIcon, PaperAirplaneIcon, ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

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
        className="w-full p-3 mt-1 flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl text-left text-gray-700 font-medium focus:ring-2 focus:ring-red-500 transition-all h-[50px]"
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
              className={`w-full text-left px-4 py-3 text-sm hover:bg-red-50 transition-colors border-b last:border-0 border-gray-50 ${value === option.value ? 'bg-red-50 text-red-700 font-bold' : 'text-gray-600'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Broadcast = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', message: '', targetRole: 'all' });
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
      e.preventDefault();
      setSending(true);
      try {
          await api.post('/admin/broadcast', form);
          alert("Broadcast Sent Successfully! 📢");
          setForm({ title: '', message: '', targetRole: 'all' });
      } catch(e) { alert("Failed to send"); }
      finally { setSending(false); }
  };

  const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Target Options
  const targetOptions = [
      { value: 'all', label: 'Everyone (Students + Providers)' },
      { value: 'student', label: 'Only Students' },
      { value: 'provider', label: 'Only Providers' }
  ];

  return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center font-sans">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white flex items-center gap-4 shadow-md">
                  <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-full transition"><ArrowLeftIcon className="w-6 h-6"/></button>
                  <div>
                      <h1 className="text-2xl font-black flex items-center tracking-tight"><MegaphoneIcon className="w-6 h-6 mr-2"/> Broadcast</h1>
                      <p className="text-red-100 text-xs font-medium">Send push notifications to users.</p>
                  </div>
              </div>
              
              <form onSubmit={handleSend} className="p-8 space-y-6">
                  
                  {/* Target Select (Fixed) */}
                  <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Audience</label>
                      <CustomSelect 
                          name="targetRole"
                          value={form.targetRole}
                          onChange={handleChange}
                          options={targetOptions}
                          placeholder="Select Audience"
                      />
                  </div>

                  <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Title</label>
                      <input 
                        name="title"
                        className="w-full p-3 mt-1 border rounded-xl bg-gray-50 outline-none font-bold focus:ring-2 focus:ring-red-500 transition" 
                        placeholder="e.g. Server Maintenance"
                        value={form.title}
                        onChange={handleChange}
                        required 
                      />
                  </div>

                  <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Message</label>
                      <textarea 
                        name="message"
                        className="w-full p-3 mt-1 border rounded-xl bg-gray-50 outline-none h-32 resize-none focus:ring-2 focus:ring-red-500 transition" 
                        placeholder="Type your alert message..."
                        value={form.message}
                        onChange={handleChange}
                        required 
                      />
                  </div>

                  <button disabled={sending} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 flex items-center justify-center transition transform active:scale-95 disabled:opacity-70">
                      {sending ? 'Sending...' : <><PaperAirplaneIcon className="w-5 h-5 mr-2"/> Send Alert</>}
                  </button>
              </form>
          </div>
      </div>
  );
};

export default Broadcast;