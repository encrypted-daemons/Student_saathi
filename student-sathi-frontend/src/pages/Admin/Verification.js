import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { CheckBadgeIcon, XCircleIcon, ShieldCheckIcon, ArrowLeftIcon, UserIcon, BriefcaseIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Verification = () => {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      // Get ALL providers (Verified & Unverified)
      const res = await api.get('/admin/users?role=provider'); 
      if (res.success) setProviders(res.data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const toggleVerification = async (id, currentStatus) => {
      try {
          // Optimistic UI Update
          setProviders(prev => prev.map(p => 
              p._id === id 
              ? { ...p, providerDetails: { ...p.providerDetails, isVerified: !currentStatus } } 
              : p
          ));
          await api.put(`/admin/verify/${id}`);
      } catch(e) { 
          alert("Action Failed"); 
          fetchProviders(); // Revert on fail
      }
  };

  if (loading) return <Loader text="Scanning Providers..." />;

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
                        <ShieldCheckIcon className="w-7 h-7 mr-3 text-blue-500"/> Provider Verification
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Total Providers: {providers.length}</p>
                </div>
            </div>
            <div className="hidden md:block px-3 py-1 bg-blue-900/30 border border-blue-900 rounded text-xs text-blue-400 font-bold uppercase">
                Secure Access
            </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-4">
            <AnimatePresence>
                {providers.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-20 bg-gray-900 rounded-3xl border border-gray-800"
                    >
                        <ShieldCheckIcon className="w-16 h-16 mx-auto text-blue-500 mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white">No Providers Found</h3>
                        <p className="text-gray-500 mt-2">System is waiting for new registrations.</p>
                    </motion.div>
                ) : (
                    providers.map((provider, idx) => (
                        <motion.div 
                            layout
                            key={provider._id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`p-6 rounded-2xl shadow-lg border flex flex-col md:flex-row justify-between items-center gap-6 transition-all ${provider.providerDetails?.isVerified ? 'bg-gray-900/50 border-green-900/30 opacity-75 hover:opacity-100' : 'bg-gray-900 border-gray-800 hover:border-blue-500/50'}`}
                        >
                            
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative">
                                    <img 
                                        src={provider.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${provider.name}`} 
                                        alt="img" 
                                        className="w-14 h-14 rounded-full bg-gray-800 object-cover border-2 border-gray-700"
                                    />
                                    {provider.providerDetails?.isVerified && (
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 p-0.5 rounded-full border-2 border-black">
                                            <CheckBadgeIcon className="w-4 h-4 text-white"/>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                        {provider.name}
                                        <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase border border-gray-700">{provider.providerDetails?.category || 'Unknown'}</span>
                                    </h3>
                                    <div className="text-sm text-gray-500 flex flex-col sm:flex-row gap-1 sm:gap-4 mt-1">
                                        <span className="flex items-center"><BriefcaseIcon className="w-3 h-3 mr-1"/> {provider.providerDetails?.businessName || 'No Business Name'}</span>
                                        <span className="flex items-center"><UserIcon className="w-3 h-3 mr-1"/> {provider.phone}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => toggleVerification(provider._id, provider.providerDetails?.isVerified)}
                                className={`flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg w-full md:w-auto ${
                                    provider.providerDetails?.isVerified 
                                    ? 'bg-green-900/20 text-green-500 border border-green-900 hover:bg-green-900/40' 
                                    : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105'
                                }`}
                            >
                                {provider.providerDetails?.isVerified ? (
                                    <><CheckBadgeIcon className="w-5 h-5 mr-2"/> Verified</>
                                ) : (
                                    <><ShieldCheckIcon className="w-5 h-5 mr-2"/> Verify Now</>
                                )}
                            </button>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};

export default Verification;