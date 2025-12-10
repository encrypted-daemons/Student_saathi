import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import WhatsAppButton from '../../components/common/WhatsAppButton';
import { 
  ExclamationTriangleIcon, CheckBadgeIcon, ArrowLeftIcon, 
  UserIcon, HomeModernIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const Disputes = () => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await api.get('/admin/disputes');
      if (res.success) setDisputes(res.data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleResolve = async (id) => {
      if(!window.confirm("Mark this issue as Resolved?")) return;
      try {
          await api.put(`/admin/disputes/${id}`);
          fetchDisputes(); 
      } catch(e) { alert("Failed"); }
  };

  if (loading) return <Loader text="Loading Issues..." />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-6 font-sans">
        
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between border-b border-gray-800 pb-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/dashboard')} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 text-white"/>
                </button>
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center">
                        <ExclamationTriangleIcon className="w-7 h-7 mr-3 text-red-500"/> Dispute Resolution
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Active Cases: {disputes.filter(d => d.status !== 'Resolved').length}</p>
                </div>
            </div>
            <div className="hidden md:block px-3 py-1 bg-red-900/30 border border-red-900 rounded text-xs text-red-400 font-bold uppercase">
                Secure Channel
            </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-4">
            <AnimatePresence>
                {disputes.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-20 bg-gray-900 rounded-3xl border border-gray-800"
                    >
                        <ShieldCheckIcon className="w-16 h-16 mx-auto text-green-500 mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white">All Clear!</h3>
                        <p className="text-gray-500 mt-2">No active disputes. Peace maintained. 🕊️</p>
                    </motion.div>
                ) : (
                    disputes.map((issue) => (
                        <motion.div 
                            layout
                            key={issue._id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-2xl shadow-lg border flex flex-col lg:flex-row gap-6 transition-all ${issue.status === 'Resolved' ? 'bg-gray-900/50 border-green-900/30 opacity-60' : 'bg-gray-900 border-red-500/30 hover:border-red-500'}`}
                        >
                            
                            {/* Left: Issue Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${issue.status === 'Resolved' ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-red-900/30 text-red-400 border-red-800 animate-pulse'}`}>
                                        {issue.status}
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono">{new Date(issue.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{issue.type} Issue</h3>
                                <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
                                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-600 mb-1"/>
                                    <p className="text-gray-400 text-sm italic">"{issue.description}"</p>
                                </div>
                            </div>

                            {/* Middle: Parties */}
                            <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[240px] justify-center border-t lg:border-t-0 lg:border-l border-gray-800 pt-4 lg:pt-0 lg:pl-6">
                                
                                {/* Student */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-900/20 rounded-full text-blue-400 border border-blue-900/30"><UserIcon className="w-4 h-4"/></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Complainant</p>
                                        <p className="text-sm font-bold text-white">{issue.student?.name}</p>
                                        <a href={`tel:${issue.student?.phone}`} className="text-xs text-blue-400 hover:underline">{issue.student?.phone}</a>
                                    </div>
                                </div>

                                {/* Owner */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-900/20 rounded-full text-purple-400 border border-purple-900/30"><HomeModernIcon className="w-4 h-4"/></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Against</p>
                                        <p className="text-sm font-bold text-white">{issue.owner?.name}</p>
                                        <div className="mt-1"><WhatsAppButton phoneNumber={issue.owner?.phone} label="Chat" small className="text-xs py-0.5 px-2 h-auto bg-green-600 hover:bg-green-700"/></div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Action */}
                            {issue.status !== 'Resolved' && (
                                <div className="flex items-center justify-center border-t lg:border-t-0 lg:border-l border-gray-800 pt-4 lg:pt-0 lg:pl-6">
                                    <button 
                                        onClick={() => handleResolve(issue._id)}
                                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-500 hover:shadow-green-500/20 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <CheckBadgeIcon className="w-5 h-5"/> Resolve
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};

export default Disputes;