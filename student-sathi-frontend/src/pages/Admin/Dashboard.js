import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { motion } from 'framer-motion';
import { 
  UsersIcon, HomeModernIcon, CheckBadgeIcon, 
  MegaphoneIcon, ChartBarIcon, ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon, ShieldCheckIcon, ServerIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.success) setStats(res.data);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  // Quick Actions Configuration
  const actions = [
    { 
        title: 'Verification Center', 
        desc: 'Approve/Reject Providers', 
        icon: CheckBadgeIcon, 
        color: 'bg-blue-600', 
        path: '/admin/verification',
        stat: stats?.pendingVerifications ? `${stats.pendingVerifications} Pending` : 'All Clear'
    },
    { 
        title: 'Broadcast Alert', 
        desc: 'Send Notification to All', 
        icon: MegaphoneIcon, 
        color: 'bg-red-600', 
        path: '/admin/broadcast',
        stat: 'Reach Everyone'
    },
    { 
        title: 'Dispute Resolution', 
        desc: 'Handle Complaints', 
        icon: ExclamationTriangleIcon, 
        color: 'bg-orange-500', 
        path: '/admin/disputes',
        stat: 'Check Issues'
    },
    { 
        title: 'Activity Logs', 
        desc: 'Monitor System Events', 
        icon: ClipboardDocumentCheckIcon, 
        color: 'bg-gray-700', 
        path: '/admin/logs',
        stat: 'Real-time'
    },
  ];

  if (loading) return <Loader text="Accessing Mainframe..." />;

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans">
        
        {/* 1. COMMAND HEADER */}
        <div className="bg-gray-900 text-white px-8 py-10 shadow-lg relative overflow-hidden">
            {/* Background Matrix Effect (Simple CSS) */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

            <div className="max-w-7xl mx-auto flex justify-between items-end relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-green-400 text-xs font-bold uppercase tracking-widest">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        System Operational
                    </div>
                    <h1 className="text-4xl font-black flex items-center tracking-tight">
                        Admin Console <ShieldCheckIcon className="w-8 h-8 ml-3 text-blue-400"/>
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium text-sm">Overview of Student Sathi Ecosystem</p>
                </div>
                
                {/* Mini Server Stat */}
                <div className="hidden md:flex items-center gap-4 bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl border border-gray-700">
                    <ServerIcon className="w-8 h-8 text-gray-500"/>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Database Status</p>
                        <p className="text-sm font-bold text-green-400 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Connected
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 md:p-8 -mt-8 relative z-20 space-y-8">

            {/* 2. LIVE STATS (Bento Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatBox label="Total Students" value={stats?.totalStudents || 0} icon={UsersIcon} color="text-blue-600" />
                <StatBox label="Service Providers" value={stats?.totalProviders || 0} icon={ChartBarIcon} color="text-purple-600" />
                <StatBox label="Active Listings" value={(stats?.totalProperties || 0) + (stats?.totalServices || 0)} icon={HomeModernIcon} color="text-green-600" />
                <StatBox label="Pending Approvals" value={stats?.pendingVerifications || 0} icon={CheckBadgeIcon} color="text-red-600" alert={stats?.pendingVerifications > 0} />
            </div>

            {/* 3. CONTROL PANEL (Quick Actions) */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <ClipboardDocumentCheckIcon className="w-6 h-6 mr-2 text-gray-500"/> Operations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {actions.map((action, idx) => (
                        <motion.div 
                            key={idx} 
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(action.path)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all flex items-center group relative overflow-hidden"
                        >
                            <div className={`absolute right-0 top-0 p-20 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110`}></div>
                            
                            <div className={`p-4 rounded-xl ${action.color} text-white mr-5 shadow-lg z-10`}>
                                <action.icon className="w-8 h-8" />
                            </div>
                            <div className="flex-1 z-10">
                                <h4 className="font-bold text-gray-900 text-xl">{action.title}</h4>
                                <p className="text-sm text-gray-500 mb-2">{action.desc}</p>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded inline-block uppercase tracking-wide ${action.title === 'Verification Center' && stats?.pendingVerifications > 0 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
                                    {action.stat}
                                </span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-full text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-colors z-10 shadow-sm">
                                <ArrowRightIcon className="w-5 h-5"/>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
    </div>
  );
};

const StatBox = ({ label, value, icon: Icon, color, alert }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`bg-white p-6 rounded-2xl shadow-lg border-l-4 flex items-center justify-between ${alert ? 'border-red-500 ring-2 ring-red-100 animate-pulse' : 'border-white'}`}
    >
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <h3 className={`text-4xl font-black mt-1 ${color}`}>{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl bg-gray-50 ${color.replace('text-', 'bg-').replace('600', '50')} bg-opacity-20`}>
            <Icon className={`w-8 h-8 ${color}`} />
        </div>
    </motion.div>
);

export default AdminDashboard;