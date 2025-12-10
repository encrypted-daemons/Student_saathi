import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CommandLineIcon, ArrowLeftIcon, 
  UserPlusIcon, HomeIcon, BellAlertIcon,
  FunnelIcon, ChevronDownIcon, ClockIcon
} from '@heroicons/react/24/solid';

// --- DARK MODE CUSTOM SELECT ---
const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(opt => opt.value === value)?.label || "Filter";

  return (
    <div className="relative w-48" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-800 border border-gray-700 text-green-400 text-xs font-bold rounded-lg px-4 py-2.5 flex justify-between items-center hover:bg-gray-700 transition-all uppercase tracking-wider"
      >
        <span className="truncate flex items-center gap-2"><FunnelIcon className="w-3 h-3"/> {selectedLabel}</span>
        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden animate-fade-in-down">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              className={`w-full text-left px-4 py-3 text-xs font-mono transition-colors border-b border-gray-700 last:border-0 ${value === option.value ? 'bg-gray-700 text-green-400' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ActivityLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/logs');
        if (res.success) setLogs(res.data);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    fetchLogs();
  }, []);

  if (loading) return <Loader text="Decrypting Logs..." />;

  // Filter Logic
  const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.type === filter);

  const getIcon = (type) => {
      if (type === 'USER_JOINED') return <UserPlusIcon className="w-5 h-5 text-blue-400" />;
      if (type === 'PROPERTY_ADDED') return <HomeIcon className="w-5 h-5 text-green-400" />;
      return <BellAlertIcon className="w-5 h-5 text-yellow-400" />;
  };

  // Filter Options
  const filterOptions = [
      { value: 'ALL', label: 'All Systems' },
      { value: 'USER_JOINED', label: 'User Joins' },
      { value: 'PROPERTY_ADDED', label: 'Properties' },
      { value: 'SYSTEM_ALERT', label: 'System Alerts' }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono p-4 md:p-8 relative overflow-hidden">
        
        {/* Matrix Background Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(10,10,10,0.9),rgba(10,10,10,0.9)),url('https://media.giphy.com/media/26tn33ai01UfBNww8/giphy.gif')] bg-cover opacity-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800 pb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate('/admin/dashboard')} className="mr-4 bg-gray-800 p-2 rounded-full hover:bg-gray-700 hover:text-white transition-all group">
                        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center tracking-tight">
                            <CommandLineIcon className="w-6 h-6 mr-3 text-green-500"/> System Logs
                        </h1>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span> 
                            Live Monitoring Active
                        </p>
                    </div>
                </div>

                {/* Custom Dropdown Filter (New) */}
                <CustomSelect 
                    value={filter}
                    onChange={setFilter}
                    options={filterOptions}
                />
            </div>

            {/* Logs List */}
            <div className="space-y-3 min-h-[500px]">
                <AnimatePresence mode='wait'>
                    {filteredLogs.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50"
                        >
                            <p className="text-gray-500">No activity detected in this sector.</p>
                        </motion.div>
                    ) : (
                        filteredLogs.map((log, idx) => (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-green-500/50 transition-all group"
                            >
                                {/* Time */}
                                <div className="flex items-center text-xs text-gray-500 min-w-[180px] font-bold bg-black/30 px-3 py-1.5 rounded-lg border border-gray-800 group-hover:border-gray-700 group-hover:text-gray-400">
                                    <ClockIcon className="w-3 h-3 mr-2"/>
                                    {new Date(log.time).toLocaleString()}
                                </div>

                                {/* Icon */}
                                <div className={`p-2 rounded-lg bg-gray-950 border border-gray-800 group-hover:scale-110 transition-transform`}>
                                    {getIcon(log.type)}
                                </div>

                                {/* Message */}
                                <div className="flex-1">
                                    <p className="text-sm text-gray-300">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded mr-2 ${log.type === 'USER_JOINED' ? 'bg-blue-900/30 text-blue-400' : log.type === 'PROPERTY_ADDED' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                            {log.type}
                                        </span>
                                        {log.msg}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
            
            <div className="mt-8 text-center border-t border-gray-800 pt-4">
                <p className="text-gray-600 text-[10px] uppercase tracking-widest">End of Stream • Secured by StudentSathi Core</p>
            </div>
        </div>
    </div>
  );
};

export default ActivityLogs;